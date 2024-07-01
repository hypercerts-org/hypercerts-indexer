import { IndexerConfig } from "@/types/types.js";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain.js";
import { client } from "@/clients/evmClient.js";
import { getAddress, parseAbi, RpcRequestError } from "viem";
import _ from "lodash";
import { batchSize, chainId } from "@/utils/constants.js";
import { indexSupportedSchemas } from "@/indexer/indexSupportedSchemas.js";
import { indexAttestations } from "@/indexer/indexAttestations.js";
import { processEvent } from "@/indexer/eventHandlers.js";
import { supabase } from "@/clients/supabaseClient.js";
import { getBlocksToFetch } from "@/utils/getBlocksToFetch.js";

let isRunning = false;

/*
 * Utility function to run indexing method with a delay. When the method is running, it will skip the next interval.
 *
 * @param indexingMethod - method to run
 * @param delay - delay in milliseconds
 * @param args - arguments to pass to the indexing method
 * @returns void
 *
 * @example
 * ```js
 * await runIndexing(indexingMethod, 1000, ...args);
 * ```
 *
 */
export const runIndexing = async (delay: number, config?: IndexerConfig) => {
  if (isRunning) {
    console.debug("[runIndexing] Batch already running, skipping interval.");
    return;
  }

  isRunning = true;

  try {
    // Get all relevant events for the current chain stored in the database
    const contractEvents = await getContractEventsForChain();

    const eventsPerContract = _.groupBy(contractEvents, "contracts_id");

    if (Object.keys(eventsPerContract).length === 0) {
      return;
    }

    const parseRequests = await Promise.all(
      Object.entries(eventsPerContract).map(async ([contracts_id, events]) => {
        const res = await supabase
          .from("contracts")
          .select("*")
          .eq("id", contracts_id)
          .single()
          .throwOnError();

        if (!res?.data) return;

        const blocks = await getBlocksToFetch({
          fromBlock: BigInt(res.data.start_block),
          batchSize,
        });

        if (!blocks) return;

        const filter = await client.createEventFilter({
          events: parseAbi(events.map((e) => e.abi)),
          address: getAddress(res.data.contract_address),
          ...blocks,
        });

        return {
          ...blocks,
          contractAddress: getAddress(res.data.contract_address),
          contracts_id,
          abi: events.map((e) => e.abi),
          filter,
        };
      }),
    );

    const requests = parseRequests.filter((r) => r !== undefined && r !== null);

    if (requests.length === 0) {
      console.debug("[runIndexing] Nothing to index");
      setTimeout(runIndexing, 3000, delay, config);
      return;
    }

    const results = await Promise.all(
      requests.map(async (request) => {
        const logs = await client.getFilterLogs({ filter: request.filter });
        const groupedLogs = _.chain(logs)
          .groupBy("blockNumber")
          .mapValues((logs) => _.sortBy(logs, "logIndex"))
          .value();
        return { ...request, logs: groupedLogs };
      }),
    );

    // Parse events per block and per event name
    for (const { logs } of results) {
      for (const [blockNumber, events] of Object.entries(logs)) {
        const block = await client.getBlock({
          blockNumber: BigInt(blockNumber),
        });
        console.info(
          `[runIndexing] Processing ${events.length} for block ${blockNumber}`,
        );
        for (const log of events) {
          const contractEvent = contractEvents?.find(
            (ce) => ce.event_name === log.eventName,
          );

          if (!contractEvent) {
            console.error(`Contract event not found for ${log.eventName}`);
            continue;
          }

          await processEvent({
            log,
            context: {
              event_name: log.eventName,
              chain_id: chainId,
              contracts_id: contractEvent.contracts_id,
              events_id: contractEvent.events_id,
              block,
            },
          });
        }

        console.info(`[runIndexing] Finished processing block ${blockNumber}.`);
      }
    }

    for (const { contracts_id, toBlock } of requests) {
      await supabase
        .from("contracts")
        .update({ start_block: toBlock })
        .eq("id", contracts_id)
        .throwOnError();
    }

    // Indexing of attestations on EAS and supported schema data as well
    await indexAttestations();
    await indexSupportedSchemas();

    setTimeout(runIndexing, delay, delay, config);
  } catch (error) {
    console.error("[runIndexing] Failed to index events", error);
    if (error instanceof RpcRequestError) {
      console.warn(error.stack);
      setTimeout(runIndexing, delay, delay, config);
    }
  } finally {
    isRunning = false;
  }
};

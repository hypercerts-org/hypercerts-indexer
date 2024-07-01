import { IndexerConfig } from "@/types/types.js";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain.js";
import { client } from "@/clients/evmClient.js";
import { getAddress, parseAbi, RpcRequestError } from "viem";
import _ from "lodash";
import { batchSize } from "@/utils/constants.js";
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

    if (!contractEvents || contractEvents.length === 0) {
      console.debug("[runIndexing] No contract events found.");
      return;
    }

    const eventsPerContract = _.groupBy(contractEvents, "contracts_id");
    const configPerContract: {
      [key: string]: {
        fromBlock: bigint;
        toBlock: bigint;
        contractAddress: string;
      };
    } = {};

    for (const [contracts_id] of Object.entries(eventsPerContract)) {
      const res = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contracts_id)
        .single()
        .throwOnError();

      if (!res?.data) continue;

      const blocks = await getBlocksToFetch({
        fromBlock: BigInt(res.data.start_block),
        batchSize,
      });

      if (!blocks) continue;

      configPerContract[contracts_id] = {
        ...blocks,
        contractAddress: res.data.contract_address,
      };
    }

    if (Object.keys(configPerContract).length === 0) {
      console.debug("[runIndexing] Nothing to index");
      setTimeout(runIndexing, 3000, delay, config);
      return;
    }

    const filtersPerContract = await Promise.all(
      Object.entries(eventsPerContract).map(
        async ([contracts_id, contractEvents]) => {
          if (!configPerContract[contracts_id]) return;
          const eventAbis = contractEvents.map((ce) => ce.abi);

          return await client.createEventFilter({
            events: parseAbi(eventAbis),
            address: getAddress(
              configPerContract[contracts_id].contractAddress,
            ),
            fromBlock: configPerContract[contracts_id].fromBlock,
            toBlock: configPerContract[contracts_id].toBlock,
          });
        },
      ),
    );

    const logsPerFilter = await Promise.all(
      filtersPerContract.flatMap((filter) =>
        filter ? client.getFilterLogs({ filter }) : [],
      ),
    );

    const logsPerBlockSortedByLogIndex = _(logsPerFilter)
      .flatten()
      .groupBy("blockNumber")
      .mapValues((logs) => _.sortBy(logs, "logIndex"))
      .value();

    const allContractEvents = contractEvents.flat();

    // Parse events per block and per event name
    for (const [blockNumber, logs] of Object.entries(
      logsPerBlockSortedByLogIndex,
    )) {
      console.info(`[runIndexing] Processing block ${blockNumber}`);
      for (const log of logs) {
        const { contracts_id, events_id } =
          allContractEvents.find((ce) => ce.event_name === log.eventName) || {};

        if (!contracts_id || !events_id) {
          console.error(
            `[runIndexing] Contract event not found for ${log.eventName}`,
          );
          continue;
        }

        await processEvent({
          eventName: log.eventName,
          log,
          contracts_id,
          events_id,
          blockNumber: BigInt(blockNumber),
        });
      }

      console.info(
        `[runIndexing] Finished processing block ${blockNumber} with ${logs.length} matching logs.`,
      );
    }

    await indexAttestations();
    await indexSupportedSchemas();

    for (const [contracts_id, config] of Object.entries(configPerContract)) {
      await supabase
        .from("contracts")
        .update({ start_block: config.toBlock })
        .eq("id", contracts_id)
        .throwOnError();
    }

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

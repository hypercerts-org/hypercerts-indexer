import { IndexerConfig } from "@/types/types.js";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain.js";
import { client } from "@/clients/evmClient.js";
import { getAddress, parseAbi, RpcRequestError } from "viem";
import _ from "lodash";
import { batchSize } from "@/utils/constants.js";
import { indexMetadata } from "@/indexer/indexMetadata.js";
import { indexAllowListData } from "@/indexer/indexAllowlistData.js";
import { indexAllowlistRecords } from "@/indexer/indexAllowlistRecords.js";
import { indexSupportedSchemas } from "@/indexer/indexSupportedSchemas.js";
import { indexAttestations } from "@/indexer/indexAttestations.js";
import { processEvent } from "@/indexer/eventHandlers.js";

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
export const runIndexing = async (
  delay: number,
  startBlock: bigint = 4421944n,
  config?: IndexerConfig,
) => {
  if (isRunning) {
    console.debug("[runIndexing] Batch already running, skipping interval.");
    return;
  }

  isRunning = true;
  const currentBlock = await client.getBlockNumber();

  // Leave 1 block marging for RPC indexing to catch up
  if (startBlock >= currentBlock - 1n) {
    console.debug("[runIndexing] No new blocks to index.");
    isRunning = false;
    setTimeout(runIndexing, 2000, delay, startBlock, config);
    return;
  }

  try {
    // Get all relevant events for the current chain stored in the database
    const contractEvents = await getContractEventsForChain({});

    if (!contractEvents || contractEvents.length === 0) {
      console.debug("[runIndexing] No contract events found.");
      return;
    }

    const eventsPerContract = _.groupBy(contractEvents, "contracts_id");

    const filtersPerContract = await Promise.all(
      Object.entries(eventsPerContract).map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async ([contracts_id, contractEvents]) => {
          const eventAbis = contractEvents.map((ce) => ce.abi);

          return await client.createEventFilter({
            events: parseAbi(eventAbis),
            address: getAddress(contractEvents[0].contract_address),
            fromBlock: startBlock,
            toBlock: startBlock + batchSize,
          });
        },
      ),
    );

    const logsPerFilter = await Promise.all(
      filtersPerContract.map((filter) => client.getFilterLogs({ filter })),
    );
    const logsPerBlock = _.groupBy(_.flatten(logsPerFilter), "blockNumber");
    const logsPerBlockPerEventName = _.mapValues(logsPerBlock, (logs) =>
      _.groupBy(logs, "eventName"),
    );

    const allContractEvents = contractEvents.flat();

    // Parse events per block and per event name
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [blockNumber, logsPerEventName] of Object.entries(
      logsPerBlockPerEventName,
    )) {
      // Catch up on missing data (metadata, allowlists, etc...)

      await indexMetadata();
      await indexAllowListData();
      await indexAllowlistRecords();
      await indexSupportedSchemas();

      for (const [eventName, logs] of Object.entries(logsPerEventName)) {
        console.debug(
          `[runIndexing] Processing ${logs.length} ${eventName} events`,
        );

        const contractEvent = allContractEvents.find(
          (ce) => ce.event_name === eventName,
        );

        if (!contractEvent) {
          console.error(
            `[runIndexing] Contract event not found for ${eventName}`,
          );
          continue;
        }

        const { contracts_id, events_id } = contractEvent;
        await processEvent({
          eventName,
          logs,
          contracts_id,
          events_id,
          blockNumber: BigInt(blockNumber),
        });
      }
    }

    await indexAttestations();

    setTimeout(runIndexing, delay, delay, startBlock + batchSize, config);
  } catch (error) {
    console.error("[runIndexing] Failed to index events", error);
    if (error instanceof RpcRequestError) {
      console.warn(error.stack);
      setTimeout(runIndexing, delay, delay, startBlock + batchSize, config);
    }
  } finally {
    isRunning = false;
  }
};

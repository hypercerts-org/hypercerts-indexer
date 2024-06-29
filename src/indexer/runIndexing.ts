import { IndexerConfig } from "@/types/types.js";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain.js";
import { client } from "@/clients/evmClient.js";
import { getAddress, parseAbi } from "viem";
import _ from "lodash";
import { batchSize } from "@/utils/constants.js";
import { parseClaimStoredEvent } from "@/parsing/claimStoredEvent.js";
import { processLogs } from "@/indexer/processLogs.js";
import { parseValueTransfer } from "@/parsing/valueTransferEvent.js";
import { parseTransferSingle } from "@/parsing/transferSingleEvent.js";
import { storeClaimStored } from "@/storage/storeClaimStored.js";
import { storeValueTransfer } from "@/storage/storeValueTransfer.js";
import { storeTransferSingle } from "@/storage/storeTransferSingle.js";
import { parseLeafClaimedEvent } from "@/parsing/leafClaimedEvent.js";
import { updateAllowlistRecordClaimed } from "@/storage/updateAllowlistRecordClaimed.js";
import { indexMetadata } from "@/indexer/indexMetadata.js";
import { indexAllowListData } from "@/indexer/indexAllowlistData.js";
import { indexAllowlistRecords } from "@/indexer/indexAllowlistRecords.js";
import { indexSupportedSchemas } from "@/indexer/indexSupportedSchemas.js";

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

  console.log("startBlock", startBlock);

  try {
    // Get all relevant events for the current chain stored in the database
    const contractEvents = await getContractEventsForChain({});

    if (!contractEvents || contractEvents.length === 0) {
      return;
    }

    const eventsPerContract = _.groupBy(contractEvents, "contracts_id");

    const filtersPerContract = await Promise.all(
      Object.entries(eventsPerContract).map(
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
    for (const [blockNumber, logsPerEventName] of Object.entries(
      logsPerBlockPerEventName,
    )) {
      // Catch up on missing data (metadata, allowlists, etc...)

      await indexMetadata();
      await indexAllowListData();
      await indexAllowlistRecords();
      await indexSupportedSchemas();

      for (const [eventName, logs] of Object.entries(logsPerEventName)) {
        if (eventName === "ClaimStored") {
          const contracts_id = allContractEvents.filter(
            (ce) => ce.event_name === logs[0].eventName,
          )[0].contracts_id;
          await processLogs({
            logs,
            contracts_id,
            parsingMethod: parseClaimStoredEvent,
            storageMethod: storeClaimStored,
          });
        }

        if (eventName === "ValueTransfer") {
          const contracts_id = allContractEvents.filter(
            (ce) => ce.event_name === logs[0].eventName,
          )[0].contracts_id;
          await processLogs({
            logs,
            contracts_id,
            parsingMethod: parseValueTransfer,
            storageMethod: storeValueTransfer,
          });
        }

        if (eventName === "TransferSingle") {
          const contracts_id = allContractEvents.filter(
            (ce) => ce.event_name === logs[0].eventName,
          )[0].contracts_id;
          await processLogs({
            logs,
            contracts_id,
            parsingMethod: parseTransferSingle,
            storageMethod: storeTransferSingle,
          });
        }

        if (eventName === "LeafClaimed") {
          const contracts_id = allContractEvents.filter(
            (ce) => ce.event_name === logs[0].eventName,
          )[0].contracts_id;
          await processLogs({
            logs,
            contracts_id,
            parsingMethod: parseLeafClaimedEvent,
            storageMethod: updateAllowlistRecordClaimed,
          });
        }
      }
    }

    setTimeout(runIndexing, delay, delay, startBlock + batchSize, config);
  } catch (error) {
    console.error("[runIndexing] Failed to index events", error);
  } finally {
    isRunning = false;
  }
};

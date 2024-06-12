import { getDeployment } from "@/utils/getDeployment.js";
import { IndexerConfig, NewUnitTransfer } from "@/types/types.js";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain.js";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents.js";
import { getLogsForContractEvents } from "@/monitoring/hypercerts.js";
import { parseValueTransfer } from "@/parsing/valueTransferEvent.js";
import { storeUnitTransfer } from "@/storage/storeUnits.js";
import * as console from "node:console";

/*
 * This function indexes the logs of the TransferSingle event emitted by the HypercertMinter contract. Based on the last
 * block indexed, it fetches the logs in batches, parses them, fetches the metadata, and stores the claim and fraction tokens in the
 * database.
 *
 * @param [batchSize] - The number of logs to fetch and parse in each batch.
 *
 * @example
 * ```js
 * await indexTransferSingleEvents({ batchSize: 1000n });
 * ```
 */

const defaultConfig = {
  batchSize: 10000n,
  eventName: "ValueTransfer",
};

export const indexUnitTransfers = async ({
  batchSize = defaultConfig.batchSize,
  eventName = defaultConfig.eventName,
}: IndexerConfig = defaultConfig) => {
  const { chainId } = getDeployment();
  const contractsWithEvents = await getContractEventsForChain({
    eventName,
  });

  if (!contractsWithEvents || contractsWithEvents.length === 0) {
    console.debug(
      `[IndexUnitTransfers] No contract events found for ${eventName} event on chain ${chainId}`,
    );
    return;
  }

  const results = await Promise.all(
    contractsWithEvents.map(async (contractEvent) => {
      const { last_block_indexed } = contractEvent;

      // Get logs in batches
      const logsFound = await getLogsForContractEvents({
        fromBlock: last_block_indexed ? BigInt(last_block_indexed) : 0n,
        batchSize,
        contractEvent,
      });

      if (!logsFound) {
        console.debug(
          " [IndexUnitTransfers] No logs found for contract event",
          contractEvent,
        );
        return;
      }

      const { logs, toBlock } = logsFound;

      // Split logs into chunks
      const logChunks = chunkArray(logs, 10);

      console.log(logChunks);

      // Initialize an empty array to store all claims
      let allTransfers: NewUnitTransfer[] = [];

      // Process each chunk one by one
      for (const logChunk of logChunks) {
        const events = await Promise.all(logChunk.map(parseValueTransfer));

        const _transfers = events.map((transfer) => ({
          ...transfer,
          contracts_id: contractEvent.contracts_id,
        }));

        console.log("local transfers: ", _transfers);

        // Add the claims from the current chunk to the allClaims array
        allTransfers = [...allTransfers, ..._transfers];
      }
      console.log("All Transfers: ", allTransfers);

      // Validate and parse logs
      const transfers = allTransfers.filter(
        (transfer): transfer is NewUnitTransfer => transfer !== null,
      );

      console.log("tranfers after filter: ", transfers);

      return {
        transfers,
        contractEventUpdate: {
          ...contractEvent,
          last_block_indexed: toBlock,
        },
      };
    }),
  );

  const transfers = results
    .flatMap((result) => (result?.transfers ? result.transfers : undefined))
    .filter(
      (transfer): transfer is NewUnitTransfer =>
        transfer !== null && transfer !== undefined,
    );

  console.log("Transfers to store: ", transfers);

  // store the claim and fraction tokens
  return await storeUnitTransfer({
    transfers,
  }).then(() =>
    updateLastBlockIndexedContractEvents({
      contract_events: results.flatMap((res) =>
        res?.contractEventUpdate ? [res.contractEventUpdate] : [],
      ),
    }),
  );
};

const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

import {
  ParsedTransferSingle,
  parseTransferSingle,
} from "@/parsing/transferSingleEvent.js";
import { getDeployment } from "@/utils/getDeployment.js";
import { IndexerConfig } from "@/types/types.js";
import { storeTransferSingle } from "@/storage/storeTransferSingle";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain.js";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents.js";
import { getLogsForContractEvents } from "@/monitoring/hypercerts.js";
import { isHypercertToken } from "@/utils/tokenIds.js";
import _ from "lodash";

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
  eventName: "TransferSingle",
};

export const indexTransferSingleEvents = async ({
  batchSize = defaultConfig.batchSize,
  eventName = defaultConfig.eventName,
}: IndexerConfig = defaultConfig) => {
  const { chainId } = getDeployment();
  const contractsWithEvents = await getContractEventsForChain({
    eventName,
  });

  if (!contractsWithEvents || contractsWithEvents.length === 0) {
    console.debug(
      `[IndexTokenTransfers] No contract events found for ${eventName} event on chain ${chainId}`,
    );
    return;
  }

  const results = await Promise.all(
    contractsWithEvents.map(async (contractEvent) => {
      // Get logs in batches
      const logsFound = await getLogsForContractEvents({
        batchSize,
        contractEvent,
      });

      if (!logsFound) {
        return;
      }

      const { logs, toBlock } = logsFound;

      if (!logs) {
        console.debug(
          "[IndexTokenTransfers] No logs found for contract event",
          { eventName: contractEvent.event_name },
        );
        return {
          contractEventUpdate: {
            ...contractEvent,
            last_block_indexed: toBlock,
          },
        };
      }

      console.debug(`[IndexTokenTransfers] Found ${logs.length} logs`);

      // Split logs into chunks
      const logChunks = _.chunk(logs, 10);

      // Initialize an empty array to store all claims
      let allTransfers: ParsedTransferSingle[] = [];

      //Process each chunk one by one
      for (const logChunk of logChunks) {
        const events = await Promise.all(
          logChunk.map(async (log) => ({
            ...(await parseTransferSingle(log)),
            contracts_id: contractEvent.contracts_id,
          })),
        );

        // Add the claims from the current chunk to the allClaims array
        allTransfers = [...allTransfers, ...events];
      }

      // Validate and parse logs
      const tokensToStore = allTransfers.filter(
        (transfer) => !isHypercertToken(transfer.token_id),
      );

      console.debug(
        `[IndexTokenTransfers] Found ${tokensToStore.length} transfers`,
      );

      return {
        transfers: tokensToStore,
        contractEventUpdate: {
          ...contractEvent,
          last_block_indexed: toBlock,
        },
      };
    }),
  );

  const transfers = results
    .flatMap((result) => (result?.transfers ? result.transfers : undefined))
    .filter((transfer) => transfer !== null && transfer !== undefined);

  const contract_events = results.flatMap((res) =>
    res?.contractEventUpdate ? [res.contractEventUpdate] : [],
  );

  // store the fraction tokens
  return await storeTransferSingle({
    transfers,
  }).then(() =>
    updateLastBlockIndexedContractEvents({
      contract_events,
    }),
  );
};

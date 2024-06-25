import { ParsedTransferSingle } from "@/parsing/transferSingleEvent.js";
import { getDeployment } from "@/utils/getDeployment.js";
import { IndexerConfig } from "@/types/types.js";
import { storeFractionTransfer } from "@/storage/storeFractionTransfer.js";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain.js";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents.js";
import { getLogsForContractEvents } from "@/monitoring/hypercerts.js";
import { isHypercertToken } from "@/utils/tokenIds.js";
import _ from "lodash";
import { parseTransferBatch } from "@/parsing/transferBatchEvent.js";

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
  eventName: "TransferBatch",
};

export const indexTransferBatchEvents = async ({
  batchSize = defaultConfig.batchSize,
  eventName = defaultConfig.eventName,
}: IndexerConfig = defaultConfig) => {
  const { chainId } = getDeployment();
  const contractsWithEvents = await getContractEventsForChain({
    eventName,
  });

  if (!contractsWithEvents || contractsWithEvents.length === 0) {
    console.debug(
      `[IndexBatchTokenTransfers] No contract events found for ${eventName} event on chain ${chainId}`,
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
          "[IndexBatchTokenTransfers] No logs found for contract event",
          contractEvent,
        );
        return;
      }

      const { logs, toBlock } = logsFound;
      console.debug(`[IndexBatchTokenTransfers] Found ${logs.length} logs`);

      // Split logs into chunks
      const logChunks = _.chunk(logs, 10);

      // Initialize an empty array to store all claims
      let allTransfers: ParsedTransferSingle[] = [];

      //Process each chunk one by one
      for (const logChunk of logChunks) {
        const events = await Promise.all(
          logChunk.flatMap(async (log) => await parseTransferBatch(log)),
        )
          .then((res) => res.flat())
          .then((res) =>
            res.map((event) => ({
              ...event,
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
        `[IndexBatchTokenTransfers] Found ${tokensToStore.length} transfers`,
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

  // store the fraction tokens
  return await storeFractionTransfer({
    transfers,
  }).then(() =>
    updateLastBlockIndexedContractEvents({
      contract_events: results.flatMap((res) =>
        res?.contractEventUpdate ? [res.contractEventUpdate] : [],
      ),
    }),
  );
};

import { parseTransferSingle } from "@/parsing/transferSingleEvent.js";
import { getDeployment } from "@/utils/getDeployment.js";
import { IndexerConfig, NewTransfer } from "@/types/types.js";
import { storeTransferSingleFraction } from "@/storage/storeTransferSingleFraction.js";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain.js";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents.js";
import { getLogsForContractEvents } from "@/monitoring/hypercerts.js";
import { isHypercertToken } from "@/utils/tokenIds.js";
import { GetFilterLogsReturnType } from "viem";

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
      const { last_block_indexed } = contractEvent;

      // Get logs in batches
      const logsFound = await getLogsForContractEvents({
        fromBlock: last_block_indexed ? BigInt(last_block_indexed) : 0n,
        batchSize,
        contractEvent,
      });

      if (!logsFound) {
        console.debug(
          "[IndexTokenTransfers] No logs found for contract event",
          contractEvent,
        );
        return;
      }

      const { logs, toBlock } = logsFound;
      console.debug(`[IndexTokenTransfers] Found ${logs.length} logs`);

      // Split logs into chunks
      const logChunks = chunkArray(logs, 10);

      // Initialize an empty array to store all claims
      let allTransfers: NewTransfer[] = [];

      //Process each chunk one by one
      for (const logChunk of logChunks) {
        const events = await Promise.all(logChunk.map(parseTransferSingle));

        const transfers = events.map((transfer) => ({
          ...transfer,
          contracts_id: contractEvent.contracts_id,
        }));

        // Add the claims from the current chunk to the allClaims array
        allTransfers = [...allTransfers, ...transfers];
      }

      // Validate and parse logs
      const tokensToStore = allTransfers.filter(
        (transfer): transfer is NewTransfer =>
          transfer !== null &&
          transfer !== undefined &&
          transfer.token_id !== null &&
          !isHypercertToken(transfer.token_id),
      );

      const transfers = tokensToStore.map((transfer) => ({
        ...transfer,
        contracts_id: contractEvent.contracts_id,
      }));

      console.debug(
        `[IndexTokenTransfers] Found ${transfers.length} transfers`,
      );

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
      (transfer): transfer is NewTransfer =>
        transfer !== null && transfer !== undefined,
    );

  // store the fraction tokens
  return await storeTransferSingleFraction({
    transfers,
  }).then(() =>
    updateLastBlockIndexedContractEvents({
      contract_events: results.flatMap((res) =>
        res?.contractEventUpdate ? [res.contractEventUpdate] : [],
      ),
    }),
  );
};

const chunkArray = (
  array: GetFilterLogsReturnType<
    undefined,
    undefined,
    undefined,
    bigint,
    bigint
  >,
  size: number,
) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

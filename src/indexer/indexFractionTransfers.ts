import { parseTransferSingle } from "@/parsing";
import { getDeployment } from "@/utils";
import { IndexerConfig, NewTransfer } from "@/types/types";
import { storeTransferSingleFraction } from "@/storage/storeTransferSingleFraction";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents";
import { getLogsForContractEvents } from "@/monitoring/hypercerts";

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
    chainId,
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
      console.log(`[IndexTokenTransfers] Found ${logs.length} logs`);

      // Validate and parse logs
      const tokensToStore = (
        await Promise.all(logs.map(parseTransferSingle))
      ).filter(
        (transfer): transfer is NewTransfer =>
          transfer !== null &&
          transfer !== undefined &&
          transfer.type === "fraction",
      );

      const transfers = tokensToStore.map((transfer) => ({
        ...transfer,
        contracts_id: contractEvent.contract_id,
      }));

      return {
        transfers,
        contractEventUpdate: {
          id: contractEvent.id,
          last_block_indexed: toBloc,
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
  await storeTransferSingleFraction({
    transfers,
  }).then(() =>
    updateLastBlockIndexedContractEvents({
      contract_events: results.flatMap((res) =>
        res?.contractEventUpdate ? [res.contractEventUpdate] : [],
      ),
    }),
  );
};

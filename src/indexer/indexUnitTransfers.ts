import { getDeployment } from "@/utils";
import { IndexerConfig, NewUnitTransfer } from "@/types/types";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents";
import { getLogsForContractEvents } from "@/monitoring/hypercerts";
import { parseValueTransfer } from "@/parsing/valueTransferEvent";
import { storeUnitTransfer } from "@/storage/storeUnits";

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
    chainId,
    eventName,
  });

  if (!contractsWithEvents || contractsWithEvents.length === 0) {
    console.debug(
      `[IndexUnitTransfers] No contract events found for ${eventName} event on chain ${chainId}`,
    );
    return;
  }

  await Promise.all(
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

      // Validate and parse logs
      const transfers = (
        await Promise.all(logs.map(parseValueTransfer))
      ).filter((transfer): transfer is NewUnitTransfer => transfer !== null);

      // store the claim and fraction tokens
      await storeUnitTransfer({
        transfers,
        contract: { id: contractEvent.contract_id },
      }).then(() =>
        updateLastBlockIndexedContractEvents({
          contractEventsId: contractEvent.id,
          lastBlockIndexed: toBlock,
        }),
      );
    }),
  );
};
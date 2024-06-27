import { getDeployment } from "@/utils/getDeployment.js";
import { IndexerConfig } from "@/types/types.js";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain.js";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents.js";
import { getLogsForContractEvents } from "@/monitoring/hypercerts.js";
import {
  ParsedValueTransfer,
  parseValueTransfer,
} from "@/parsing/valueTransferEvent.js";
import { storeUnitTransfer } from "@/storage/storeUnits.js";
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
  eventName: "ValueTransfer",
};

export const indexValueTransfer = async ({
  batchSize = defaultConfig.batchSize,
  eventName = defaultConfig.eventName,
}: IndexerConfig = defaultConfig) => {
  const { chainId } = getDeployment();
  const contractsWithEvents = await getContractEventsForChain({
    eventName,
  });

  if (!contractsWithEvents || contractsWithEvents.length === 0) {
    console.debug(
      `[IndexValueTransfers] No contract events found for ${eventName} event on chain ${chainId}`,
    );
    return;
  }

  const results = await Promise.all(
    contractsWithEvents.map(async (contractEvent) => {
      const { last_block_indexed } = contractEvent;

      // Get logs in batches
      const { logs, toBlock } = await getLogsForContractEvents({
        lastBlockIndexed: last_block_indexed,
        batchSize,
        contractEvent,
      });

      if (!logs || logs.length === 0) {
        console.debug(
          " [IndexValueTransfers] No logs found for contract event",
          contractEvent,
        );
        return {
          contractEventUpdate: {
            ...contractEvent,
            last_block_indexed: toBlock,
          },
        };
      }
      // Split logs into chunks
      const logChunks = _.chunk(logs, 10);

      // Initialize an empty array to store all claims
      let allTransfers: ParsedValueTransfer[] = [];

      // Process each chunk one by one
      for (const logChunk of logChunks) {
        const events = await Promise.all(
          logChunk.map(async (log) => ({
            ...(await parseValueTransfer(log)),
            contracts_id: contractEvent.contracts_id,
          })),
        );

        // Add the claims from the current chunk to the allClaims array
        allTransfers = [...allTransfers, ...events];
      }

      // Validate and parse logs
      const transfers = allTransfers.filter(
        (transfer) => transfer !== null && transfer !== undefined,
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
    .filter((transfer) => transfer !== null && transfer !== undefined);

  if (transfers.length === 0) {
    await updateLastBlockIndexedContractEvents({
      contract_events: results.flatMap((res) =>
        res?.contractEventUpdate ? [res.contractEventUpdate] : [],
      ),
    });
    return;
  }

  // store the claim and fraction tokens
  return await storeUnitTransfer({ transfers }).then(() =>
    updateLastBlockIndexedContractEvents({
      contract_events: results.flatMap((res) =>
        res?.contractEventUpdate ? [res.contractEventUpdate] : [],
      ),
    }),
  );
};

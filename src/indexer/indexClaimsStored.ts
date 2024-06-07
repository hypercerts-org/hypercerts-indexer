import { parseClaimStoredEvent } from "@/parsing/claimStoredEvent.js";
import { IndexerConfig } from "@/types/types.js";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain.js";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents.js";
import { getLogsForContractEvents } from "@/monitoring/hypercerts.js";
import { storeClaim } from "@/storage/storeClaim.js";

const defaultConfig = {
  batchSize: 10000n,
  eventName: "ClaimStored",
};

/**
 * Indexes the logs of the ClaimStored event emitted by the HypercertMinter contract.
 *
 * This function fetches the logs in batches based on the last block indexed, parses them, fetches the metadata,
 * and stores the hypercerts in the database. If no contract events are found, the function returns early.
 *
 * @param {object} config - Configuration object for the indexer.
 * @param {bigint} config.batchSize - The number of logs to fetch and parse in each batch. Defaults to 10000.
 * @param {string} config.eventName - The name of the event to index. Defaults to "ClaimStored".
 *
 * @returns {Promise} A promise that resolves when all claims have been stored and the last block indexed has been updated.
 *
 * @example
 * ```typescript
 * await indexClaimsStoredEvents({ batchSize: 1000n, eventName: "ClaimStored" });
 * ```
 * */
export const indexClaimsStoredEvents = async ({
  batchSize = defaultConfig.batchSize,
  eventName = defaultConfig.eventName,
}: IndexerConfig = defaultConfig) => {
  const contractsWithEvents = await getContractEventsForChain({
    eventName,
  });

  if (!contractsWithEvents || contractsWithEvents.length === 0) {
    return;
  }

  const results = await Promise.all(
    contractsWithEvents.flatMap(async (contractEvent) => {
      const { last_block_indexed } = contractEvent;

      // Get logs in batches
      const { logs, toBlock } = await getLogsForContractEvents({
        fromBlock: last_block_indexed,
        batchSize,
        contractEvent,
      });

      // parse logs to get claimID, contractAddress and cid
      const events = await Promise.all(logs.map(parseClaimStoredEvent));

      const claims = events.map((claim) => ({
        ...claim,
        contracts_id: contractEvent.contracts_id,
      }));

      return {
        claims,
        contractEventUpdate: {
          ...contractEvent,
          last_block_indexed: toBlock,
        },
      };
    }),
  );

  const claims = results.flatMap((result) => result.claims);

  const contractEventUpdates = results.flatMap((result) => [
    result.contractEventUpdate,
  ]);

  return await storeClaim({
    claims,
  }).then(() =>
    updateLastBlockIndexedContractEvents({
      contract_events: contractEventUpdates,
    }),
  );
};

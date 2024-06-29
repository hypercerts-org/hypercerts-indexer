import { parseClaimStoredEvent } from "@/parsing/claimStoredEvent.js";
import { IndexerConfig } from "@/types/types.js";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain.js";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents.js";
import { getLogsForContractEvents } from "@/monitoring/hypercerts.js";
import { Claim, storeClaim } from "@/storage/storeClaimStored";
import _ from "lodash";

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
      // Get logs in batches
      const logsFound = await getLogsForContractEvents({
        batchSize,
        contractEvent,
      });

      if (!logsFound) {
        return;
      }

      const { logs, toBlock } = logsFound;

      if (!logs || logs.length === 0) {
        console.debug("[IndexClaimsStored] No logs found for contract event", {
          eventName: contractEvent.event_name,
        });
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
      let allClaims: Claim[] = [];

      // Process each chunk one by one
      for (const logChunk of logChunks) {
        const events = await Promise.all(logChunk.map(parseClaimStoredEvent));

        const claims = events.map((claim) => ({
          ...claim,
          contracts_id: contractEvent.contracts_id,
        }));

        // Add the claims from the current chunk to the allClaims array
        allClaims = [...allClaims, ...claims];
      }

      const claims = allClaims.filter(
        (claim) => claim !== null && claim !== undefined,
      );

      return {
        claims,
        contractEventUpdate: {
          ...contractEvent,
          last_block_indexed: toBlock,
        },
      };
    }),
  );

  const claims = results
    .flatMap((result) => (result?.claims ? result.claims : undefined))
    .filter((claim) => claim !== null && claim !== undefined);

  const contractEventUpdates = results.flatMap((result) => {
    return result?.contractEventUpdate ? [result.contractEventUpdate] : [];
  });

  return await storeClaim({
    claims,
  }).then(() =>
    updateLastBlockIndexedContractEvents({
      contract_events: contractEventUpdates,
    }),
  );
};

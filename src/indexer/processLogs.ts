import { parseClaimStoredEvent } from "@/parsing/claimStoredEvent.js";
import { Claim, storeClaim } from "@/storage/storeClaim.js";
import _ from "lodash";

export interface LogParser<T> {
  logs: unkown[];
  contracts_id: string;
  parsingMethod: (event: unknown) => Promise<T>;
  storageMethod: (data: T[]) => Promise<void>;
}

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
export const processClaimStored = async ({ logs, contracts_id }: LogParser) => {
  console.log(`Processing ${logs.length} ClaimStores logs`);
  // Split logs into chunks
  const logChunks = _.chunk(logs, 10);

  // Initialize an empty array to store all claims
  let allClaims: Claim[] = [];

  // Process each chunk one by one
  for (const logChunk of logChunks) {
    const events = await Promise.all(logChunk.map(parseClaimStoredEvent));

    const claims = events.map((claim) => ({
      ...claim,
      contracts_id,
    }));

    // Add the claims from the current chunk to the allClaims array
    allClaims = [...allClaims, ...claims];
  }

  const claims = allClaims.filter(
    (claim) => claim !== null && claim !== undefined,
  );

  return await storeClaim({
    claims,
  });
};

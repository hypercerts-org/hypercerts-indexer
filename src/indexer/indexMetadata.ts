import { IndexerConfig } from "@/types/types.js";
import { getMissingMetadataUris } from "@/storage/getMissingMetadataUris.js";
import { storeMetadata } from "@/storage/storeMetadata.js";
import { fetchMetadataFromUri } from "@/fetching/fetchMetadataFromUri.js";
import _ from "lodash";

/*
 * This function indexes the logs of the ClaimStored event emitted by the HypercertMinter contract. Based on the last
 * block indexed, it fetches the logs in batches, parses them, fetches the metadata, and stores the hypercerts in the
 * database.
 *
 * @param [batchSize] - The number of logs to fetch and parse in each batch.
 *
 * @example
 * ```js
 * await indexClaimsStoredEvents({ batchSize: 1000n });
 * ```
 */

export const indexMetadata = async ({ batchSize }: IndexerConfig) => {
  const missingUris = await getMissingMetadataUris();

  if (!missingUris || missingUris.length === 0) {
    return;
  }

  const logChunks = _.chunk(missingUris, Number(batchSize));
  for (const chunk of logChunks) {
    await processMetadataBatch(chunk);
  }
};

const processMetadataBatch = async (batch: string[]) => {
  const data = await Promise.all(
    batch.map(async (uri) => await fetchMetadataFromUri({ uri })),
  );

  const filtered = data.filter(
    (metadata) => metadata !== null && metadata !== undefined,
  );

  if (!filtered || filtered.length === 0) {
    return;
  }

  await storeMetadata({ data: filtered });
};

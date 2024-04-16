import { IndexerConfig } from "@/types/types";
import { getMissingMetadataUris } from "@/storage/getMissingMetadataUris";
import { storeMetadata } from "@/storage/storeMetadata";
import { Tables } from "@/types/database.types";
import { fetchMetadataFromUri } from "@/fetching/fetchMetadataFromUri";

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

const defaultConfig = {
  batchSize: 5n,
};

export const indexMetadata = async ({
  batchSize = defaultConfig.batchSize,
}: IndexerConfig = defaultConfig) => {
  const missingUris = await getMissingMetadataUris();

  if (!missingUris || missingUris.length === 0) {
    return;
  }

  const _size = Number(batchSize);

  console.log(`[IndexMetadata] Processing ${missingUris.length} metadata URIs`);

  // Process metadata in batches
  for (let i = 0; i < missingUris.length; i += _size) {
    const batch = missingUris.slice(i, i + _size);

    await processMetadataBatch(batch);
  }
};

const processMetadataBatch = async (batch: string[]) => {
  const metadata = (
    await Promise.all(
      batch.map(async (uri) => ({
        uri,
        ...(await fetchMetadataFromUri({ uri })),
      })),
    )
  ).filter(
    (metadata): metadata is Tables<"metadata"> =>
      metadata !== null && metadata !== undefined,
  );

  await storeMetadata({ metadata });
};

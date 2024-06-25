import { IndexerConfig } from "@/types/types.js";
import { getMissingMetadataUris } from "@/storage/getMissingMetadataUris.js";
import { storeMetadata } from "@/storage/storeMetadata.js";
import { fetchMetadataFromUri } from "@/fetching/fetchMetadataFromUri.js";

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
    console.debug("[IndexMetadata] No missing metadata URIs found");
    return;
  }

  const _size = Number(batchSize);

  console.debug(
    `[IndexMetadata] Processing ${missingUris.length} metadata URIs`,
  );

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
        parsed: true,
        ...(await fetchMetadataFromUri({ uri })),
      })),
    )
  ).filter((metadata) => metadata !== null && metadata !== undefined);

  // @ts-expect-error properties[] cannot be mapped to JSON
  await storeMetadata({ metadata });
};

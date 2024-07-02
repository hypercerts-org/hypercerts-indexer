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

  console.debug(
    `[IndexMetadata] Processing ${missingUris.length} metadata URIs`,
  );

  const logChunks = _.chunk(missingUris, Number(batchSize));
  for (const chunk of logChunks) {
    await processMetadataBatch(chunk);
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

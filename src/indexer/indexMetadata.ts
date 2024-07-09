import { IndexerConfig } from "@/types/types.js";
import { getMissingMetadataUris } from "@/storage/getMissingMetadataUris.js";
import { storeMetadata } from "@/storage/storeMetadata.js";
import _ from "lodash";
import { fetchFromHttpsOrIpfs } from "@/utils/fetchFromHttpsOrIpfs.js";
import { parseMetadata } from "@/parsing/metadata.js";

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

export const indexMetadata = async ({ batchSize, context }: IndexerConfig) => {
  const { dataFetcher } = context;
  const missingUris = await getMissingMetadataUris();

  if (!missingUris || missingUris.length === 0) {
    return;
  }

  const logChunks = _.chunk(missingUris, Number(batchSize));
  const fetchMethod = dataFetcher ?? fetchFromHttpsOrIpfs;
  for (const chunk of logChunks) {
    const data = await Promise.all(
      chunk.map(async (uri) => {
        const data = await fetchMethod({ uri });
        const parsed = await parseMetadata({ data, context });
        return [{ ...parsed[0], uri }];
      }),
    );

    if (!data || data.length === 0) {
      return;
    }

    const flatData = data.flat();

    // @ts-expect-error property uri does not exist on type Database["public"]["Tables"]["metadata"]["Update"]
    await storeMetadata({ data: flatData });
  }
};

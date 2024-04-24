import { IndexerConfig } from "@/types/types";
import { getMissingAllowListUris } from "@/storage/getMissingAllowListUris";
import { fetchAllowListFromUri } from "@/fetching/fetchAllowlistFromUri";
import { storeAllowListData } from "@/storage/storeAllowListData";
import { Database, Tables } from "@/types/database.types";

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

export const indexAllowListData = async ({
  batchSize = defaultConfig.batchSize,
}: IndexerConfig = defaultConfig) => {
  const missingAllowLists = await getMissingAllowListUris();

  if (!missingAllowLists || missingAllowLists.length === 0) {
    console.debug("[IndexAllowListData] No missing allow lists found");
    return;
  }

  const _size = Number(batchSize);

  console.debug(
    `[IndexAllowListData] Processing ${missingAllowLists.length} allow lists`,
  );

  // Process metadata in batches
  for (let i = 0; i < missingAllowLists.length; i += _size) {
    const batch = missingAllowLists.slice(i, i + _size);

    await processAllowListBatch(batch);
  }
};

const processAllowListBatch = async (
  batch: Database["public"]["Functions"]["find_missing_allow_list_uris_and_roots"]["Returns"],
) => {
  const allowListData = (
    await Promise.all(
      batch.map(async (missingList) => {
        const allowList = await fetchAllowListFromUri({
          uri: missingList.allow_list_uri,
        });

        if (!allowList) {
          return;
        }

        if (missingList.allow_list_root !== allowList.root) {
          console.error(
            `[IndexAllowListData] Root hash mismatch for allow list ${missingList.allow_list_uri}: expected ${missingList.allow_list_root}, got ${allowList.root}`,
          );
          return;
        }

        return {
          id: missingList.allow_list_id,
          data: JSON.stringify(allowList.dump()),
          root: missingList.allow_list_root,
          uri: missingList.allow_list_uri,
          parsed: false,
        } as Partial<Tables<"allow_list_data">>;
      }),
    )
  ).filter(
    (data): data is Partial<Tables<"allow_list_data">> =>
      data !== null && data !== undefined,
  );

  await storeAllowListData({
    allowListData,
  });
};

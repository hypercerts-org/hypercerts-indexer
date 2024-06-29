import { IndexerConfig } from "@/types/types.js";
import { fetchAllowListFromUri } from "@/fetching/fetchAllowlistFromUri.js";
import { storeAllowListData } from "@/storage/storeAllowListData.js";
import { Tables } from "@/types/database.types.js";
import { getUnparsedAllowLists } from "@/storage/getUnparsedAllowLists.js";

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
  const missingAllowLists = await getUnparsedAllowLists();

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
  batch: Partial<Tables<"allow_list_data">>[],
) => {
  const allowListData = (
    await Promise.all(
      batch.map(async (missingList) => {
        if (!missingList.uri) {
          console.error(
            `[IndexAllowListData] Missing URI for allow list ${missingList.id}`,
          );
          return;
        }

        const allowList = await fetchAllowListFromUri({
          uri: missingList.uri,
        });

        if (!allowList) {
          return;
        }

        return {
          id: missingList.id,
          data: JSON.parse(JSON.stringify(allowList.dump())),
          root: allowList.root,
          uri: missingList.uri,
          parsed: true,
        } as Tables<"allow_list_data">;
      }),
    )
  ).filter((data) => data !== null && data !== undefined);

  await storeAllowListData({
    allowListData,
  });
};

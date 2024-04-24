import { IndexerConfig } from "@/types/types";
import { storeAllowListData } from "@/storage/storeAllowListData";
import { AllowList, getUnparsedAllowLists } from "@/storage/getUnparsedAllowLists";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { storeAllowListRecords } from "@/storage/storeAllowListRecords";
import { Tables } from "@/types/database.types";

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

export const indexAllowListEntries = async ({
  batchSize = defaultConfig.batchSize,
}: IndexerConfig = defaultConfig) => {
  const unparsedAllowLists = await getUnparsedAllowLists();

  if (!unparsedAllowLists || unparsedAllowLists.length === 0) {
    console.debug("[IndexAllowListEntries] No unparsed allow lists found");
    return;
  }

  const _size = Number(batchSize);

  console.debug(
    `[IndexAllowListEntries] Processing ${unparsedAllowLists.length} allow lists`,
  );

  // Process metadata in batches
  for (let i = 0; i < unparsedAllowLists.length; i += _size) {
    const batch = unparsedAllowLists.slice(i, i + _size);

    await processAllowListEntriesBatch(batch);
  }
};

const processAllowListEntriesBatch = async (batch: AllowList[]) => {
  const rows = await Promise.all(
    batch.map(async (allowList) => {
      if (!allowList.allow_list_data || !allowList.allow_list_data[0].data) {
        console.warn(
          `[IndexAllowListEntries] Missing data for allow list ${allowList.id}`,
          allowList,
        );
        return;
      }

      const tree = StandardMerkleTree.load(
        JSON.parse(<string>allowList.allow_list_data[0].data,
      );

      if (!tree) {
        console.error(
          "[IndexAllowListEntries] Failed to load tree from data",
          allowList
        );
        return;
      }

      const rows = [];
      for (const [i, v] of tree.entries()) {
        rows.push({
          hc_allow_list_id: allowList.id,
          user_address: v[0],
          entry: i,
          units: v[1]
        });
      }

      return rows;
    }),
  );

  const allowListRecords = rows
    .flat()
    .filter(
      (r): r is Tables<"allow_list_records"> => r !== null && r !== undefined
    );

  const data = await storeAllowListRecords({ allowListRecords });

  if (!data) {
    console.error(`[IndexAllowListEntries] Failed to store allow list records`);
    return;
  }

  await storeAllowListData({
    allowListData: batch.map((allowList) => ({
      id: allowList.id,
      parsed: true
    })),
  });
};

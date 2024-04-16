import { IndexerConfig } from "@/types/types";
import { storeAllowListData } from "@/storage/storeAllowListData";
import { getUnparsedAllowLists } from "@/storage/getUnparsedAllowLists";
import { Tables } from "@/types/database.types";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { storeAllowListRecords } from "@/storage/storeAllowListRecords";

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

  console.log(
    `[IndexAllowListEntries] Processing ${unparsedAllowLists.length} allow lists`,
  );

  // Process metadata in batches
  for (let i = 0; i < unparsedAllowLists.length; i += _size) {
    const batch = unparsedAllowLists.slice(i, i + _size);

    await processAllowListEntriesBatch(batch);
  }
};

const processAllowListEntriesBatch = async (
  batch: Tables<"allow_list_data">[],
) => {
  batch.map(async (allowList) => {
    if (!allowList.data) {
      console.error(
        `[IndexAllowListEntries] Missing data for allow list ${allowList.id}`,
      );
      return;
    }

    console.log(allowList);

    const tree = StandardMerkleTree.load(JSON.parse(<string>allowList.data));

    if (!tree) {
      console.error("[IndexAllowListEntries] Failed to load tree from data");
      return;
    }

    const rows = [];
    for (const [i, v] of tree.entries()) {
      rows.push({
        allow_list_id: allowList.id,
        user_address: v[0],
        entry: i,
        units: v[1],
      });
    }

    const data = await storeAllowListRecords({ allowListRecords: rows });

    if (!data) {
      console.error(
        `[IndexAllowListEntries] Failed to store allow list records for ${allowList.id}`,
      );
      return;
    }

    await storeAllowListData({
      allowListData: {
        id: allowList.id,
        parsed: true,
      },
    });
  });
};

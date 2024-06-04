import { IndexerConfig } from "@/types/types";
import { storeAllowListRecords } from "@/storage/storeAllowListRecords";
import {
  getUnparsedAllowListRecords,
  UnparsedAllowListRecord,
} from "@/storage/getUnparsedAllowListsRecords";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

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
  batchSize: 2n,
};

//TODO allow list records parsing based on created allowlists and claims
export const indexAllowlistRecords = async ({
  batchSize = defaultConfig.batchSize,
}: IndexerConfig = defaultConfig) => {
  const unparsedAllowLists = await getUnparsedAllowListRecords();

  if (!unparsedAllowLists || unparsedAllowLists.length === 0) {
    console.debug(
      "[IndexAllowlistRecords] No parsable unparsed allow lists found",
    );
    return;
  }

  const _size = Number(batchSize);

  console.debug(
    `[IndexAllowlistRecords] Processing ${unparsedAllowLists.length} allow lists`,
  );

  // Process metadata in batches
  for (let i = 0; i < unparsedAllowLists.length; i += _size) {
    console.debug(
      `[IndexAllowlistRecords] Processing batch ${i} - ${i + _size - 1}`,
    );
    const batch = unparsedAllowLists.slice(i, i + _size);

    await processAllowListEntriesBatch(batch);
  }
};

const processAllowListEntriesBatch = async (
  batch: UnparsedAllowListRecord[],
) => {
  const allowListsToStore = await Promise.all(
    batch.map(async (allowList) => {
      const tree = StandardMerkleTree.load(allowList.data);

      if (!tree) {
        console.debug(
          "[IndexAllowlistRecords] Failed to load tree from data",
          allowList,
        );
        return;
      }

      const rows = [];
      for (const [i, v] of tree.entries()) {
        const leaf = tree.leafHash(v);
        const proof = tree.getProof(v);
        rows.push({
          user_address: v[0],
          entry: i,
          units: v[1],
          leaf,
          proof,
        });
      }

      return { ...allowList, records: rows };
    }),
  );

  try {
    await Promise.all(
      allowListsToStore.map((data) =>
        storeAllowListRecords({
          claim_id: data?.claim_id,
          allow_list_data_id: data?.al_data_id,
          records: data?.records,
        }),
      ),
    );
  } catch (error) {
    console.error(
      "[IndexAllowlistRecords] Error while storing allow list records",
      error,
    );
  }
};

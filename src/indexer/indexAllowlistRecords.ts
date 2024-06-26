import { IndexerConfig } from "@/types/types.js";
import { storeAllowListRecords } from "@/storage/storeAllowListRecords.js";
import { getUnparsedAllowListRecords } from "@/storage/getUnparsedAllowListsRecords.js";
import { Database } from "@/types/database.types.js";
import { parseToOzMerkleTree } from "@/utils/parseToOzMerkleTree.js";
import _ from "lodash";
import { getAddress } from "viem";

/**
 * This function indexes the unparsed allow lists in batches.
 *
 * It fetches the unparsed allow lists from the database and processes them in batches. The size of the batches is determined by the `batchSize` parameter.
 * If no unparsed allow lists are found, the function logs a debug message and returns.
 * For each batch, it calls the `processAllowListEntriesBatch` function to process the allow list entries.
 *
 * @param {IndexerConfig} config - The configuration for the indexer. It has a `batchSize` property that defaults to `defaultConfig.batchSize`.
 * @returns {Promise<void>} A promise that resolves when all batches have been processed.
 *
 * @example
 * ```typescript
 * await indexAllowlistRecords({ batchSize: 1000n });
 * ```
 */

//TODO allow list records parsing based on created allowlists and claims
export const indexAllowlistRecords = async ({ batchSize }: IndexerConfig) => {
  const unparsedAllowLists = await getUnparsedAllowListRecords();

  if (!unparsedAllowLists || unparsedAllowLists.length === 0) {
    return;
  }

  const allowlistChunks = _.chunk(unparsedAllowLists, Number(batchSize));

  for (const chunk of allowlistChunks) {
    await processAllowListEntriesBatch(chunk);
  }
};

const processAllowListEntriesBatch = async (
  batch: Database["public"]["Functions"]["get_unparsed_hypercert_allow_lists"]["Returns"],
) => {
  const allowListsToStore = await Promise.all(
    batch.map(async (allowList) => {
      const tree = parseToOzMerkleTree(allowList?.data);
      if (!tree) {
        console.error(
          "[IndexAllowlistRecords] Error while loading tree from data",
          allowList,
        );
        return;
      }

      const rows = [];
      for (const [i, v] of tree.entries()) {
        const leaf = tree.leafHash(v);
        const proof = tree.getProof(v);
        rows.push({
          user_address: getAddress(v[0]),
          entry: i,
          units: v[1],
          leaf,
          proof,
          claimed: false,
        });
      }

      return { ...allowList, records: rows };
    }),
  );

  try {
    await Promise.all(
      allowListsToStore.map((data) => {
        if (!data || !data.records) {
          console.debug(
            "[IndexAllowlistRecords] No records found for allow list",
            data,
          );
          return;
        }
        storeAllowListRecords({
          claim_id: data?.claim_id,
          allow_list_data_id: data?.al_data_id,
          // @ts-ignore
          records: data?.records,
        });
      }),
    );
  } catch (error) {
    console.error(
      "[IndexAllowlistRecords] Error while storing allow list records",
      error,
    );
  }
};

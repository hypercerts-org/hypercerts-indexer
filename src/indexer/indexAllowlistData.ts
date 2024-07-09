import { IndexerConfig } from "@/types/types.js";
import { storeAllowListData } from "@/storage/storeAllowListData.js";
import { getUnparsedAllowLists } from "@/storage/getUnparsedAllowLists.js";
import _ from "lodash";
import { fetchFromHttpsOrIpfs } from "@/utils/fetchFromHttpsOrIpfs.js";
import { parseToOzMerkleTree } from "@/utils/parseToOzMerkleTree.js";

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

export const indexAllowListData = async ({
  batchSize,
  context,
}: IndexerConfig) => {
  const { dataFetcher } = context;
  const missingAllowLists = await getUnparsedAllowLists();

  if (!missingAllowLists || missingAllowLists.length === 0) {
    return;
  }

  const allowlistChunks = _.chunk(missingAllowLists, Number(batchSize));

  const fetchMethod = dataFetcher || fetchFromHttpsOrIpfs;

  for (const chunk of allowlistChunks) {
    const allowListData = (
      await Promise.all(
        chunk.map(async (missingList) => {
          const { id, uri } = missingList;
          if (!uri) {
            console.error(
              `[IndexAllowListData] Missing URI for allow list ${id}`,
            );
            return;
          }

          const res = await fetchMethod({
            uri,
          });

          if (!res) {
            return;
          }

          const allowList = parseToOzMerkleTree(res, uri);

          if (!allowList) {
            return;
          }

          return {
            id,
            data: allowList.dump(),
            root: allowList.root,
            uri,
            parsed: true,
          };
        }),
      )
    ).filter((data) => data !== null && data !== undefined);

    await storeAllowListData({
      data: allowListData,
      context,
    });
  }
};

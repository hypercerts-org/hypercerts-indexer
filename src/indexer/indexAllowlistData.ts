import { IndexerConfig } from "@/types/types.js";
import { fetchAllowListFromUri } from "@/fetching/fetchAllowlistFromUri.js";
import { storeAllowListData } from "@/storage/storeAllowListData.js";
import { Tables } from "@/types/database.types.js";
import { getUnparsedAllowLists } from "@/storage/getUnparsedAllowLists.js";
import _ from "lodash";
import { LogParserContext } from "@/indexer/processLogs.js";

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
  const missingAllowLists = await getUnparsedAllowLists();

  if (!missingAllowLists || missingAllowLists.length === 0) {
    console.debug("[IndexAllowListData] No missing allow lists found");
    return;
  }

  const allowlistChunks = _.chunk(missingAllowLists, Number(batchSize));

  for (const chunk of allowlistChunks) {
    await processAllowListBatch(chunk, context);
  }
};

const processAllowListBatch = async (
  batch: Partial<Tables<"allow_list_data">>[],
  context: LogParserContext,
) => {
  const allowListData = (
    await Promise.all(
      batch.map(async (missingList) => {
        const { id, uri } = missingList;
        if (!uri) {
          console.error(
            `[IndexAllowListData] Missing URI for allow list ${id}`,
          );
          return;
        }

        const allowList = await fetchAllowListFromUri({
          uri,
        });

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
};

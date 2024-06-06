import { IndexerConfig, NewAllowList } from "@/types/types.js";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain.js";
import { getLogsForContractEvents } from "@/monitoring/index.js";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents.js";
import { parseAllowListCreated } from "@/parsing/allowListCreatedEvent.js";
import { storeHypercertAllowList } from "@/storage/storeHypercertAllowList.js";
import { Database } from "@/types/database.types.js";

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
  batchSize: 10000n,
  eventName: "AllowlistCreated",
};

export const indexAllowListCreated = async ({
  batchSize = defaultConfig.batchSize,
  eventName = defaultConfig.eventName,
}: IndexerConfig = defaultConfig) => {
  const contractsWithEvents = await getContractEventsForChain({
    eventName,
  });

  if (!contractsWithEvents || contractsWithEvents.length === 0) {
    return;
  }

  const results = await Promise.all(
    contractsWithEvents.map(async (contractEvent) => {
      const { last_block_indexed } = contractEvent;

      // Get logs in batches
      const logsFound = await getLogsForContractEvents({
        fromBlock: last_block_indexed ? BigInt(last_block_indexed) : 0n,
        batchSize,
        contractEvent,
      });

      if (!logsFound) {
        return;
      }

      const { logs, toBlock } = logsFound;

      // parse logs to get claimID, contractAddress and cid
      const allowLists = (
        await Promise.all(logs.map(parseAllowListCreated))
      ).filter(
        (allowList): allowList is NewAllowList =>
          allowList !== null && allowList !== undefined,
      );

      const allowListData = allowLists.map((allowList) => ({
        token_id: allowList.token_id.toString(),
        contract_id: contractEvent.contracts_id,
        root: allowList.root,
      }));

      return {
        allowListData,
        contractEventUpdate: {
          ...contractEvent,
          last_block_indexed: toBlock,
        },
      };
    }),
  );

  // TODO better typings
  const allowListPointers = results
    .flatMap((result) =>
      result?.allowListData ? result.allowListData : undefined,
    )
    .filter(
      (al) => al !== null && al !== undefined,
    ) as Database["public"]["CompositeTypes"]["allow_list_data_type"][];

  await storeHypercertAllowList({
    batchToStore: allowListPointers,
  })
    .then(() =>
      updateLastBlockIndexedContractEvents({
        contract_events: results.flatMap((res) =>
          res?.contractEventUpdate ? [res.contractEventUpdate] : [],
        ),
      }),
    )
    .catch((error) => console.error(error));
};

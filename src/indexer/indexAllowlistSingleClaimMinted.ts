import { parseLeafClaimedEvent } from "@/parsing";
import { getDeployment } from "@/utils";
import { IndexerConfig, LeafClaimed } from "@/types/types";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents";
import { getLogsForContractEvents } from "@/monitoring/hypercerts";
import { updateAllowlistRecordClaimed } from "@/storage/updateAllowlistRecordClaimed";

/*
 * This function indexes the logs of the LeafClaimed event emitted by the HypercertMinter contract. Based on the last
 * block indexed, it fetches the logs in batches, parses them, finds the correct allowlist entry and marks it as claimed.
 *
 * @param [batchSize] - The number of logs to fetch and parse in each batch.
 *
 * @example
 * ```js
 * await indexAllowlistSingleClaimMinted({ batchSize: 1000n });
 * ```
 */

const defaultConfig = {
  batchSize: 20000n,
  eventName: "LeafClaimed",
};

export const indexAllowlistSingleClaimMinted = async ({
  batchSize = defaultConfig.batchSize,
  eventName = defaultConfig.eventName,
}: IndexerConfig = defaultConfig) => {
  const { chainId } = getDeployment();
  const contractsWithEvents = await getContractEventsForChain({
    chainId,
    eventName,
  });

  if (!contractsWithEvents || contractsWithEvents.length === 0) {
    return;
  }

  const results = await Promise.all(
    contractsWithEvents.flatMap(async (contractEvent) => {
      const { last_block_indexed } = contractEvent;

      // Get logs in batches
      const logsFound = await getLogsForContractEvents({
        fromBlock: last_block_indexed ? BigInt(last_block_indexed) : 0n,
        batchSize,
        contractEvent,
      });

      if (!logsFound) {
        console.debug(
          " [IndexAllowlistSingleClaimMinted] No logs found for contract event",
          contractEvent,
        );
        return;
      }

      const { logs, toBlock } = logsFound;

      // parse logs to get claimID, contractAddress and cid
      const parsedEvents = (
        await Promise.all(logs.map(parseLeafClaimedEvent))
      ).filter(
        (claim): claim is Partial<LeafClaimed> =>
          claim !== null && claim !== undefined,
      );

      const claims = parsedEvents.map((claim) => ({
        ...claim,
        contracts_id: contractEvent.contracts_id,
      }));

      return {
        claims,
        contractEventUpdate: {
          ...contractEvent,
          last_block_indexed: toBlock,
        },
      };
    }),
  );

  const claims = results
    .flatMap((result) => (result?.claims ? result.claims : undefined))
    .filter(
      (claim): claim is LeafClaimed => claim !== null && claim !== undefined,
    );

  await Promise.all(
    claims.map(async (claim) => {
      return updateAllowlistRecordClaimed({
        tokenId: claim.token_id,
        leaf: claim.leaf,
        userAddress: claim.creator_address as `0x${string}`,
      });
    }),
  );

  await updateLastBlockIndexedContractEvents({
    contract_events: results.flatMap((res) =>
      res?.contractEventUpdate ? [res.contractEventUpdate] : [],
    ),
  });
};

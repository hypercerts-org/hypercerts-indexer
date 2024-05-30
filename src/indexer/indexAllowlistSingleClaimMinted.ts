import { parseLeafClaimedEvent } from "@/parsing";
import { getDeployment } from "@/utils";
import { IndexerConfig, LeafClaimed } from "@/types/types";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents";
import { getLogsForContractEvents } from "@/monitoring/hypercerts";
import { updateAllowlistRecordClaimed } from "@/storage/updateAllowlistRecordClaimed";
import { supabase } from "@/clients/supabaseClient";
import { client } from "@/clients/evmClient";

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

  const currentBlock = await client.getBlockNumber();
  const currentEventsClaimStored = await getContractEventsForChain({
    chainId,
    eventName: "ClaimStored",
  });
  const latestIndexedBlockClaimStored = (currentEventsClaimStored || []).reduce(
    (maxBlock, event) => {
      return BigInt(event.last_block_indexed) > maxBlock
        ? BigInt(event.last_block_indexed)
        : maxBlock;
    },
    0n,
  );
  const claimStoredIndexingUpToDate =
    currentBlock === latestIndexedBlockClaimStored;

  // Do batch size based on latest indexed allowlist data for current chain
  const latestIndexedHypercertAllowlist = await supabase
    .from("hypercert_allowlists_with_claim")
    .select("block_number")
    .like("hypercert_id", `${chainId}-%`)
    .order("block_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const latestIndexedAllowlistClaimBlock = latestIndexedHypercertAllowlist?.data
    ?.block_number as number | undefined;

  if (latestIndexedAllowlistClaimBlock === undefined) {
    // No allowlists known, so nothing to index
    return;
  }

  if (!contractsWithEvents || contractsWithEvents.length === 0) {
    return;
  }

  const results = await Promise.all(
    contractsWithEvents.flatMap(async (contractEvent) => {
      const { last_block_indexed } = contractEvent;
      const fromBlock = last_block_indexed ? last_block_indexed : 0n;
      const proposedEndBlock = fromBlock + batchSize;

      let maxEndBlock: bigint | undefined;

      if (claimStoredIndexingUpToDate) {
        // If we're up-to-date with the chain for ClaimStored event, we can index up to the latest block that had its ClaimStored events parsed
        maxEndBlock = latestIndexedBlockClaimStored;
      } else {
        // Set maxEndBlock to lowest of proposedEndBlock and latestIndexedAllowlistClaimBlock
        // This is so we only parse LeafClaimed events for hypercert-allowlists that have been fetched from IPFS and indexed
        maxEndBlock =
          proposedEndBlock < BigInt(latestIndexedAllowlistClaimBlock)
            ? proposedEndBlock
            : BigInt(latestIndexedAllowlistClaimBlock);
      }

      const adjustedBatchSize = claimStoredIndexingUpToDate
        ? batchSize
        : maxEndBlock - fromBlock;

      // Get logs in batches
      const logsFound = await getLogsForContractEvents({
        fromBlock,
        batchSize: adjustedBatchSize,
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

import { getClaimStoredLogs } from "@/monitoring";
import { parseClaimStoredEvent } from "@/parsing";
import { storeHypercert } from "@/storage";
import { getLastBlockIndexed } from "@/storage/getLastBlockIndexed";
import { updateLastBlock } from "@/storage/updateLastBlock";
import { fetchMetadataFromUri } from "@/fetching";

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

export const indexClaimsStoredEvents = async ({ batchSize = 1000n }) => {
  const lastBlockIndexed = await getLastBlockIndexed();

  // Get logs in batches
  const logsFound = await getClaimStoredLogs({
    fromBlock: lastBlockIndexed?.blockNumber
      ? BigInt(lastBlockIndexed.blockNumber)
      : 0n,
    batchSize,
  });

  if (!logsFound) {
    return;
  }

  const { logs, toBlock } = logsFound;

  // parse logs to get claimID, contractAddress and cid
  const parsedEvents = logs.map(parseClaimStoredEvent).flatMap((claim) => {
    if (claim) return [claim];
    return [];
  });

  // fetch metadata from IPFS
  const claimsToStore = await Promise.all(
    parsedEvents.map(fetchMetadataFromUri),
  );

  console.info(`Storing ${claimsToStore.length} hypercerts`);

  // store hypercerts in the database
  await Promise.all(claimsToStore.map(storeHypercert))
    .catch((error) => {
      console.error("Error while storing hypercerts", error);
      return;
    })
    .then(async (storeResponse) => {
      console.info(
        `Stored ${storeResponse ? storeResponse.length : 0} hypercerts`,
      );
      return await updateLastBlock(toBlock);
    });
};

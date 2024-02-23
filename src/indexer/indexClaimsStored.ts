import { getClaimStoredLogs } from "@/monitoring";
import { parseClaimStoredEvent } from "@/parsing";
import { storeHypercert } from "@/storage";
import { getLastBlockIndexed } from "@/storage/getLastBlockIndexed";
import { updateLastBlock } from "@/storage/updateLastBlock";

export const indexClaimsStoredEvents = async ({ batchSize = 1000n }) => {
  const lastBlockIndexed = await getLastBlockIndexed();
  const fromBlock = lastBlockIndexed?.[0]?.block_number
    ? BigInt(lastBlockIndexed[0].block_number)
    : 0n;

  // Get logs in batches
  const { logs, toBlock } = await getClaimStoredLogs({
    fromBlock,
    batchSize,
  });

  // parse logs to get metadata, claimID, contractAddress and cid
  const parsedLogs = await Promise.all(logs.map(parseClaimStoredEvent));

  // filter parsed logs that are invalid
  const validParsedLogs = parsedLogs.flatMap((log) => {
    if (log && log.metadata) return [log];
    return [];
  });

  console.info(`Storing ${validParsedLogs.length} hypercerts`);

  // store hypercerts in the database
  await Promise.all(
    validParsedLogs.map((log) =>
      storeHypercert(
        log?.contractAddress,
        log?.claimID,
        log?.metadata,
        log?.cid
      )
    )
  )
    .catch((error) => {
      console.error("Error while storing hypercerts", error);
      return;
    })
    .then(async (storeResponse) => {
      console.info(`Stored ${storeResponse?.length ?? 0} hypercerts`);
      return await updateLastBlock(toBlock);
    });
};

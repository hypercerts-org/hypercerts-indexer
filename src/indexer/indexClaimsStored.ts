import { getClaimStoredLogs } from "@/monitoring";
import { parseClaimStoredEvent } from "@/parsing";
import { storeHypercertContract, storeHypercerts } from "@/storage";
import { fetchMetadataFromUri } from "@/fetching";
import { getDeployment } from "@/utils";
import { getHypercertContracts } from "@/storage/getHypercertContracts";
import { IndexerConfig } from "@/types/types";

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
const defaultConfig = { batchSize: 1000n };

export const indexClaimsStoredEvents = async ({
  batchSize = defaultConfig.batchSize,
}: IndexerConfig = defaultConfig) => {
  const { chainId } = getDeployment();
  const hypercert_contracts = await getHypercertContracts({ chainId });

  if (!hypercert_contracts || hypercert_contracts.length === 0) {
    console.error("No hypercert contracts found");
    return;
  }

  await Promise.all(
    hypercert_contracts.map(async (contract) => {
      const { last_block_indexed } = contract;

      // Get logs in batches
      const logsFound = await getClaimStoredLogs({
        fromBlock: last_block_indexed ? BigInt(last_block_indexed) : 0n,
        batchSize,
      });

      if (!logsFound) {
        return;
      }

      const { logs, toBlock } = logsFound;

      // parse logs to get claimID, contractAddress and cid
      // fetch metadata from IPFS
      const parsedEvents = await Promise.all(
        logs.map(
          async (log) =>
            await parseClaimStoredEvent(log).then(
              async (hypercert) =>
                await fetchMetadataFromUri({
                  hypercert,
                }),
            ),
        ),
      );

      await storeHypercerts({ hypercerts: parsedEvents, contract }).then(() =>
        storeHypercertContract({
          contract: {
            ...contract,
            last_block_indexed: toBlock,
          },
        }),
      );
    }),
  );
};

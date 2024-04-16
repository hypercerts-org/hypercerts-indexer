import { parseClaimStoredEvent } from "@/parsing";
import { getDeployment } from "@/utils";
import { IndexerConfig, NewClaim } from "@/types/types";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain";
import { updateLastBlockIndexedContractEvents } from "@/storage/updateLastBlockIndexedContractEvents";
import { getLogsForContractEvents } from "@/monitoring/hypercerts";
import { storeClaim } from "@/storage/storeClaim";

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
  eventName: "ClaimStored",
};

export const indexClaimsStoredEvents = async ({
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

  await Promise.all(
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
      const claims = (
        await Promise.all(logs.map(parseClaimStoredEvent))
      ).filter((claim): claim is NewClaim => claim !== null);

      // TODO - flip so claims are passed as array
      await Promise.all(
        claims.map(
          async (claim) =>
            await storeClaim({
              claim,
              contract: { id: contractEvent.contract_id },
            }),
        ),
      ).then(() =>
        updateLastBlockIndexedContractEvents({
          contractEventsId: contractEvent.id,
          lastBlockIndexed: toBloc,
        }),
      );
    }),
  );
};

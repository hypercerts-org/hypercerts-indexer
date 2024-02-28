import { client } from "@/monitoring/evmClient";
import { parseAbiItem } from "viem";
import { getDeployment } from "@/utils/getDeployment";

/* 
    This function fetches the logs of the ClaimStored event from the HypercertMinter contract.
    
    @param fromBlock - The block number from which to start fetching logs.
    @param batchSize - The number of blocks to fetch logs from.
    @returns The logs and the block numbers from which to start fetching logs. 
    
    @example
    ```js
    const logs = await getClaimStoredLogs({ fromBlock: 1337n, batchSize: 100n });
    ```
 */
export const getClaimStoredLogs = async ({
  fromBlock,
  batchSize,
}: {
  fromBlock?: bigint;
  batchSize: bigint;
}) => {
  const { addresses, startBlock } = getDeployment();
  const latestBlock = await client.getBlockNumber();

  if (!addresses || !addresses.HypercertMinterUUPS) {
    console.error("HypercertMinter address is not available");
    return;
  }

  const _fromBlock =
    fromBlock && fromBlock > startBlock ? fromBlock : startBlock;
  const _toBlock =
    _fromBlock + batchSize > latestBlock ? latestBlock : _fromBlock + batchSize;

  console.info(`Fetching logs from ${_fromBlock} to ${_toBlock}`);

  const filter = await client.createEventFilter({
    address: addresses.HypercertMinterUUPS,
    fromBlock: _fromBlock,
    toBlock: _toBlock,
    event: parseAbiItem(
      "event ClaimStored(uint256 indexed claimID, string uri, uint256 totalUnits)",
    ),
  });

  const logs = await client.getFilterLogs({ filter });

  return { logs, fromBlock: _fromBlock, toBlock: _toBlock };
};

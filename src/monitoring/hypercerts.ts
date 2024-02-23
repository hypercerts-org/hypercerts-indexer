import { client } from "@/monitoring/evmClient";
import { parseAbiItem } from "viem";
import { getDeployment } from "@/utils/getDeployment";

export const getClaimStoredLogs = async ({
  fromBlock,
  batchSize,
}: {
  fromBlock?: bigint;
  batchSize: bigint;
}) => {
  const deployment = getDeployment();
  const latestBlock = await client.getBlockNumber();

  const _fromBlock =
    fromBlock && fromBlock > deployment.startBlock
      ? fromBlock
      : deployment.startBlock;
  const _toBlock =
    _fromBlock + batchSize > latestBlock ? latestBlock : _fromBlock + batchSize;

  console.info(`Fetching logs from ${_fromBlock} to ${_toBlock}`);

  const filter = await client.createEventFilter({
    address: deployment.addresses?.HypercertMinterUUPS,
    fromBlock: _fromBlock,
    toBlock: _toBlock,
    event: parseAbiItem(
      "event ClaimStored(uint256 indexed claimID, string uri, uint256 totalUnits)"
    ),
  });

  const logs = await client.getFilterLogs({ filter });

  return { logs, fromBlock: _fromBlock, toBlock: _toBlock };
};

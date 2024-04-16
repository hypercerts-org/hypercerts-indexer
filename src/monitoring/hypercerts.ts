import { client } from "@/clients/evmClient";
import { parseAbiItem } from "viem";
import { getDeployment } from "@/utils/getDeployment";
import { Database } from "@/types/database.types";

const getMinterAddress = () => {
  const { addresses, startBlock } = getDeployment();

  return { address: addresses?.HypercertMinterUUPS, startBlock };
};

interface BlocksToFetch {
  contractCreationBlock: bigint;
  fromBlock?: bigint;
  batchSize: bigint;
}

const getBlocksToFetch = async ({
  contractCreationBlock,
  fromBlock,
  batchSize,
}: BlocksToFetch) => {
  const latestBlock = await client.getBlockNumber();
  const _fromBlock =
    fromBlock && fromBlock > contractCreationBlock
      ? fromBlock
      : contractCreationBlock;
  const _toBlock =
    _fromBlock + batchSize > latestBlock ? latestBlock : _fromBlock + batchSize;

  return { fromBlock: _fromBlock, toBlock: _toBlock };
};

//TODO review hacky typing
interface LogsForContractEvents {
  fromBlock?: bigint;
  batchSize: bigint;
  contractEvent: Database["public"]["Functions"]["search_contract_events"]["Returns"][0];
}

export const getLogsForContractEvents = async ({
  fromBlock,
  batchSize,
  contractEvent,
}: LogsForContractEvents) => {
  const { address, startBlock } = getMinterAddress();

  if (!address) {
    console.error("[GetLogsForContractEvents] Address is not available");
    return;
  }

  const { fromBlock: from, toBlock: to } = await getBlocksToFetch({
    contractCreationBlock: startBlock,
    fromBlock,
    batchSize,
  });

  console.info(
    `[GetLogsForContractEvents] Fetching ${contractEvent.event_name} logs from ${from} to ${to}`,
  );

  const abiItem = parseAbiItem([contractEvent.event_abi]);
  const filter = await client.createEventFilter({
    address,
    fromBlock: from,
    toBlock: to,
    event: abiItem,
  });

  const logs = await client.getFilterLogs({ filter });

  return { logs, fromBlock: from, toBlock: to };
};

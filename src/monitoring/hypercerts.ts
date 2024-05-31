import { client } from "@/clients/evmClient";
import { parseAbiItem } from "viem";
import { EventToFetch } from "@/types/types";
import { getMinterAddressAndStartBlock } from "@/utils/getMinterAddressAndStartBlock";
import { getBlocksToFetch } from "@/utils/getBlocksToFetch";

interface GetLogsForEventInput {
  fromBlock?: bigint;
  batchSize: bigint;
  contractEvent: EventToFetch;
}

/**
 * Fetches logs for a specific contract event from the Ethereum Virtual Machine (EVM).
 *
 * This function first gets the address and start block of the HypercertMinterUUPS from the deployment.
 * It then calculates the range of blocks to fetch based on the contract creation block, the from block, and the batch size.
 * After that, it creates a filter for the contract event and fetches the logs from the EVM client.
 * If an error occurs while fetching the logs, it logs the error and rethrows it.
 *
 * @param {GetLogsForEventInput} { fromBlock, batchSize, contractEvent } - An object containing the from block, the batch size, and the contract event.
 * @param {bigint} [fromBlock] - The block number to start fetching from. If not provided, it defaults to the contract creation block.
 * @param {bigint} batchSize - The number of blocks to fetch in each batch.
 * @param {EventToFetch} contractEvent - The contract event to fetch logs for.
 * @property {string} event_name - The name of the contract event.
 * @property {string} abi - The ABI of the contract event.
 *
 * @returns {Promise<{ logs: any[], fromBlock: bigint, toBlock: bigint }>} A promise that resolves to an object containing the fetched logs, the from block, and the to block.
 *
 * @throws {Error} If an error occurs while fetching the logs, it throws the error.
 *
 * @example
 * ```typescript
 * const fromBlock = BigInt(200);
 * const batchSize = BigInt(50);
 * const contractEvent = { event_name: "Transfer", abi: "..." };
 *
 * const { logs, fromBlock, toBlock } = await getLogsForContractEvents({ fromBlock, batchSize, contractEvent });
 * ```
 * */
export const getLogsForContractEvents = async ({
  fromBlock,
  batchSize,
  contractEvent,
}: GetLogsForEventInput) => {
  const { address, startBlock } = getMinterAddressAndStartBlock();

  console.log(address, startBlock);
  const { fromBlock: from, toBlock: to } = await getBlocksToFetch({
    contractCreationBlock: startBlock,
    fromBlock,
    batchSize,
  });

  try {
    console.debug(
      `[GetLogsForContractEvents] Fetching ${contractEvent.event_name} logs from ${from} to ${to}`,
    );

    const abiItem = parseAbiItem([contractEvent.abi]);
    const filter = await client.createEventFilter({
      address,
      fromBlock: from,
      toBlock: to,
      event: abiItem,
    });

    const logs = await client.getFilterLogs({ filter });

    return { logs, fromBlock: from, toBlock: to };
  } catch (error) {
    console.error(
      `[GetLogsForContractEvents] Error while fetching logs for contract event ${contractEvent.event_name} on contract ${address}`,
      error,
    );
    throw error;
  }
};

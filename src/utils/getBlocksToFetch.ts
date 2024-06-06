import { client } from "@/clients/evmClient.js";

interface BlocksToFetchInput {
  contractCreationBlock: bigint;
  fromBlock?: bigint;
  batchSize: bigint;
}

/**
 * Calculates the range of blocks to fetch based on the contract creation block, the from block, and the batch size.
 *
 * This function first gets the latest block number from the Ethereum Virtual Machine (EVM) client. It then calculates the from block and to block for fetching.
 * The from block is the greater of the provided from block and the contract creation block. If the from block is not provided, it defaults to the contract creation block.
 * The to block is calculated as the from block plus the batch size. However, if this exceeds the latest block number, the to block is set to the latest block number.
 *
 * @param {BlocksToFetchInput} { contractCreationBlock, fromBlock, batchSize } - An object containing the contract creation block, the from block, and the batch size.
 * @param {bigint} contractCreationBlock - The block number when the contract was created.
 * @param {bigint} [fromBlock] - The block number to start fetching from. If not provided, it defaults to the contract creation block.
 * @param {bigint} batchSize - The number of blocks to fetch in each batch.
 *
 * @returns {Promise<{ fromBlock: bigint, toBlock: bigint }>} A promise that resolves to an object containing the from block and the to block for fetching.
 *
 * @example
 * ```typescript
 * const contractCreationBlock = BigInt(100);
 * const fromBlock = BigInt(200);
 * const batchSize = BigInt(50);
 *
 * const { fromBlock, toBlock } = await getBlocksToFetch({ contractCreationBlock, fromBlock, batchSize });
 * console.log(fromBlock, toBlock);
 * ```
 * */
export const getBlocksToFetch = async ({
  contractCreationBlock,
  fromBlock,
  batchSize,
}: BlocksToFetchInput) => {
  try {
    const latestBlock = await client.getBlockNumber();
    const _fromBlock =
      fromBlock && fromBlock > contractCreationBlock
        ? fromBlock
        : contractCreationBlock;
    const _toBlock =
      _fromBlock + batchSize > latestBlock
        ? latestBlock
        : _fromBlock + batchSize;

    if (_fromBlock > _toBlock) {
      throw Error(
        `[getBlocksToFetch] from block more recent than to block. [${_fromBlock}, ${_toBlock}]`,
      );
    }

    return { fromBlock: _fromBlock, toBlock: _toBlock };
  } catch (error) {
    console.error(
      `[getBlocksToFetch] Error while fetching latest block number from the EVM client`,
      error,
    );
    throw error;
  }
};

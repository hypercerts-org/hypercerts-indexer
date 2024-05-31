import { client } from "@/clients/evmClient";
import { isAddress, parseAbiItem } from "viem";
import { getDeployment } from "@/utils/getDeployment";
import { Tables } from "@/types/database.types";

/**
 * Fetches the logs of the Attested event from the EAS contract for a specific schema.
 *
 * @param schema - The EAS schema ID as stored in the database.
 * @param fromBlock - The block number from which to start fetching logs. Defaults to 0.
 * @param batchSize - The number of blocks to fetch logs from.
 *
 * @returns An object containing the fetched logs and the block numbers from which to start fetching logs.
 * If the EAS address is not available or not a valid address, or if the schema or EAS schema ID is not found, it returns undefined.
 *
 * @example
 * ```typescript
 * const supportedSchemas = await getSupportedSchemas({ chainId: 1 });
 * const schema = supportedSchemas[0];
 * const logs = await getAttestationsForSchema({ schema,  fromBlock: 1337n, batchSize: 100n });
 ```
 */

export const getAttestationsForSchema = async ({
  schema,
  fromBlock = 0n,
  batchSize,
}: {
  schema: Pick<Tables<"supported_schemas">, "uid">;
  fromBlock?: bigint;
  batchSize: bigint;
}) => {
  const { startBlock, easAddress } = getDeployment();

  if (!isAddress(easAddress)) {
    console.error(
      "[getAttestationsForSchema] EAS is not available",
      easAddress,
    );
    return;
  }

  try {
    const latestBlock = await client.getBlockNumber();

    const _fromBlock =
      fromBlock && fromBlock > startBlock ? fromBlock : startBlock;
    const _toBlock =
      _fromBlock + batchSize > latestBlock
        ? latestBlock
        : _fromBlock + batchSize;

    console.info(
      `[getAttestationsForSchema] Fetching attestation logs from ${_fromBlock} to ${_toBlock}`,
    );

    // TODO could be it's own schema
    const filter = await client.createEventFilter({
      address: easAddress,
      fromBlock: _fromBlock,
      toBlock: _toBlock,
      event: parseAbiItem(
        "event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schema)",
      ),
      args: {
        schema: schema.uid as `0x${string}`,
      },
    });

    return {
      logs: await client.getFilterLogs({ filter }),
      fromBlock: _fromBlock,
      toBlock: _toBlock,
    };
  } catch (error) {
    console.error(
      "[getAttestationsForSchema] Error fetching attestation logs",
      error,
    );
    return;
  }
};

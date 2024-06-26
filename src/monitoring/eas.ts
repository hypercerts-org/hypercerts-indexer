import { client } from "@/clients/evmClient.js";
import { isAddress, parseAbiItem } from "viem";
import { getDeployment } from "@/utils/getDeployment.js";
import { Tables } from "@/types/database.types.js";
import { getBlocksToFetch } from "@/utils/getBlocksToFetch.js";

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
  lastBlockIndexed,
  batchSize,
}: {
  schema: Pick<Tables<"supported_schemas">, "uid">;
  lastBlockIndexed: bigint;
  batchSize: bigint;
}) => {
  const { startBlock, easAddress } = getDeployment();

  if (!isAddress(easAddress)) {
    throw Error(`[GetAttestationForSchema] EAS is not available`);
  }

  const blocks = await getBlocksToFetch({
    fromBlock: startBlock > lastBlockIndexed ? startBlock : lastBlockIndexed,
    batchSize,
  });

  if (!blocks) {
    return;
  }

  const { fromBlock, toBlock } = blocks;

  try {
    console.debug(
      `[getAttestationsForSchema] Fetching attestation logs from ${fromBlock} to ${toBlock}`,
    );

    // TODO could be it's own schema
    const filter = await client.createEventFilter({
      address: easAddress,
      fromBlock,
      toBlock,
      event: parseAbiItem(
        "event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schema)",
      ),
      args: {
        schema: schema.uid as `0x${string}`,
      },
    });

    return {
      logs: await client.getFilterLogs({ filter }),
      fromBlock,
      toBlock,
    };
  } catch (error) {
    console.error(
      "[getAttestationsForSchema] Error fetching attestation logs",
      error,
    );
    throw error;
  }
};

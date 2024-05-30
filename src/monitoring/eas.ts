import { client } from "@/clients/evmClient";
import { isAddress, parseAbiItem } from "viem";
import { getDeployment } from "@/utils/getDeployment";
import { Tables } from "@/types/database.types";

/* 
    This function fetches the logs of the Attested event from the EAS contract.
    
    @param schema - The EAS schema ID as stored in the database.
    @param fromBlock - The block number from which to start fetching logs.
    @param batchSize - The number of blocks to fetch logs from.
    @returns The logs and the block numbers from which to start fetching logs. 
    
    @example
    ```js
    const supportedSchemas = await getSupportedSchemas({ chainId: 1 });
    
    const schema = supportedSchemas[0];
    
    const logs = await getAttestationsForSchema({ schema,  fromBlock: 1337n, batchSize: 100n });
    ```
 */
export const getAttestationsForSchema = async ({
  schema,
  fromBlock = 0n,
  batchSize,
}: {
  schema: Tables<"supported_schemas">;
  fromBlock?: bigint;
  batchSize: bigint;
}) => {
  const { startBlock, easAddress } = getDeployment();
  const latestBlock = await client.getBlockNumber();

  if (!easAddress || !isAddress(easAddress)) {
    console.error("EAS is not available", easAddress);
    return;
  }

  if (!schema || !schema.eas_schema_id) {
    console.error("Schema or EAS schema ID not found", schema);
    return;
  }

  const _fromBlock =
    fromBlock && fromBlock > startBlock ? fromBlock : startBlock;
  const _toBlock =
    _fromBlock + batchSize > latestBlock ? latestBlock : _fromBlock + batchSize;

  console.info(`Fetching attestation logs from ${_fromBlock} to ${_toBlock}`);

  const filter = await client.createEventFilter({
    address: easAddress,
    fromBlock: _fromBlock,
    toBlock: _toBlock,
    event: parseAbiItem(
      "event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schema)",
    ),
    args: {
      schema: schema.eas_schema_id as `0x${string}`,
    },
  });

  return {
    logs: await client.getFilterLogs({ filter }),
    fromBlock: _fromBlock,
    toBlock: _toBlock,
  };
};

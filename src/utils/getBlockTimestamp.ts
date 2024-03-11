import { client } from "@/clients/evmClient";

export const getBlockTimestamp = async (blockNumber: bigint) => {
  const block = await client.getBlock({ blockNumber });
  return block.timestamp;
};

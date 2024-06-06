import { client } from "@/clients/evmClient.js";

export const getBlockTimestamp = async (blockNumber: bigint) => {
  const block = await client.getBlock({ blockNumber });
  return block.timestamp;
};

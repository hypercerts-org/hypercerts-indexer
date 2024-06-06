import { isAddress, isHex } from "viem";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp.js";
import { LeafClaimed } from "@/types/types.js";
import { client } from "@/clients/evmClient.js";
import { z } from "zod";

const LeafClaimedSchema = z.object({
  address: z.string().refine(isAddress),
  args: z.object({
    tokenID: z.bigint(),
    leaf: z.string(),
  }),
  blockNumber: z.bigint(),
  transactionHash: z.string().refine(isHex),
});

/*
 * Helper method to get the tokenID, contract address, minter address and leaf hash from the event. Will return undefined when the event is
 * missing values.
 *
 * @param event - The event object.
 * */
export const parseLeafClaimedEvent = async (event: unknown) => {
  const { args, blockNumber, address, transactionHash } =
    LeafClaimedSchema.parse(event);

  const transaction = await client.getTransaction({
    hash: transactionHash,
  });

  const claim: Partial<LeafClaimed> = {
    creator_address: transaction.from,
    token_id: args.tokenID,
    block_timestamp: await getBlockTimestamp(blockNumber),
    contract_address: address,
    leaf: args.leaf,
  };

  return claim;
};

import { isAddress, isHex } from "viem";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp.js";
import { client } from "@/clients/evmClient.js";
import { z } from "zod";
import { messages } from "@/utils/validation.js";

const LeafClaimedSchema = z.object({
  address: z.string().refine(isAddress),
  args: z.object({
    tokenID: z.bigint(),
    leaf: z.string(),
  }),
  blockNumber: z.bigint(),
  transactionHash: z.string().refine(isHex),
});

const LeafClaimed = z.object({
  creator_address: z
    .string()
    .refine(isAddress, { message: messages.INVALID_ADDRESS }),
  token_id: z.bigint(),
  creation_block_timestamp: z.bigint(),
  contract_address: z
    .string()
    .refine(isAddress, { message: messages.INVALID_ADDRESS }),
  leaf: z.string(),
});
/*
 * Helper method to get the tokenID, contract address, minter address and leaf hash from the event. Will return undefined when the event is
 * missing values.
 *
 * @param event - The event object.
 * */
export const parseLeafClaimedEvent = async (event: unknown) => {
  console.log("PARSING LEAF CLAIMED EVENT");
  const { args, blockNumber, address, transactionHash } =
    LeafClaimedSchema.parse(event);

  const transaction = await client.getTransaction({
    hash: transactionHash,
  });

  return LeafClaimed.parse({
    creator_address: transaction.from,
    token_id: args.tokenID,
    creation_block_timestamp: await getBlockTimestamp(blockNumber),
    contract_address: address,
    leaf: args.leaf,
  });
};

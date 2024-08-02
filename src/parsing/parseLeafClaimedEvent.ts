import { isAddress, isHex } from "viem";
import { getEvmClient } from "@/clients/evmClient.js";
import { z } from "zod";
import { messages } from "@/utils/validation.js";
import { ParserMethod } from "@/indexer/LogParser.js";

const LeafClaimedSchema = z.object({
  address: z.string().refine(isAddress),
  params: z.object({
    tokenID: z.coerce.bigint(),
    leaf: z.string(),
  }),
  transactionHash: z.string().refine(isHex),
});

const LeafClaimed = z.object({
  creator_address: z
    .string()
    .refine(isAddress, { message: messages.INVALID_ADDRESS }),
  token_id: z.coerce.bigint(),
  contract_address: z
    .string()
    .refine(isAddress, { message: messages.INVALID_ADDRESS }),
  leaf: z.string(),
});

export type LeafClaimed = z.infer<typeof LeafClaimed>;
/*
 * Helper method to get the tokenID, contract address, minter address and leaf hash from the event. Will return undefined when the event is
 * missing values.
 *
 * @param event - The event object.
 * */
export const parseLeafClaimedEvent: ParserMethod<LeafClaimed> = async ({
  event,
  context: { chain_id },
}) => {
  const { params, address, transactionHash } = LeafClaimedSchema.parse(event);
  const client = getEvmClient(Number(chain_id));

  const transaction = await client.getTransaction({
    hash: transactionHash,
  });

  return [
    LeafClaimed.parse({
      creator_address: transaction.from,
      token_id: params.tokenID,
      contract_address: address,
      leaf: params.leaf,
    }),
  ];
};

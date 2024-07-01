import { isAddress } from "viem";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp.js";
import { z } from "zod";
import { messages } from "@/utils/validation.js";
import { ParserMethod } from "@/indexer/processLogs.js";

const ValueTransferEventSchema = z.object({
  address: z.string().refine(isAddress),
  args: z.object({
    claimID: z.bigint(),
    fromTokenID: z.bigint(),
    toTokenID: z.bigint(),
    value: z.bigint(),
  }),
  blockNumber: z.bigint(),
});

export const ParsedValueTransfer = z.object({
  claim_id: z.bigint(),
  contract_address: z
    .string()
    .refine(isAddress, { message: messages.INVALID_ADDRESS }),
  from_token_id: z.bigint(),
  to_token_id: z.bigint(),
  creation_block_number: z.bigint(),
  creation_block_timestamp: z.bigint(),
  last_update_block_number: z.bigint(),
  last_update_block_timestamp: z.bigint(),
  units: z.bigint(),
  contracts_id: z.string().optional(),
});

export type ParsedValueTransfer = z.infer<typeof ParsedValueTransfer>;

/*
 * Helper method to get the sender, recipient, tokenID and value from the event. Will return undefined when the event is
 * missing any of the required fields.
 *
 * @param event - The event object.
 * */
export const parseValueTransfer: ParserMethod<ParsedValueTransfer> = async ({
  log,
}) => {
  const { args, blockNumber, address } = ValueTransferEventSchema.parse(log);

  return ParsedValueTransfer.parse({
    claim_id: args.claimID,
    contract_address: address,
    from_token_id: args.fromTokenID,
    to_token_id: args.toTokenID,
    creation_block_number: blockNumber,
    creation_block_timestamp: await getBlockTimestamp(blockNumber),
    last_update_block_number: blockNumber,
    last_update_block_timestamp: await getBlockTimestamp(blockNumber),
    units: args.value,
  });
};

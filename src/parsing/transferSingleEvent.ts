import { isAddress } from "viem";
import { z } from "zod";
import { messages } from "@/utils/validation.js";
import { ParserMethod } from "@/indexer/processLogs.js";

const TransferSingleEventSchema = z.object({
  address: z.string().refine(isAddress),
  args: z.object({
    operator: z.string().refine(isAddress),
    from: z.string().refine(isAddress),
    to: z.string().refine(isAddress),
    id: z.bigint(),
    value: z.bigint(),
  }),
  blockNumber: z.bigint(),
});

export const ParsedTransferSingle = z.object({
  contract_address: z
    .string()
    .refine(isAddress, { message: messages.INVALID_ADDRESS }),
  token_id: z.bigint(),
  block_number: z.bigint(),
  block_timestamp: z.bigint(),
  value: z.bigint(),
  to_owner_address: z
    .string()
    .refine(isAddress, { message: messages.INVALID_ADDRESS }),
  from_owner_address: z
    .string()
    .refine(isAddress, { message: messages.INVALID_ADDRESS }),
  contracts_id: z.string().optional(),
});

export type ParsedTransferSingle = z.infer<typeof ParsedTransferSingle>;

/*
 * Helper method to get the sender, recipient, tokenID and value from the event. Will throw when the event is
 * missing any of the required fields.
 *
 * @param event - The event object.
 * */
export const parseTransferSingle: ParserMethod<ParsedTransferSingle> = async ({
  log,
  context: { block },
}) => {
  const { args, blockNumber, address } = TransferSingleEventSchema.parse(log);

  return ParsedTransferSingle.parse({
    contract_address: address,
    token_id: args.id,
    block_number: blockNumber,
    block_timestamp: block.timestamp,
    value: args.value,
    to_owner_address: args.to,
    from_owner_address: args.from,
  });
};

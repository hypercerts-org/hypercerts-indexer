import { isAddress } from "viem";
import { z } from "zod";
import { messages } from "@/utils/validation.js";
import { ParserMethod } from "@/indexer/LogParser.js";

const TransferSingleEventSchema = z.object({
  address: z.string().refine(isAddress),
  params: z.object({
    operator: z.string().refine(isAddress),
    from: z.string().refine(isAddress),
    to: z.string().refine(isAddress),
    id: z.coerce.bigint(),
    value: z.coerce.bigint(),
  }),
});

export const ParsedTransferSingle = z.object({
  contract_address: z
    .string()
    .refine(isAddress, { message: messages.INVALID_ADDRESS }),
  token_id: z.coerce.bigint(),
  value: z.coerce.bigint(),
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
export const parseTransferSingleEvent: ParserMethod<
  ParsedTransferSingle
> = async ({ event }) => {
  const { params, address } = TransferSingleEventSchema.parse(event);

  return [
    ParsedTransferSingle.parse({
      contract_address: address,
      token_id: params.id,
      value: params.value,
      to_owner_address: params.to,
      from_owner_address: params.from,
    }),
  ];
};

import { isAddress } from "viem";
import { z } from "zod";
import { messages } from "@/utils/validation.js";
import { ParserMethod } from "@/indexer/LogParser.js";

const ValueTransferEventSchema = z.object({
  address: z.string().refine(isAddress),
  params: z.object({
    claimID: z.coerce.bigint(),
    fromTokenID: z.coerce.bigint(),
    toTokenID: z.coerce.bigint(),
    value: z.coerce.bigint(),
  }),
});

export const ParsedValueTransfer = z.object({
  claim_id: z.coerce.bigint(),
  contract_address: z
    .string()
    .refine(isAddress, { message: messages.INVALID_ADDRESS }),
  from_token_id: z.coerce.bigint(),
  to_token_id: z.coerce.bigint(),
  units: z.coerce.bigint(),
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
  data,
}) => {
  const { params, address } = ValueTransferEventSchema.parse(data);

  return [
    ParsedValueTransfer.parse({
      claim_id: params.claimID,
      contract_address: address,
      from_token_id: params.fromTokenID,
      to_token_id: params.toTokenID,
      units: params.value,
    }),
  ];
};

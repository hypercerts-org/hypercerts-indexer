import { isAddress } from "viem";
import { z } from "zod";
import { ParsedValueTransfer } from "@/parsing/parseValueTransferEvent.js";
import { ParserMethod } from "@/indexer/LogParser.js";

const ValueTransferEventSchema = z.object({
  address: z.string().refine(isAddress),
  params: z.object({
    claimIDs: z.array(z.coerce.bigint()),
    fromTokenIDs: z.array(z.coerce.bigint()),
    toTokenIDs: z.array(z.coerce.bigint()),
    values: z.array(z.coerce.bigint()),
  }),
  blockNumber: z.coerce.bigint(),
});

/*
 * Helper method to get the sender, recipient, tokenID and value from the event. Will return undefined when the event is
 * missing any of the required fields.
 *
 * @param event - The event object.
 * */
export const parseBatchValueTransferEvent: ParserMethod<
  ParsedValueTransfer
> = async ({ event }) => {
  const { params, address } = ValueTransferEventSchema.parse(event);

  const transfers = params.claimIDs.map((claimID, index) => {
    return {
      contract_address: address,
      claim_id: claimID,
      from_token_id: params.fromTokenIDs[index],
      to_token_id: params.toTokenIDs[index],
      units: params.values[index],
    };
  });

  return transfers.map((transfer) => ParsedValueTransfer.parse(transfer));
};

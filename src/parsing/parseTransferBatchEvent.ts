import { isAddress } from "viem";
import { z } from "zod";
import { ParsedTransferSingle } from "@/parsing/parseTransferSingleEvent.js";
import { ParserMethod } from "@/indexer/LogParser.js";

const TransferBatchEventSchema = z.object({
  address: z.string().refine(isAddress),
  params: z.object({
    operator: z.string().refine(isAddress),
    from: z.string().refine(isAddress),
    to: z.string().refine(isAddress),
    ids: z.array(z.coerce.bigint()),
    values: z.array(z.coerce.bigint()),
  }),
});

/*
 * Helper method to get the sender, recipient, tokenID and value from the event. Will throw when the event is
 * missing any of the required fields.
 *
 * @param event - The event object.
 * */
export const parseTransferBatchEvent: ParserMethod<
  ParsedTransferSingle
> = async ({ event }) => {
  const { params, address } = TransferBatchEventSchema.parse(event);

  return params.ids.map((id, index) =>
    ParsedTransferSingle.parse({
      contract_address: address,
      to_owner_address: params.to,
      from_owner_address: params.from,
      token_id: id,
      value: params.values[index],
    }),
  );
};

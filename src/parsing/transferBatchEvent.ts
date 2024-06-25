import { isAddress } from "viem";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp.js";
import { z } from "zod";
import { isHypercertToken } from "@/utils/tokenIds.js";
import { ParsedTransferSingle } from "@/parsing/transferSingleEvent.js";

const TransferBatchEventSchema = z.object({
  address: z.string().refine(isAddress),
  args: z.object({
    operator: z.string().refine(isAddress),
    from: z.string().refine(isAddress),
    to: z.string().refine(isAddress),
    ids: z.array(z.bigint()),
    values: z.array(z.bigint()),
  }),
  blockNumber: z.bigint(),
});

/*
 * Helper method to get the sender, recipient, tokenID and value from the event. Will throw when the event is
 * missing any of the required fields.
 *
 * @param event - The event object.
 * */
export const parseTransferBatch = async (event: unknown) => {
  const { args, blockNumber, address } = TransferBatchEventSchema.parse(event);

  const transfers = await Promise.all(
    args.ids.map(async (id, index) => {
      const type: "claim" | "fraction" = isHypercertToken(id)
        ? "claim"
        : "fraction";
      return {
        contract_address: address,
        block_number: blockNumber,
        block_timestamp: await getBlockTimestamp(blockNumber),
        to_owner_address: args.to,
        from_owner_address: args.from,
        token_id: id,
        value: args.values[index],
        type,
      };
    }),
  );

  return transfers.map((transfer) => ParsedTransferSingle.parse(transfer));
};

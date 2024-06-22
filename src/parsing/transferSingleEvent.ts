import { isAddress } from "viem";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp.js";
import { NewTransfer } from "@/types/types.js";
import { z } from "zod";

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

/*
 * Helper method to get the sender, recipient, tokenID and value from the event. Will throw when the event is
 * missing any of the required fields.
 *
 * @param event - The event object.
 * */
export const parseTransferSingle = async (event: unknown) => {
  const { args, blockNumber, address } = TransferSingleEventSchema.parse(event);

  return {
    contract_address: address,
    token_id: args.id,
    block_timestamp: await getBlockTimestamp(blockNumber),
    block_number: blockNumber,
    value: args.value,
    to_owner_address: args.to,
    from_owner_address: args.from,
  };
};

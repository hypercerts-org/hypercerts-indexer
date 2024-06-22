import { isAddress } from "viem";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp.js";
import { z } from "zod";

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

/*
 * Helper method to get the sender, recipient, tokenID and value from the event. Will return undefined when the event is
 * missing any of the required fields.
 *
 * @param event - The event object.
 * */
export const parseValueTransfer = async (event: unknown) => {
  const { args, blockNumber, address } = ValueTransferEventSchema.parse(event);

  return {
    contract_address: address,
    from_token_id: args.fromTokenID,
    to_token_id: args.toTokenID,
    last_update_block_number: blockNumber,
    last_update_block_timestamp: await getBlockTimestamp(blockNumber),
    units: args.value,
  };
};

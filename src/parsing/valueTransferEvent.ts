import { isAddress } from "viem";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp";
import { NewUnitTransfer } from "@/types/types";
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
  const { args, blockNumber } = ValueTransferEventSchema.parse(event);

  const row: Partial<NewUnitTransfer> = {
    from_token_id: args.fromTokenID,
    to_token_id: args.toTokenID,
    block_timestamp: await getBlockTimestamp(blockNumber),
    units: args.value,
  };

  return row;
};

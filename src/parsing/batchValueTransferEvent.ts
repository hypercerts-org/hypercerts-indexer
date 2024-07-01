import { isAddress } from "viem";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp.js";
import { z } from "zod";
import { ParsedValueTransfer } from "@/parsing/valueTransferEvent.js";
import { ParserMethod } from "@/indexer/processLogs.js";

const ValueTransferEventSchema = z.object({
  address: z.string().refine(isAddress),
  args: z.object({
    claimIDs: z.array(z.bigint()),
    fromTokenIDs: z.array(z.bigint()),
    toTokenIDs: z.array(z.bigint()),
    values: z.array(z.bigint()),
  }),
  blockNumber: z.bigint(),
});

/*
 * Helper method to get the sender, recipient, tokenID and value from the event. Will return undefined when the event is
 * missing any of the required fields.
 *
 * @param event - The event object.
 * */
export const parseBatchValueTransfer: ParserMethod<
  ParsedValueTransfer[]
> = async ({ log }) => {
  const { args, blockNumber, address } = ValueTransferEventSchema.parse(log);

  return Promise.all(
    args.claimIDs.map(async (claimID, index) => {
      return ParsedValueTransfer.parse({
        contract_address: address,
        claim_id: claimID,
        from_token_id: args.fromTokenIDs[index],
        to_token_id: args.toTokenIDs[index],
        units: args.values[index],
        creation_block_number: blockNumber,
        creation_block_timestamp: await getBlockTimestamp(blockNumber),
        last_update_block_number: blockNumber,
        last_update_block_timestamp: await getBlockTimestamp(blockNumber),
      });
    }),
  );
};

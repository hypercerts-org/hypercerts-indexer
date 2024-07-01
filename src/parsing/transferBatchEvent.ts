import { isAddress } from "viem";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp.js";
import { z } from "zod";
import { ParsedTransferSingle } from "@/parsing/transferSingleEvent.js";
import { ParserMethod } from "@/indexer/processLogs.js";

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
export const parseTransferBatch: ParserMethod<ParsedTransferSingle[]> = async ({
  log,
}) => {
  const { args, blockNumber, address } = TransferBatchEventSchema.parse(log);

  const transfers = await Promise.all(
    args.ids.map(async (id, index) => {
      return {
        contract_address: address,
        block_number: blockNumber,
        block_timestamp: await getBlockTimestamp(blockNumber),
        to_owner_address: args.to,
        from_owner_address: args.from,
        token_id: id,
        value: args.values[index],
      };
    }),
  );

  return transfers.map((transfer) => ParsedTransferSingle.parse(transfer));
};

import { isAddress, isHex } from "viem";
import { client } from "@/clients/evmClient.js";
import { z } from "zod";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp.js";
import { Claim, ClaimSchema } from "@/storage/storeClaimStored.js";
import { ParserMethod } from "@/indexer/processLogs.js";

export const ClaimStoredEventSchema = z.object({
  address: z.string().refine(isAddress, {
    message: "[ClaimStoredEvent] Invalid contract address",
  }),
  args: z.object({
    claimID: z.bigint(),
    uri: z.string(),
    totalUnits: z.bigint(),
  }),
  blockNumber: z.bigint(),
  transactionHash: z.string().refine(isHex),
});

export type ClaimStoredEvent = z.infer<typeof ClaimStoredEventSchema>;

/**
 * Parses a ClaimStoredEvent and retrieves additional information about the transaction.
 *
 * @param {unknown} event - The event to parse.
 * @returns {Promise<Claim>} A promise that resolves to an object containing the parsed event data.
 * @throws {z.ZodError} If the event does not match the ClaimStoredEventSchema, a Zod validation error is thrown.
 */
export const parseClaimStoredEvent: ParserMethod<Claim> = async ({
  log,
  context,
}) => {
  const { args, address, transactionHash, blockNumber } =
    ClaimStoredEventSchema.parse(log);

  try {
    const transaction = await client.getTransaction({
      hash: transactionHash,
    });

    return ClaimSchema.parse({
      contracts_id: context.contracts_id,
      owner_address: "0x0000000000000000000000000000000000000000",
      creator_address: transaction.from,
      token_id: args.claimID,
      uri: args.uri,
      creation_block_number: blockNumber,
      creation_block_timestamp: await getBlockTimestamp(blockNumber),
      last_update_block_number: blockNumber,
      last_update_block_timestamp: await getBlockTimestamp(blockNumber),
      units: args.totalUnits,
    });
  } catch (error) {
    console.error(
      "[ParseClaimStoredEvent] Error parsing claim stored event",
      error,
    );
    throw error;
  }
};

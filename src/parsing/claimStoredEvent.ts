import { isAddress, isHex, parseAbi } from "viem";
import { client } from "@/clients/evmClient.js";
import { z } from "zod";

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

export type ParsedClaimStoredEvent = {
  owner_address: string;
  creator_address: string;
  token_id: bigint;
  uri: string;
  block_number: bigint;
  units: bigint;
};

/**
 * Parses a ClaimStoredEvent and retrieves additional information about the transaction.
 *
 * @param {unknown} event - The event to parse.
 * @returns {Promise<ParsedClaimStoredEvent>} A promise that resolves to an object containing the parsed event data.
 * @throws {z.ZodError} If the event does not match the ClaimStoredEventSchema, a Zod validation error is thrown.
 */
export const parseClaimStoredEvent = async (event: unknown) => {
  const { args, address, transactionHash, blockNumber } =
    ClaimStoredEventSchema.parse(event);

  try {
    const transaction = await client.getTransaction({
      hash: transactionHash,
    });

    const parsedEvent: ParsedClaimStoredEvent = {
      owner_address: "0x0000000000000000000000000000000000000000",
      creator_address: transaction.from,
      token_id: args.claimID,
      uri: args.uri,
      block_number: blockNumber,
      units: args.totalUnits,
    };

    return parsedEvent;
  } catch (error) {
    console.error(
      "[ParseClaimStoredEvent] Error parsing claim stored event",
      error,
    );
    throw error;
  }
};

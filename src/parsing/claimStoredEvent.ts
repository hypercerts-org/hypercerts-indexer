import { isAddress, isHex } from "viem";
import { client } from "@/clients/evmClient.js";
import { z } from "zod";
import { Claim, ClaimSchema } from "@/storage/storeClaimStored.js";
import { ParserMethod } from "@/indexer/LogParser.js";

export const ClaimStoredEventSchema = z.object({
  address: z.string().refine(isAddress, {
    message: "[ClaimStoredEvent] Invalid contract address",
  }),
  params: z.object({
    claimID: z.coerce.bigint(),
    uri: z.string(),
    totalUnits: z.coerce.bigint(),
  }),
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
  context: { block, contracts_id },
}) => {
  const { params, transactionHash } = ClaimStoredEventSchema.parse(log);

  try {
    const transaction = await client.getTransaction({
      hash: transactionHash,
    });

    return [
      ClaimSchema.parse({
        contracts_id: contracts_id,
        owner_address: "0x0000000000000000000000000000000000000000",
        creator_address: transaction.from,
        token_id: params.claimID,
        uri: params.uri,
        units: params.totalUnits,
      }),
    ];
  } catch (error) {
    console.error(
      "[ParseClaimStoredEvent] Error parsing claim stored event",
      error,
    );
    throw error;
  }
};

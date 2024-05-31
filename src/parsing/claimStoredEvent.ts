import { isAddress, isHex, parseAbi, parseAbiItem } from "viem";
import { client } from "@/clients/evmClient";
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

/**
 * Parses a ClaimStoredEvent and retrieves additional information about the transaction.
 *
 * @param {unknown} event - The event to parse.
 * @returns {Promise<Object>} A promise that resolves to an object containing the parsed event data.
 * @throws {z.ZodError} If the event does not match the ClaimStoredEventSchema, a Zod validation error is thrown.
 */
export const parseClaimStoredEvent = async (event: unknown) => {
  console.log(event);
  const { args, address, transactionHash, blockNumber } =
    ClaimStoredEventSchema.parse(event);

  try {
    const transaction = await client.getTransaction({
      hash: transactionHash,
    });

    const owner = await client.readContract({
      address,
      abi: parseAbi([
        `function ownerOf(uint256 tokenId) view returns (address owner)`,
      ]),
      functionName: "ownerOf",
      args: [args.claimID],
    });

    return {
      owner_address: owner,
      creator_address: transaction.from,
      token_id: args.claimID,
      uri: args.uri,
      block_number: blockNumber,
      units: args.totalUnits,
    };
  } catch (error) {
    console.error(
      "[ParseClaimStoredEvent] Error parsing claim stored event",
      error,
    );
    throw error;
  }
};

import { supabase } from "@/clients/supabaseClient.js";
import { isAddress } from "viem";
import { z } from "zod";
import { StorageMethod } from "@/indexer/LogParser.js";

export const ClaimSchema = z.object({
  contracts_id: z.string().optional(),
  creator_address: z
    .string()
    .refine(isAddress, { message: "Invalid creator address" }),
  owner_address: z
    .string()
    .refine(isAddress, { message: "Invalid owner address" }),
  token_id: z.coerce.bigint(),
  units: z.coerce.bigint(),
  uri: z.string(),
});

export type Claim = z.infer<typeof ClaimSchema>;

/**
 * Stores the provided claims in the database.
 *
 * This function takes an object containing an array of claims as input. Each claim is an object that must match the ClaimSchema.
 * The function maps over the array of claims, parses each claim using the ClaimSchema, and adds a `value` property with a value of 1 to each claim.
 * The function then stores the claims in the "claims" table in the database using the Supabase client's `upsert` method.
 * If the "contracts_id" and "token_id" of a claim already exist in the table, the existing row is updated with the new claim data.
 * If an error occurs while storing the claims, the error is logged and rethrown.
 *
 * @param {Claim} claim - An object containing an array of claims to store. Each claim must match the ClaimSchema.
 *
 * @throws {Error} If an error occurs while storing the claims, the error is logged and rethrown.
 *
 * @example
 * ```typescript
 * const claims: Claim[] = [
 *   {
 *     contracts_id: '0x1234...5678',
 *     creator_address: '0x1234...5678',
 *     token_id: BigInt('12345678901234567890'),
 *     block_number: BigInt('12345678'),
 *     units: BigInt('1000'),
 *     uri: 'ipfs://Qm...',
 *   },
 *   // More claims...
 * ];
 *
 * await storeClaim({ claims });
 * ```
 * */
export const storeClaimStored: StorageMethod<Claim> = async ({
  data,
  context,
}) => {
  const { block } = context;
  const claims = data.map((token) => ({
    ...token,
    value: 1,
    token_id: token.token_id.toString(),
    creation_block_number: block.blockNumber.toString(),
    creation_block_timestamp: block.timestamp,
    last_update_block_number: block.blockNumber.toString(),
    last_update_block_timestamp: block.timestamp,
    units: token.units.toString(),
  }));

  try {
    await supabase
      .from("claims")
      .upsert(claims, {
        onConflict: "contracts_id, token_id",
        ignoreDuplicates: false,
      })
      .throwOnError();
  } catch (error) {
    console.error("[StoreClaim] Error storing claims", error);
    throw error;
  }
};

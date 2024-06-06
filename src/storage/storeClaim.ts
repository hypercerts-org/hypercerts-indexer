import { supabase } from "@/clients/supabaseClient.js";
import { isAddress } from "viem";
import { z } from "zod";

const ClaimSchema = z.object({
  contracts_id: z.string(),
  creator_address: z
    .string()
    .refine(isAddress, { message: "Invalid creator address" }),
  owner_address: z
    .string()
    .refine(isAddress, { message: "Invalid owner address" }),
  token_id: z.bigint(),
  block_number: z.bigint(),
  units: z.bigint(),
  uri: z.string(),
});

export type Claim = z.infer<typeof ClaimSchema>;

interface StoreClaimInput {
  claims: Claim[];
}

/**
 * Stores the provided claims in the database.
 *
 * This function takes an object containing an array of claims as input. Each claim is an object that must match the ClaimSchema.
 * The function maps over the array of claims, parses each claim using the ClaimSchema, and adds a `value` property with a value of 1 to each claim.
 * The function then stores the claims in the "claims" table in the database using the Supabase client's `upsert` method.
 * If the "contracts_id" and "token_id" of a claim already exist in the table, the existing row is updated with the new claim data.
 * If an error occurs while storing the claims, the error is logged and rethrown.
 *
 * @param {StoreClaimInput} { claims } - An object containing an array of claims to store. Each claim must match the ClaimSchema.
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
export const storeClaim = async ({ claims }: StoreClaimInput) => {
  const _claims = claims.map((claim) => ({
    ...ClaimSchema.parse(claim),
    value: 1,
    token_id: claim.token_id.toString(),
    block_number: claim.block_number.toString(),
    units: claim.units.toString(),
  }));

  try {
    console.debug(`[StoreClaim] Storing ${_claims.length} claims`);

    await supabase
      .from("claims")
      .upsert(_claims, {
        onConflict: "contracts_id, token_id",
        ignoreDuplicates: false,
      })
      .throwOnError();
  } catch (error) {
    console.error("[StoreClaim] Error storing claims", error);
    throw error;
  }
};

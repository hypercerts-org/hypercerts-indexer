import { isAddress } from "viem";
import { z } from "zod";
import { StorageMethod } from "@/indexer/LogParser.js";
import { dbClient } from "@/clients/dbClient.js";

export const ClaimSchema = z.object({
  contracts_id: z.string(),
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
  context: { block, contracts_id, events_id },
}) => {
  const _claims = data.map((claim) => ({
    ...ClaimSchema.parse(claim),
    value: 1,
    token_id: claim.token_id.toString(),
    creation_block_number: block.blockNumber.toString(),
    creation_block_timestamp: block.timestamp,
    last_update_block_number: block.blockNumber.toString(),
    last_update_block_timestamp: block.timestamp,
    units: claim.units.toString(),
  }));

  try {
    return [
      dbClient
        .insertInto("claims")
        .values(_claims)
        .onConflict((oc) =>
          oc.columns(["contracts_id", "token_id"]).doUpdateSet((eb) => ({
            creator_address: eb.ref("excluded.creator_address"),
            owner_address: eb.ref("excluded.owner_address"),
            value: 1,
            token_id: eb.ref("excluded.token_id"),
            creation_block_number: eb.ref("excluded.creation_block_number"),
            creation_block_timestamp: eb.ref(
              "excluded.creation_block_timestamp",
            ),
            last_update_block_number: eb.ref(
              "excluded.last_update_block_number",
            ),
            last_update_block_timestamp: eb.ref(
              "excluded.last_update_block_timestamp",
            ),
            units: eb.ref("excluded.units"),
          })),
        )
        .compile(),
      dbClient
        .updateTable("contract_events")
        .set({ last_block_indexed: block.blockNumber })
        .where("contracts_id", "=", contracts_id)
        .where("events_id", "=", events_id)
        .compile(),
    ];
  } catch (error) {
    console.error("[StoreClaim] Error storing claims", error);
    throw error;
  }
};

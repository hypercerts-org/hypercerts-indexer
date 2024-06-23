import { supabase } from "@/clients/supabaseClient.js";
import { Database } from "@/types/database.types.js";

interface StoreAttestations {
  attestations: (
    | Database["public"]["Tables"]["attestations"]["Update"]
    | undefined
  )[];
}

/*
 *  Stores the provided attestation data in the database.
 *
 *   @param {attestations} - An array of attestations to store in the database.
 *   @returns {Promise<void>} - A promise that resolves when the attestation data has been stored in the database.
 *
 *  @throws {Error} - If the attestation data cannot be stored in the database.
 */
export const storeAttestations = async ({
  attestations,
}: StoreAttestations) => {
  const _attestations = attestations.filter(
    (
      attestation,
    ): attestation is Database["public"]["Tables"]["attestations"]["Update"] =>
      attestation !== null && attestation !== undefined,
  );

  if (!_attestations || _attestations.length === 0) {
    console.debug("[StoreAttestations] No attestation data provided");
    return;
  }

  console.debug(
    `[StoreAttestations] Storing ${_attestations.length} attestations`,
  );

  const parsedAttestations = _attestations.map((attestation) => {
    return {
      ...attestation,
      token_id: attestation.token_id.toString(),
      creation_block_number: attestation.creation_block_number.toString(),
      creation_block_timestamp: attestation.creation_block_timestamp.toString(),
      last_update_block_number: attestation.last_update_block_number.toString(),
      last_update_block_timestamp:
        attestation.last_update_block_timestamp.toString(),
    };
  });

  try {
    await supabase
      .from("attestations")
      .upsert(parsedAttestations, {
        onConflict: "supported_schemas_id, uid",
      })
      .throwOnError();
  } catch (error) {
    console.error(
      "[StoreAttestations] Error while storing attestations",
      error,
    );

    throw error;
  }
};

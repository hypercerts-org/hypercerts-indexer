import { supabase } from "@/clients/supabaseClient.js";
import { Database } from "@/types/database.types.js";

interface StoreAttestations {
  attestations: Database["public"]["Tables"]["attestations"]["Update"][];
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
  const _attestations = (attestations = attestations.filter(
    (attestation) => attestation !== null && attestation !== undefined,
  ));

  if (!_attestations || _attestations.length === 0) {
    console.debug("[StoreAttestations] No attestation data provided");
    return;
  }

  console.debug(
    `[StoreAttestations] Storing ${_attestations.length} attestations`,
  );

  try {
    await supabase
      .from("attestations")
      .upsert(_attestations, {
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

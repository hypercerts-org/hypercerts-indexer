import { supabase } from "@/clients/supabaseClient";
import { Tables } from "@/types/database.types";
import * as console from "node:console";

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
}: {
  attestations?: Tables<"attestations">[];
}) => {
  if (!attestations) {
    console.debug("[StoreAttestations] No attestation data provided");
    return;
  }

  if (attestations.length === 0) return;

  console.debug(
    `[StoreAttestations] Storing ${attestations.length} attestations`,
  );

  await supabase
    .from("attestations")
    .upsert(attestations, {
      onConflict: "supported_schemas_id, uid",
    })
    .throwOnError();
};

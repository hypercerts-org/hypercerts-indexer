import { supabase } from "@/clients/supabaseClient.js";
import { StorageMethod } from "@/indexer/LogParser.js";
import { DecodedAttestation } from "@/parsing/attestationData.js";
import { storeSupportedSchemas } from "@/storage/storeSupportedSchemas.js";

/*
 *  Stores the provided attestation data in the database.
 *
 *   @param {attestations} - An array of attestations to store in the database.
 *   @returns {Promise<void>} - A promise that resolves when the attestation data has been stored in the database.
 *
 *  @throws {Error} - If the attestation data cannot be stored in the database.
 */
export const storeAttestations: StorageMethod<DecodedAttestation> = async ({
  data,
  context: { schema, block },
}) => {
  const parsedAttestations = data.map((attestation) => {
    return {
      ...attestation,
      token_id: attestation.token_id.toString(),
      creation_block_number: block.blockNumber,
      creation_block_timestamp: block.timestamp.toString(),
      last_update_block_number: block.blockNumber,
      last_update_block_timestamp: block.timestamp.toString(),
    };
  });

  try {
    await supabase
      .from("attestations")
      .upsert(parsedAttestations, {
        onConflict: "supported_schemas_id, uid",
      })
      .throwOnError();

    await storeSupportedSchemas({
      supportedSchemas: [
        {
          ...schema,
          last_block_indexed: block.blockNumber,
        },
      ],
    });
  } catch (error) {
    console.error(
      "[StoreAttestations] Error while storing attestations",
      error,
    );

    throw error;
  }
};

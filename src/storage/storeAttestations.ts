import { StorageMethod } from "@/indexer/LogParser.js";
import { DecodedAttestation } from "@/parsing/parseAttestationData.js";
import { dbClient } from "@/clients/dbClient.js";

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
  context: { block },
}) => {
  const attestations = [];

  for (const attestation of data) {
    attestations.push({
      ...attestation,
      token_id: attestation.token_id.toString(),
      creation_block_number: block.blockNumber,
      creation_block_timestamp: block.timestamp.toString(),
      last_update_block_number: block.blockNumber,
      last_update_block_timestamp: block.timestamp.toString(),
    });
  }

  return [dbClient.insertInto("attestations").values(attestations).compile()];
};

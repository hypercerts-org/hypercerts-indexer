import { dbClient } from "@/clients/dbClient.js";
import { MetadataResult } from "@/parsing/parseUriEvent.js";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { getAddress } from "viem";

/**
 * Stores the value transfer data in the database.
 *
 * This function processes the parsed value transfer data and stores the relevant information
 * in the database. It handles the creation or retrieval of claims and updates the token information.
 *
 * @param {Object} params - The parameters for the function.
 * @param {ParsedValueTransfer[]} params.data - The parsed value transfer event data.
 * @param {Object} params.context - The context for the storage operation.
 * @param {Object} params.context.block - The block information.
 * @param {Function} params.context.readContract - The function to read contract data.
 *
 * @returns {Promise<void>} A promise that resolves when the data has been stored.
 *
 * @example
 * ```typescript
 * const data = [
 *   {
 *     from_token_id: 1n,
 *     to_token_id: 2n,
 *     contract_address: "0x1234...5678",
 *     claim_id: 1n,
 *   },
 *   // other transfers...
 * ];
 * const context = {
 *   block: {
 *     timestamp: 1234567890n,
 *     blockNumber: 12345,
 *   },
 *   readContract: async ({ address, contract, functionName, args }) => {
 *     // implementation...
 *   },
 * };
 * await storeValueTransfer({ data, context });
 */
export const storeMetadata = async ({ data }: { data: MetadataResult[] }) => {
  if (data.length === 0) return [];

  const requests = [];

  for (const metadata of data) {
    if (!metadata.metadata) continue;

    requests.push(
      dbClient
        .insertInto("metadata")
        .values(metadata.metadata)
        .onConflict((oc) => oc.columns(["uri"]).doNothing())
        .compile(),
    );

    if (metadata.allow_list) {
      // Store allow_list_data
      requests.push(
        dbClient
          .insertInto("allow_list_data")
          .values(metadata.allow_list)
          .onConflict((oc) => oc.columns(["uri"]).doNothing())
          .compile(),
      );

      // Store hypercert_allow_list_records
      const hypercert_allow_lists_id = metadata.hypercert_allow_list?.id;

      if (!hypercert_allow_lists_id)
        throw new Error("[storeMetadata] hypercert_allow_list id not found");
      const allowList = StandardMerkleTree.load(metadata.allow_list.data);
      const records = [];

      for (const [i, v] of allowList.entries()) {
        const leaf = allowList.leafHash(v);
        const proof = allowList.getProof(v);
        records.push({
          hypercert_allow_lists_id,
          user_address: getAddress(v[0]),
          entry: i,
          units: v[1],
          leaf,
          proof,
          claimed: false,
        });
      }

      requests.push(
        dbClient
          .insertInto("hypercert_allow_list_records")
          .values(records)
          .compile(),
      );

      // Store hypercert_allow_lists as parsed
      requests.push(
        dbClient
          .updateTable("hypercert_allow_lists")
          .set({ parsed: true })
          .where("id", "=", hypercert_allow_lists_id)
          .compile(),
      );
    }
  }

  return requests;
};

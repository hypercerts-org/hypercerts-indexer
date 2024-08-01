import { dbClient } from "@/clients/dbClient.js";
import { MetadataResult } from "@/parsing/parseUriEvent.js";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { getAddress } from "viem";

/**
 * Stores metadata and allow list data in the database.
 *
 * This function processes an array of `MetadataResult` objects and stores the metadata and allow list data
 * in the database. It handles conflicts by ignoring entries with duplicate URIs. Additionally, it processes
 * and stores allow list records and updates the parsed status of hypercert allow lists.
 *
 * @param params - The parameters for the function.
 * @param params.data - The array of metadata results to store.
 *
 * @returns A promise that resolves to an array of database requests.
 *
 * @example
 * ```typescript
 * const metadataResults = [
 *   {
 *     metadata: {
 *       name: "My Hypercert",
 *       description: "This is a Hypercert",
 *       image: "data:image/png;base64,iVBOA...uQmCC",
 *       external_url: "https://example.com/hypercert/1",
 *       uri: "QmXZj9Pm4g7Hv3Z6K4Vw2vW",
 *       parsed: true,
 *     },
 *     allow_list: {
 *       data: { ... },
 *       root: "rootHash",
 *       uri: "QmXZj9Pm4g7Hv3Z6K4Vw2vW",
 *       parsed: true,
 *     },
 *   },
 *   // other metadata results...
 * ];
 * const storedData = await storeMetadata({ data: metadataResults });
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
        throw new Error("[storeMetadata] hypercert_allow_lists_id not found");
      const allowList = StandardMerkleTree.load(metadata.allow_list.data);
      const records = [];

      for (const [i, v] of allowList.entries()) {
        const leaf = allowList.leafHash(v);
        const proof = allowList.getProof(i);
        records.push({
          hypercert_allow_lists_id,
          user_address: getAddress(v[0]),
          entry: i,
          units: v[1].toString(),
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
          .insertInto("hypercert_allow_lists")
          .values(metadata.hypercert_allow_list)
          .compile(),
      );
    }
  }

  return requests;
};

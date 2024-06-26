import { supabase } from "@/clients/supabaseClient.js";
import { Database } from "@/types/database.types.js";

/* 
    This function stores the chain, contract address, token ID, metadata and URI of a hypercert in the database.

    @param claim The claim to store. 
    @returns The stored data.

    @example
    ```js
    
    const metadata: HypercertMetadata = {
            name: "My Hypercert",
            description: "This is a Hypercert",
            image: "data:image/png;base64,iVBOA...uQmCC',
            external_url: "https://example.com/hypercert/1",
            hypercert: {...}
           };
    const cid = "QmXZj9Pm4g7Hv3Z6K4Vw2vW";
    
    const storedData = await storeHypercert("0x1234...5678", 1n, metadata, cid);
    ```
 */

interface StoreMetadata {
  metadata?: Database["public"]["Tables"]["metadata"]["Update"][];
}

export const storeMetadata = async ({ metadata }: StoreMetadata) => {
  if (!metadata || metadata.length === 0) {
    console.error("[StoreMetadata] No data or contract provided");
    return;
  }

  console.debug(`[StoreMetadata] Storing ${metadata.length} metadata entries`);

  try {
    await supabase
      .from("metadata")
      .upsert(metadata, {
        onConflict: "uri",
        ignoreDuplicates: false,
        defaultToNull: true,
      })
      .throwOnError();
  } catch (error) {
    console.error("[StoreMetadata] Error while storing parsed metadata", error);
    throw error;
  }
};

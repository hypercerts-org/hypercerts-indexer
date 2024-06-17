import { supabase } from "@/clients/supabaseClient.js";
import { Database } from "@/types/database.types.js";
import { z } from "zod";

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

  const metadataValidationSchema = z.object({
    allow_list_uri: z.string().optional(),
    contributors: z.array(z.string()).optional(),
    description: z.string().optional(),
    external_url: z.string().optional(),
    id: z.string().optional(),
    image: z.string().optional(),
    impact_scope: z.array(z.string()).optional(),
    impact_timeframe_from: z.number().optional(),
    impact_timeframe_to: z.number().optional(),
    name: z.string().optional(),
    properties: z
      .array(
        z.object({
          trait_type: z.string(),
          value: z.any(),
        }),
      )
      .optional(),
    rights: z.array(z.string()).optional(),
    uri: z.string().optional(),
    work_scope: z.array(z.string()).optional(),
    work_timeframe_from: z.number().optional(),
    work_timeframe_to: z.number().optional(),
  });

  try {
    const parsedMetadata = metadata.map((x) => ({
      ...metadataValidationSchema.parse(x),
      parsed: true,
    }));

    await supabase
      .from("metadata")
      .upsert(parsedMetadata, { onConflict: "uri", ignoreDuplicates: false })
      .throwOnError();
  } catch (error) {
    console.error("[StoreMetadata] Error while storing parsed metadata", error);
  }
};

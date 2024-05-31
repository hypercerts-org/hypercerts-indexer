import { supabase } from "@/clients/supabaseClient";
import { NewClaim } from "@/types/types";
import { isAddress } from "viem";
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

interface StoreClaim {
  claims?: NewClaim[];
}

export const storeClaim = async ({ claims }: StoreClaim) => {
  if (!claims) {
    console.debug("[StoreClaim] No data or contract provided");
    return;
  }

  const validationSchema = z
    .object({
      contracts_id: z.string().uuid(),
      creator_address: z.string(),
      token_id: z.bigint(),
      block_number: z.bigint(),
      units: z.bigint(),
      uri: z.string(),
    })
    .refine(
      (x) => isAddress(x.creator_address),
      `[StoreClaim] Invalid creator address`,
    );

  const _claims = claims
    .map((claim) => validationSchema.parse(claim))
    .map((claim) => ({
      owner_address: claim.creator_address,
      contracts_id: claim.contracts_id,
      token_id: claim.token_id.toString(),
      block_number: claim.block_number.toString(),
      units: claim.units.toString(),
      uri: claim.uri,
      value: 1,
    }));

  console.debug(`[StoreClaim] Storing ${_claims.length} claims`);

  await supabase
    .from("claims")
    .upsert(_claims, {
      onConflict: "contracts_id, token_id",
      ignoreDuplicates: false,
    })
    .throwOnError();
};

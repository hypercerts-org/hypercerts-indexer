import { supabase } from "@/clients/supabaseClient";
import { Database, Tables } from "@/types/database.types";
import { NewClaim } from "@/types/types";

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
  claim?: Partial<NewClaim>;
  contract?: Pick<Tables<"contracts">, "id">;
}

export const storeClaim = async ({ claim, contract }: StoreClaim) => {
  if (!claim || !contract) {
    console.error("[StoreClaim] No data or contract provided");
    return;
  }

  // TODO validations
  if (
    !claim.creator_address ||
    !claim.token_id ||
    !claim.block_timestamp ||
    !claim.units ||
    !claim.uri
  ) {
    console.error("[StoreClaim] Invalid claim data: ", claim);
    return;
  }

  const hypercert_token: Database["public"]["Functions"]["store_claim"]["Args"] =
    {
      p_creator: claim.creator_address,
      p_contracts_id: contract.id,
      p_token_id: claim.token_id.toString(),
      p_block_timestamp: claim.block_timestamp.toString(),
      p_type: "claim",
      p_units: claim.units.toString(),
      p_uri: claim.uri,
    };

  console.log(
    `[StoreClaim] Storing claim ${hypercert_token.p_token_id}: `,
    hypercert_token,
  );

  try {
    const { data, error } = await supabase.rpc("store_claim", hypercert_token);

    if (error) {
      throw new Error(
        `[StoreClaim] Error while storing claim: ${error.message}`,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[StoreClaim] Error while storing claim: ${error.message}`);
    } else {
      console.error(
        `[StoreClaim] An unknown error occurred: ${JSON.stringify(error)}`,
      );
    }
  }
};

import { supabase } from "./supabaseClient";
import { chainId } from "@/utils/constants";
import { ClaimData } from "@/parsing/claimStoredEvent";
import { Tables } from "@/types/database-generated.types";

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
export const storeHypercert = async (claim: ClaimData) => {
  const { contractAddress, claimID, metadata, uri } = claim;

  const { data, error } = await supabase
    .from("hypercerts")
    .upsert({
      chain_id: chainId,
      contract_address: contractAddress,
      token_id: claimID.toString(),
      name: metadata?.name,
      description: metadata?.description,
      image: metadata?.image,
      external_url: metadata?.external_url,
      work_scope: metadata?.hypercert?.work_scope.value,
      work_timeframe_from: metadata?.hypercert?.work_timeframe?.value?.[0],
      work_timeframe_to: metadata?.hypercert?.work_timeframe?.value?.[1],
      impact_scope: metadata?.hypercert?.impact_scope.value,
      impact_timeframe_from: metadata?.hypercert?.impact_timeframe?.value?.[0],
      impact_timeframe_to: metadata?.hypercert?.impact_timeframe?.value?.[1],
      contributors: metadata?.hypercert?.contributors.value,
      rights: metadata?.hypercert?.rights?.value,
      cid: uri,
      properties: metadata?.properties,
    })
    .select()
    .returns<Tables<"hypercerts">>();

  if (error) {
    console.error(
      `Error while inserting data for claim ${claimID} at contract ${contractAddress} into database: `,
      error,
    );
    return;
  }

  return data;
};

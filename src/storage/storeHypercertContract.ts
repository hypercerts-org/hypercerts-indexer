import { supabase } from "../clients/supabaseClient";
import { Tables } from "@/types/database.types";

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
export const storeHypercertContract = async ({
  contract,
}: {
  contract?: Tables<"hypercert_contracts">;
}) => {
  if (!contract) {
    console.error("No contract data provided");
    return;
  }

  const { data, error } = await supabase
    .from("hypercert_contracts")
    .upsert(contract)
    .select()
    .returns<Tables<"hypercert_contracts">>();

  if (error) {
    console.error(`Error while storing contract`, error);
    return;
  }

  console.info(`Stored contract`, data);

  return data;
};

import { supabase } from "@/clients/supabaseClient";
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
export const storeHypercerts = async ({
  hypercerts,
  contract,
}: {
  hypercerts?: Tables<"hypercerts">[];
  contract?: Tables<"hypercert_contracts">;
}) => {
  if (!hypercerts || !contract) {
    console.error("No hypercert data or contract provided");
    return;
  }

  const _hypercerts = hypercerts
    .filter((data) => data !== undefined)
    .map((hypercert) => ({
      ...hypercert,
      claim_id: hypercert.claim_id?.toString(),
      hypercert_contracts_id: contract.id,
    }));

  console.log(`Storing ${_hypercerts.length} hypercerts`);

  if (_hypercerts.length === 0) return;

  const { data, error } = await supabase
    .from("hypercerts")
    .upsert(_hypercerts)
    .select()
    .returns<Tables<"hypercerts">[]>();

  if (error) {
    console.error(`Error while storing hypercerts`, error);
    return;
  }

  console.info(`Stored ${data?.length} hypercerts`);

  return data;
};

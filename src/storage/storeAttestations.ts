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
export const storeAttestations = async ({
  attestations,
  schema,
}: {
  attestations?: Tables<"attestations">[];
  schema?: Tables<"supported_schemas">;
}) => {
  if (!attestations) {
    console.error("No attestation data provided");
    return;
  }

  const _attestations = attestations.map((attestation) => ({
    ...attestation,
    supported_schemas_id: schema?.id,
  }));

  if (_attestations.length === 0) return;

  console.debug(`Storing ${_attestations.length} attestations`);

  const { data, error } = await supabase
    .from("attestations")
    .upsert(_attestations)
    .select();

  if (error) {
    console.error(`Error while storing attestations`, error);
    return;
  }

  console.debug(`Stored ${data?.length} attestations`);

  return data;
};

import { supabase } from "@/clients/supabaseClient";
import { Tables } from "@/types/database.types";

/* 
    This function stores the schema data in the database.

    @param scheme The schema to store. 
    @returns The stored data.

    @example
    ```js
    
    const record  = {
            id: "0x1234...5678",
            eas_schema_id: "0x1234...5678",
            schema: 'bytes32 proposalId, bool vote',
            revocable: true
           };
    
    const storedData = await storeSchemaRecord(record); 
    ```
 */

interface StoreSupportedSchemas {
  supportedSchemas?: Tables<"supported_schemas">[];
}

export const storeSupportedSchemas = async ({
  supportedSchemas,
}: StoreSupportedSchemas) => {
  if (!supportedSchemas) {
    console.error("[StoreSupportedSchema] No schema data provided");
    return;
  }

  await supabase
    .from("supported_schemas")
    .upsert(supportedSchemas)
    .throwOnError();
};

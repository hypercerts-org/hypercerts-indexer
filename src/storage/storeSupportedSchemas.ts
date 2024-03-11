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
export const storeSupportedSchemas = async ({
  supportedSchemas,
}: {
  supportedSchemas?: Tables<"supported_schemas">[];
}) => {
  if (!supportedSchemas) {
    console.error("No schema data provided");
    return;
  }

  const { data, error } = await supabase
    .from("supported_schemas")
    .upsert(supportedSchemas)
    .select()
    .returns<Tables<"supported_schemas">[]>();

  if (error) {
    console.error(
      `Error while inserting schema ${supportedSchemas.map((schema) => schema.id)} into the database`,
      error,
    );
    return;
  }

  console.debug(
    `Inserted schemas ${supportedSchemas.map((schema) => schema.id)} into the database`,
  );

  return data;
};

export const storeSupportedSchema = async ({
  supportedSchema,
}: {
  supportedSchema?: Tables<"supported_schemas">;
}) => {
  if (!supportedSchema) {
    console.error("No schema data provided");
    return;
  }

  const { data, error } = await supabase
    .from("supported_schemas")
    .upsert(supportedSchema)
    .select()
    .returns<Tables<"supported_schemas">[]>();

  if (error) {
    console.error(
      `Error while inserting schema ${supportedSchema.id} into the database`,
      error,
    );
    return;
  }

  console.info(`Inserted schema ${supportedSchema.id} into the database`);
  return data;
};

import { supabase } from "@/clients/supabaseClient.js";
import { Database } from "@/types/database.types.js";

interface StoreSupportedSchemas {
  supportedSchemas: Database["public"]["Tables"]["supported_schemas"]["Update"][];
}

/**
 * Asynchronously stores supported schemas in the database.
 *
 * This function takes an object with a `supportedSchemas` property as input, which should be an array of supported schema objects.
 * It uses the Supabase client to upsert the supported schemas into the `supported_schemas` table in the database.
 * If the `supportedSchemas` property is not provided, the function logs an error and returns early.
 * If there is an error during the upsert operation, the function logs the error and throws it.
 *
 * @param {Object} params - The parameters for the function.
 * @param {Object[]} params.supportedSchemas - The array of supported schema objects to store.
 *
 * @returns {Promise<void>} A promise that resolves when the upsert operation is complete. If there is an error during the operation, the promise is rejected with the error.
 *
 * @example
 * ```typescript
 * const supportedSchemas = [
 *   {
 *     id: '0x1234...5678',
 *     eas_schema_id: '0x1234...5678',
 *     ...
 *     schema: 'bytes32 proposalId, bool vote',
 *     revocable: true,
 *   },
 *   // More schema objects...
 * ];
 *
 * await storeSupportedSchemas({ supportedSchemas });
 *
 *```
 */
export const storeSupportedSchemas = async ({
  supportedSchemas,
}: StoreSupportedSchemas) => {
  try {
    await supabase
      .from("supported_schemas")
      .upsert(supportedSchemas)
      .throwOnError();
  } catch (error) {
    console.error("[StoreSupportedSchema] Error storing schema data", error);
    throw error;
  }
};

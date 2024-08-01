import { supabase } from "@/clients/supabaseClient.js";
import { Tables } from "@/types/database.types.js";

/**
 * getSupportedSchemas is an async function that fetches supported EAS schemas for a given chain ID from the "supported_schemas" table in the database.
 * It uses the supabase client to read from the database.
 *
 * @returns {Promise<Tables<"supported_schemas">[] | undefined>} - The supported EAS schemas for the given chain ID, or undefined if an error occurs or no data is found.
 *
 * @throws {Error} - Throws an error if there is an error in the fetch operation.
 */
export const getSupportedSchemas = async ({ chainId }: { chainId: number }) => {
  try {
    const { data } = await supabase
      .from("supported_schemas")
      .select("*")
      .eq("chain_id", chainId)
      .returns<Tables<"supported_schemas">[]>()
      .throwOnError();

    return data;
  } catch (error) {
    console.error(
      `[GetSupportedSchema] Error while fetching supported EAS schema for chain ID ${chainId}`,
      error,
    );
    throw error;
  }
};

import { supabase } from "@/clients/supabaseClient";
import { Tables } from "@/types/database.types";

export const getSupportedSchemas = async ({ chainId }: { chainId: number }) => {
  if (!chainId || !Number.isInteger(chainId)) {
    console.error(`Invalid chain ID: ${chainId}`);
    return;
  }

  const { data, error } = await supabase
    .from("supported_schemas")
    .select()
    .eq("chain_id", chainId)
    .returns<Tables<"supported_schemas">[]>();

  if (!data) {
    console.error(
      `Error while fetching supported EAS schema for chain ID ${chainId}`,
      error,
    );
    return;
  }

  return data;
};

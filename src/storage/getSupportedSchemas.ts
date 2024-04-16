import { supabase } from "@/clients/supabaseClient";

export const getSupportedSchemas = async ({ chainId }: { chainId: number }) => {
  if (!chainId || !Number.isInteger(chainId)) {
    console.error(`[GetSupportedSchema] Invalid chain ID: ${chainId}`);
    return;
  }

  const { data, error } = await supabase
    .from("supported_schemas")
    .select()
    .eq("chain_id", chainId);

  if (!data) {
    console.error(
      `[GetSupportedSchema] Error while fetching supported EAS schema for chain ID ${chainId}`,
      error,
    );
    return;
  }

  return data;
};

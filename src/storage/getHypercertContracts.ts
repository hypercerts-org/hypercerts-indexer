import { supabase } from "@/clients/supabaseClient";
import { Tables } from "@/types/database.types";

export const getHypercertContracts = async ({
  chainId,
}: {
  chainId: number;
}) => {
  if (!chainId || !Number.isInteger(chainId)) {
    console.error(`Invalid chain ID: ${chainId}`);
    return;
  }

  const { data, error } = await supabase
    .from("hypercert_contracts")
    .select()
    .eq("chain_id", chainId)
    .returns<Tables<"hypercert_contracts">[]>();

  if (!data) {
    console.error(
      `Error while fetching supported contracts for chain ID ${chainId}`,
      error,
    );
    return;
  }

  return data;
};

import { getDeployment } from "@/utils/getDeployment";
import { supabase } from "./supabaseClient";
import { chainId } from "@/utils/constants";

export const getLastBlockIndexed = async () => {
  const deployment = getDeployment();

  const contractAddress = deployment.addresses?.HypercertMinterUUPS;
  const { data, error } = await supabase
    .from("lastblockindexed")
    .select("block_number")
    .eq("chain_id", chainId)
    .eq("contract_address", contractAddress);

  if (error) {
    console.error(
      `Error while fetching last block indexed for chain ID ${chainId} and contract ${contractAddress}`,
      error
    );
  }

  return data;
};

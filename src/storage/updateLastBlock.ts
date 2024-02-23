import { supabase } from "./supabaseClient";
import { chainId } from "@/utils/constants";
import { deployments } from "@hypercerts-org/sdk";

const selectedDeployment = () => {
  switch (chainId) {
    case "10":
      return { ...deployments["10"], startBlock: 76066993n };
    case "11155111":
      return { ...deployments["11155111"], startBlock: 4421944n };
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

export const updateLastBlock = async (blockNumber: bigint) => {
  const deployment = selectedDeployment();
  const contractAddress = deployment.addresses?.HypercertMinterUUPS;

  console.info(
    `Setting last block ${blockNumber} for contract ${contractAddress}`
  );
  const { data, error } = await supabase
    .from("lastblockindexed")
    .upsert({
      chain_id: chainId,
      contract_address: contractAddress?.toString(),
      block_number: blockNumber.toString(),
    })
    .select();

  if (error) {
    console.error(
      `Error while updating last block for contract ${contractAddress} on chain ${chainId} in database: `,
      error
    );
  }

  console.info(`Last block updated for contract ${contractAddress} to ${blockNumber}`);

  return data;
};

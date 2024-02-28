import { getDeployment } from "@/utils/getDeployment";
import { supabase } from "./supabaseClient";
import { chainId as chainIdFromEnv } from "@/utils/constants";
import { isAddress } from "viem";

type LastBlockIndexed = {
  blockNumber: number;
  chainId: number;
  contractAddress: string;
};

const deployment = getDeployment();

type LastBlockIndexedParams = {
  chainId?: number;
  contractAddress?: string;
};

const defaultParams: LastBlockIndexedParams = {
  chainId: chainIdFromEnv,
  contractAddress: deployment.addresses?.HypercertMinterUUPS,
};

/*
  This function fetches the last block indexed for a given chain ID and contract address from the database. This is used
  to determine the starting block for indexing logs. It is also useful for resuming indexing from the last block 
  indexed in the event of a crash or restart. It also provides a useful way to check if the contract has been indexed 
  at all.

  @param [chain_id] - The chain ID of the contract to check.
  @param [contract_address] - The address of the contract to check.
  @returns  The last block indexed for the given chain ID and contract address.

  @example
  ```js
  const lastBlockIndexed = await getLastBlockIndexed({chain_id: 1, contract_address: "0x1234...5678"});
  const { block_number, chain_id, contractAddress } = lastBlockIndexed;
  ```
 */
export const getLastBlockIndexed = async ({
  chainId = defaultParams.chainId,
  contractAddress = defaultParams.contractAddress,
}: LastBlockIndexedParams = defaultParams) => {
  if (!chainId) {
    console.error(`Invalid chain ID: ${chainId}`);
    return;
  }

  if (!contractAddress || !isAddress(contractAddress)) {
    console.error(`Invalid contract address: ${contractAddress}`);
    return;
  }

  const { data, error } = await supabase
    .from("lastblockindexed")
    .select("block_number")
    .eq("chain_id", chainId)
    .eq("contract_address", contractAddress);

  if (error) {
    console.error(
      `Error while fetching last block indexed for chain ID ${chainId} and contract ${contractAddress}`,
      error,
    );
  }

  const block_number = data?.[0]?.block_number;

  if (!block_number) {
    console.warn(
      `No last block indexed found for chain ID ${chainId} and contract ${contractAddress}`,
    );
    return;
  }

  return {
    blockNumber: block_number,
    chainId,
    contractAddress,
  } as LastBlockIndexed;
};

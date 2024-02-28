import { supabase } from "./supabaseClient";
import { chainId } from "@/utils/constants";
import { getDeployment } from "@/utils";
import { isAddress } from "viem";

/*
 * This function updates the last block indexed for a given chain ID and contract address in the Supabase database.
 *
 * @param [blockNumber] - The block number to set as the last block indexed.
 * @returns The last block indexed for the given chain ID and contract address.
 *
 * @example
 * ```js
 * const lastBlockIndexed = await updateLastBlock(123456n);
 * ```
 */

export const updateLastBlock = async (blockNumber: bigint) => {
  const deployment = getDeployment();
  const contractAddress = deployment.addresses?.HypercertMinterUUPS;

  if (!contractAddress || !isAddress(contractAddress)) {
    console.error(`Invalid contract address: ${contractAddress}`);
    return;
  }

  console.info(
    `Setting last block ${blockNumber} for contract ${contractAddress} on chain ${chainId} in database...`,
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
      error,
    );
  }

  console.info(
    `Last block updated for contract ${contractAddress} to ${blockNumber}`,
  );

  return data;
};

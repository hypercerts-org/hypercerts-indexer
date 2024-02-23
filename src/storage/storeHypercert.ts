import { supabase } from "./supabaseClient";
import { HypercertMetadata } from "@hypercerts-org/sdk";
import { Address } from "viem";
import { chainId } from "@/utils/constants";

export const storeHypercert = async (
  contractAddress: Address,
  claimID: bigint,
  metadata: HypercertMetadata,
  cid: string
) => {
  const { data, error } = await supabase
    .from("hypercerts")
    .upsert({
      contract_address: contractAddress.toString(),
      chain_id: chainId,
      token_id: claimID.toString(),
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
      external_url: metadata.external_url,
      work_scope: metadata.hypercert?.work_scope.value,
      work_timeframe_from: metadata.hypercert?.work_timeframe?.value?.[0],
      work_timeframe_to: metadata.hypercert?.work_timeframe?.value?.[1],
      impact_scope: metadata.hypercert?.impact_scope.value,
      impact_timeframe_from: metadata.hypercert?.impact_timeframe?.value?.[0],
      impact_timeframe_to: metadata.hypercert?.impact_timeframe?.value?.[1],
      contributors: metadata.hypercert?.contributors.value,
      rights: metadata.hypercert?.rights?.value,
      cid,
    })
    .select();

  if (error) {
    console.error(
      `Error while inserting data for claim ${claimID} at contract ${contractAddress} into database: `,
      error
    );
  }

  return data;
};

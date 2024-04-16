import { supabase } from "@/clients/supabaseClient";

interface ContractEvents {
  eventName: string;
  chainId: number;
}

export const getContractEventsForChain = async ({
  chainId,
  eventName,
}: ContractEvents) => {
  if (!chainId || !Number.isInteger(chainId)) {
    console.error(`[GetContractEvents] Invalid chain ID: ${chainId}`);
    return;
  }

  const { data, error } = await supabase.rpc("search_contract_events", {
    p_chain: chainId,
    p_event: eventName,
  });

  if (!data) {
    console.error(
      `[GetContractEvents] Error while fetching supported contracts for ${eventName} on chain ${chainId}`,
      error,
    );
    return;
  }

  console.debug(
    `[GetContractEvents] Found ${data.length} contracts for ${eventName} on chain ${chainId}`,
  );

  return data;
};

import { supabase } from "@/clients/supabaseClient.js";

export const getContractEventsForChain = async ({
  chainId,
}: {
  chainId: number;
}) => {
  try {
    const res = await supabase
      .from("contract_events")
      .select(
        "contract:contracts!inner(id,contract_address,start_block,contract_slug),event:events!inner(id,name,abi),last_block_indexed",
      )
      .eq("contracts.chain_id", chainId)
      .throwOnError();

    const { data } = res;

    if (!data) {
      console.debug(
        `[GetContractEvents] No contract events found for chain ${chainId}`,
      );
      return;
    }

    return data.map((contractEvent) => ({
      // @ts-expect-error incorrect typing as array
      contracts_id: contractEvent.contract.id,
      // @ts-expect-error incorrect typing as array
      contract_address: contractEvent.contract.contract_address,
      // @ts-expect-error incorrect typing as array
      events_id: contractEvent.event.id,
      // @ts-expect-error incorrect typing as array
      event_name: contractEvent.event.name,
      // @ts-expect-error incorrect typing as array
      abi: contractEvent.event.abi,
      last_block_indexed: 0n,
      // @ts-expect-error incorrect typing as array
      contract_slug: contractEvent.contract.contract_slug,
      // @ts-expect-error incorrect typing as array
      // start_block: 31807828n - 1n,
      start_block: 0n,
    }));
  } catch (error) {
    console.error(
      `[GetContractEvents] Error while fetching contract events for chain ${chainId}`,
      error,
    );
    throw error;
  }
};

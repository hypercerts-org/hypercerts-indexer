import { supabase } from "@/clients/supabaseClient";
import * as console from "console";
import { EventToFetch } from "@/types/types";

export type ContractEvents = {
  eventName: string;
  chainId: number;
};

export const getContractEventsForChain = async ({
  chainId,
  eventName,
}: ContractEvents) => {
  if (!chainId || !Number.isInteger(chainId)) {
    console.error(`[GetContractEvents] Invalid chain ID: ${chainId}`);
    return;
  }

  const { data, error } = await supabase
    .from("contract_events")
    .select(
      "contract:contracts!inner(id,contract_address),event:events!inner(id,name,abi),last_block_indexed",
    )
    .eq("contracts.chain_id", chainId)
    .eq("events.name", eventName);

  if (!data || error) {
    console.error(
      `[GetContractEvents] Error while fetching supported contracts for ${eventName} on chain ${chainId}`,
      error,
    );
    return;
  }

  console.debug(
    `[GetContractEvents] Found ${data.length} contract events for ${eventName} on chain ${chainId}`,
  );

  return data.map(
    (contractEvent) =>
      ({
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
        last_block_indexed: contractEvent.last_block_indexed,
      }) as EventToFetch,
  );
};

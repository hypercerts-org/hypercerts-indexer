import { supabase } from "@/clients/supabaseClient.js";
import { chainId } from "@/utils/constants.js";

export type ContractEvents = {
  eventName?: string;
};

export const getContractEventsForChain = async ({
  eventName,
}: ContractEvents) => {
  try {
    let data;
    if (!eventName) {
      const res = await supabase
        .from("contract_events")
        .select(
          "contract:contracts!inner(id,contract_address,start_block,contract_slug),event:events!inner(id,name,abi),last_block_indexed",
        )
        .eq("contracts.chain_id", chainId)
        .throwOnError();

      data = res.data;
    } else {
      const res = await supabase
        .from("contract_events")
        .select(
          "contract:contracts!inner(id,contract_address,start_block,contract_slug),event:events!inner(id,name,abi),last_block_indexed",
        )
        .eq("contracts.chain_id", chainId)
        .eq("events.name", eventName)
        .throwOnError();

      data = res.data;
    }

    if (!data) {
      console.debug(
        `[GetContractEvents] No contract events found for ${eventName} on chain ${chainId}`,
      );
      return;
    }

    console.debug(
      `[GetContractEvents] Found ${data.length} contract events for ${eventName} on chain ${chainId}`,
    );

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
      last_block_indexed: contractEvent.last_block_indexed
        ? BigInt(contractEvent.last_block_indexed)
        : // @ts-expect-error incorrect typing as array
          contractEvent.contract.start_block
          ? // @ts-expect-error incorrect typing as array
            BigInt(contractEvent.contract.start_block)
          : 0n,
      // @ts-expect-error incorrect typing as array
      contract_slug: contractEvent.contract.contract_slug,
      // @ts-expect-error incorrect typing as array
      start_block: contractEvent.contract.start_block
        ? // @ts-expect-error incorrect typing as array
          BigInt(contractEvent.contract.start_block)
        : 0n,
    }));
  } catch (error) {
    console.error(
      `[GetContractEvents] Error while fetching supported contracts for ${eventName} on chain ${chainId}`,
      error,
    );
    throw error;
  }
};

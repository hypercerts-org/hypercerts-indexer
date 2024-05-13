import { supabase } from "@/clients/supabaseClient";
import { EventToFetch } from "@/types/types";

interface UpdateLastBlockIndexedContractEvents {
  contract_events: EventToFetch[];
}

export const updateLastBlockIndexedContractEvents = async ({
  contract_events,
}: UpdateLastBlockIndexedContractEvents) => {
  const filteredObjects = contract_events.map((ce) => ({
    contracts_id: ce.contracts_id,
    events_id: ce.events_id,
    last_block_indexed: ce.last_block_indexed,
  }));
  try {
    await supabase
      .from("contract_events")
      .upsert(filteredObjects, {
        onConflict: "contracts_id, events_id",
        ignoreDuplicates: false,
      })
      .throwOnError();
  } catch (error) {
    console.error(
      "[UpdateLastBlockIndexedContractEvents] Error while updating last block indexed for contract events",
      error,
    );
  }
};

import { supabase } from "@/clients/supabaseClient";
import { Tables } from "@/types/database.types";

interface UpdateLastBlockIndexedContractEvents {
  contract_events: Pick<
    Tables<"contract_events">,
    "id" | "last_block_indexed"
  >[];
}

export const updateLastBlockIndexedContractEvents = async ({
  contract_events,
}: UpdateLastBlockIndexedContractEvents) => {
  for (const contract_event of contract_events) {
    const { error } = await supabase
      .from("contract_events")
      .update({ last_block_indexed: contract_event.last_block_indexed })
      .eq("id", contract_event.id);

    if (error) {
      console.error(
        `[UpdateLastBlockIndexedEvents] Error while updating last block indexed for contract event with id ${contract_event.id}`,
        error,
      );
      return;
    }
  }
};

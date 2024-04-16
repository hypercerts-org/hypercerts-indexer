import { supabase } from "@/clients/supabaseClient";

interface UpdateLastBlockIndexedContractEvents {
  contractEventsId: string;
  lastBlockIndexed: bigint;
}

export const updateLastBlockIndexedContractEvents = async ({
  contractEventsId,
  lastBlockIndexed,
}: UpdateLastBlockIndexedContractEvents) => {
  const { data, error } = await supabase
    .from("contract_events")
    .update({
      last_block_indexed: lastBlockIndexed.toString(),
    })
    .eq("id", contractEventsId);

  if (error) {
    console.error(
      `[UpdateLastBlockIndexedEvents] Error while updating last block indexed for contract events with ID ${contractEventsId}`,
      error,
    );
    return;
  }

  return data;
};

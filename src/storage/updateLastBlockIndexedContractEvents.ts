import { supabase } from "@/clients/supabaseClient.js";

export const updateLastBlockIndexedContractEvents = async ({
  contracts_id,
  events_id,
  last_block_indexed,
}: {
  contracts_id: string;
  events_id: string;
  last_block_indexed: bigint;
}) => {
  try {
    await supabase
      .from("contract_events")
      .upsert(
        { contracts_id, last_block_indexed, events_id },
        {
          onConflict: "contracts_id, events_id",
          ignoreDuplicates: false,
        },
      )
      .throwOnError();
  } catch (error) {
    console.error(
      "[UpdateLastBlockIndexedContractEvents] Error while updating last block indexed for contract events",
      error,
    );
  }
};

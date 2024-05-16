import { supabase } from "@/clients/supabaseClient";

export const updateAllowlistRecordClaimed = async ({
  leaf,
  userAddress,
}: {
  leaf: string;
  userAddress: `0x${string}`;
}) => {
  try {
    // Get an allowlist record for corresponding leaf that has not been claimed
    const record = await supabase
      .from("hypercert_allow_list_records")
      .select()
      .eq("leaf", leaf)
      .ilike("user_address", userAddress)
      .eq("claimed", false)
      .single()
      .throwOnError();

    if (!record.data) {
      console.error(
        "[UpdateAllowlistRecordClaimed] Could not find unclaimed allowlist record",
        record.error?.message,
      );
      return;
    }

    // Update that record to claimed
    await supabase
      .from("hypercert_allow_list_records")
      .update({ claimed: true })
      .eq("id", record.data.id);
  } catch (e) {
    console.error(
      "[UpdateAllowlistRecordClaimed] Error while updating allow list record as claimed",
      e,
    );
  }
};

import { supabase } from "@/clients/supabaseClient";

export const updateAllowlistRecordClaimed = async ({
  tokenId,
  leaf,
  userAddress,
}: {
  tokenId: bigint;
  leaf: string;
  userAddress: `0x${string}`;
}) => {
  try {
    // Get an allowlist record for corresponding tokenId and leaf that has not been claimed
    const record = await supabase
      .from("hypercert_allow_list_records_with_token_id")
      .select("*")
      .eq("leaf", leaf)
      .eq("user_address", userAddress)
      .eq("claimed", false)
      .eq("token_id", tokenId)
      .maybeSingle()
      .throwOnError();

    console.log("record", record);

    if (!record.data) {
      console.error(
        "[UpdateAllowlistRecordClaimed] Could not find unclaimed allowlist record",
        "tokenId",
        tokenId,
        "leaf",
        leaf,
        "userAddress",
        userAddress,
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

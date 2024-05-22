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
      .from("claims")
      .select(
        "*, metadata(*, allow_list_data(*, hypercert_allow_lists(*, hypercert_allow_list_records(*))))",
      )
      .eq("token_id", tokenId)
      .eq(
        "metadata.allow_list_data.hypercert_allow_lists.hypercert_allow_list_records.leaf",
        leaf,
      )
      .ilike(
        "metadata.allow_list_data.hypercert_allow_lists.hypercert_allow_list_records.user_address",
        userAddress,
      )
      .eq(
        "metadata.allow_list_data.hypercert_allow_lists.hypercert_allow_list_records.claimed",
        false,
      )
      .maybeSingle()
      .throwOnError();

    const hypercertAllowListRecordId =
      record.data?.metadata?.allow_list_data?.hypercert_allow_lists?.[0]
        ?.hypercert_allow_list_records?.[0]?.id;

    if (!hypercertAllowListRecordId) {
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
      .eq("id", hypercertAllowListRecordId);
  } catch (e) {
    console.error(
      "[UpdateAllowlistRecordClaimed] Error while updating allow list record as claimed",
      e,
    );
  }
};

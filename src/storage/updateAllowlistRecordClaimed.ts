import { supabase } from "@/clients/supabaseClient.js";

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
      .from("claimable_fractions_with_proofs")
      .select("*")
      .eq("leaf", leaf)
      .eq("user_address", userAddress)
      .eq("claimed", false)
      .eq("token_id", tokenId.toString())
      .maybeSingle()
      .throwOnError();

    if (!record.data) {
      const alreadyClaimedRecord = await supabase
        .from("claimable_fractions_with_proofs")
        .select("*")
        .eq("leaf", leaf)
        .eq("user_address", userAddress)
        .eq("claimed", true)
        .eq("token_id", tokenId.toString())
        .maybeSingle()
        .throwOnError();

      if (alreadyClaimedRecord.data) {
        console.error(
          "[UpdateAllowlistRecordClaimed] Allowlist record already claimed",
          alreadyClaimedRecord.data,
        );
        return;
      }

      throw new Error(
        `Could not find unclaimed allowlist record for tokenId ${tokenId}, leaf ${leaf} and userAddress ${userAddress}, ${record.error?.message}`,
      );
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

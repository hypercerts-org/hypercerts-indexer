import { supabase } from "@/clients/supabaseClient.js";
import { LeafClaimed } from "@/parsing/leafClaimedEvent.js";
import { StorageMethod } from "@/indexer/processLogs.js";
import _ from "lodash";

export const updateAllowlistRecordClaimed: StorageMethod<LeafClaimed> = async ({
  data,
}) => {
  if (_.isArray(data)) return;

  const { leaf, token_id, creator_address } = data;
  try {
    // Get an allowlist record for corresponding tokenId and leaf that has not been claimed
    const { data } = await supabase
      .from("claimable_fractions_with_proofs")
      .select("*, token_id::text")
      .eq("leaf", leaf)
      .ilike("user_address", creator_address)
      .eq("claimed", false)
      .eq("token_id", token_id.toString())
      .maybeSingle()
      .throwOnError();

    if (!data) {
      const alreadyClaimedRecord = await supabase
        .from("claimable_fractions_with_proofs")
        .select("*, token_id::text")
        .eq("leaf", leaf)
        .ilike("user_address", creator_address)
        .eq("claimed", true)
        .eq("token_id", token_id.toString())
        .maybeSingle()
        .throwOnError();

      if (alreadyClaimedRecord.data) {
        console.error(
          "[UpdateAllowlistRecordClaimed] Allowlist record already claimed",
          alreadyClaimedRecord.data,
        );

        return;
      }

      console.error(
        "[UpdateAllowlistRecordClaimed] Allowlist record not found",
        { leaf, token_id, creator_address },
      );

      return;
    }

    await supabase
      .from("hypercert_allow_list_records")
      .update({ claimed: true })
      .eq("id", data.id)
      .throwOnError();
  } catch (e) {
    console.error(
      "[UpdateAllowlistRecordClaimed] Error while updating allow list record as claimed",
      e,
    );
  }
};

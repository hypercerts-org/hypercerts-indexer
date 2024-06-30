import { supabase } from "@/clients/supabaseClient.js";
import { Tables } from "@/types/database.types";
import { getHypercertTokenId } from "@/utils/tokenIds.js";
import { LeafClaimed } from "@/parsing/leafClaimedEvent";

export const updateAllowlistRecordClaimed = async (data: LeafClaimed[]) => {
  const records: Tables<"claimable_fractions_with_proofs">[] = [];

  for (const { leaf, token_id, creator_address } of data) {
    try {
      // Get an allowlist record for corresponding tokenId and leaf that has not been claimed
      const record = await supabase
        .from("claimable_fractions_with_proofs")
        .select("*")
        .eq("leaf", leaf)
        .ilike("user_address", creator_address)
        .eq("claimed", false)
        .eq("token_id", token_id.toString())
        .maybeSingle()
        .throwOnError();

      if (!record.data) {
        const alreadyClaimedRecord = await supabase
          .from("claimable_fractions_with_proofs")
          .select("*")
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

        throw new Error(
          `Could not find unclaimed allowlist record for tokenId ${token_id}, leaf ${leaf} and userAddress ${creator_address}, ${record.error?.message}`,
        );
      }

      records.push({ ...record.data, claimed: true });

      // Update that record to claimed
    } catch (e) {
      console.error(
        "[UpdateAllowlistRecordClaimed] Error while updating allow list record as claimed",
        e,
      );
    }
  }

  console.debug(
    `[UpdateAllowlistRecordClaimed] Updating ${records.length} records to claimed`,
  );

  const recordsToUpdate = records.map(
    ({
      id,
      claimed,
      entry,
      hypercert_allow_lists_id,
      leaf,
      user_address,
      proof,
      units,
    }) => ({
      id,
      claimed,
      entry,
      hypercert_allow_lists_id,
      leaf,
      proof,
      user_address,
      units,
    }),
  );

  await supabase
    .from("hypercert_allow_list_records")
    .upsert(recordsToUpdate, { onConflict: "id", ignoreDuplicates: false })
    .throwOnError();
};

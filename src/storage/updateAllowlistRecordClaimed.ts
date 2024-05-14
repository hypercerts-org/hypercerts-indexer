import { supabase } from "@/clients/supabaseClient";

export const updateAllowlistRecordClaimed = async ({
  leaf,
  userAddress,
}: {
  leaf: string;
  userAddress: `0x${string}`;
}) => {
  try {
    await supabase
      .from("allow_list_records")
      .update({ claimed: true })
      .match({ leaf, user_address: userAddress });
  } catch (e) {
    console.error(
      "[UpdateAllowlistRecordClaimed] Error while updating allow list record as claimed",
      e,
    );
  }
};

import { supabase } from "@/clients/supabaseClient.js";
import { Database } from "@/types/database.types.js";
import _ from "lodash";

interface StoreAllowListData {
  allowListData: Database["public"]["Tables"]["allow_list_data"]["Update"][];
}

export const storeAllowListData = async ({
  allowListData,
}: StoreAllowListData) => {
  const uniqueAllowListData = _.uniqBy(allowListData, "uri");

  if (uniqueAllowListData.length === 0) {
    console.debug("[StoreAllowListData] No allow list data to store");
    return;
  }

  console.debug(
    `[StoreAllowListData] Storing allow list data: ${uniqueAllowListData.length} entries`,
  );

  await supabase
    .from("allow_list_data")
    .upsert(uniqueAllowListData, { onConflict: "uri", ignoreDuplicates: false })
    .throwOnError();
};

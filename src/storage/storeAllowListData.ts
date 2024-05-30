import { supabase } from "@/clients/supabaseClient";
import { Tables } from "@/types/database.types";
import _ from "lodash";

interface StoreAllowListData {
  allowListData: Partial<Tables<"allow_list_data">>[];
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

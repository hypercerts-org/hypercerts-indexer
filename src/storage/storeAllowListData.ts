import { supabase } from "@/clients/supabaseClient";
import { Tables } from "@/types/database.types";

interface StoreAllowListData {
  allowListData: Partial<Tables<"allow_list_data">>[];
}

export const storeAllowListData = async ({
  allowListData,
}: StoreAllowListData) => {
  const { data, error } = await supabase
    .from("allow_list_data")
    .upsert(allowListData);

  if (error) {
    console.error(
      `[StoreAllowListData] Error while storing allow list datasets`,
      error,
    );
    console.debug(allowListData);
    return;
  }

  return data;
};

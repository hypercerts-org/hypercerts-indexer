import { supabase } from "@/clients/supabaseClient";
import { Database } from "@/types/database.types";

interface StoreHypercertAllowList {
  allowListPointer: Database["public"]["Functions"]["store_allow_list_data_and_hypercert_allow_list"]["Args"];
}

export const storeHypercertAllowList = async ({
  allowListPointer,
}: StoreHypercertAllowList) => {
  const { data, error } = await supabase.rpc(
    "store_allow_list_data_and_hypercert_allow_list",
    allowListPointer,
  );

  if (error) {
    console.error(
      `[StoreHypercertAllowList] Error while storing hypercert allow list with root ${allowListPointer.p_root}.`,
      error,
    );
    return;
  }

  return data;
};

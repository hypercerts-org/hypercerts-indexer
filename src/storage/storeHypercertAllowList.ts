import { supabase } from "@/clients/supabaseClient";
import { Database } from "@/types/database.types";

interface StoreHypercertAllowList {
  batchToStore: Database["public"]["CompositeTypes"]["allow_list_data_type"][];
}

export const storeHypercertAllowList = async ({
  batchToStore,
}: StoreHypercertAllowList) => {
  const { data, error } = await supabase.rpc(
    "store_allow_list_data_and_hypercert_allow_list_batch",
    { p_allow_list_data: batchToStore },
  );

  if (error) {
    console.error(
      `[StoreHypercertAllowList] Error while storing hypercert and allow list.`,
      error,
    );
    console.debug(batchToStore);
    return;
  }

  return data;
};

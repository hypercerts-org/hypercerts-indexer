import { supabase } from "@/clients/supabaseClient";
import { Database } from "@/types/database.types";

interface StoreHypercertAllowList {
  batchToStore: Database["public"]["CompositeTypes"]["allow_list_data_type"][];
}

export const storeHypercertAllowList = async ({
  batchToStore,
}: StoreHypercertAllowList) => {
  if (batchToStore.length === 0) {
    console.debug(
      "[StoreHypercertAllowList] No hypercert and allow list data to store",
    );
    return;
  }

  await supabase
    .rpc("store_hypercert_allow_list_roots", {
      p_hc_allow_list_roots: batchToStore,
    })
    .throwOnError();
};

import { supabase } from "@/clients/supabaseClient";
import { Database } from "@/types/database.types";

export const storeHypercertAllowList = async ({
  p_hc_allow_list_roots,
}: Database["public"]["Functions"]["store_hypercert_allow_list_roots"]["Args"]) => {
  if (p_hc_allow_list_roots.length === 0) {
    console.debug(
      "[StoreHypercertAllowList] No hypercert and allow list data to store",
    );
    return;
  }

  await supabase
    .rpc("store_hypercert_allow_list_roots", {
      p_hc_allow_list_roots,
    })
    .throwOnError();
};

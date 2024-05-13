import { supabase } from "@/clients/supabaseClient";
import { Tables } from "@/types/database.types";

interface StoreAllowListRecords {
  claim_id?: string;
  allow_list_data_id?: string;
  records?: Partial<Tables<"hypercert_allow_list_records">>[];
}

export const storeAllowListRecords = async ({
  claim_id,
  allow_list_data_id,
  records,
}: StoreAllowListRecords) => {
  await supabase
    .rpc("store_allow_list_records", {
      _claims_id: claim_id,
      _allow_list_data_id: allow_list_data_id,
      _records: records,
    })
    .throwOnError();
};

import { supabase } from "@/clients/supabaseClient";
import { Tables } from "@/types/database.types";
import _ from "lodash";

interface StoreAllowListRecords {
  allowListRecords: Partial<Tables<"allow_list_records">>[];
}

export const storeAllowListRecords = async ({
  allowListRecords,
}: StoreAllowListRecords) => {
  const uniqueAllowListRecords = _.uniqWith(allowListRecords, _.isEqual);

  await supabase
    .from("allow_list_records")
    .upsert(uniqueAllowListRecords, {
      onConflict: "hc_allow_list_id, user_address, units, entry",
      // ignoreDuplicates: true,
    })
    .throwOnError();
};

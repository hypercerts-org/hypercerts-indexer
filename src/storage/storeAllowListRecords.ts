import { supabase } from "@/clients/supabaseClient.js";
import { Tables } from "@/types/database.types.js";
import { getAddress } from "viem";

interface StoreAllowListRecords {
  claim_id?: string;
  allow_list_data_id?: string;
  records: Tables<"hypercert_allow_list_records">[];
}

export const storeAllowListRecords = async ({
  claim_id,
  allow_list_data_id,
  records,
}: StoreAllowListRecords) => {
  const { data } = await supabase
    .from("hypercert_allow_lists")
    .insert({ claims_id: claim_id, allow_list_data_id, parsed: false })
    .select("id")
    .single()
    .throwOnError();

  if (!data?.id) {
    console.error(
      "[StoreAllowListRecords] Could not get hypercert_allow_lists_id.",
    );
    return;
  }

  const recordsToInsert = records.map((record) => ({
    hypercert_allow_lists_id: data.id,
    user_address: getAddress(record.user_address),
    units: record.units,
    entry: record.entry,
    leaf: record.leaf,
    proof: record.proof,
  }));

  await supabase
    .from("hypercert_allow_list_records")
    .insert(recordsToInsert)
    .throwOnError()
    .then(async () => {
      await supabase
        .from("hypercert_allow_lists")
        .update({ parsed: true })
        .eq("id", data.id)
        .throwOnError();
    });
};

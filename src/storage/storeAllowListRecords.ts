import { supabase } from "@/clients/supabaseClient";
import { Tables } from "@/types/database.types";

interface StoreAllowListRecords {
  allowListRecords: Omit<Tables<"allow_list_records">, "id">[];
}

export const storeAllowListRecords = async ({
  allowListRecords,
}: StoreAllowListRecords) => {
  const { data, error } = await supabase
    .from("allow_list_records")
    .insert(allowListRecords)
    .select();

  if (error) {
    console.error(
      `[StoreAllowListRecords] Error while storing allow list records`,
      error,
    );
    return;
  }

  return data;
};
import { supabase } from "@/clients/supabaseClient";
import { Database } from "@/types/database.types";

export const getUnparsedAllowListRecords = async () => {
  const { data, error } = await supabase
    .rpc("get_unparsed_hypercert_allow_lists")
    .select()
    .returns<
      Database["public"]["Functions"]["get_unparsed_hypercert_allow_lists"]["Returns"]
    >();

  if (error) {
    console.error(
      "[GetUnparsedAllowListRecords] Failed to fetch unparsed allow list records",
      error,
    );
    return null;
  }

  console.debug(
    `[GetUnparsedAllowListRecords] Fetched ${data?.length} unparsed allow list records`,
  );

  return data;
};

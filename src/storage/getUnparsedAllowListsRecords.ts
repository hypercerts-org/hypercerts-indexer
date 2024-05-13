import { supabase } from "@/clients/supabaseClient";

export type UnparsedAllowListRecord = {
  claim_id: string;
  al_data_id: string;
  data: string;
};

export const getUnparsedAllowListRecords = async () => {
  const { data, error } = await supabase
    .rpc("get_unparsed_hypercert_allow_lists")
    .select()
    .returns<UnparsedAllowListRecord[]>();

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

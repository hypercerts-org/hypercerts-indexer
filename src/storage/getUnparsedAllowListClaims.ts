import { supabase } from "@/clients/supabaseClient";

export const getUnparsedAllowLists = async () => {
  const { data } = await supabase
    .from("allow_list_data")
    .select()
    .not("uri", "is", null)
    .not("parsed", "is", true)
    .throwOnError();

  console.debug(
    `[GetUnparsedAllowLists] Fetched ${data?.length} unparsed allow lists`,
  );

  return data;
};

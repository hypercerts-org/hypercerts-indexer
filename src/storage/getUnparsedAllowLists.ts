import { supabase } from "@/clients/supabaseClient.js";

export const getUnparsedAllowLists = async () => {
  const { data } = await supabase
    .from("allow_list_data")
    .select()
    .is("parsed", null);

  console.debug(
    `[GetUnparsedAllowLists] Fetched ${data?.length} unparsed allow lists`,
  );

  return data;
};

import { supabase } from "@/clients/supabaseClient";

export const getUnparsedAllowLists = async () => {
  const { data, error } = await supabase
    .from("allow_list_data")
    .select()
    .eq("parsed", false);

  if (!data) {
    console.error(
      `[GetUnparsedAllowLists] Error while fetching unparsed allow lists`,
      error,
    );
    return;
  }

  console.debug(
    `[GetUnparsedAllowLists] Fetched ${data.length} unparsed allow lists`,
  );

  return data;
};

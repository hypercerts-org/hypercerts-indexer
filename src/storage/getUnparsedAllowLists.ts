import { supabase } from "@/clients/supabaseClient.js";

export const getUnparsedAllowLists = async () => {
  const { data } = await supabase
    .from("allow_list_data")
    .select()
    .not("parsed", "is", true)
    .throwOnError();

  return data;
};

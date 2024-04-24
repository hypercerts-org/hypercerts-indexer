import { supabase } from "@/clients/supabaseClient";
import { Tables } from "@/types/database.types";

export interface AllowList extends Pick<Tables<"hypercert_allow_lists">, "id"> {
  allow_list_data: Tables<"allow_list_data">[] | null;
}

export const getUnparsedAllowLists = async () => {
  const { data, error } = await supabase
    .from("hypercert_allow_lists")
    .select("id, allow_list_data(id, data, root, parsed, uri)")
    .eq("allow_list_data.parsed", false);

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

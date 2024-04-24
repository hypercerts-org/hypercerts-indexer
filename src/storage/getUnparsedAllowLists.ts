import { supabase } from "@/clients/supabaseClient";
import { Database, Tables } from "@/types/database.types";

export type AllowList = Pick<Tables<"hypercert_allow_lists">, "id"> & {
  allow_list_data?: Database["public"]["Tables"]["allow_list_data"]["Row"];
};

export const getUnparsedAllowLists = async () => {
  const { data } = await supabase
    .from("hypercert_allow_lists")
    .select("id, allow_list_data(id, data, root, uri)")
    .not("allow_list_data.data", "is", null)
    .not("parsed", "is", true)
    .returns<AllowList[]>()
    .throwOnError();

  console.debug(
    `[GetUnparsedAllowLists] Fetched ${data?.length} unparsed allow lists`,
  );

  return data;
};

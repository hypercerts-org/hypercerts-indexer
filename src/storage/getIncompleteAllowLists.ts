import { supabase } from "@/clients/supabaseClient";
import { Tables } from "@/types/database.types";

export const getIncompleteAllowLists = async () => {
  const { data, error } = await supabase
    .from("allow_list_data")
    .select()
    .not("root", "eq", null)
    .returns<Tables<"allow_list_data">[]>();

  if (error) {
    console.error(
      `[getIncompleteAllowLists] Error while fetching missing allow list URIs: ${error.message}`,
    );
    return;
  }

  if (!data) {
    console.debug("[getIncompleteAllowLists] No data returned from database");
    return;
  }

  console.debug(
    `[getIncompleteAllowLists] Found ${data.length} missing allow list URIs`,
  );

  return data;
};

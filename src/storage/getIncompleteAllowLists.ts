import { supabase } from "@/clients/supabaseClient";

export const getMissingAllowListUris = async () => {
  const { data, error } = await supabase
    .from("allow_list_data")
    .select("uri")
    .eq("root", null);

  if (error) {
    console.error(
      `[GetMissingAllowListUris] Error while fetching missing allow list URIs: ${error.message}`,
    );
    return;
  }

  if (!data) {
    console.debug("[GetMissingAllowListUris] No data returned from database");
    return;
  }

  console.debug(
    `[GetMissingAllowListUris] Found ${data.length} missing allow list URIs`,
  );

  return data;
};

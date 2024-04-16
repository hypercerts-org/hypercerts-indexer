import { supabase } from "@/clients/supabaseClient";

export const getMissingAllowListUris = async () => {
  const { data, error } = await supabase
    .rpc("find_missing_allow_list_uris_and_roots")
    .select();

  if (error) {
    console.error(
      `[GetMissingAllowListUris] Error while fetching missing allow list URIs: ${error.message}`,
    );
    return;
  }

  if (!data) {
    console.error("[GetMissingAllowListUris] No data returned from database");
    return;
  }

  console.debug(
    `[GetMissingAllowListUris] Found ${data.length} missing allow list URIs`,
  );
  return data;
};

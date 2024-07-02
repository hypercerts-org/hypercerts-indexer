import { supabase } from "@/clients/supabaseClient.js";

export const getMissingMetadataUris = async () => {
  const { data, error } = await supabase
    .rpc("get_missing_metadata_uris")
    .select();

  if (error) {
    console.error(
      `[getMissingMetadataUris] Error while fetching missing metadata URIs: ${error.message}`,
    );
  }

  if (!data) {
    console.debug("[getMissingMetadataUris] No data returned from database");
    return;
  }

  return data
    .filter(
      ({ missing_uri }) => missing_uri !== null && missing_uri !== undefined,
    )
    .map(({ missing_uri }) => missing_uri);
};

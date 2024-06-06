import { supabase } from "@/clients/supabaseClient.js";

export const getUnparsedAllowListClaims = async () => {
  const { data: claims, error } = await supabase.rpc(
    "get_claim_ids_with_allow_list_data",
  );

  if (error) {
    console.error("Error: ", error);
    return;
  }

  console.log(
    "[GetUnparsedAllowListClaims] Claims not in allow lists: ",
    claims,
  );
  return claims;
};

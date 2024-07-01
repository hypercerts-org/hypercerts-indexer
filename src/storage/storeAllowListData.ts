import { supabase } from "@/clients/supabaseClient.js";
import { StorageMethod } from "@/indexer/processLogs.js";
import { z } from "zod";

const AllowListData = z.object({
  uri: z.string(),
  root: z.string(),
  data: z.any(),
});

export type AllowListData = z.infer<typeof AllowListData>;

export const storeAllowListData: StorageMethod<AllowListData> = async ({
  data,
}) => {
  await supabase
    .from("allow_list_data")
    .upsert(data, { onConflict: "uri", ignoreDuplicates: false })
    .throwOnError();
};

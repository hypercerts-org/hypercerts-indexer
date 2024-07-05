import { supabase } from "@/clients/supabaseClient.js";
import { StorageMethod } from "@/indexer/LogParser.js";
import { z } from "zod";
import _ from "lodash";

const AllowListData = z.object({
  uri: z.string(),
  root: z.string(),
  data: z.any(),
});

export type AllowListData = z.infer<typeof AllowListData>;

export const storeAllowListData: StorageMethod<AllowListData> = async ({
  data,
}) => {
  try {
    const dataToStore = _.unionBy(data, "uri");
    await supabase
      .from("allow_list_data")
      .upsert(dataToStore, { onConflict: "uri", ignoreDuplicates: false })
      .throwOnError();
  } catch (e: unknown) {
    console.error(
      "[storeAllowListData] Error while storing allow list data.",
      e,
    );
    throw e;
  }
};

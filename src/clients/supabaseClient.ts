import { createClient } from "@supabase/supabase-js";
import {
  supabaseApiKey,
  supabaseDataServiceApiKey,
  supabaseDataUrl,
  supabaseUrl,
} from "@/utils/constants.js";
import { Database } from "@/types/database.types.js";
import { Database as SupabaseData } from "@/types/supabase-data-generated.types.js";

export const supabase = createClient<Database>(supabaseUrl, supabaseApiKey);

export const supabaseData = createClient<SupabaseData>(
  supabaseDataUrl,
  supabaseDataServiceApiKey,
);

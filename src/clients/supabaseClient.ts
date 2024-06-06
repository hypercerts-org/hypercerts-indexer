import { createClient } from "@supabase/supabase-js";
import { supabaseApiKey, supabaseUrl } from "@/utils/constants.js";
import { Database } from "@/types/database.types.js";

export const supabase = createClient<Database>(supabaseUrl, supabaseApiKey);

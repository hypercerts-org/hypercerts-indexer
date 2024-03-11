import { createClient } from "@supabase/supabase-js";
import { supabaseApiKey, supabaseUrl } from "@/utils/constants";
import { Database } from "@/types/database.types";

export const supabase = createClient<Database>(supabaseUrl, supabaseApiKey);

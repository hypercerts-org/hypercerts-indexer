import { createClient } from "@supabase/supabase-js";
import { supabaseApiKey, supabaseUrl } from "@/utils/constants";

export const supabase = createClient(supabaseUrl, supabaseApiKey);

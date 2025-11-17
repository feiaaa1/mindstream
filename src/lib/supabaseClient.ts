import { projectId, publicAnonKey } from "@/app/utils/supabase/info";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SB_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SB_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase env variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClient } from "@supabase/supabase-js";

// These should be in your environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key must be provided!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 
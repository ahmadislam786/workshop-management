import { createClient } from "@supabase/supabase-js";
import config from "./config";

const supabaseUrl = config.supabaseUrl;
const supabaseAnonKey = config.anonKey;

// Validate configuration
if (!supabaseUrl || supabaseUrl === "https://your-project-id.supabase.co") {
  throw new Error(
    "Supabase URL not configured. Please update config.ts with your Supabase project URL."
  );
}

if (!supabaseAnonKey || supabaseAnonKey === "your-anon-key-here") {
  throw new Error(
    "Supabase anonymous key not configured. Please update config.ts with your Supabase anonymous key."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
  global: {
    headers: {
      "x-client-info": "workshop-management",
    },
  },
});

// Authentication helpers
export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

export const getCurrentSession = async () => {
  return await supabase.auth.getSession();
};

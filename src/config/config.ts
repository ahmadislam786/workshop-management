// =====================================================
// SUPABASE CONFIGURATION
// =====================================================

interface Config {
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey?: string;
  isProduction: boolean;
}

const config: Config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  isProduction: import.meta.env.MODE === "production",
};

// Validate required configuration
if (!config.supabaseUrl || !config.anonKey) {
  if (import.meta.env.MODE === "production") {
    throw new Error(
      "Missing required Supabase configuration. Please check your environment variables."
    );
  }
}

export default config;

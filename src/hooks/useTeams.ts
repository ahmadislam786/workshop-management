import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Team } from "@/types";
import { toast } from "react-toastify";

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test if teams table exists
      const { error: tableError } = await supabase.from("teams").select("id").limit(1);
      if (tableError) {
        setError(`Teams table not found: ${tableError.message}`);
        return;
      }

      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      setTeams((data as unknown as Team[]) || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      toast.error("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();

    const handleRefresh = () => fetchTeams();
    window.addEventListener("refresh-dashboard-data", handleRefresh);
    return () => window.removeEventListener("refresh-dashboard-data", handleRefresh);
  }, []);

  return { teams, loading, error, refetch: fetchTeams };
};

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Technician } from "../types";

export const useTechnicians = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test if we can access the technicians table
      const { error: tableError } = await supabase
        .from("technicians")
        .select("id")
        .limit(1);

      if (tableError) {
        setError(`Table access failed: ${tableError.message}`);
        return;
      }

      const { data, error: supabaseError } = await supabase
        .from("technicians")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) {
        setError(supabaseError.message);
        return;
      }

      setTechnicians(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();

    // Listen for manual refresh events
    const handleRefresh = () => {
      fetchTechnicians();
    };

    window.addEventListener("refresh-dashboard-data", handleRefresh);

    return () => {
      window.removeEventListener("refresh-dashboard-data", handleRefresh);
    };
  }, []);

  return {
    technicians,
    loading,
    error,
    refetch: fetchTechnicians,
  };
};

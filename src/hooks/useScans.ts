import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ScanRecord } from "@/types";
import { toast } from "react-toastify";

export const useScans = () => {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScans = async () => {
    try {
      setLoading(true);
      setError(null);

      // Optional: verify table exists
      const { error: tableError } = await supabase
        .from("scans")
        .select("id")
        .limit(1);
      if (tableError) {
        setError(`Table access failed: ${tableError.message}`);
        return;
      }

      const { data, error } = await supabase
        .from("scans")
        .select(
          `
          *,
          vehicle:vehicles(*),
          customer:customers(*),
          technician:technicians(*)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setScans((data as unknown as ScanRecord[]) || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      toast.error("Failed to fetch scans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();

    const handleRefresh = () => fetchScans();
    window.addEventListener("refresh-dashboard-data", handleRefresh);
    return () =>
      window.removeEventListener("refresh-dashboard-data", handleRefresh);
  }, []);

  return { scans, loading, error, refetch: fetchScans };
};

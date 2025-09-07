import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { DamageReport } from "@/types";
import { toast } from "react-toastify";

export const useDamageReports = () => {
  const [damageReports, setDamageReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDamageReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test if damage_reports table exists
      const { error: tableError } = await supabase
        .from("damage_reports")
        .select("id")
        .limit(1);
      if (tableError) {
        setError(`Damage reports table not found: ${tableError.message}`);
        return;
      }

      const { data, error } = await supabase
        .from("damage_reports")
        .select(
          `
          *,
          job:jobs(
            *,
            customer:customers(*),
            vehicle:vehicles(*),
            technician:technicians(*)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDamageReports((data as unknown as DamageReport[]) || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      toast.error("Failed to fetch damage reports");
    } finally {
      setLoading(false);
    }
  };

  const createDamageReport = async (reportData: Partial<DamageReport>) => {
    try {
      const { data, error } = await supabase
        .from("damage_reports")
        .insert([reportData])
        .select()
        .single();

      if (error) throw error;

      toast.success("Damage report created successfully");
      await fetchDamageReports();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to create damage report: ${message}`);
      throw err;
    }
  };

  useEffect(() => {
    fetchDamageReports();

    const handleRefresh = () => fetchDamageReports();
    window.addEventListener("refresh-dashboard-data", handleRefresh);
    return () =>
      window.removeEventListener("refresh-dashboard-data", handleRefresh);
  }, []);

  return {
    damageReports,
    loading,
    error,
    refetch: fetchDamageReports,
    createDamageReport,
  };
};

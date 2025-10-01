import { useEffect, useState } from "react";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/contexts/auth-context";

export interface SkillGroupStats {
  group_name: string;
  pending: number;
  active: number;
  done: number;
  technician_ids: string[];
  technician_names: string[];
}

export function useSkillGroups() {
  const [data, setData] = useState<SkillGroupStats[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { profile, loading: authLoading } = useAuth();

  useEffect(() => {
    let isMounted = true;
    if (authLoading) return;
    if (!profile) {
      // Not signed in; surface empty state without error
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_skill_groups_with_stats"
      );
      if (!isMounted) return;
      if (rpcError) {
        // Gracefully handle missing RPC (404) by returning empty data without throwing
        const message = rpcError.message || "Unknown error";
        if (message.includes("404") || message.toLowerCase().includes("not found")) {
          setData([]);
          setError(null);
        } else {
          setError(message);
          setData(null);
        }
      } else {
        setData((rpcData as unknown as SkillGroupStats[]) ?? []);
        setError(null);
      }
      setLoading(false);
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [profile, authLoading]);

  return { data, loading, error };
}

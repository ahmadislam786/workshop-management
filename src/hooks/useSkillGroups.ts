import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.rpc('get_skill_groups_with_stats');
      if (!isMounted) return;
      if (error) {
        setError(error.message);
        setData(null);
      } else {
        setData((data as unknown as SkillGroupStats[]) ?? []);
      }
      setLoading(false);
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}



import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Customer } from "../types";

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test if we can access the customers table
      const { error: tableError } = await supabase
        .from("customers")
        .select("id")
        .limit(1);

      if (tableError) {
        setError(`Table access failed: ${tableError.message}`);
        return;
      }

      const { data, error: supabaseError } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) {
        setError(supabaseError.message);
        return;
      }

      setCustomers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();

    // Listen for manual refresh events
    const handleRefresh = () => {
      fetchCustomers();
    };

    window.addEventListener("refresh-dashboard-data", handleRefresh);

    return () => {
      window.removeEventListener("refresh-dashboard-data", handleRefresh);
    };
  }, []);

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
  };
};

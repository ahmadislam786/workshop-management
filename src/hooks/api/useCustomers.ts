import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/config/supabase";
import type { Customer } from "@/types";
import { toast } from "react-toastify";

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeConnected] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setCustomers(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Failed to fetch customers:", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomer = useCallback(
    async (customerData: Partial<Customer>) => {
      try {
        const { data, error } = await supabase
          .from("customers")
          .insert([customerData])
          .select()
          .single();

        if (error) throw error;

        setCustomers(prev => [data, ...prev]);
        toast.success("Customer created successfully");
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create customer";
        toast.error(errorMessage);
        throw err;
      }
    },
    []
  );

  const updateCustomer = useCallback(
    async (id: string, updates: Partial<Customer>) => {
      try {
        const { data, error } = await supabase
          .from("customers")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        setCustomers(prev =>
          prev.map(customer => (customer.id === id ? data : customer))
        );
        toast.success("Customer updated successfully");
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update customer";
        toast.error(errorMessage);
        throw err;
      }
    },
    []
  );

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);

      if (error) throw error;

      setCustomers(prev => prev.filter(customer => customer.id !== id));
      toast.success("Customer deleted successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete customer";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

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
  }, [fetchCustomers]);

  // Real-time subscriptions are now handled centrally by RealtimeProvider
  // This prevents duplicate subscriptions and ensures consistent state management

  return {
    customers,
    loading,
    error,
    realtimeConnected,
    refetch: fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};

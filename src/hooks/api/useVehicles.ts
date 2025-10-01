import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/config/supabase";
import type { Vehicle } from "@/types";
import { toast } from "react-toastify";

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeConnected] = useState(false);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setVehicles(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Failed to fetch vehicles:", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createVehicle = useCallback(async (vehicleData: Partial<Vehicle>) => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .insert([vehicleData])
        .select()
        .single();

      if (error) throw error;

      setVehicles(prev => [data, ...prev]);
      toast.success("Vehicle created successfully");
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create vehicle";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateVehicle = useCallback(
    async (id: string, updates: Partial<Vehicle>) => {
      try {
        const { data, error } = await supabase
          .from("vehicles")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        setVehicles(prev =>
          prev.map(vehicle => (vehicle.id === id ? data : vehicle))
        );
        toast.success("Vehicle updated successfully");
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update vehicle";
        toast.error(errorMessage);
        throw err;
      }
    },
    []
  );

  const deleteVehicle = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);

      if (error) throw error;

      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
      toast.success("Vehicle deleted successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete vehicle";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchVehicles();

    // Listen for manual refresh events
    const handleRefresh = () => {
      fetchVehicles();
    };

    window.addEventListener("refresh-dashboard-data", handleRefresh);

    return () => {
      window.removeEventListener("refresh-dashboard-data", handleRefresh);
    };
  }, [fetchVehicles]);

  // Real-time subscriptions are now handled centrally by RealtimeProvider
  // This prevents duplicate subscriptions and ensures consistent state management

  return {
    vehicles,
    loading,
    error,
    realtimeConnected,
    refetch: fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  };
};

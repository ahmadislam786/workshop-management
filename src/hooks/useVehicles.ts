import { useState, useEffect } from "react";
import type { Vehicle } from "../types";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("vehicles")
        .select(
          `
          *,
          customer:customers(*)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  const createVehicle = async (vehicleData: Partial<Vehicle>) => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .insert([vehicleData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success("Vehicle created successfully");
      fetchVehicles();
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to create vehicle: ${errorMessage}`);
      return { data: null, error: errorMessage };
    }
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      toast.success("Vehicle updated successfully");
      fetchVehicles();
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to update vehicle");
      return { data: null, error: errorMessage };
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);

      if (error) throw error;

      toast.success("Vehicle deleted successfully");
      fetchVehicles();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to delete vehicle");
      return { error: errorMessage };
    }
  };

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
  }, []);

  return {
    vehicles,
    loading,
    error,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    refetch: fetchVehicles,
  };
};

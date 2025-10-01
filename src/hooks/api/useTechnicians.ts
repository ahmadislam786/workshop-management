import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/config/supabase";
import type { Technician } from "@/types";
import { toast } from "react-toastify";

export const useTechnicians = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const fetchTechnicians = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("technicians")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setTechnicians(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Failed to fetch technicians:", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTechnician = useCallback(async (technicianData: Partial<Technician>) => {
    try {
      const { data, error } = await supabase
        .from("technicians")
        .insert([technicianData])
        .select()
        .single();

      if (error) throw error;

      setTechnicians(prev => [data, ...prev]);
      toast.success("Technician created successfully");
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create technician";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateTechnician = useCallback(async (id: string, updates: Partial<Technician>) => {
    try {
      const { data, error } = await supabase
        .from("technicians")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setTechnicians(prev =>
        prev.map(technician => (technician.id === id ? data : technician))
      );
      toast.success("Technician updated successfully");
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update technician";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteTechnician = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("technicians")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTechnicians(prev => prev.filter(technician => technician.id !== id));
      toast.success("Technician deleted successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete technician";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

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
  }, [fetchTechnicians]);

  // Real-time subscription for technicians
  useEffect(() => {
    const channel = supabase
      .channel("technicians-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "technicians" },
        (payload) => {
          const newTechnician = payload.new as Technician;
          setTechnicians(prev => [newTechnician, ...prev]);
          toast.success("New technician added");
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "technicians" },
        (payload) => {
          const updatedTechnician = payload.new as Technician;
          setTechnicians(prev =>
            prev.map(technician => 
              technician.id === updatedTechnician.id ? updatedTechnician : technician
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "technicians" },
        (payload) => {
          const oldTechnician = payload.old as { id: string };
          setTechnicians(prev => prev.filter(technician => technician.id !== oldTechnician.id));
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
        if (status === "CHANNEL_ERROR") {
          console.error("Real-time subscription error for technicians");
          toast.error("Connection lost. Attempting to reconnect...");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    technicians,
    loading,
    error,
    realtimeConnected,
    refetch: fetchTechnicians,
    createTechnician,
    updateTechnician,
    deleteTechnician,
  };
};

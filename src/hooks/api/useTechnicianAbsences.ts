import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/config/supabase";
import type { TechnicianAbsence } from "@/types";
import { toast } from "react-toastify";

export const useTechnicianAbsences = () => {
  const [absences, setAbsences] = useState<TechnicianAbsence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const fetchAbsences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("technician_absences")
        .select(
          `
          *,
          technician:technicians(*)
        `
        )
        .order("start_date", { ascending: false });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setAbsences(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Failed to fetch technician absences:", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAbsence = useCallback(
    async (absenceData: Partial<TechnicianAbsence>) => {
      try {
        const { data, error } = await supabase
          .from("technician_absences")
          .insert([absenceData])
          .select(
            `
          *,
          technician:technicians(*)
        `
          )
          .single();

        if (error) throw error;

        setAbsences(prev => [data, ...prev]);
        toast.success("Absence created successfully");
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create absence";
        toast.error(errorMessage);
        throw err;
      }
    },
    []
  );

  const updateAbsence = useCallback(
    async (id: string, updates: Partial<TechnicianAbsence>) => {
      try {
        const { data, error } = await supabase
          .from("technician_absences")
          .update(updates)
          .eq("id", id)
          .select(
            `
          *,
          technician:technicians(*)
        `
          )
          .single();

        if (error) throw error;

        setAbsences(prev =>
          prev.map(absence => (absence.id === id ? data : absence))
        );
        toast.success("Absence updated successfully");
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update absence";
        toast.error(errorMessage);
        throw err;
      }
    },
    []
  );

  const deleteAbsence = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("technician_absences")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setAbsences(prev => prev.filter(absence => absence.id !== id));
      toast.success("Absence deleted successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete absence";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const getAbsencesForDate = useCallback(async (date: string) => {
    try {
      const { data, error } = await supabase
        .from("technician_absences")
        .select(
          `
          *,
          technician:technicians(*)
        `
        )
        .lte("start_date", date)
        .gte("end_date", date)
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch absences for date";
      console.error(errorMessage);
      return [];
    }
  }, []);

  const getAbsencesForTechnician = useCallback(async (technicianId: string) => {
    try {
      const { data, error } = await supabase
        .from("technician_absences")
        .select(
          `
          *,
          technician:technicians(*)
        `
        )
        .eq("technician_id", technicianId)
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch absences for technician";
      console.error(errorMessage);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchAbsences();

    // Listen for manual refresh events
    const handleRefresh = () => {
      fetchAbsences();
    };

    window.addEventListener("refresh-dashboard-data", handleRefresh);

    return () => {
      window.removeEventListener("refresh-dashboard-data", handleRefresh);
    };
  }, [fetchAbsences]);

  // Real-time subscription for technician absences
  useEffect(() => {
    const channel = supabase
      .channel("technician-absences-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "technician_absences" },
        payload => {
          const newAbsence = payload.new as TechnicianAbsence;
          setAbsences(prev => [newAbsence, ...prev]);
          toast.success("New absence added");
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "technician_absences" },
        payload => {
          const updatedAbsence = payload.new as TechnicianAbsence;
          setAbsences(prev =>
            prev.map(absence =>
              absence.id === updatedAbsence.id ? updatedAbsence : absence
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "technician_absences" },
        payload => {
          const oldAbsence = payload.old as { id: string };
          setAbsences(prev =>
            prev.filter(absence => absence.id !== oldAbsence.id)
          );
        }
      )
      .subscribe(status => {
        setRealtimeConnected(status === "SUBSCRIBED");
        if (status === "CHANNEL_ERROR") {
          console.error("Real-time subscription error for technician absences");
          toast.error("Connection lost. Attempting to reconnect...");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    absences,
    loading,
    error,
    realtimeConnected,
    refetch: fetchAbsences,
    createAbsence,
    updateAbsence,
    deleteAbsence,
    getAbsencesForDate,
    getAbsencesForTechnician,
  };
};

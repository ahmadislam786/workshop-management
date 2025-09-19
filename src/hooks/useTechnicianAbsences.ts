import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { TechnicianAbsence } from "@/types";
import { toast } from "react-toastify";

export const useTechnicianAbsences = () => {
  const [absences, setAbsences] = useState<TechnicianAbsence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAbsences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("technician_absences")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;

      setAbsences(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch technician absences";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAbsence = useCallback(async (absenceData: Partial<TechnicianAbsence>) => {
    try {
      const { data, error } = await supabase
        .from("technician_absences")
        .insert([absenceData])
        .select()
        .single();

      if (error) throw error;

      setAbsences(prev => [...prev, data].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
      toast.success("Absence created successfully");
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create absence";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateAbsence = useCallback(async (id: string, updates: Partial<TechnicianAbsence>) => {
    try {
      const { data, error } = await supabase
        .from("technician_absences")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setAbsences(prev => 
        prev.map(absence => 
          absence.id === id ? data : absence
        ).sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      );
      toast.success("Absence updated successfully");
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update absence";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

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
      const errorMessage = err instanceof Error ? err.message : "Failed to delete absence";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const getAbsencesForDate = useCallback(async (date: string) => {
    try {
      const { data, error } = await supabase
        .from("technician_absences")
        .select("*")
        .eq("date", date)
        .order("from_time", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch absences for date";
      toast.error(errorMessage);
      return [];
    }
  }, []);

  const getAbsencesForTechnician = useCallback(async (technicianId: string, startDate?: string, endDate?: string) => {
    try {
      let query = supabase
        .from("technician_absences")
        .select("*")
        .eq("technician_id", technicianId)
        .order("date", { ascending: true });

      if (startDate) {
        query = query.gte("date", startDate);
      }
      if (endDate) {
        query = query.lte("date", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch absences for technician";
      toast.error(errorMessage);
      return [];
    }
  }, []);

  const getAbsencesForDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase
        .from("technician_absences")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch absences for date range";
      toast.error(errorMessage);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchAbsences();
  }, [fetchAbsences]);

  return {
    absences,
    loading,
    error,
    fetchAbsences,
    createAbsence,
    updateAbsence,
    deleteAbsence,
    getAbsencesForDate,
    getAbsencesForTechnician,
    getAbsencesForDateRange,
  };
};

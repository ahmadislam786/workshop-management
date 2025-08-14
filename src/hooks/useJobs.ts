import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Job } from "../types";
import { toast } from "react-toastify";

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test if we can access the jobs table
      const { error: tableError } = await supabase
        .from("jobs")
        .select("id")
        .limit(1);

      if (tableError) {
        setError(`Table access failed: ${tableError.message}`);
        return;
      }

      const { data, error: supabaseError } = await supabase
        .from("jobs")
        .select(
          `
          *,
          customer:customers(*),
          vehicle:vehicles(*),
          technician:technicians(*)
        `
        )
        .order("created_at", { ascending: false });

      if (supabaseError) {
        setError(supabaseError.message);
        return;
      }

      setJobs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: Partial<Job>) => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .insert([jobData])
        .select()
        .single();

      if (error) throw error;

      toast.success("Job created successfully");
      fetchJobs(); // Refresh list
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to create job");
      return { data: null, error: errorMessage };
    }
  };

  const createJobFromEmail = async (jobData: Partial<Job>) => {
    try {
      // Automatically set source to email for n8n automation
      const emailJobData = { ...jobData, source: "email" as const };

      const { data, error } = await supabase
        .from("jobs")
        .insert([emailJobData])
        .select()
        .single();

      if (error) throw error;

      toast.success("Job created from email automation");
      fetchJobs(); // Refresh list
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to create job from email");
      return { data: null, error: errorMessage };
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      toast.success("Job updated successfully");
      fetchJobs(); // Refresh list
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to update job");
      return { data: null, error: errorMessage };
    }
  };

  const deleteJob = async (id: string) => {
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", id);

      if (error) throw error;

      toast.success("Job deleted successfully");
      fetchJobs(); // Refresh list
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to delete job");
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchJobs();

    // Listen for manual refresh events
    const handleRefresh = () => {
      fetchJobs();
    };

    window.addEventListener("refresh-dashboard-data", handleRefresh);

    return () => {
      window.removeEventListener("refresh-dashboard-data", handleRefresh);
    };
  }, []);

  return {
    jobs,
    loading,
    error,
    createJob,
    createJobFromEmail,
    updateJob,
    deleteJob,
    refetch: fetchJobs,
  };
};

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Service } from "@/types";
import { toast } from "react-toastify";

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      setServices(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch services";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = useCallback(async (serviceData: Partial<Service>) => {
    try {
      const { data, error } = await supabase
        .from("services")
        .insert([serviceData])
        .select()
        .single();

      if (error) throw error;

      setServices(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success("Service created successfully");
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create service";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateService = useCallback(async (id: string, updates: Partial<Service>) => {
    try {
      const { data, error } = await supabase
        .from("services")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setServices(prev => 
        prev.map(service => 
          service.id === id ? data : service
        ).sort((a, b) => a.name.localeCompare(b.name))
      );
      toast.success("Service updated successfully");
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update service";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteService = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setServices(prev => prev.filter(service => service.id !== id));
      toast.success("Service deleted successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete service";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const getServiceById = useCallback((id: string) => {
    return services.find(service => service.id === id);
  }, [services]);

  const getServicesBySkill = useCallback((skill: string) => {
    return services.filter(service => 
      service.required_skills.includes(skill)
    );
  }, [services]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    getServiceById,
    getServicesBySkill,
  };
};

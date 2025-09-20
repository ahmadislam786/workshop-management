import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Part } from "@/types";
import { toast } from "react-toastify";

export const useParts = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("parts")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      setParts(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch parts";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPart = useCallback(async (partData: Partial<Part>) => {
    try {
      const { data, error } = await supabase
        .from("parts")
        .insert([partData])
        .select()
        .single();

      if (error) throw error;

      setParts(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success("Part created successfully");
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create part";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updatePart = useCallback(async (id: string, updates: Partial<Part>) => {
    try {
      const { data, error } = await supabase
        .from("parts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setParts(prev => 
        prev.map(part => 
          part.id === id ? data : part
        ).sort((a, b) => a.name.localeCompare(b.name))
      );
      toast.success("Part updated successfully");
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update part";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deletePart = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("parts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setParts(prev => prev.filter(part => part.id !== id));
      toast.success("Part deleted successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete part";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const getPartById = useCallback((id: string) => {
    return parts.find(part => part.id === id);
  }, [parts]);

  const getLowStockParts = useCallback(() => {
    // Low stock threshold removed - using fixed threshold of 5
    return parts.filter(part => part.stock_quantity <= 5);
  }, [parts]);

  const updateStockQuantity = useCallback(async (id: string, newQuantity: number) => {
    try {
      const { data, error } = await supabase
        .from("parts")
        .update({ stock_quantity: newQuantity })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setParts(prev => 
        prev.map(part => 
          part.id === id ? data : part
        )
      );
      toast.success("Stock quantity updated successfully");
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update stock quantity";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const searchParts = useCallback((query: string) => {
    const searchTerm = query.toLowerCase();
    return parts.filter(part => 
      part.name.toLowerCase().includes(searchTerm) ||
      (part.description && part.description.toLowerCase().includes(searchTerm))
    );
  }, [parts]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  return {
    parts,
    loading,
    error,
    fetchParts,
    createPart,
    updatePart,
    deletePart,
    getPartById,
    getLowStockParts,
    updateStockQuantity,
    searchParts,
  };
};

import { useState, useEffect } from "react";
import { supabase } from "@/config/supabase";

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface TechnicianSkill {
  id: string;
  technician_id: string;
  skill_id: string;
  proficiency_level: number;
  skill: Skill;
}

export interface TechnicianWithSkills {
  id: string;
  name: string;
  email: string;
  job_count: number;
  skills: Skill[];
  skill_categories: string[];
  skill_count: number;
}

export const useTechnicianSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [technicianSkills, setTechnicianSkills] = useState<
    TechnicianWithSkills[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setSkills(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch skills");
    }
  };

  const fetchTechnicianSkills = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the view we created
      const { data, error } = await supabase
        .from("technician_skills_view")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      // Transform the data to include skills as an array
      const transformedData = (data || []).map((tech: any) => ({
        id: tech.id,
        name: tech.name,
        email: tech.email,
        job_count: tech.job_count,
        skills: tech.skills_list
          ? tech.skills_list.split(", ").map((skillName: string) => ({
              id: skillName.toLowerCase().replace(/\s+/g, "_"),
              name: skillName,
              category: "general",
            }))
          : [],
        skill_categories: tech.skill_categories
          ? tech.skill_categories.split(", ")
          : [],
        skill_count: tech.skill_count || 0,
        created_at: tech.created_at,
        updated_at: tech.updated_at,
      }));

      setTechnicianSkills(transformedData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch technician skills"
      );
    } finally {
      setLoading(false);
    }
  };

  const findTechniciansBySkills = async (requiredSkills: string[]) => {
    try {
      const { data, error } = await supabase.rpc("find_technicians_by_skills", {
        required_skills: requiredSkills,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to find technicians by skills"
      );
      return [];
    }
  };

  const getJobRecommendations = async (technicianId: string) => {
    try {
      const { data, error } = await supabase.rpc(
        "get_job_recommendations_for_technician",
        { tech_id: technicianId }
      );

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get job recommendations"
      );
      return [];
    }
  };

  const assignSkillToTechnician = async (
    technicianId: string,
    skillId: string,
    proficiencyLevel: number = 4
  ) => {
    try {
      const { error } = await supabase.from("technician_skills").insert({
        technician_id: technicianId,
        skill_id: skillId,
        proficiency_level: proficiencyLevel,
      });

      if (error) throw error;
      await fetchTechnicianSkills();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to assign skill",
      };
    }
  };

  const removeSkillFromTechnician = async (
    technicianId: string,
    skillId: string
  ) => {
    try {
      const { error } = await supabase
        .from("technician_skills")
        .delete()
        .eq("technician_id", technicianId)
        .eq("skill_id", skillId);

      if (error) throw error;
      await fetchTechnicianSkills();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to remove skill",
      };
    }
  };

  const updateSkillProficiency = async (
    technicianId: string,
    skillId: string,
    proficiencyLevel: number
  ) => {
    try {
      const { error } = await supabase
        .from("technician_skills")
        .update({ proficiency_level: proficiencyLevel })
        .eq("technician_id", technicianId)
        .eq("skill_id", skillId);

      if (error) throw error;
      await fetchTechnicianSkills();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to update skill proficiency",
      };
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchTechnicianSkills();
  }, []);

  return {
    skills,
    technicianSkills,
    loading,
    error,
    refetch: fetchTechnicianSkills,
    findTechniciansBySkills,
    getJobRecommendations,
    assignSkillToTechnician,
    removeSkillFromTechnician,
    updateSkillProficiency,
  };
};

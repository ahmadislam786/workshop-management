export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profile: {
        Row: {
          id: string;
          user_id: string;
          role: "admin" | "technician";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: "admin" | "technician";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: "admin" | "technician";
          created_at?: string;
          updated_at?: string;
        };
      };
      technicians: {
        Row: {
          id: string;
          profile_id: string | null;
          name: string;
          email: string;
          specialization: string | null;
          phone: string | null;
          job_count: number;
          shift_start: string;
          shift_end: string;
          aw_capacity_per_day: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          name: string;
          email: string;
          specialization?: string | null;
          phone?: string | null;
          job_count?: number;
          shift_start?: string;
          shift_end?: string;
          aw_capacity_per_day?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          name?: string;
          email?: string;
          specialization?: string | null;
          phone?: string | null;
          job_count?: number;
          shift_start?: string;
          shift_end?: string;
          aw_capacity_per_day?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      technician_absences: {
        Row: {
          id: string;
          technician_id: string;
          date: string;
          type: "vacation" | "sick" | "training" | "other";
          from_time: string | null;
          to_time: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          technician_id: string;
          date: string;
          type: "vacation" | "sick" | "training" | "other";
          from_time?: string | null;
          to_time?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          technician_id?: string;
          date?: string;
          type?: "vacation" | "sick" | "training" | "other";
          from_time?: string | null;
          to_time?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          default_aw_estimate: number;
          required_skills: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          default_aw_estimate?: number;
          required_skills?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          default_aw_estimate?: number;
          required_skills?: string[];
          created_at?: string;
        };
      };
      parts: {
        Row: {
          id: string;
          name: string;
          part_number: string | null;
          description: string | null;
          stock_quantity: number;
          min_stock_level: number;
          unit_price: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          part_number?: string | null;
          description?: string | null;
          stock_quantity?: number;
          min_stock_level?: number;
          unit_price?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          part_number?: string | null;
          description?: string | null;
          stock_quantity?: number;
          min_stock_level?: number;
          unit_price?: number | null;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          date: string;
          customer_id: string;
          vehicle_id: string;
          service_id: string | null;
          title: string;
          notes: string | null;
          aw_estimate: number;
          priority: "low" | "normal" | "high" | "urgent";
          status: "new" | "scheduled" | "in_progress" | "paused" | "waiting_parts" | "done" | "delivered";
          required_skills: string[];
          sla_promised_at: string | null;
          flags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          customer_id: string;
          vehicle_id: string;
          service_id?: string | null;
          title: string;
          notes?: string | null;
          aw_estimate?: number;
          priority?: "low" | "normal" | "high" | "urgent";
          status?: "new" | "scheduled" | "in_progress" | "paused" | "waiting_parts" | "done" | "delivered";
          required_skills?: string[];
          sla_promised_at?: string | null;
          flags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          customer_id?: string;
          vehicle_id?: string;
          service_id?: string | null;
          title?: string;
          notes?: string | null;
          aw_estimate?: number;
          priority?: "low" | "normal" | "high" | "urgent";
          status?: "new" | "scheduled" | "in_progress" | "paused" | "waiting_parts" | "done" | "delivered";
          required_skills?: string[];
          sla_promised_at?: string | null;
          flags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      schedule_assignments: {
        Row: {
          id: string;
          appointment_id: string;
          technician_id: string;
          start_time: string;
          end_time: string;
          aw_planned: number;
          status: "scheduled" | "in_progress" | "completed" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          technician_id: string;
          start_time: string;
          end_time: string;
          aw_planned: number;
          status?: "scheduled" | "in_progress" | "completed" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          appointment_id?: string;
          technician_id?: string;
          start_time?: string;
          end_time?: string;
          aw_planned?: number;
          status?: "scheduled" | "in_progress" | "completed" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          whatsapp: string | null;
          phone: string | null;
          status: "active" | "inactive";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          whatsapp?: string | null;
          phone?: string | null;
          status?: "active" | "inactive";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          whatsapp?: string | null;
          phone?: string | null;
          status?: "active" | "inactive";
          created_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          make: string;
          model: string;
          license_plate: string;
          year: number;
          customer_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          make: string;
          model: string;
          license_plate: string;
          year: number;
          customer_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          make?: string;
          model?: string;
          license_plate?: string;
          year?: number;
          customer_id?: string;
          created_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          customer_id: string;
          vehicle_id: string;
          technician_id: string | null;
          service_type: string;
          status:
            | "pending"
            | "scheduled"
            | "in_progress"
            | "completed"
            | "cancelled";
          time_frame: string | null;
          scheduled_start: string | null;
          scheduled_end: string | null;
          parts_needed: string | null;
          duration_hours: number | null;
          ai_duration_hour: number | null;
          source: "email" | "manual";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          vehicle_id: string;
          technician_id?: string | null;
          service_type: string;
          status?:
            | "pending"
            | "scheduled"
            | "in_progress"
            | "completed"
            | "cancelled";
          time_frame?: string | null;
          scheduled_start?: string | null;
          scheduled_end?: string | null;
          parts_needed?: string | null;
          duration_hours?: number | null;
          ai_duration_hour?: number | null;
          source?: "email" | "manual";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          vehicle_id?: string;
          technician_id?: string | null;
          service_type?: string;
          status?:
            | "pending"
            | "scheduled"
            | "in_progress"
            | "completed"
            | "cancelled";
          time_frame?: string | null;
          scheduled_start?: string | null;
          scheduled_end?: string | null;
          parts_needed?: string | null;
          duration_hours?: number | null;
          ai_duration_hour?: number | null;
          source?: "email" | "manual";
          notes?: string | null;
          created_at?: string;
        };
      };
      // Removed damage_reports and scans tables per product decision
      notifications: {
        Row: {
          id: string;
          user_id: string;
          message: string;
          type: "info" | "success" | "warning" | "error";
          is_read: boolean;
          action_link: string | null;
          action_label: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          message: string;
          type?: "info" | "success" | "warning" | "error";
          is_read?: boolean;
          action_link?: string | null;
          action_label?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          message?: string;
          type?: "info" | "success" | "warning" | "error";
          is_read?: boolean;
          action_link?: string | null;
          action_label?: string | null;
          created_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          color: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      skills: {
        Row: {
          id: string;
          name: string;
          category: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      technician_skills: {
        Row: {
          id: string;
          technician_id: string;
          skill_id: string;
          proficiency_level: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          technician_id: string;
          skill_id: string;
          proficiency_level?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          technician_id?: string;
          skill_id?: string;
          proficiency_level?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      technician_skills_view: {
        Row: {
          id: string;
          name: string;
          email: string;
          job_count: number;
          created_at: string;
          updated_at: string;
          skills_list: string;
          skill_categories: string;
          skill_count: number;
        };
      };
      job_details_view: {
        Row: {
          id: string;
          service_type: string;
          status: string;
          scheduled_start: string | null;
          scheduled_end: string | null;
          duration_hours: number | null;
          ai_duration_hour: number | null;
          source: string;
          notes: string | null;
          created_at: string;
          customer_name: string;
          customer_email: string | null;
          customer_phone: string | null;
          vehicle_make: string;
          vehicle_model: string;
          license_plate: string;
          vehicle_year: number;
          technician_name: string | null;
          technician_email: string | null;
        };
      };
    };
    Functions: {
      find_technicians_by_skills: {
        Args: {
          required_skills: string[];
        };
        Returns: {
          technician_id: string;
          technician_name: string;
          email: string;
          matched_skills: string;
          skill_match_count: number;
          total_skills: number;
          match_percentage: number;
        }[];
      };
      get_job_recommendations_for_technician: {
        Args: {
          tech_id: string;
        };
        Returns: {
          job_id: string;
          service_type: string;
          customer_name: string;
          vehicle_info: string;
          required_skills: string;
          technician_skills: string;
          skill_match_count: number;
          match_percentage: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

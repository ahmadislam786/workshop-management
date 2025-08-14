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
          job_count: number;
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
          job_count?: number;
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
          job_count?: number;
          source?: "email" | "manual";
          notes?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

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
      damage_reports: {
        Row: {
          id: string;
          job_id: string;
          comment: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          comment?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          comment?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
      };
      scans: {
        Row: {
          id: string;
          vehicle_id: string;
          customer_id: string;
          technician_id: string | null;
          device: string;
          scan_type: string;
          summary: string | null;
          results: any | null;
          status: "pending" | "completed" | "failed" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          customer_id: string;
          technician_id?: string | null;
          device: string;
          scan_type?: string;
          summary?: string | null;
          results?: any | null;
          status?: "pending" | "completed" | "failed" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          customer_id?: string;
          technician_id?: string | null;
          device?: string;
          scan_type?: string;
          summary?: string | null;
          results?: any | null;
          status?: "pending" | "completed" | "failed" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
      };
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

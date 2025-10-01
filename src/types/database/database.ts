// Database Types
export interface Database {
  public: {
    Tables: {
      profile: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          role: "admin" | "technician";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          role: "admin" | "technician";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          role?: "admin" | "technician";
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email?: string;
          phone?: string;
          address?: string;
          status: "active" | "inactive";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string;
          phone?: string;
          address?: string;
          status?: "active" | "inactive";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          address?: string;
          status?: "active" | "inactive";
          created_at?: string;
          updated_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          customer_id: string;
          make: string;
          model: string;
          year?: number;
          vin?: string;
          license_plate?: string;
          color?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          make: string;
          model: string;
          year?: number;
          vin?: string;
          license_plate?: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          make?: string;
          model?: string;
          year?: number;
          vin?: string;
          license_plate?: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      technicians: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          email: string;
          phone?: string;
          shift_start: string;
          shift_end: string;
          aw_capacity_per_day: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          email: string;
          phone?: string;
          shift_start?: string;
          shift_end?: string;
          aw_capacity_per_day?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          name?: string;
          email?: string;
          phone?: string;
          shift_start?: string;
          shift_end?: string;
          aw_capacity_per_day?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          date: string;
          customer_id: string;
          vehicle_id: string;
          service_id?: string;
          technician_id?: string;
          title: string;
          description?: string;
          notes?: string;
          aw_estimate: number;
          priority: "low" | "normal" | "high" | "urgent";
          status:
            | "waiting"
            | "assigned"
            | "in_progress"
            | "paused"
            | "completed";
          required_skills: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          customer_id: string;
          vehicle_id: string;
          service_id?: string;
          technician_id?: string;
          title: string;
          description?: string;
          notes?: string;
          aw_estimate: number;
          priority?: "low" | "normal" | "high" | "urgent";
          status?:
            | "waiting"
            | "assigned"
            | "in_progress"
            | "paused"
            | "completed";
          required_skills?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          customer_id?: string;
          vehicle_id?: string;
          service_id?: string;
          technician_id?: string;
          title?: string;
          description?: string;
          notes?: string;
          aw_estimate?: number;
          priority?: "low" | "normal" | "high" | "urgent";
          status?:
            | "waiting"
            | "assigned"
            | "in_progress"
            | "paused"
            | "completed";
          required_skills?: string[];
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
      technician_absences: {
        Row: {
          id: string;
          technician_id: string;
          start_date: string;
          end_date: string;
          reason: string;
          status: "pending" | "approved" | "rejected";
          type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          technician_id: string;
          start_date: string;
          end_date: string;
          reason: string;
          status?: "pending" | "approved" | "rejected";
          type: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          technician_id?: string;
          start_date?: string;
          end_date?: string;
          reason?: string;
          status?: "pending" | "approved" | "rejected";
          type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          description?: string;
          aw_estimate: number;
          price?: number;
          required_skills: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          aw_estimate: number;
          price?: number;
          required_skills?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          aw_estimate?: number;
          price?: number;
          required_skills?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      parts: {
        Row: {
          id: string;
          name: string;
          description?: string;
          part_number?: string;
          price?: number;
          stock_quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          part_number?: string;
          price?: number;
          stock_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          part_number?: string;
          price?: number;
          stock_quantity?: number;
          created_at?: string;
          updated_at?: string;
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

// API Types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  role: "admin" | "technician";
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string; 
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
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
}

export interface Technician {
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
}

export type AppointmentStatus =
  | "waiting"
  | "assigned"
  | "in_progress"
  | "paused"
  | "completed";

export interface Appointment {
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
  status: AppointmentStatus;
  required_skills: string[];
  created_at: string;
  updated_at: string;
  customer?: Customer;
  vehicle?: Vehicle;
  technician?: Technician;
}

export interface ScheduleAssignment {
  id: string;
  appointment_id: string;
  technician_id: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  aw_planned: number;
  appointment?: Appointment;
  created_at: string;
  updated_at: string;
}

export interface TechnicianAbsence {
  id: string;
  technician_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  type: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  aw_estimate: number;
  price?: number;
  required_skills: string[];
  created_at: string;
  updated_at: string;
}

export interface Part {
  id: string;
  name: string;
  description?: string;
  part_number?: string;
  price?: number;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

// Additional types for user management
export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: "admin" | "technician";
  phone?: string;
}

export interface UserCreationResult {
  success: boolean;
  user?: User;
  userId?: string;
  profileId?: string;
  requiresEmailConfirmation?: boolean;
  error?: string;
}

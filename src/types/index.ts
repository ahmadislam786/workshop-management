// =====================================================
// TYPE DEFINITIONS
// =====================================================

/**
 * User authentication interface
 */
export interface User {
  id: string;
  email: string;
}

/**
 * User profile interface
 */
export interface Profile {
  id: string;
  user_id: string;
  role: "admin" | "technician";
  created_at: string;
  updated_at: string;
}

/**
 * Customer interface
 */
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  status: "active" | "inactive";
  created_at: string;
}

/**
 * Vehicle interface
 */
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  license_plate: string;
  year: number;
  customer_id: string;
  created_at: string;
}

/**
 * Technician interface
 */
export interface Technician {
  id: string;
  profile_id: string;
  name: string;
  email: string;
  specialization?: string;
  phone?: string;
  job_count: number;
  shift_start: string;
  shift_end: string;
  aw_capacity_per_day: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Job status types (legacy - for backward compatibility)
 */
export type JobStatus =
  | "pending"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

/**
 * Appointment status types (new system)
 */
export type AppointmentStatus =
  | "new"
  | "scheduled"
  | "in_progress"
  | "paused"
  | "waiting_parts"
  | "done"
  | "delivered";

/**
 * Priority types
 */
export type Priority = "low" | "normal" | "high" | "urgent";

/**
 * Absence types
 */
export type AbsenceType = "vacation" | "sick" | "training" | "other";

/**
 * Job source types
 */
export type JobSource = "email" | "manual";

/**
 * Service interface
 */
export interface Service {
  id: string;
  name: string;
  description?: string;
  default_aw_estimate: number;
  required_skills: string[];
  created_at: string;
}

/**
 * Part interface
 */
export interface Part {
  id: string;
  name: string;
  part_number?: string;
  description?: string;
  stock_quantity: number;
  min_stock_level: number;
  unit_price?: number;
  created_at: string;
}

/**
 * Technician absence interface
 */
export interface TechnicianAbsence {
  id: string;
  technician_id: string;
  date: string;
  type: AbsenceType;
  from_time?: string;
  to_time?: string;
  description?: string;
  created_at: string;
}

/**
 * Appointment interface (new system)
 */
export interface Appointment {
  id: string;
  date: string;
  customer_id: string;
  vehicle_id: string;
  service_id?: string;
  title: string;
  notes?: string;
  aw_estimate: number;
  priority: Priority;
  status: AppointmentStatus;
  required_skills: string[];
  sla_promised_at?: string;
  flags: string[];
  created_at: string;
  updated_at: string;
  // Related data (populated by joins)
  customer?: Customer;
  vehicle?: Vehicle;
  service?: Service;
}

/**
 * Schedule assignment interface
 */
export interface ScheduleAssignment {
  id: string;
  appointment_id: string;
  technician_id: string;
  start_time: string;
  end_time: string;
  aw_planned: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  // Related data (populated by joins)
  appointment?: Appointment;
  technician?: Technician;
}

/**
 * Job interface (legacy - for backward compatibility)
 */
export interface Job {
  id: string;
  customer_id: string;
  vehicle_id: string;
  technician_id?: string;
  service_type: string;
  status: JobStatus;
  time_frame?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  parts_needed?: string;
  duration_hours?: number;
  ai_duration_hour?: number;
  source: JobSource;
  notes?: string;
  created_at: string;
  // Related data (populated by joins)
  customer?: Customer;
  vehicle?: Vehicle;
  technician?: Technician;
}

/**
 * Form data interfaces for better type safety
 */
export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: "admin" | "technician";
  specialization?: string;
  phone?: string;
}

export interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
}

export interface CreateVehicleData {
  make: string;
  model: string;
  license_plate: string;
  year: number;
  customer_id: string;
}

export interface CreateJobData {
  customer_id: string;
  vehicle_id: string;
  technician_id?: string;
  service_type: string;
  time_frame?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  parts_needed?: string;
  duration_hours?: number;
  notes?: string;
}

/**
 * API response interfaces
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserCreationResult {
  success: boolean;
  userId?: string;
  profileId?: string;
  requiresEmailConfirmation?: boolean;
  error?: string;
}

// Removed scans module per product decision

export interface Team {
  id: string;
  name: string;
  color: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

// Removed DamageReport interface since the feature is deleted

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
  created_at: string;
  updated_at: string;
}

/**
 * Job status types
 */
export type JobStatus =
  | "pending"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

/**
 * Job source types
 */
export type JobSource = "email" | "manual";

/**
 * Job interface
 */
export interface Job {
  id: string;
  customer_id: string;
  vehicle_id: string;
  technician_id?: string;
  team_id?: string;
  assigned_employee_id?: string;
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

// =====================================================
// SCANS MODULE
// =====================================================

export interface ScanMeasurement {
  name: string; // e.g. "Voltage", "Temperature"
  value: string | number; // keep flexible for units formatting
  unit?: string; // e.g. "V", "°C"
  status?: "ok" | "warning" | "error"; // optional traffic-light state
}

export interface ScanRecord {
  id: string;
  created_at: string;
  device: string; // scanner source
  vehicle_id: string;
  customer_id: string;
  technician_id?: string;
  scan_type: string;
  summary?: string; // short description shown in list
  results?: ScanMeasurement[] | Record<string, unknown> | null;
  status: "pending" | "completed" | "failed" | "cancelled";
  updated_at: string;
  // Related data (populated by joins)
  vehicle?: Vehicle;
  customer?: Customer;
  technician?: Technician;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface DamageReport {
  id: string;
  job_id: string;
  comment?: string;
  photo_url?: string;
  created_at: string;
  // Related data
  job?: Job;
}

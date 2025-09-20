// =====================================================
// TYPE DEFINITIONS - CLEANED VERSION
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
 * Customer interface - Simplified (removed whatsapp)
 */
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
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
 * Technician interface - Simplified (removed specialization, job_count)
 */
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

/**
 * Appointment status types
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
 * Part interface - Simplified (removed part_number, min_stock_level, unit_price)
 */
export interface Part {
  id: string;
  name: string;
  description?: string;
  stock_quantity: number;
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
 * Appointment interface - Simplified (removed sla_promised_at, flags)
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
 * Skill interface
 */
export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  created_at: string;
}

/**
 * Technician skill interface
 */
export interface TechnicianSkill {
  id: string;
  technician_id: string;
  skill_id: string;
  proficiency_level: number;
  created_at: string;
  // Related data (populated by joins)
  skill?: Skill;
  technician?: Technician;
}

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_read: boolean;
  action_link?: string;
  action_label?: string;
  created_at: string;
}

/**
 * Form data interfaces for better type safety
 */
export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: "admin" | "technician";
  phone?: string;
}

export interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
}

export interface CreateVehicleData {
  make: string;
  model: string;
  license_plate: string;
  year: number;
  customer_id: string;
}

export interface CreateAppointmentData {
  date: string;
  customer_id: string;
  vehicle_id: string;
  service_id?: string;
  title: string;
  notes?: string;
  aw_estimate?: number;
  priority?: Priority;
  required_skills?: string[];
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

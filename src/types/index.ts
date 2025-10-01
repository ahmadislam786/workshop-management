// =====================================================
// CONSOLIDATED TYPE DEFINITIONS
// =====================================================

// Re-export all types from API and Database modules
export * from "./api";
export * from "./database/database";

// Re-export specific types for easy access
export type { Database } from "./database/database";
export type {
  User,
  Profile,
  Appointment,
  Customer,
  Vehicle,
  Technician,
  AppointmentStatus,
  ScheduleAssignment,
  TechnicianAbsence,
  Service,
  Part,
  CreateUserData,
  UserCreationResult,
} from "./api";

// =====================================================
// APPLICATION CONSTANTS
// =====================================================

// Application metadata
export const APP_NAME = "Workshop Manager";
export const APP_VERSION = "1.0.0";
export const APP_DESCRIPTION = "Professional workshop management system";

// AW (Arbeitswerte) constants
export const AW_MINUTES = 6; // 1 AW = 6 minutes
export const WORK_HOURS_PER_DAY = 8;
export const AW_PER_DAY = WORK_HOURS_PER_DAY * 60 / AW_MINUTES; // 80 AW per day

// Working hours
export const WORK_START_HOUR = 8; // 8:00 AM
export const WORK_END_HOUR = 17; // 5:00 PM

// Status constants
export const APPOINTMENT_STATUSES = [
  "waiting",
  "assigned", 
  "in_progress",
  "paused",
  "completed"
] as const;

export const USER_ROLES = ["admin", "technician"] as const;

export const NOTIFICATION_TYPES = [
  "info",
  "success", 
  "warning",
  "error"
] as const;

// UI constants
export const SIDEBAR_WIDTH = {
  EXPANDED: 256, // 16rem
  COLLAPSED: 64  // 4rem
};

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280
};

// API constants
export const API_ENDPOINTS = {
  APPOINTMENTS: "/appointments",
  CUSTOMERS: "/customers",
  VEHICLES: "/vehicles", 
  TECHNICIANS: "/technicians",
  SERVICES: "/services",
  PARTS: "/parts"
} as const;

// Default values
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_DEBOUNCE_MS = 300;
export const DEFAULT_TOAST_DURATION = 3000;

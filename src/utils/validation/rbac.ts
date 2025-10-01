import type { Profile } from "@/types";

/**
 * Role-Based Access Control (RBAC) utilities
 * Provides centralized role checking and permission management
 */

export type UserRole = "admin" | "technician";

export interface Permission {
  resource: string;
  action: string;
  condition?: (user: Profile, context?: any) => boolean;
}

export interface RolePermissions {
  [key: string]: Permission[];
}

// Define permissions for each role
export const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    // Full access to all resources
    { resource: "appointments", action: "read" },
    { resource: "appointments", action: "create" },
    { resource: "appointments", action: "update" },
    { resource: "appointments", action: "delete" },
    { resource: "schedule_assignments", action: "read" },
    { resource: "schedule_assignments", action: "create" },
    { resource: "schedule_assignments", action: "update" },
    { resource: "schedule_assignments", action: "delete" },
    { resource: "customers", action: "read" },
    { resource: "customers", action: "create" },
    { resource: "customers", action: "update" },
    { resource: "customers", action: "delete" },
    { resource: "vehicles", action: "read" },
    { resource: "vehicles", action: "create" },
    { resource: "vehicles", action: "update" },
    { resource: "vehicles", action: "delete" },
    { resource: "technicians", action: "read" },
    { resource: "technicians", action: "create" },
    { resource: "technicians", action: "update" },
    { resource: "technicians", action: "delete" },
    { resource: "technician_absences", action: "read" },
    { resource: "technician_absences", action: "create" },
    { resource: "technician_absences", action: "update" },
    { resource: "technician_absences", action: "delete" },
    { resource: "notifications", action: "read" },
    { resource: "notifications", action: "create" },
    { resource: "notifications", action: "update" },
    { resource: "notifications", action: "delete" },
    // Navigation permissions
    { resource: "navigation", action: "dashboard" },
    { resource: "navigation", action: "jobs" },
    { resource: "navigation", action: "customers" },
    { resource: "navigation", action: "vehicles" },
    { resource: "navigation", action: "technicians" },
    { resource: "navigation", action: "leitstand" },
    { resource: "navigation", action: "plantafel" },
    { resource: "navigation", action: "dayview" },
    { resource: "navigation", action: "calendar" },
    // Admin-specific features
    { resource: "admin", action: "user_management" },
    { resource: "admin", action: "system_settings" },
    { resource: "admin", action: "reports" },
    { resource: "admin", action: "analytics" },
  ],
  technician: [
    // Limited access to assigned appointments only
    { 
      resource: "appointments", 
      action: "read",
      condition: (user, context) => {
        // Technicians can only read appointments assigned to them
        return context?.assignedToTechnician === true;
      }
    },
    { 
      resource: "appointments", 
      action: "update",
      condition: (user, context) => {
        // Technicians can only update status of their assigned appointments
        return context?.assignedToTechnician === true;
      }
    },
    // Read-only access to customers and vehicles for context
    { resource: "customers", action: "read" },
    { resource: "vehicles", action: "read" },
    // Limited access to their own schedule assignments
    { 
      resource: "schedule_assignments", 
      action: "read",
      condition: (user, context) => {
        return context?.technicianId === user.id;
      }
    },
    // Read notifications
    { resource: "notifications", action: "read" },
    // Limited navigation
    { resource: "navigation", action: "dashboard" },
    { resource: "navigation", action: "jobs" },
    // Technician-specific features
    { resource: "technician", action: "update_status" },
    { resource: "technician", action: "view_schedule" },
    { resource: "technician", action: "request_absence" },
  ],
};

/**
 * Check if a user has permission to perform an action on a resource
 */
export function hasPermission(
  user: Profile | null,
  resource: string,
  action: string,
  context?: any
): boolean {
  if (!user) return false;

  const rolePermissions = ROLE_PERMISSIONS[user.role];
  if (!rolePermissions) return false;

  const permission = rolePermissions.find(
    p => p.resource === resource && p.action === action
  );

  if (!permission) return false;

  // Check condition if it exists
  if (permission.condition) {
    return permission.condition(user, context);
  }

  return true;
}

/**
 * Check if a user can access a specific navigation item
 */
export function canAccessNavigation(
  user: Profile | null,
  navigationItem: string
): boolean {
  return hasPermission(user, "navigation", navigationItem);
}

/**
 * Check if a user can perform CRUD operations on a resource
 */
export function canRead(user: Profile | null, resource: string, context?: any): boolean {
  return hasPermission(user, resource, "read", context);
}

export function canCreate(user: Profile | null, resource: string, context?: any): boolean {
  return hasPermission(user, resource, "create", context);
}

export function canUpdate(user: Profile | null, resource: string, context?: any): boolean {
  return hasPermission(user, resource, "update", context);
}

export function canDelete(user: Profile | null, resource: string, context?: any): boolean {
  return hasPermission(user, resource, "delete", context);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: Profile | null): boolean {
  return user?.role === "admin";
}

/**
 * Check if user is technician
 */
export function isTechnician(user: Profile | null): boolean {
  return user?.role === "technician";
}

/**
 * Get user's role
 */
export function getUserRole(user: Profile | null): UserRole | null {
  return user?.role || null;
}

/**
 * Check if user can access admin features
 */
export function canAccessAdminFeatures(user: Profile | null): boolean {
  return isAdmin(user);
}

/**
 * Check if user can manage users
 */
export function canManageUsers(user: Profile | null): boolean {
  return hasPermission(user, "admin", "user_management");
}

/**
 * Check if user can view reports
 */
export function canViewReports(user: Profile | null): boolean {
  return hasPermission(user, "admin", "reports");
}

/**
 * Check if user can access system settings
 */
export function canAccessSystemSettings(user: Profile | null): boolean {
  return hasPermission(user, "admin", "system_settings");
}

/**
 * Get filtered navigation items based on user role
 */
export function getFilteredNavigationItems(
  user: Profile | null,
  allItems: Array<{ id: string; [key: string]: any }>
): Array<{ id: string; [key: string]: any }> {
  if (!user) return [];

  return allItems.filter(item => 
    canAccessNavigation(user, item.id)
  );
}

/**
 * Check if user can view specific appointment
 */
export function canViewAppointment(
  user: Profile | null,
  appointment: any,
  assignments: any[]
): boolean {
  if (!user) return false;

  // Admins can view all appointments
  if (isAdmin(user)) return true;

  // Technicians can only view appointments assigned to them
  if (isTechnician(user)) {
    const isAssigned = assignments.some(
      assignment => 
        assignment.appointment_id === appointment.id &&
        assignment.technician_id === user.id
    );
    return isAssigned;
  }

  return false;
}

/**
 * Check if user can update specific appointment
 */
export function canUpdateAppointment(
  user: Profile | null,
  appointment: any,
  assignments: any[]
): boolean {
  if (!user) return false;

  // Admins can update all appointments
  if (isAdmin(user)) return true;

  // Technicians can only update status of their assigned appointments
  if (isTechnician(user)) {
    const isAssigned = assignments.some(
      assignment => 
        assignment.appointment_id === appointment.id &&
        assignment.technician_id === user.id
    );
    return isAssigned;
  }

  return false;
}

/**
 * Get user's accessible resources
 */
export function getUserAccessibleResources(user: Profile | null): string[] {
  if (!user) return [];

  const rolePermissions = ROLE_PERMISSIONS[user.role];
  if (!rolePermissions) return [];

  const resources = new Set<string>();
  rolePermissions.forEach(permission => {
    resources.add(permission.resource);
  });

  return Array.from(resources);
}

/**
 * Check if user has any permission for a resource
 */
export function hasAnyPermissionForResource(
  user: Profile | null,
  resource: string
): boolean {
  if (!user) return false;

  const rolePermissions = ROLE_PERMISSIONS[user.role];
  if (!rolePermissions) return false;

  return rolePermissions.some(permission => permission.resource === resource);
}

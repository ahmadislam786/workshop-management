import { useAuth } from "@/contexts/auth-context";
import {
  hasPermission,
  canRead,
  canCreate,
  canUpdate,
  canDelete,
  canAccessNavigation,
  isAdmin,
  isTechnician,
  canAccessAdminFeatures,
  canManageUsers,
  canViewReports,
  canAccessSystemSettings,
  canViewAppointment,
  canUpdateAppointment,
  hasAnyPermissionForResource,
  getUserAccessibleResources,
  getFilteredNavigationItems,
  type UserRole,
  type Permission,
} from "@/utils/validation/rbac";

/**
 * Hook for role-based access control
 * Provides easy access to RBAC utilities with current user context
 */
export const useRBAC = () => {
  const { profile, technician } = useAuth();

  return {
    // User info
    user: profile,
    technician,
    role: profile?.role as UserRole | null,

    // Role checks
    isAdmin: isAdmin(profile),
    isTechnician: isTechnician(profile),

    // Permission checks
    hasPermission: (resource: string, action: string, context?: any) =>
      hasPermission(profile, resource, action, context),

    canRead: (resource: string, context?: any) =>
      canRead(profile, resource, context),

    canCreate: (resource: string, context?: any) =>
      canCreate(profile, resource, context),

    canUpdate: (resource: string, context?: any) =>
      canUpdate(profile, resource, context),

    canDelete: (resource: string, context?: any) =>
      canDelete(profile, resource, context),

    // Navigation checks
    canAccessNavigation: (navigationItem: string) =>
      canAccessNavigation(profile, navigationItem),

    // Admin feature checks
    canAccessAdminFeatures: canAccessAdminFeatures(profile),
    canManageUsers: canManageUsers(profile),
    canViewReports: canViewReports(profile),
    canAccessSystemSettings: canAccessSystemSettings(profile),

    // Appointment-specific checks
    canViewAppointment: (appointment: any, assignments: any[]) =>
      canViewAppointment(profile, appointment, assignments),

    canUpdateAppointment: (appointment: any, assignments: any[]) =>
      canUpdateAppointment(profile, appointment, assignments),

    // Resource access
    hasAnyPermissionForResource: (resource: string) =>
      hasAnyPermissionForResource(profile, resource),

    getUserAccessibleResources: () => getUserAccessibleResources(profile),

    // Navigation filtering
    getFilteredNavigationItems: (
      allItems: Array<{ id: string; [key: string]: any }>
    ) => getFilteredNavigationItems(profile, allItems),
  };
};

/**
 * Hook for checking specific permissions
 */
export const usePermission = (
  resource: string,
  action: string,
  context?: any
) => {
  const { profile } = useAuth();
  return hasPermission(profile, resource, action, context);
};

/**
 * Hook for checking navigation access
 */
export const useNavigationAccess = (navigationItem: string) => {
  const { profile } = useAuth();
  return canAccessNavigation(profile, navigationItem);
};

/**
 * Hook for admin feature access
 */
export const useAdminAccess = () => {
  const { profile } = useAuth();

  return {
    canAccessAdminFeatures: canAccessAdminFeatures(profile),
    canManageUsers: canManageUsers(profile),
    canViewReports: canViewReports(profile),
    canAccessSystemSettings: canAccessSystemSettings(profile),
  };
};

/**
 * Hook for appointment access
 */
export const useAppointmentAccess = () => {
  const { profile } = useAuth();

  return {
    canViewAppointment: (appointment: any, assignments: any[]) =>
      canViewAppointment(profile, appointment, assignments),

    canUpdateAppointment: (appointment: any, assignments: any[]) =>
      canUpdateAppointment(profile, appointment, assignments),
  };
};

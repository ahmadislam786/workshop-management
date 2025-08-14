// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Simple class name utility function
 * Combines class names and filters out falsy values
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date): string => {
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return "Invalid Date";
  }
};

/**
 * Format date and time to readable string
 */
export const formatDateTime = (date: string | Date): string => {
  try {
    return new Date(date).toLocaleString();
  } catch {
    return "Invalid Date";
  }
};

/**
 * Get Tailwind CSS classes for different statuses
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    scheduled: "bg-blue-100 text-blue-800 border-blue-200",
    in_progress: "bg-orange-100 text-orange-800 border-orange-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return statusColors[status] || statusColors.inactive;
};

/**
 * Capitalize first letter of string
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format phone number
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return phone;
  
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Truncate text to specified length
 */
export const truncate = (text: string, length: number): string => {
  if (!text || text.length <= length) return text;
  return text.slice(0, length) + "...";
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

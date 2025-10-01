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
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid date";
    return dateObj.toLocaleDateString();
  } catch {
    return "Invalid date";
  }
};

/**
 * Format date and time to readable string
 */
export const formatDateTime = (date: string | Date): string => {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid date/time";
    return `${formatDate(dateObj)} at ${formatTime(dateObj)}`;
  } catch {
    return "Invalid date/time";
  }
};

/**
 * Format time to readable string
 */
export const formatTime = (date: string | Date): string => {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid time";
    return dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid time";
  }
};

/**
 * Format date to short format (e.g., "Jan 15")
 */
export const formatDateShort = (date: string | Date): string => {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid date";
    return dateObj.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid date";
  }
};

/**
 * Get Tailwind CSS classes for different statuses
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    assigned: "bg-blue-100 text-blue-800 border-blue-200",
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
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
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
export const debounce = <T extends (...args: unknown[]) => unknown>(
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

/**
 * Format datetime-local value to readable string without timezone conversion
 */
export const formatDateTimeLocal = (dateTimeString: string): string => {
  try {
    if (!dateTimeString) return "No time set";

    // Split the datetime-local string (format: "2025-08-18T22:00")
    const [datePart, timePart] = dateTimeString.split("T");

    // Be tolerant: if only date provided, show date; if only time, show time
    if (!datePart && !timePart) return "—";
    if (!datePart && timePart)
      return formatTimeFromLocal(`2000-01-01T${timePart}`);
    if (datePart && !timePart) {
      const [y, m, d] = datePart.split("-").map(Number);
      const onlyDate = new Date(y, (m || 1) - 1, d || 1);
      return onlyDate.toLocaleDateString();
    }

    // Parse date parts
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    // Create date object in local timezone
    const date = new Date(year, month - 1, day, hour, minute);

    // Format the date and time
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${dateStr} at ${timeStr}`;
  } catch {
    return "Invalid date/time";
  }
};

/**
 * Format time from datetime-local value
 */
export const formatTimeFromLocal = (dateTimeString: string): string => {
  try {
    if (!dateTimeString) return "No time set";

    const timePart = dateTimeString.split("T")[1];
    if (!timePart) return "—";

    const [hour, minute] = timePart.split(":").map(Number);
    const date = new Date(2000, 0, 1, hour, minute); // Use arbitrary date, just for time formatting

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid time";
  }
};

/**
 * AW (Arbeitswerte) utility functions
 * 1 AW = 6 minutes
 */

export const MINUTES_PER_AW = 6;
export const DEFAULT_AW_CAPACITY = 80; // Default daily capacity per technician
export const WORKING_HOURS = { start: 7, end: 18 }; // 07:00 - 18:00

/**
 * Convert AW to minutes
 */
export const awToMinutes = (aw: number): number => {
  return aw * MINUTES_PER_AW;
};

/**
 * Convert minutes to AW
 */
export const minutesToAW = (minutes: number): number => {
  return Math.round(minutes / MINUTES_PER_AW);
};

/**
 * Convert AW to hours
 */
export const awToHours = (aw: number): number => {
  return awToMinutes(aw) / 60;
};

/**
 * Convert hours to AW
 */
export const hoursToAW = (hours: number): number => {
  return minutesToAW(hours * 60);
};

/**
 * Calculate end time from start time and AW
 */
export const calculateEndTime = (startTime: Date, aw: number): Date => {
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + awToMinutes(aw));
  return endTime;
};

/**
 * Calculate AW from start and end times
 */
export const calculateAW = (startTime: Date, endTime: Date): number => {
  const diffMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  return minutesToAW(diffMinutes);
};

/**
 * Check if two time ranges overlap
 */
export const timeRangesOverlap = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean => {
  return start1 < end2 && end1 > start2;
};

/**
 * Snap time to 15-minute intervals
 */
export const snapToGrid = (date: Date, gridMinutes: number = 15): Date => {
  const snapped = new Date(date);
  const minutes = snapped.getMinutes();
  const snappedMinutes = Math.round(minutes / gridMinutes) * gridMinutes;
  snapped.setMinutes(snappedMinutes, 0, 0);
  return snapped;
};

/**
 * Generate time slots for a day (15-minute intervals)
 */
export const generateTimeSlots = (date: Date, gridMinutes: number = 15) => {
  const slots = [];
  const startHour = WORKING_HOURS.start;
  const endHour = WORKING_HOURS.end;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += gridMinutes) {
      const slotTime = new Date(date);
      slotTime.setHours(hour, minute, 0, 0);
      slots.push({
        hour,
        minute,
        timeString: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        isWorkingHour: true
      });
    }
  }

  return slots;
};

/**
 * Calculate available AW for a technician on a specific date
 * Takes into account absences and existing assignments
 */
export const calculateAvailableAW = (
  technicianCapacity: number,
  absences: Array<{ from_time?: string; to_time?: string }>,
  existingAssignments: Array<{ aw_planned: number }>
): number => {
  // Calculate absence AW
  let absenceAW = 0;
  
  for (const absence of absences) {
    if (!absence.from_time && !absence.to_time) {
      // Full day absence
      absenceAW = technicianCapacity;
      break;
    } else if (absence.from_time && absence.to_time) {
      // Partial day absence
      const fromTime = new Date(`2000-01-01T${absence.from_time}`);
      const toTime = new Date(`2000-01-01T${absence.to_time}`);
      const absenceMinutes = (toTime.getTime() - fromTime.getTime()) / (1000 * 60);
      absenceAW += minutesToAW(absenceMinutes);
    }
  }

  // Calculate planned AW
  const plannedAW = existingAssignments.reduce((sum, assignment) => sum + assignment.aw_planned, 0);

  // Return available AW
  return Math.max(0, technicianCapacity - absenceAW - plannedAW);
};

/**
 * Calculate utilization percentage
 */
export const calculateUtilization = (plannedAW: number, capacity: number): number => {
  if (capacity === 0) return 0;
  return Math.min(100, (plannedAW / capacity) * 100);
};

/**
 * Get utilization color based on percentage
 */
export const getUtilizationColor = (percentage: number): string => {
  if (percentage >= 100) return "text-red-600";
  if (percentage >= 80) return "text-orange-600";
  return "text-green-600";
};

/**
 * Get utilization background color
 */
export const getUtilizationBgColor = (percentage: number): string => {
  if (percentage >= 100) return "bg-red-50";
  if (percentage >= 80) return "bg-orange-50";
  return "bg-green-50";
};

/**
 * Format AW for display
 */
export const formatAW = (aw: number): string => {
  return `${aw} AW`;
};

/**
 * Format time duration from AW
 */
export const formatDurationFromAW = (aw: number): string => {
  const minutes = awToMinutes(aw);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${remainingMinutes}m`;
  }
};

/**
 * Check if a time slot is within working hours
 */
export const isWithinWorkingHours = (date: Date): boolean => {
  const hour = date.getHours();
  return hour >= WORKING_HOURS.start && hour < WORKING_HOURS.end;
};

/**
 * Get working hours for a date
 */
export const getWorkingHours = (date: Date) => {
  const start = new Date(date);
  start.setHours(WORKING_HOURS.start, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(WORKING_HOURS.end, 0, 0, 0);
  
  return { start, end };
};

/**
 * Calculate total working minutes for a day
 */
export const getTotalWorkingMinutes = (): number => {
  return (WORKING_HOURS.end - WORKING_HOURS.start) * 60;
};

/**
 * Calculate total working AW for a day
 */
export const getTotalWorkingAW = (): number => {
  return minutesToAW(getTotalWorkingMinutes());
};

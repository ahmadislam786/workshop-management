import React from "react";
import { AlertTriangle, CheckCircle, X, Clock, User, Car } from "lucide-react";
import type { Appointment, ScheduleAssignment, Technician } from "@/types";
import { timeRangesOverlap, isWithinWorkingHours } from "@/lib/aw-utils";

interface ValidationResult {
  isValid: boolean;
  type: "error" | "warning" | "info";
  message: string;
  icon: React.ReactNode;
}

interface SchedulingValidatorProps {
  appointment: Appointment;
  technician: Technician;
  startTime: Date;
  endTime: Date;
  existingAssignments: ScheduleAssignment[];
  technicianAbsences: any[];
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const SchedulingValidator: React.FC<SchedulingValidatorProps> = ({
  appointment,
  technician,
  startTime,
  endTime,
  existingAssignments,
  technicianAbsences,
  onConfirm,
  onCancel
}) => {
  const validations: ValidationResult[] = [];

  // Check if technician is absent
  const isAbsent = technicianAbsences.some(absence => {
    if (!absence.from_time && !absence.to_time) {
      // Full day absence
      return true;
    } else if (absence.from_time && absence.to_time) {
      // Partial day absence
      const absenceStart = new Date(`2000-01-01T${absence.from_time}`);
      const absenceEnd = new Date(`2000-01-01T${absence.to_time}`);
      const appointmentStart = new Date(`2000-01-01T${startTime.toTimeString().slice(0, 8)}`);
      const appointmentEnd = new Date(`2000-01-01T${endTime.toTimeString().slice(0, 8)}`);
      
      return timeRangesOverlap(appointmentStart, appointmentEnd, absenceStart, absenceEnd);
    }
    return false;
  });

  if (isAbsent) {
    validations.push({
      isValid: false,
      type: "error",
      message: "Technician is absent during this time period",
      icon: <X className="h-4 w-4 text-red-600" />
    });
  }

  // Check for time conflicts
  const hasConflict = existingAssignments.some(assignment => {
    const assignmentStart = new Date(assignment.start_time);
    const assignmentEnd = new Date(assignment.end_time);
    return timeRangesOverlap(startTime, endTime, assignmentStart, assignmentEnd);
  });

  if (hasConflict) {
    validations.push({
      isValid: false,
      type: "error",
      message: "Time slot conflicts with existing assignment",
      icon: <X className="h-4 w-4 text-red-600" />
    });
  }

  // Check if within working hours
  if (!isWithinWorkingHours(startTime) || !isWithinWorkingHours(endTime)) {
    validations.push({
      isValid: false,
      type: "error",
      message: "Appointment is outside working hours (07:00-18:00)",
      icon: <Clock className="h-4 w-4 text-red-600" />
    });
  }

  // Check skill requirements
  const technicianSkills = technician.specialization?.split(", ") || [];
  const requiredSkills = appointment.required_skills || [];
  const missingSkills = requiredSkills.filter(skill => 
    !technicianSkills.some(techSkill => 
      techSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );

  if (missingSkills.length > 0) {
    validations.push({
      isValid: false,
      type: "warning",
      message: `Technician may lack required skills: ${missingSkills.join(", ")}`,
      icon: <AlertTriangle className="h-4 w-4 text-orange-600" />
    });
  }

  // Check SLA risk
  if (appointment.sla_promised_at) {
    const slaTime = new Date(appointment.sla_promised_at);
    const timeUntilSLA = slaTime.getTime() - startTime.getTime();
    const hoursUntilSLA = timeUntilSLA / (1000 * 60 * 60);
    
    if (hoursUntilSLA < 2) {
      validations.push({
        isValid: false,
        type: "warning",
        message: "SLA deadline is very close (< 2 hours)",
        icon: <AlertTriangle className="h-4 w-4 text-orange-600" />
      });
    } else if (hoursUntilSLA < 4) {
      validations.push({
        isValid: true,
        type: "warning",
        message: "SLA deadline is approaching (< 4 hours)",
        icon: <AlertTriangle className="h-4 w-4 text-orange-600" />
      });
    }
  }

  // Check if vehicle is onsite
  if (!appointment.flags?.includes('vehicle_onsite')) {
    validations.push({
      isValid: true,
      type: "info",
      message: "Vehicle may not be onsite yet",
      icon: <Car className="h-4 w-4 text-blue-600" />
    });
  }

  // Check parts availability
  if (appointment.flags?.includes('parts_ordered')) {
    validations.push({
      isValid: true,
      type: "warning",
      message: "Parts are still on order",
      icon: <AlertTriangle className="h-4 w-4 text-orange-600" />
    });
  }

  // Check capacity utilization
  const plannedAW = existingAssignments.reduce((sum, assignment) => sum + assignment.aw_planned, 0);
  const appointmentAW = appointment.aw_estimate;
  const totalPlannedAW = plannedAW + appointmentAW;
  const utilizationPercentage = (totalPlannedAW / technician.aw_capacity_per_day) * 100;

  if (utilizationPercentage > 100) {
    validations.push({
      isValid: false,
      type: "error",
      message: "Technician would be overbooked",
      icon: <X className="h-4 w-4 text-red-600" />
    });
  } else if (utilizationPercentage > 90) {
    validations.push({
      isValid: true,
      type: "warning",
      message: "Technician would be near capacity",
      icon: <AlertTriangle className="h-4 w-4 text-orange-600" />
    });
  }

  const hasErrors = validations.some(v => v.type === "error");
  const hasWarnings = validations.some(v => v.type === "warning");

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Scheduling Validation</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <User className="h-5 w-5 text-gray-500" />
          <div>
            <div className="font-medium text-gray-900">{technician.name}</div>
            <div className="text-sm text-gray-600">
              {appointment.title} - {appointment.aw_estimate} AW
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <div>Start: {startTime.toLocaleTimeString()}</div>
          <div>End: {endTime.toLocaleTimeString()}</div>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {validations.map((validation, index) => (
          <div
            key={index}
            className={`flex items-center space-x-3 p-3 rounded-lg ${
              validation.type === "error"
                ? "bg-red-50 border border-red-200"
                : validation.type === "warning"
                ? "bg-orange-50 border border-orange-200"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            {validation.icon}
            <span
              className={`text-sm ${
                validation.type === "error"
                  ? "text-red-800"
                  : validation.type === "warning"
                  ? "text-orange-800"
                  : "text-blue-800"
              }`}
            >
              {validation.message}
            </span>
          </div>
        ))}

        {validations.length === 0 && (
          <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              All validations passed. Ready to schedule.
            </span>
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={hasErrors}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            hasErrors
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : hasWarnings
              ? "bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500"
              : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
          }`}
        >
          {hasErrors ? "Cannot Schedule" : hasWarnings ? "Schedule Anyway" : "Schedule"}
        </button>
      </div>
    </div>
  );
};

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  useAppointments,
  useScheduleAssignments,
} from "@/hooks/useAppointments";
import { useTechnicians } from "@/hooks/useTechnicians";
import { useTechnicianAbsences } from "@/hooks/useTechnicianAbsences";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Car,
  Wrench,
  X,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  Pause,
  Package,
} from "lucide-react";
import { toast } from "react-toastify";
import type { Appointment, ScheduleAssignment, Technician } from "@/types";
import {
  WORKING_HOURS,
  calculateAvailableAW,
  calculateUtilization,
  getUtilizationColor,
  snapToGrid,
  calculateEndTime,
} from "@/lib/aw-utils";

interface TimeSlot {
  hour: number;
  minute: number;
  timeString: string;
  isWorkingHour: boolean;
}

interface TechnicianLane {
  technician: Technician;
  assignments: ScheduleAssignment[];
  absences: any[];
  availableAW: number;
  plannedAW: number;
  utilizationPercentage: number;
}

const TIME_SLOT_MINUTES = 15;

export const DayViewPlanner: React.FC = () => {
  const { getAppointmentsForDate, updateAppointment } = useAppointments();
  const { getAssignmentsForDate, createAssignment } = useScheduleAssignments();
  const { technicians } = useTechnicians();
  const { getAbsencesForDate } = useTechnicianAbsences();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [draggedAppointment, setDraggedAppointment] =
    useState<Appointment | null>(null);
  const [dragOverTechnicianId, setDragOverTechnicianId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");


  const isToday = useMemo(() => {
    const now = new Date();
    return (
      now.getFullYear() === selectedDate.getFullYear() &&
      now.getMonth() === selectedDate.getMonth() &&
      now.getDate() === selectedDate.getDate()
    );
  }, [selectedDate]);

  // State for day-specific data
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([]);
  const [dayAssignments, setDayAssignments] = useState<ScheduleAssignment[]>(
    []
  );
  const [dayAbsences, setDayAbsences] = useState<any[]>([]);
  const [loadingDayData, setLoadingDayData] = useState(false);

  // Load day-specific data
  useEffect(() => {
    const loadDayData = async () => {
      const dateString = selectedDate.toISOString().split("T")[0];

      try {
        setLoadingDayData(true);
        const [appointments, assignments, absences] = await Promise.all([
          getAppointmentsForDate(dateString),
          getAssignmentsForDate(dateString),
          getAbsencesForDate(dateString),
        ]);

        setDayAppointments(appointments);
        setDayAssignments(assignments);
        setDayAbsences(absences);
      } catch (error) {
        toast.error("Failed to load day data. Please try again.");
      } finally {
        setLoadingDayData(false);
      }
    };

    loadDayData();
  }, [
    selectedDate,
    getAppointmentsForDate,
    getAssignmentsForDate,
    getAbsencesForDate,
  ]);

  // Filter appointments based on selected filters
  const filteredAppointments = useMemo(() => {
    return dayAppointments.filter((appointment: Appointment) => {
      if (filterPriority !== "all" && appointment.priority !== filterPriority)
        return false;
      if (filterStatus !== "all" && appointment.status !== filterStatus)
        return false;

      return true;
    });
  }, [dayAppointments, filterPriority, filterStatus]);

  // Get unassigned appointments (buffer)
  const unassignedAppointments = useMemo(() => {
    const unassigned = filteredAppointments.filter(
      (appointment: Appointment) => appointment.status === "new"
    );
    return unassigned;
  }, [filteredAppointments]);

  // Create technician lanes with capacity calculations
  const technicianLanes = useMemo((): TechnicianLane[] => {
    return technicians
      .filter((tech: Technician) => tech.active)
      .map((technician: Technician) => {
        const technicianAssignments = dayAssignments.filter(
          (assignment: ScheduleAssignment) =>
            assignment.technician_id === technician.id
        );

        const technicianAbsences = dayAbsences.filter(
          (absence: any) => absence.technician_id === technician.id
        );

        const plannedAW = technicianAssignments.reduce(
          (sum: number, assignment: ScheduleAssignment) =>
            sum + assignment.aw_planned,
          0
        );
        const utilizationPercentage = calculateUtilization(
          plannedAW,
          technician.aw_capacity_per_day
        );
        const availableAW = calculateAvailableAW(
          technician.aw_capacity_per_day,
          technicianAbsences,
          technicianAssignments
        );

        return {
          technician,
          assignments: technicianAssignments,
          absences: technicianAbsences,
          availableAW,
          plannedAW,
          utilizationPercentage,
        };
      });
  }, [technicians, dayAssignments, dayAbsences]);

  // Calculate KPI metrics
  const kpiMetrics = useMemo(() => {
    const totalPlannedAW = technicianLanes.reduce(
      (sum: number, lane: TechnicianLane) => sum + lane.plannedAW,
      0
    );
    const totalAvailableAW = technicianLanes.reduce(
      (sum: number, lane: TechnicianLane) => sum + lane.availableAW,
      0
    );
    const totalCapacity = technicianLanes.reduce(
      (sum: number, lane: TechnicianLane) =>
        sum + lane.technician.aw_capacity_per_day,
      0
    );
    const overallUtilization =
      totalCapacity > 0 ? (totalPlannedAW / totalCapacity) * 100 : 0;
    const waitingCustomers = unassignedAppointments.length;
    const vehiclesOnsite = filteredAppointments.filter((app: Appointment) =>
      app.flags?.includes("vehicle_onsite")
    ).length;
    const pendingParts = filteredAppointments.filter((app: Appointment) =>
      app.flags?.includes("parts_ordered")
    ).length;

    return {
      totalPlannedAW,
      totalAvailableAW,
      overallUtilization,
      waitingCustomers,
      vehiclesOnsite,
      pendingParts,
    };
  }, [technicianLanes, unassignedAppointments, filteredAppointments]);

  // Handle date navigation
  const navigateDate = useCallback(
    (direction: "prev" | "next") => {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + (direction === "next" ? 1 : -1));
      setSelectedDate(newDate);
    },
    [selectedDate]
  );

  // Handle appointment drag start
  const handleAppointmentDragStart = useCallback(
    (appointment: Appointment, event: React.DragEvent) => {
      setDraggedAppointment(appointment);
      event.dataTransfer.setData("text/plain", appointment.id);
      event.dataTransfer.effectAllowed = "move";

      if (event.currentTarget instanceof HTMLElement) {
        event.currentTarget.style.opacity = "0.5";
      }
    },
    []
  );

  // Handle appointment drag end
  const handleAppointmentDragEnd = useCallback((event: React.DragEvent) => {
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.style.opacity = "1";
    }
    setDraggedAppointment(null);
  }, []);

  // Handle drop on technician lane
  const handleTechnicianDrop = useCallback(
    async (
      technicianId: string,
      timeSlot: TimeSlot,
      event: React.DragEvent
    ) => {
      event.preventDefault();

      if (!draggedAppointment) return;

      try {
        // Calculate start and end times
        const startTime = snapToGrid(new Date(selectedDate));
        startTime.setHours(timeSlot.hour, timeSlot.minute, 0, 0);

        const endTime = calculateEndTime(
          startTime,
          draggedAppointment.aw_estimate
        );

        // Check for conflicts
        const existingAssignments = dayAssignments.filter(
          (assignment: ScheduleAssignment) =>
            assignment.technician_id === technicianId
        );

        const hasConflict = existingAssignments.some(
          (assignment: ScheduleAssignment) => {
            const assignmentStart = new Date(assignment.start_time);
            const assignmentEnd = new Date(assignment.end_time);
            return startTime < assignmentEnd && endTime > assignmentStart;
          }
        );

        if (hasConflict) {
          toast.error("Time slot conflicts with existing assignment");
          return;
        }

        // Create schedule assignment
        await createAssignment({
          appointment_id: draggedAppointment.id,
          technician_id: technicianId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          aw_planned: draggedAppointment.aw_estimate,
          status: "scheduled",
        });

        // Update appointment status
        await updateAppointment(draggedAppointment.id, {
          status: "scheduled",
        });

        toast.success(`Appointment scheduled for ${timeSlot.timeString}`);
        setDraggedAppointment(null);
      } catch (error) {
        toast.error("Failed to schedule appointment");
      }
    },
    [
      draggedAppointment,
      selectedDate,
      dayAssignments,
      createAssignment,
      updateAppointment,
    ]
  );

  // Handle drag over
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Get appointment color based on priority and status
  const getAppointmentColor = useCallback((appointment: Appointment) => {
    if (appointment.priority === "urgent")
      return "bg-red-50 border-red-200 text-red-800 hover:bg-red-100";
    if (appointment.priority === "high")
      return "bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100";
    if (appointment.status === "waiting_parts")
      return "bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100";
    if (appointment.status === "paused")
      return "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100";
    return "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100";
  }, []);

  // Get status icon
  const getStatusIcon = useCallback((appointment: Appointment) => {
    if (appointment.priority === "urgent") return <AlertCircle className="h-4 w-4" />;
    if (appointment.priority === "high") return <AlertCircle className="h-4 w-4" />;
    if (appointment.status === "waiting_parts") return <Package className="h-4 w-4" />;
    if (appointment.status === "paused") return <Pause className="h-4 w-4" />;
    if (appointment.status === "done") return <CheckCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  }, []);


  // Calculate appointment position and width
  const getAppointmentStyle = useCallback((assignment: ScheduleAssignment) => {
    const startTime = new Date(assignment.start_time);
    const endTime = new Date(assignment.end_time);

    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
    const durationMinutes = endMinutes - startMinutes;

    const startPosition =
      ((startMinutes - WORKING_HOURS.start * 60) / TIME_SLOT_MINUTES) * 100;
    const width = (durationMinutes / TIME_SLOT_MINUTES) * 100;

    return {
      left: `${startPosition}%`,
      width: `${width}%`,
      minWidth: "80px",
    };
  }, []);

  if (loadingDayData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading day data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigateDate("prev")}
              variant="secondary"
              size="sm"
              className="rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h1>
            </div>

            <Button
              onClick={() => navigateDate("next")}
              variant="secondary"
              size="sm"
              className="rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={() => setSelectedDate(new Date())}
            variant="secondary"
            size="sm"
            className="rounded-lg"
          >
            Today
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <div className="text-sm font-medium text-blue-700">Planned AW</div>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {kpiMetrics.totalPlannedAW}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="text-sm font-medium text-green-700">Available AW</div>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {kpiMetrics.totalAvailableAW}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-4 h-4 rounded-full bg-purple-600"></div>
              <div className="text-sm font-medium text-purple-700">Utilization</div>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {kpiMetrics.overallUtilization.toFixed(1)}%
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center space-x-2 mb-1">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <div className="text-sm font-medium text-orange-700">Waiting</div>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {kpiMetrics.waitingCustomers}
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
            <div className="flex items-center space-x-2 mb-1">
              <Car className="h-4 w-4 text-indigo-600" />
              <div className="text-sm font-medium text-indigo-700">Onsite</div>
            </div>
            <div className="text-2xl font-bold text-indigo-900">
              {kpiMetrics.vehiclesOnsite}
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center space-x-2 mb-1">
              <Package className="h-4 w-4 text-yellow-600" />
              <div className="text-sm font-medium text-yellow-700">Pending Parts</div>
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {kpiMetrics.pendingParts}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Filters:</span>
          </div>

          <select
            value={filterPriority}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFilterPriority(e.target.value)
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFilterStatus(e.target.value)
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="paused">Paused</option>
            <option value="waiting_parts">Waiting Parts</option>
            <option value="done">Done</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Unassigned Appointments */}
      {unassignedAppointments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Wrench className="h-5 w-5 mr-2 text-orange-500" />
            Unassigned Appointments ({unassignedAppointments.length})
            <span className="ml-2 text-sm text-gray-500 font-normal">
              Drag to schedule
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {unassignedAppointments.map((appointment: Appointment) => (
              <div
                key={appointment.id}
                draggable
                onDragStart={(e: React.DragEvent) =>
                  handleAppointmentDragStart(appointment, e)
                }
                onDragEnd={handleAppointmentDragEnd}
                onClick={() => {
                  setSelectedAppointment(appointment);
                  setShowAppointmentModal(true);
                }}
                className={`p-4 rounded-lg border-2 cursor-move hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 ${getAppointmentColor(appointment)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(appointment)}
                    <span className="font-semibold text-sm truncate">
                      {appointment.title}
                    </span>
                  </div>
                  <span className="text-xs bg-white bg-opacity-60 px-2 py-1 rounded-full font-medium">
                    {appointment.aw_estimate} AW
                  </span>
                </div>
                <div className="text-xs opacity-80 mb-2">
                  {appointment.customer?.name}
                </div>
                <div className="text-xs opacity-80 mb-3">
                  {appointment.vehicle?.make} {appointment.vehicle?.model}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-white bg-opacity-60 px-2 py-1 rounded-full">
                    {appointment.priority}
                  </span>
                  {appointment.flags && appointment.flags.length > 0 && (
                    <div className="flex space-x-1">
                      {appointment.flags.slice(0, 2).map((flag: any) => (
                        <span
                          key={flag}
                          className="text-xs bg-white bg-opacity-60 px-1 py-0.5 rounded"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technician Schedule */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Technician Schedule
            </h3>
            <div className="text-sm text-gray-500">
              {WORKING_HOURS.start}:00 - {WORKING_HOURS.end}:00
            </div>
          </div>
        </div>

        {/* Time Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex">
            <div className="w-64 p-4 border-r border-gray-200 bg-gray-50">
              <div className="text-sm font-medium text-gray-700">Technician</div>
            </div>
            <div className="flex-1 p-4">
              <div className="grid grid-cols-11 gap-0">
                {Array.from({ length: 11 }, (_, i) => {
                  const hour = WORKING_HOURS.start + i;
                  return (
                    <div key={hour} className="text-center">
                      <div className="text-sm font-medium text-gray-700">
                        {hour.toString().padStart(2, '0')}:00
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Technician Lanes */}
        {technicianLanes.map((lane: TechnicianLane) => (
          <div
            key={lane.technician.id}
            className={`border-b border-gray-200 last:border-b-0 ${
              dragOverTechnicianId === lane.technician.id ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex min-h-[120px]">
              {/* Technician Info */}
              <div className="w-64 p-4 border-r border-gray-200 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-gray-900">
                      {lane.technician.name}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Capacity:</span>
                      <span className="font-medium">{lane.technician.aw_capacity_per_day} AW</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Planned:</span>
                      <span className="font-medium">{lane.plannedAW} AW</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <span className="font-medium text-green-600">{lane.availableAW} AW</span>
                    </div>
                  </div>

                  {/* Utilization Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Utilization</span>
                      <span className={`font-medium ${getUtilizationColor(lane.utilizationPercentage)}`}>
                        {lane.utilizationPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          lane.utilizationPercentage > 90
                            ? "bg-red-500"
                            : lane.utilizationPercentage > 70
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(100, lane.utilizationPercentage)}%` }}
                      />
                    </div>
                  </div>

                  {lane.absences.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-red-600 font-medium">Absences:</div>
                      {lane.absences.map((absence: any) => (
                        <div key={absence.id} className="text-xs text-red-600">
                          {absence.type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule Grid */}
              <div className="flex-1 relative">
                <div className="grid grid-cols-11 gap-0 h-full">
                  {Array.from({ length: 11 }, (_, i) => {
                    const hour = WORKING_HOURS.start + i;
                    return (
                      <div
                        key={hour}
                        className="border-r border-gray-200 last:border-r-0 relative"
                        onDrop={(e: React.DragEvent) => {
                          const timeSlot = { hour, minute: 0, timeString: `${hour.toString().padStart(2, '0')}:00`, isWorkingHour: true };
                          handleTechnicianDrop(lane.technician.id, timeSlot, e);
                        }}
                        onDragOver={(e: React.DragEvent) => {
                          handleDragOver(e);
                          if (draggedAppointment) setDragOverTechnicianId(lane.technician.id);
                        }}
                        onDragLeave={() => setDragOverTechnicianId(prev => (prev === lane.technician.id ? null : prev))}
                      >
                        {/* Hour markers */}
                        <div className="absolute top-1 left-1 text-xs text-gray-400">
                          {hour.toString().padStart(2, '0')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Current time indicator */}
                {isToday && (
                  (() => {
                    const now = new Date();
                    const currentHour = now.getHours();
                    if (currentHour >= WORKING_HOURS.start && currentHour < WORKING_HOURS.end) {
                      const hourIndex = currentHour - WORKING_HOURS.start;
                      const minutes = now.getMinutes();
                      const position = (hourIndex + minutes / 60) / 11 * 100;
                      return (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                          style={{ left: `${position}%` }}
                        />
                      );
                    }
                    return null;
                  })()
                )}

                {/* Appointments */}
                <div className="absolute inset-0 pointer-events-none">
                  {lane.assignments.map((assignment: ScheduleAssignment) => (
                    <div
                      key={assignment.id}
                      className="absolute top-2 bottom-2 rounded-lg border bg-white shadow-sm pointer-events-auto cursor-pointer hover:shadow-md transition-all duration-200"
                      style={getAppointmentStyle(assignment)}
                      onClick={() => {
                        setSelectedAppointment(assignment.appointment || null);
                        setShowAppointmentModal(true);
                      }}
                    >
                      <div className="p-2 h-full flex flex-col justify-center">
                        <div className="text-xs font-semibold truncate text-gray-900">
                          {assignment.appointment?.title}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {assignment.appointment?.customer?.name}
                        </div>
                        <div className="text-xs text-blue-600 font-medium">
                          {assignment.aw_planned} AW
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty state */}
                {lane.assignments.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-sm text-gray-400 text-center">
                      <div className="mb-1">No appointments scheduled</div>
                      <div className="text-xs">Drop appointments here</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Details Modal */}
      {showAppointmentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Appointment Details
              </h3>
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Wrench className="h-4 w-4 mr-2 text-blue-600" />
                    Service Details
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Title:</span>
                      <span className="font-medium">{selectedAppointment.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">AW Estimate:</span>
                      <span className="font-medium">{selectedAppointment.aw_estimate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className="font-medium capitalize">{selectedAppointment.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium capitalize">{selectedAppointment.status}</span>
                    </div>
                    {selectedAppointment.sla_promised_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">SLA:</span>
                        <span className="font-medium">
                          {new Date(selectedAppointment.sla_promised_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2 text-green-600" />
                    Customer & Vehicle
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-600">Customer</div>
                        <div className="font-medium">{selectedAppointment.customer?.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-600">Vehicle</div>
                        <div className="font-medium">
                          {selectedAppointment.vehicle?.make} {selectedAppointment.vehicle?.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {selectedAppointment.vehicle?.license_plate}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              {selectedAppointment.required_skills && selectedAppointment.required_skills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAppointment.required_skills.map((skill: any) => (
                      <span
                        key={skill}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedAppointment.flags && selectedAppointment.flags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Flags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAppointment.flags.map((flag: any) => (
                      <span
                        key={flag}
                        className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
import React, { useState, useCallback, useMemo } from "react";
import { useJobs } from "@/hooks/useJobs";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Car,
  Clock,
  Wrench,
} from "lucide-react";
import { toast } from "react-toastify";
import type { Job } from "../../../types";
import { formatTimeFromLocal, formatDateTimeLocal } from "@/lib/utils";

interface CalendarSlot {
  date: Date;
  hour: number;
  technicianId?: string;
  job?: Job;
  isAvailable: boolean;
}

interface OpenJobPoolProps {
  jobs: Job[];
  onJobDragStart: (job: Job, event: React.DragEvent) => void;
}

const OpenJobPool: React.FC<OpenJobPoolProps> = ({ jobs, onJobDragStart }) => {
  const openJobs = jobs.filter(
    job => job.status === "pending" && !job.technician_id
  );

  if (openJobs.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <Wrench className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No open jobs in pool</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <Wrench className="h-5 w-5 mr-2 text-orange-500" />
        Open Job Pool ({openJobs.length})
      </h3>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {openJobs.map(job => (
          <div
            key={job.id}
            draggable
            onDragStart={e => onJobDragStart(job, e)}
            className="bg-orange-50 border border-orange-200 rounded-lg p-3 cursor-move hover:bg-orange-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-orange-800 text-sm">
                  {job.service_type}
                </p>
                <p className="text-orange-600 text-xs">
                  {job.customer?.name} - {job.vehicle?.make}{" "}
                  {job.vehicle?.model}
                </p>
              </div>
              <div className="text-orange-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const JobCalendar: React.FC = () => {
  const { jobs, updateJob } = useJobs();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("week");
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);

  // Generate calendar slots for the current week
  const generateWeekSlots = useCallback(
    (date: Date): CalendarSlot[] => {
      const slots: CalendarSlot[] = [];
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());

      // Generate slots for each day of the week (Mon-Sun)
      for (let day = 0; day < 7; day++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + day);

        // Generate hourly slots from 8 AM to 6 PM
        for (let hour = 8; hour <= 18; hour++) {
          const slotDate = new Date(currentDay);
          slotDate.setHours(hour, 0, 0, 0);

          // Check if there's a job scheduled for this slot
          const scheduledJob = jobs.find(job => {
            if (!job.scheduled_start || job.status !== "scheduled")
              return false;
            const jobDate = new Date(job.scheduled_start);
            return (
              jobDate.getDate() === currentDay.getDate() &&
              jobDate.getMonth() === currentDay.getMonth() &&
              jobDate.getFullYear() === currentDay.getFullYear() &&
              jobDate.getHours() === hour
            );
          });

          slots.push({
            date: slotDate,
            hour,
            technicianId: scheduledJob?.technician_id,
            job: scheduledJob,
            isAvailable: !scheduledJob,
          });
        }
      }

      return slots;
    },
    [jobs]
  );

  const weekSlots = useMemo(
    () => generateWeekSlots(currentDate),
    [currentDate, generateWeekSlots]
  );

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleJobDragStart = (job: Job, event: React.DragEvent) => {
    setDraggedJob(job);
    event.dataTransfer.setData("text/plain", job.id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleSlotDrop = useCallback(
    async (slot: CalendarSlot, event: React.DragEvent) => {
      event.preventDefault();

      if (!draggedJob || slot.job) {
        return; // Can't drop on occupied slot
      }

      try {
        // Calculate end time based on job duration
        const startTime = new Date(slot.date);
        const endTime = new Date(startTime);
        endTime.setHours(
          startTime.getHours() + (draggedJob.duration_hours || 1)
        );

        await updateJob(draggedJob.id, {
          status: "scheduled",
          scheduled_start: startTime.toISOString(),
          scheduled_end: endTime.toISOString(),
          technician_id: slot.technicianId,
        });

        toast.success(
          `Job scheduled for ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}`
        );
        setDraggedJob(null);
      } catch (error) {
        toast.error("Failed to schedule job");
      }
    },
    [draggedJob, updateJob]
  );

  const handleSlotDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Add previous month's days
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }

    // Add next month's days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  const getJobsForDate = (date: Date) => {
    return jobs.filter(job => {
      if (!job.scheduled_start) return false;
      const jobDate = new Date(job.scheduled_start);
      return (
        jobDate.getDate() === date.getDate() &&
        jobDate.getMonth() === date.getMonth() &&
        jobDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const jobsForDate = getJobsForDate(date);
    if (jobsForDate.length > 0) {
      setSelectedJob(jobsForDate[0]);
      setShowJobModal(true);
    }
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleStatusUpdate = async (
    jobId: string,
    newStatus: Job["status"]
  ) => {
    try {
      await updateJob(jobId, { status: newStatus });
      toast.success(`Job status updated to ${newStatus.replace("_", " ")}`);
      setShowJobModal(false);
    } catch {
      toast.error("Failed to update job status");
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Job Calendar</h2>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setCurrentDate(new Date())}
            variant="secondary"
            size="sm"
          >
            Today
          </Button>
          <div className="flex border border-gray-200 rounded-lg">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 text-sm ${
                viewMode === "month"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 text-sm ${
                viewMode === "week"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 text-sm ${
                viewMode === "day"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Open Job Pool */}
      <OpenJobPool jobs={jobs} onJobDragStart={handleJobDragStart} />

      {/* Calendar Header */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
        <Button
          onClick={() =>
            setCurrentDate(
              new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
            )
          }
          variant="secondary"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>

        <Button
          onClick={() =>
            setCurrentDate(
              new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
            )
          }
          variant="secondary"
          size="sm"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week View Calendar */}
      {viewMode === "week" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
            <div className="p-3 text-sm font-medium text-gray-500">Time</div>
            {weekDays.map(day => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-8">
            {Array.from({ length: 11 }, (_, hour) => (
              <React.Fragment key={hour}>
                <div className="p-2 text-xs text-gray-500 border-r border-gray-200 bg-gray-50">
                  {hour + 8}:00
                </div>
                {weekDays.map((_, dayIndex) => {
                  const slot = weekSlots.find(
                    s =>
                      s.date.getDay() === (dayIndex + 1) % 7 &&
                      s.hour === hour + 8
                  );

                  if (!slot)
                    return (
                      <div
                        key={dayIndex}
                        className="border-r border-gray-200"
                      />
                    );

                  return (
                    <div
                      key={dayIndex}
                      className={`border-r border-gray-200 min-h-[60px] p-1 ${
                        slot.isAvailable ? "bg-green-50" : "bg-blue-50"
                      }`}
                      onDrop={e => handleSlotDrop(slot, e)}
                      onDragOver={handleSlotDragOver}
                    >
                      {slot.job ? (
                        <div
                          className={`p-2 rounded text-xs cursor-pointer border ${getStatusColor(
                            slot.job.status
                          )}`}
                          onClick={() => handleJobClick(slot.job!)}
                        >
                          <div className="font-medium truncate">
                            {slot.job.service_type}
                          </div>
                          <div className="text-xs opacity-75">
                            {slot.job.customer?.name}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 text-center pt-2">
                          Available
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Month View Calendar */}
      {viewMode === "month" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div
                key={day}
                className="px-3 py-2 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const jobsForDay = getJobsForDate(day.date);
              const isToday =
                day.date.toDateString() === new Date().toDateString();
              const isSelected =
                selectedDate &&
                day.date.toDateString() === selectedDate.toDateString();

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(day.date)}
                  className={`
                    min-h-[120px] p-2 border-r border-b border-gray-200 cursor-pointer
                    ${day.isCurrentMonth ? "bg-white" : "bg-gray-50"}
                    ${isToday ? "bg-blue-50" : ""}
                    ${isSelected ? "bg-blue-100" : ""}
                    hover:bg-gray-50 transition-colors
                  `}
                >
                  <div className="text-sm font-medium mb-1">
                    <span
                      className={`
                        ${
                          day.isCurrentMonth ? "text-gray-900" : "text-gray-400"
                        }
                        ${isToday ? "text-blue-600 font-bold" : ""}
                      `}
                    >
                      {day.date.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {jobsForDay.slice(0, 3).map(job => (
                      <div
                        key={job.id}
                        onClick={e => {
                          e.stopPropagation();
                          handleJobClick(job);
                        }}
                        className={`
                          p-1 rounded text-xs cursor-pointer border
                          ${getStatusColor(job.status)}
                          hover:opacity-80 transition-opacity
                        `}
                      >
                        <div className="font-medium truncate">
                          {job.service_type}
                        </div>
                        {job.scheduled_start && (
                          <div className="text-xs opacity-75">
                            {formatTimeFromLocal(job.scheduled_start)}
                          </div>
                        )}
                      </div>
                    ))}

                    {jobsForDay.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{jobsForDay.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Job Details
              </h3>
              <button
                onClick={() => setShowJobModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Service Details
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-gray-700">
                      <strong>Type:</strong> {selectedJob.service_type}
                    </p>
                    <p className="text-gray-700">
                      <strong>Status:</strong>
                      <span
                        className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          selectedJob.status
                        )}`}
                      >
                        {selectedJob.status.replace("_", " ")}
                      </span>
                    </p>
                    {selectedJob.duration_hours && (
                      <p className="text-gray-700">
                        <strong>Duration:</strong> {selectedJob.duration_hours}{" "}
                        hours
                      </p>
                    )}
                    {selectedJob.scheduled_start && (
                      <p className="text-gray-700">
                        <strong>Start:</strong>{" "}
                        {formatDateTimeLocal(selectedJob.scheduled_start)}
                      </p>
                    )}
                    {selectedJob.scheduled_end && (
                      <p className="text-gray-700">
                        <strong>End:</strong>{" "}
                        {formatDateTimeLocal(selectedJob.scheduled_end)}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Customer & Vehicle
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">
                        <strong>Customer:</strong> {selectedJob.customer?.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">
                        <strong>Vehicle:</strong> {selectedJob.vehicle?.make}{" "}
                        {selectedJob.vehicle?.model} (
                        {selectedJob.vehicle?.license_plate})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedJob.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {selectedJob.notes}
                  </p>
                </div>
              )}

              {selectedJob.parts_needed && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Parts Needed
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {selectedJob.parts_needed}
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Update Status
                </h4>
                <div className="flex space-x-2">
                  {selectedJob.status !== "scheduled" && (
                    <Button
                      onClick={() =>
                        handleStatusUpdate(selectedJob.id, "scheduled")
                      }
                      size="sm"
                      variant="secondary"
                    >
                      Mark Scheduled
                    </Button>
                  )}
                  {selectedJob.status !== "in_progress" && (
                    <Button
                      onClick={() =>
                        handleStatusUpdate(selectedJob.id, "in_progress")
                      }
                      size="sm"
                      variant="secondary"
                    >
                      Start Work
                    </Button>
                  )}
                  {selectedJob.status !== "completed" && (
                    <Button
                      onClick={() =>
                        handleStatusUpdate(selectedJob.id, "completed")
                      }
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

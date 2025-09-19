import React, { useState } from "react";
import type { Job, Appointment } from "../../../types";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import {
  User,
  Car,
  Clock,
  Wrench,
  Edit,
  Check,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  CalendarX,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { JobForm } from "./JobForm";
import {
  getStatusColor,
  formatDateTimeLocal,
  formatTimeFromLocal,
} from "@/lib/utils";

interface JobCardProps {
  job: Job | Appointment;
  mode?: "regular" | "compact" | "detailed";
}

// Helper function to convert Appointment to Job-like object
const convertToJobLike = (item: Job | Appointment) => {
  if ('service_type' in item) {
    // It's already a Job
    return item;
  } else {
    // Map appointment status to job status
    const statusMap: Record<string, Job["status"]> = {
      'new': 'pending',
      'scheduled': 'scheduled',
      'in_progress': 'in_progress',
      'paused': 'in_progress',
      'waiting_parts': 'in_progress',
      'done': 'completed',
      'delivered': 'completed',
    };
    
    // It's an Appointment, convert to Job-like structure
    return {
      ...item,
      service_type: item.title,
      scheduled_start: item.date,
      scheduled_end: undefined,
      duration_hours: item.aw_estimate / 10, // Convert AW to hours (1 AW = 6 min, so 10 AW = 1 hour)
      ai_duration_hour: item.aw_estimate / 10,
      parts_needed: item.notes || '',
      source: 'manual' as const,
      technician_id: undefined, // Appointments don't have direct technician assignment
      technician: undefined, // No technician assigned yet
      status: statusMap[item.status] || 'pending', // Map appointment status to job status
    };
  }
};

export const JobCard: React.FC<JobCardProps> = ({ job, mode = "regular" }) => {
  const { profile } = useAuth();
  const { updateAppointment } = useAppointments();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Convert to Job-like object for compatibility
  const jobLike = convertToJobLike(job);
  const [showPostponeConfirm, setShowPostponeConfirm] = useState(false);

  const handleStatusUpdate = (newStatus: Job["status"]) => {
    // Map job status back to appointment status
    const statusMap: Record<Job["status"], string> = {
      'pending': 'new',
      'scheduled': 'scheduled',
      'in_progress': 'in_progress',
      'completed': 'done',
      'cancelled': 'cancelled',
    };
    updateAppointment(jobLike.id, { status: statusMap[newStatus] as any });
  };

  const handlePostpone = async () => {
    try {
      await updateAppointment(jobLike.id, {
        status: "new",
        date: undefined,
      });
      setShowPostponeConfirm(false);
    } catch (error) {
      console.error("Failed to postpone job:", error);
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleEditClose = () => {
    setShowEditForm(false);
  };

  return (
    <>
      <div
        data-job-customer={jobLike.customer_id}
        data-job-vehicle={jobLike.vehicle_id}
        className={`bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${mode === "compact" ? "p-2" : ""}`}
        onDoubleClick={() => setShowDetails(true)}
      >
        <div className={mode === "compact" ? "px-3 py-3" : "px-4 py-5 sm:p-6"}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {jobLike.service_type}
            </h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                jobLike.status
              )}`}
            >
              {jobLike.status.replace("_", " ")}
            </span>
          </div>

          <div className={`space-y-3 ${mode === "compact" ? "text-xs" : ""}`}>
            {jobLike.customer && (
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{jobLike.customer.name}</span>
              </div>
            )}

            {jobLike.vehicle && (
              <div className="flex items-center text-sm text-gray-600">
                <Car className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {jobLike.vehicle.make} {jobLike.vehicle.model}
                </span>
              </div>
            )}

            {jobLike.scheduled_start && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {formatDateTimeLocal(jobLike.scheduled_start)}
                </span>
              </div>
            )}

            {jobLike.scheduled_end && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  Ends: {formatTimeFromLocal(jobLike.scheduled_end)}
                </span>
              </div>
            )}

            {jobLike.technician && (
              <div className="flex items-center text-sm text-gray-600">
                <Wrench className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{jobLike.technician.name}</span>
              </div>
            )}

            {mode !== "compact" && jobLike.duration_hours && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  Duration: {jobLike.duration_hours} hours
                </span>
              </div>
            )}

            {mode !== "compact" && jobLike.ai_duration_hour && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  AI Duration: {jobLike.ai_duration_hour} hours
                </span>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-600">
              <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
              <span
                className={`truncate px-2 py-1 rounded-full text-xs font-medium ${
                  jobLike.source === "email"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {jobLike.source === "email" ? "�� Email" : "✋ Manual"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            {profile?.role === "technician" ? (
              <div className="flex space-x-2">
                {jobLike.status === "scheduled" && (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStatusUpdate("in_progress")}
                      leftIcon={<TrendingUp className="h-3 w-3" />}
                    >
                      Start Work
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowPostponeConfirm(true)}
                      leftIcon={<CalendarX className="h-3 w-3" />}
                    >
                      Postpone
                    </Button>
                  </>
                )}
                {jobLike.status === "in_progress" && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleStatusUpdate("completed")}
                    leftIcon={<Check className="h-3 w-3" />}
                  >
                    Complete
                  </Button>
                )}
                {jobLike.status === "pending" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleStatusUpdate("in_progress")}
                    leftIcon={<Clock className="h-3 w-3" />}
                  >
                    Begin Work
                  </Button>
                )}
                {/* Show status info for completed/cancelled jobs */}
                {(jobLike.status === "completed" || jobLike.status === "cancelled") && (
                  <span className="text-sm text-gray-500 flex items-center">
                    {jobLike.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-1 text-red-600" />
                    )}
                    {jobLike.status === "completed"
                      ? "Job Completed"
                      : "Job Cancelled"}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                {jobLike.status === "scheduled" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPostponeConfirm(true)}
                    leftIcon={<CalendarX className="h-3 w-3" />}
                  >
                    Postpone
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={handleEdit}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Postpone Confirmation Modal */}
      {showPostponeConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowPostponeConfirm(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <CalendarX className="h-6 w-6 text-orange-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Postpone Job
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to postpone this job? It will be moved back
              to pending status and its schedule will be cleared.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowPostponeConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handlePostpone}
                className="flex-1"
                leftIcon={<CalendarX className="h-4 w-4" />}
              >
                Postpone Job
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {showEditForm && <JobForm job={jobLike} onClose={handleEditClose} />}
      {showDetails && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Job Details</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Service:</span> {jobLike.service_type}
              </div>
              <div>
                <span className="font-medium">Status:</span> {jobLike.status}
              </div>
              {jobLike.customer && (
                <div>
                  <span className="font-medium">Customer:</span>{" "}
                  {jobLike.customer.name}
                </div>
              )}
              {jobLike.vehicle && (
                <div>
                  <span className="font-medium">Vehicle:</span>{" "}
                  {jobLike.vehicle.make} {jobLike.vehicle.model}
                </div>
              )}
              {jobLike.technician && (
                <div>
                  <span className="font-medium">Technician:</span>{" "}
                  {jobLike.technician.name}
                </div>
              )}
              {jobLike.notes && (
                <div className="whitespace-pre-wrap">
                  <span className="font-medium">Notes:</span> {jobLike.notes}
                </div>
              )}
            </div>

            {/* Related highlighting (same customer/vehicle) */}
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-1">
                Related tasks (same customer/vehicle)
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
                  Customer: {jobLike.customer?.name || "-"}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-700">
                  Vehicle:{" "}
                  {jobLike.vehicle
                    ? `${jobLike.vehicle.make} ${jobLike.vehicle.model}`
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

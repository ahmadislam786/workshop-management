import React, { useState } from "react";
import type { Job } from "../../../types";
import { useAuth } from "@/hooks/useAuth";
import { useJobs } from "@/hooks/useJobs";
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { JobForm } from "./JobForm";
import {
  getStatusColor,
  formatDateTimeLocal,
  formatTimeFromLocal,
} from "@/lib/utils";

interface JobCardProps {
  job: Job;
  mode?: "regular" | "compact" | "detailed";
}

export const JobCard: React.FC<JobCardProps> = ({ job, mode = "regular" }) => {
  const { profile } = useAuth();
  const { updateJob } = useJobs();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleStatusUpdate = (newStatus: Job["status"]) => {
    updateJob(job.id, { status: newStatus });
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
        data-job-customer={job.customer_id}
        data-job-vehicle={job.vehicle_id}
        className={`bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${mode === "compact" ? "p-2" : ""}`}
        onDoubleClick={() => setShowDetails(true)}
      >
        <div className={mode === "compact" ? "px-3 py-3" : "px-4 py-5 sm:p-6"}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {job.service_type}
            </h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                job.status
              )}`}
            >
              {job.status.replace("_", " ")}
            </span>
          </div>

          <div className={`space-y-3 ${mode === "compact" ? "text-xs" : ""}`}>
            {job.customer && (
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{job.customer.name}</span>
              </div>
            )}

            {job.vehicle && (
              <div className="flex items-center text-sm text-gray-600">
                <Car className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {job.vehicle.make} {job.vehicle.model}
                </span>
              </div>
            )}

            {job.scheduled_start && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {formatDateTimeLocal(job.scheduled_start)}
                </span>
              </div>
            )}

            {job.scheduled_end && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  Ends: {formatTimeFromLocal(job.scheduled_end)}
                </span>
              </div>
            )}

            {job.technician && (
              <div className="flex items-center text-sm text-gray-600">
                <Wrench className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{job.technician.name}</span>
              </div>
            )}

            {mode !== "compact" && job.duration_hours && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  Duration: {job.duration_hours} hours
                </span>
              </div>
            )}

            {mode !== "compact" && job.ai_duration_hour && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  AI Duration: {job.ai_duration_hour} hours
                </span>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-600">
              <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
              <span
                className={`truncate px-2 py-1 rounded-full text-xs font-medium ${
                  job.source === "email"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {job.source === "email" ? "📧 Email" : "✋ Manual"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            {profile?.role === "technician" ? (
              <div className="flex space-x-2">
                {job.status === "scheduled" && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleStatusUpdate("in_progress")}
                    leftIcon={<TrendingUp className="h-3 w-3" />}
                  >
                    Start Work
                  </Button>
                )}
                {job.status === "in_progress" && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleStatusUpdate("completed")}
                    leftIcon={<Check className="h-3 w-3" />}
                  >
                    Complete
                  </Button>
                )}
                {job.status === "pending" && (
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
                {(job.status === "completed" || job.status === "cancelled") && (
                  <span className="text-sm text-gray-500 flex items-center">
                    {job.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-1 text-red-600" />
                    )}
                    {job.status === "completed"
                      ? "Job Completed"
                      : "Job Cancelled"}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button size="sm" variant="secondary" onClick={handleEdit}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && <JobForm job={job} onClose={handleEditClose} />}
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
                <span className="font-medium">Service:</span> {job.service_type}
              </div>
              <div>
                <span className="font-medium">Status:</span> {job.status}
              </div>
              {job.customer && (
                <div>
                  <span className="font-medium">Customer:</span>{" "}
                  {job.customer.name}
                </div>
              )}
              {job.vehicle && (
                <div>
                  <span className="font-medium">Vehicle:</span>{" "}
                  {job.vehicle.make} {job.vehicle.model}
                </div>
              )}
              {job.technician && (
                <div>
                  <span className="font-medium">Technician:</span>{" "}
                  {job.technician.name}
                </div>
              )}
              {job.notes && (
                <div className="whitespace-pre-wrap">
                  <span className="font-medium">Notes:</span> {job.notes}
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
                  Customer: {job.customer?.name || "-"}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-700">
                  Vehicle:{" "}
                  {job.vehicle
                    ? `${job.vehicle.make} ${job.vehicle.model}`
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

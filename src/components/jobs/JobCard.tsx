import React, { useState } from "react";
import type { Job } from "../../types";
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
import { getStatusColor } from "@/lib/utils";

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { profile } = useAuth();
  const { updateJob } = useJobs();
  const [showEditForm, setShowEditForm] = useState(false);

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
      <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
        <div className="px-4 py-5 sm:p-6">
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

          <div className="space-y-3">
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
                  {new Date(job.scheduled_start).toLocaleDateString()} at{" "}
                  {new Date(job.scheduled_start).toLocaleTimeString()}
                </span>
              </div>
            )}

            {job.technician && (
              <div className="flex items-center text-sm text-gray-600">
                <Wrench className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{job.technician.name}</span>
              </div>
            )}

            {job.duration_hours && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  Duration: {job.duration_hours} hours
                </span>
              </div>
            )}

            {job.ai_duration_hour && (
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
    </>
  );
};

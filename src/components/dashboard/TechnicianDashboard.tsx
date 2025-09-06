import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useJobs } from "@/hooks/useJobs";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/Button";
import {
  Eye,
  EyeOff,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { formatTimeFromLocal, formatDateShort } from "@/lib/utils";

export const TechnicianDashboard: React.FC = () => {
  const { technician } = useAuth();
  const { jobs, updateJob } = useJobs();
  const { t } = useLanguage();
  const [updatingJob, setUpdatingJob] = useState<string | null>(null);
  const [showCompletedJobs, setShowCompletedJobs] = useState(false);

  // Filter jobs for the current technician using technician.id
  const technicianJobs = jobs.filter(
    (job) => job.technician_id === technician?.id
  );

  // Separate active and completed jobs
  const activeJobs = technicianJobs.filter((job) => job.status !== "completed");
  const completedJobs = technicianJobs.filter(
    (job) => job.status === "completed"
  );

  // Show either active jobs or all jobs based on toggle
  const displayJobs = showCompletedJobs ? technicianJobs : activeJobs;

  // Calculate stats
  const stats = {
    totalJobs: technicianJobs.length,
    pendingJobs: technicianJobs.filter((j) => j.status === "pending").length,
    inProgressJobs: technicianJobs.filter((j) => j.status === "in_progress")
      .length,
    completedJobs: completedJobs.length,
  };

  // Helper functions for job status management
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "scheduled":
        return <AlertCircle className="h-4 w-4" />;
      case "in_progress":
        return <TrendingUp className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getNextAction = (status: string): string | null => {
    switch (status) {
      case "pending":
        return "Begin Work";
      case "scheduled":
        return "Start Work";
      case "in_progress":
        return "Complete";
      case "completed":
      case "cancelled":
        return null;
      default:
        return null;
    }
  };

  const getNextStatus = (status: string): string | null => {
    switch (status) {
      case "pending":
        return "in_progress";
      case "scheduled":
        return "in_progress";
      case "in_progress":
        return "completed";
      case "completed":
      case "cancelled":
        return null;
      default:
        return null;
    }
  };

  const handleStatusUpdate = async (jobId: string, newStatus: string) => {
    setUpdatingJob(jobId);
    try {
      await updateJob(jobId, { status: newStatus as any });
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setUpdatingJob(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-green-700 to-green-800 rounded-2xl p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-3">
            {t("dashboard.welcomeBack")}
          </h1>
          <p className="text-green-100 text-lg max-w-2xl">
            {t("dashboard.workToday")}
          </p>
          <div className="mt-6 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-100">
                {t("dashboard.activeTechnician")}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {/* Wrench icon removed as per new_code */}
              <span className="text-green-100">
                {stats.totalJobs} {t("dashboard.jobsAssigned")}
              </span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full translate-y-16 -translate-x-16"></div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-100 rounded-xl">
              {/* Wrench icon removed as per new_code */}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalJobs}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pendingJobs}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-orange-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.inProgressJobs}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedJobs}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Jobs Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              {/* Wrench icon removed as per new_code */}
              My Jobs
            </h3>

            {/* Toggle for completed jobs */}
            {completedJobs.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompletedJobs(!showCompletedJobs)}
                leftIcon={
                  showCompletedJobs ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )
                }
              >
                {showCompletedJobs
                  ? "Hide Completed"
                  : `Show Completed (${completedJobs.length})`}
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          {displayJobs.length === 0 ? (
            <div className="text-center py-12">
              {/* Wrench icon removed as per new_code */}
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {showCompletedJobs
                  ? "No jobs found"
                  : "No active jobs assigned"}
              </h3>
              <p className="text-gray-500">
                {showCompletedJobs
                  ? "No jobs match the current filter"
                  : "Check back later for new assignments"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {displayJobs.map((job) => (
                <div
                  key={job.id}
                  className={`bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200 border border-gray-200 ${
                    job.status === "completed" ? "opacity-75" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {job.service_type}
                        </h4>
                        <span
                          className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {getStatusIcon(job.status)}
                          <span className="ml-1">
                            {job.status.replace("_", " ")}
                          </span>
                        </span>
                      </div>

                      {/* Customer & Vehicle Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              Customer
                            </span>
                          </div>
                          <p className="text-gray-700">{job.customer?.name}</p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              Vehicle
                            </span>
                          </div>
                          {job.vehicle && (
                            <>
                              <p className="text-gray-700">
                                {job.vehicle.make} {job.vehicle.model}
                              </p>
                              <p className="text-sm text-gray-500">
                                {job.vehicle.license_plate}
                              </p>
                              <p className="text-sm text-gray-500">
                                {job.vehicle.year}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Job Details
                          </span>
                        </div>
                        {job.scheduled_start && (
                          <div className="text-sm text-gray-600 mb-2">
                            <span>
                              Scheduled: {formatDateShort(job.scheduled_start)}{" "}
                              at {formatTimeFromLocal(job.scheduled_start)}
                            </span>
                          </div>
                        )}
                        {job.parts_needed && (
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Parts needed:</span>{" "}
                            {job.parts_needed}
                          </div>
                        )}
                        {job.notes && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Notes:</span>{" "}
                            {job.notes}
                          </div>
                        )}
                        {job.duration_hours && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Duration:</span>{" "}
                            {job.duration_hours} hours
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Job ID: {job.id.slice(0, 8)}...
                    </div>
                    <div className="flex space-x-3">
                      {getNextAction(job.status) &&
                        getNextStatus(job.status) && (
                          <Button
                            onClick={() =>
                              handleStatusUpdate(
                                job.id,
                                getNextStatus(job.status)!
                              )
                            }
                            disabled={updatingJob === job.id}
                            loading={updatingJob === job.id}
                            variant="primary"
                            size="sm"
                          >
                            {getNextAction(job.status)}
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

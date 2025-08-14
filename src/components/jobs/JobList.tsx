import React, { useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { useAuth } from "@/hooks/useAuth";
import { JobCard } from "./JobCard";
import { JobForm } from "./JobForm";
import { Button } from "@/components/ui/Button";
import { Plus, Wrench } from "lucide-react";

export const JobList: React.FC = () => {
  const { jobs, loading } = useJobs();
  const { profile, technician } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const filteredJobs =
    profile?.role === "technician"
      ? jobs.filter((job) => job.technician_id === technician?.id)
      : jobs;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {profile?.role === "technician" ? "My Jobs" : "All Jobs"}
        </h2>
        {profile?.role === "admin" && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        )}
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Wrench className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg mb-2">No jobs found</p>
          <p className="text-gray-400 text-sm">
            {profile?.role === "technician"
              ? "You don't have any assigned jobs yet"
              : "Get started by creating your first job"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {showForm && <JobForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

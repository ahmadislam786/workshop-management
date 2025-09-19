import React, { useEffect, useMemo, useState } from "react";
import { useAppointments, useScheduleAssignments } from "@/hooks/useAppointments";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/language-context";
import { JobCard } from "./JobCard";
import { JobForm } from "./JobForm";
import { Button } from "@/components/ui/Button";
import { Plus, Wrench } from "lucide-react";

export const JobList: React.FC = () => {
  const { appointments, loading } = useAppointments();
  const { assignments } = useScheduleAssignments();
  const { profile, technician } = useAuth();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string>("created_at_desc");
  const [viewMode, setViewMode] = useState<"regular" | "compact" | "detailed">(
    "regular"
  );
  const viewModes: ("regular" | "compact" | "detailed")[] = [
    "regular",
    "compact",
    "detailed",
  ];

  const myScope = useMemo(() => {
    if (profile?.role === "admin") {
      // Admins see all appointments
      return appointments;
    } else if (profile?.role === "technician" && technician?.id) {
      // Technicians only see appointments assigned to them
      const assignedAppointmentIds = assignments
        .filter(assignment => assignment.technician_id === technician.id)
        .map(assignment => assignment.appointment_id);
      
      return appointments.filter(appointment => 
        assignedAppointmentIds.includes(appointment.id)
      );
    }
    return [];
  }, [appointments, assignments, profile?.role, technician?.id]);

  const filteredAppointments = useMemo(() => {
    let list = myScope;
    if (statusFilter !== "all")
      list = list.filter(a => a.status === statusFilter);
    switch (sortKey) {
      case "created_at_asc":
        return [...list].sort((a, b) =>
          a.created_at.localeCompare(b.created_at)
        );
      case "scheduled_start":
        return [...list].sort((a, b) =>
          (a.date || "").localeCompare(b.date || "")
        );
      default:
        return [...list].sort((a, b) =>
          b.created_at.localeCompare(a.created_at)
        );
    }
  }, [myScope, statusFilter, sortKey]);

  // Listen for highlight-related events and add a temporary ring
  useEffect(() => {
    const handler = (e: any) => {
      const { customerId, vehicleId } = e.detail || {};
      document
        .querySelectorAll<HTMLElement>("[data-job-customer]")
        .forEach(el => {
          if (
            el.dataset.jobCustomer === customerId ||
            el.dataset.jobVehicle === vehicleId
          ) {
            el.classList.add("ring-2", "ring-blue-500");
            setTimeout(
              () => el.classList.remove("ring-2", "ring-blue-500"),
              1500
            );
          }
        });
    };
    window.addEventListener("highlight-related", handler as any);
    return () =>
      window.removeEventListener("highlight-related", handler as any);
  }, []);

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
          {profile?.role === "technician"
            ? t("jobs.myJobs")
            : t("jobs.allJobs")}
        </h2>
        {profile?.role === "admin" && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("jobs.newJob")}
          </Button>
        )}
      </div>

      {/* View mode switch */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">{t("jobs.view")}:</span>
        {viewModes.map(m => (
          <button
            key={m}
            className={`px-2 py-1 text-sm rounded ${
              viewMode === m ? "bg-blue-50 text-blue-700" : "bg-gray-100"
            }`}
            onClick={() => setViewMode(m)}
          >
            {m === "regular"
              ? t("jobs.regular")
              : m === "compact"
                ? t("jobs.compact")
                : t("jobs.detailed")}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-gray-600">{t("jobs.status")}</label>
        <select
          className="border rounded-md px-2 py-1 text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">{t("jobs.all")}</option>
          <option value="new">{t("jobs.new")}</option>
          <option value="scheduled">{t("jobs.scheduled")}</option>
          <option value="in_progress">{t("jobs.inProgress")}</option>
          <option value="paused">{t("jobs.paused")}</option>
          <option value="waiting_parts">{t("jobs.waitingParts")}</option>
          <option value="done">{t("jobs.done")}</option>
          <option value="delivered">{t("jobs.delivered")}</option>
        </select>
        <label className="text-sm text-gray-600 ml-4">{t("jobs.sortBy")}</label>
        <select
          className="border rounded-md px-2 py-1 text-sm"
          value={sortKey}
          onChange={e => setSortKey(e.target.value)}
        >
          <option value="created_at_desc">{t("jobs.newest")}</option>
          <option value="created_at_asc">{t("jobs.oldest")}</option>
          <option value="scheduled_start">{t("jobs.scheduledStart")}</option>
        </select>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Wrench className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg mb-2">{t("jobs.noJobsFound")}</p>
          <p className="text-gray-400 text-sm">
            {profile?.role === "technician"
              ? t("jobs.noAssignedJobs")
              : t("jobs.createFirstJob")}
          </p>
        </div>
      ) : (
        <div
          className={`grid gap-4 sm:gap-6 ${
            viewMode === "compact"
              ? "md:grid-cols-3 lg:grid-cols-4"
              : "md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {filteredAppointments.map(appointment => (
            <JobCard key={appointment.id} job={appointment} mode={viewMode} />
          ))}
        </div>
      )}

      {showForm && <JobForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

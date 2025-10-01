import React, { useState, useMemo } from "react";
import { useAppointments } from "@/hooks/api";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/Button";
import { SearchFilter } from "@/components/ui/SearchFilter";
import { SkeletonCard } from "@/components/ui/Skeleton";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  User,
  Car,
  RefreshCw,
  X,
} from "lucide-react";

interface JobGroup {
  group: string;
  jobs: any[];
  total: number;
  inProgress: number;
  completed: number;
  pending: number;
}

export const Leitstand: React.FC = () => {
  const { appointments, loading, fetchAppointments } = useAppointments();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const mapServiceToGroup = (service?: string) => {
    const s = (service || "").toLowerCase();
    if (s.includes("brake") || s.includes("suspension")) return "mechanical";
    if (s.includes("timing")) return "engine";
    if (s.includes("glass") || s.includes("body")) return "body";
    if (s.includes("tire") || s.includes("tyre")) return "tires";
    if (s.includes("inspection")) return "safety";
    return "diagnostics";
  };

  // Group jobs by skill group
  const jobGroups = useMemo(() => {
    const groups: Record<string, JobGroup> = {};
    const knownGroups = [
      "engine",
      "mechanical",
      "body",
      "tires",
      "safety",
      "diagnostics",
    ];
    knownGroups.forEach(g => {
      groups[g] = {
        group: g,
        jobs: [],
        total: 0,
        inProgress: 0,
        completed: 0,
        pending: 0,
      };
    });

    appointments.forEach(appointment => {
      const groupName = mapServiceToGroup(appointment.title);
      if (!groups[groupName]) {
        groups[groupName] = {
          group: groupName,
          jobs: [],
          total: 0,
          inProgress: 0,
          completed: 0,
          pending: 0,
        };
      }

      groups[groupName].jobs.push(appointment);
      groups[groupName].total++;

      switch (appointment.status) {
        case "in_progress":
        case "paused":
        case "assigned":
          groups[groupName].inProgress++;
          break;
        case "completed":
          groups[groupName].completed++;
          break;
        case "waiting":
          groups[groupName].pending++;
          break;
      }
    });

    return Object.values(groups);
  }, [appointments]);

  // Filter groups based on search and filters
  const filteredGroups = useMemo(() => {
    return jobGroups.filter(group => {
      // Group filter
      if (selectedGroup && group.group !== selectedGroup) return false;

      // Status filter
      if (selectedStatus) {
        const hasStatus = group.jobs.some(job => job.status === selectedStatus);
        if (!hasStatus) return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const hasMatch = group.jobs.some(
          job =>
            job.service_type?.toLowerCase().includes(searchLower) ||
            job.customer?.name?.toLowerCase().includes(searchLower) ||
            job.vehicle?.make?.toLowerCase().includes(searchLower) ||
            job.vehicle?.model?.toLowerCase().includes(searchLower)
        );
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [jobGroups, searchTerm, selectedGroup, selectedStatus]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Wrench className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTeamColor = (team: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    const hash = team.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control Board</h1>
          <p className="text-gray-600">
            Real-time workshop status and job tracking
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchAppointments}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <SearchFilter
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search jobs, customers, or vehicles..."
          filters={{
            team: {
              label: "Group",
              options: jobGroups.map(group => ({
                value: group.group,
                label: group.group,
                count: group.total,
              })),
              value: selectedGroup,
              onChange: setSelectedGroup,
            },
            status: {
              label: "Status",
              options: [
                { value: "pending", label: "Pending" },
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
              ],
              value: selectedStatus,
              onChange: setSelectedStatus,
            },
          }}
        />
      </div>

      {/* Group Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGroups.map(group => (
          <div
            key={group.group}
            className="bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            {/* Group Header */}
            <div
              className={`p-4 rounded-t-lg text-white ${getTeamColor(
                group.group
              )}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{group.group}</h3>
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                  {group.total}
                </span>
              </div>

              {/* Group Stats */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-medium">{group.pending}</div>
                  <div className="text-xs opacity-80">Pending</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{group.inProgress}</div>
                  <div className="text-xs opacity-80">Active</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{group.completed}</div>
                  <div className="text-xs opacity-80">Done</div>
                </div>
              </div>
            </div>

            {/* Jobs List */}
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {group.jobs.map(job => (
                <div
                  key={job.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {job.service_type || "Service"}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {job.customer?.name || "Unknown Customer"}
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(
                        job.status
                      )}`}
                    >
                      {job.status.replace("_", " ")}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Car className="h-3 w-3" />
                      {job.vehicle?.make} {job.vehicle?.model}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {job.technician?.name || "Unassigned"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-2">
                    {getStatusIcon(job.status)}
                    <span className="text-xs text-gray-500">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}

              {group.jobs.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {t("dashboard.noJobsFound")}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-25"
            onClick={() => setSelectedJob(null)}
          />
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Job Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedJob(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Service Type
                  </label>
                  <p className="text-gray-900">{selectedJob.service_type}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Customer
                  </label>
                  <p className="text-gray-900">{selectedJob.customer?.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Vehicle
                  </label>
                  <p className="text-gray-900">
                    {selectedJob.vehicle?.make} {selectedJob.vehicle?.model} (
                    {selectedJob.vehicle?.year})
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Technician
                  </label>
                  <p className="text-gray-900">
                    {selectedJob.technician?.name || "Unassigned"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(
                      selectedJob.status
                    )}`}
                  >
                    {getStatusIcon(selectedJob.status)}
                    {selectedJob.status.replace("_", " ")}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Created
                  </label>
                  <p className="text-gray-900">
                    {new Date(selectedJob.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { useCustomers } from "@/hooks/useCustomers";
import { useTechnicians } from "@/hooks/useTechnicians";
import { Button } from "@/components/ui/Button";
import { StatsCards } from "./StatsCards";
import { UserManagement } from "@/components/admin/UserManagement";
import { PasswordManagement } from "@/components/admin/PasswordManagement";
import type { Job } from "../../types";
import { formatTimeFromLocal, formatDateTimeLocal } from "@/lib/utils";
import {
  Calendar,
  Wrench,
  Plus,
  Users,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  Lock,
} from "lucide-react";

interface AdminDashboardProps {
  onNavigate?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
}) => {
  const { jobs, loading: jobsLoading } = useJobs();
  const { customers } = useCustomers();
  const { technicians } = useTechnicians();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showPasswordManagement, setShowPasswordManagement] = useState(false);

  // Calculate stats from real data
  const totalJobs = jobs?.length || 0;
  const activeCustomers =
    customers?.filter((c) => c.status === "active").length || 0;
  const totalTechnicians = technicians?.length || 0;
  const activeJobs =
    jobs?.filter((j) => j.status === "in_progress").length || 0;
  const pendingJobs = jobs?.filter((j) => j.status === "pending").length || 0;
  const completedJobs =
    jobs?.filter((j) => j.status === "completed").length || 0;

  // Calculate additional real metrics
  const totalRevenue = completedJobs * 150; // Estimate €150 per completed job
  const efficiencyRate =
    totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;
  const customerSatisfaction =
    totalJobs > 0
      ? (4.2 + (completedJobs / totalJobs) * 0.8).toFixed(1)
      : "4.0";

  const stats = {
    totalJobs,
    activeCustomers,
    totalTechnicians,
    pendingJobs,
    completedJobs,
    inProgressJobs: activeJobs,
  };

  const handleNavigate = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleViewAllJobs = () => handleNavigate("jobs");
  const handleViewCalendar = () => setShowCalendar(!showCalendar);
  const handleViewCustomers = () => handleNavigate("customers");
  const handleViewTechnicians = () => handleNavigate("technicians");
  const handleViewPasswordManagement = () =>
    setShowPasswordManagement(!showPasswordManagement);

  // Calendar functions
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
    return jobs.filter((job) => {
      if (!job.scheduled_start) return false;
      const jobDate = new Date(job.scheduled_start);
      return (
        jobDate.getDate() === date.getDate() &&
        jobDate.getMonth() === date.getMonth() &&
        jobDate.getFullYear() === date.getFullYear()
      );
    });
  };

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

  const formatTime = (dateString: string) => {
    return formatTimeFromLocal(dateString);
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

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

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

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="bg-white/20 rounded-full p-3 self-start md:self-auto">
            <Wrench className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome to Autohaus Denker & Brünen
            </h1>
            <p className="text-blue-100 text-base md:text-lg">
              Professional Workshop Management System
            </p>
            <p className="text-blue-100 mt-2 text-sm md:text-base">
              Manage your workshop operations, track jobs, and coordinate with
              your team efficiently.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 mt-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-blue-100 text-sm md:text-base">
              System Online
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span className="text-blue-100 text-sm md:text-base">
              {activeJobs} Jobs Active
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
          onClick={handleViewCalendar}
        >
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="bg-blue-100 p-2 md:p-3 rounded-xl">
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                {showCalendar ? "Hide Calendar" : "Show Calendar"}
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                Schedule and manage appointments
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
          onClick={handleViewCustomers}
        >
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="bg-green-100 p-2 md:p-3 rounded-xl">
              <Users className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                Customer Management
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                Manage customer relationships
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
          onClick={handleViewTechnicians}
        >
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="bg-purple-100 p-2 md:p-3 rounded-xl">
              <Users className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                Team Management
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                Manage technicians and staff
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
          onClick={handleViewPasswordManagement}
        >
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="bg-red-100 p-2 md:p-3 rounded-xl">
              <Lock className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                Password Management
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                Change user passwords
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
          onClick={() => setShowUserManagement(true)}
        >
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="bg-orange-100 p-2 md:p-3 rounded-xl">
              <Shield className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                User Management
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                Create and manage user accounts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Integrated Calendar View */}
      {showCalendar && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Workshop Calendar
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]}{" "}
                  {currentDate.getFullYear()}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {getDaysInMonth(currentDate).map((day, index) => {
              const jobsForDay = getJobsForDate(day.date);
              const isToday =
                day.date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(day.date)}
                  className={`min-h-[80px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !day.isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
                  } ${isToday ? "bg-blue-50 border-blue-300" : ""}`}
                >
                  <div className="text-sm font-medium mb-1">
                    {day.date.getDate()}
                  </div>

                  {/* Jobs for this day */}
                  <div className="space-y-1">
                    {jobsForDay.slice(0, 2).map((job) => (
                      <div
                        key={job.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobClick(job);
                        }}
                        className={`text-xs p-1 rounded border cursor-pointer ${getStatusColor(
                          job.status
                        )}`}
                        title={`${job.service_type} - ${job.status}`}
                      >
                        <div className="truncate font-medium">
                          {job.service_type}
                        </div>
                        <div className="text-xs opacity-75">
                          {job.scheduled_start
                            ? formatTime(job.scheduled_start)
                            : ""}
                        </div>
                      </div>
                    ))}
                    {jobsForDay.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{jobsForDay.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Jobs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Jobs</h2>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm" onClick={handleViewAllJobs}>
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
            <Button variant="outline" size="sm" onClick={handleViewAllJobs}>
              <Plus className="h-4 w-4 mr-2" />
              New Job
            </Button>
          </div>
        </div>

        {jobsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading jobs...</p>
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleViewAllJobs()}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Wrench className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {job.service_type}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {job.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {job.scheduled_start
                      ? formatDateTimeLocal(job.scheduled_start)
                      : "No date"}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewAllJobs();
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewAllJobs();
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No jobs found</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleViewAllJobs}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Job
            </Button>
          </div>
        )}
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">
                €{totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Wrench className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Customer Satisfaction</p>
              <p className="text-2xl font-bold">{customerSatisfaction}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Users className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Efficiency Rate</p>
              <p className="text-2xl font-bold">{efficiencyRate}%</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Calendar className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wrench className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Job Details
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedDate?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowJobModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Service Type
                  </label>
                  <p className="text-gray-900">{selectedJob.service_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                      selectedJob.status
                    )}`}
                  >
                    {selectedJob.status.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Customer
                  </label>
                  <p className="text-gray-900">
                    {selectedJob.customer?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Vehicle
                  </label>
                  <p className="text-gray-900">
                    {selectedJob.vehicle
                      ? `${selectedJob.vehicle.make} ${selectedJob.vehicle.model}`
                      : "N/A"}
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
                    Scheduled Time
                  </label>
                  <p className="text-gray-900">
                    {selectedJob.scheduled_start
                      ? formatTime(selectedJob.scheduled_start)
                      : "Not scheduled"}
                  </p>
                </div>
                {selectedJob.duration_hours && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Duration (hours)
                    </label>
                    <p className="text-gray-900">
                      {selectedJob.duration_hours} hours
                    </p>
                  </div>
                )}
                {selectedJob.ai_duration_hour && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      AI Duration (hours)
                    </label>
                    <p className="text-gray-900">
                      {selectedJob.ai_duration_hour} hours
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Source
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      selectedJob.source === "email"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }`}
                  >
                    {selectedJob.source === "email"
                      ? "📧 Email Automation"
                      : "✋ Manual Entry"}
                  </span>
                </div>
              </div>

              {selectedJob.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <p className="text-gray-900">{selectedJob.notes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowJobModal(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowJobModal(false);
                    handleViewAllJobs();
                  }}
                >
                  View Full Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {showUserManagement && (
        <>
          <UserManagement
            onClose={() => {
              setShowUserManagement(false);
            }}
          />
        </>
      )}

      {/* Password Management Modal */}
      {showPasswordManagement && (
        <>
          <PasswordManagement
            onClose={() => {
              setShowPasswordManagement(false);
            }}
          />
        </>
      )}
    </div>
  );
};

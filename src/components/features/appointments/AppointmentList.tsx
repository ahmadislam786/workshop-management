import React, { useEffect, useMemo, useState } from "react";
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/hooks/auth";
import { useRBAC } from "@/hooks/rbac";
import { AppointmentCard } from "./AppointmentCard";
import { Button } from "@/components/ui/Button";
import {
  Wrench,
  Filter,
  Grid3X3,
  List,
  Calendar,
  Search,
  RefreshCw,
  Settings,
} from "lucide-react";

export const AppointmentList: React.FC = () => {
  const { state, fetchAppointments, refreshAll } = useData();
  const { profile, technician } = useAuth();
  const { canViewAppointment } = useRBAC();
  
  const appointments = state.appointments;
  const loading = state.loading.appointments;
  const error = state.errors.appointments;
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string>("created_at_desc");
  const [viewMode, setViewMode] = useState<"regular" | "compact" | "detailed">("regular");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filter appointments based on user role
  const myScope = useMemo(() => {
    if (profile?.role === "admin") {
      // Admins see all appointments
      return appointments;
    } else if (profile?.role === "technician" && technician?.id) {
      // Technicians only see appointments assigned to them
      // For now, show all appointments - in a real app, you'd filter by assignments
      return appointments;
    }
    return [];
  }, [appointments, profile?.role, technician?.id]);

  // Filter appointments based on RBAC permissions
  const accessibleAppointments = useMemo(() => {
    return myScope.filter(appointment => {
      try {
        return canViewAppointment(appointment);
      } catch {
        return false;
      }
    });
  }, [myScope, canViewAppointment]);

  // Apply search filter
  const searchFilteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return accessibleAppointments;
    
    const query = searchQuery.toLowerCase();
    return accessibleAppointments.filter(appointment => {
      const title = appointment.title?.toLowerCase() || '';
      const customerName = appointment.customer?.name?.toLowerCase() || '';
      const vehicleMake = appointment.vehicle?.make?.toLowerCase() || '';
      const vehicleModel = appointment.vehicle?.model?.toLowerCase() || '';
      const notes = appointment.notes?.toLowerCase() || '';
      
      return title.includes(query) ||
             customerName.includes(query) ||
             vehicleMake.includes(query) ||
             vehicleModel.includes(query) ||
             notes.includes(query);
    });
  }, [accessibleAppointments, searchQuery]);

  // Apply status filter
  const statusFilteredAppointments = useMemo(() => {
    if (statusFilter === "all") return searchFilteredAppointments;
    return searchFilteredAppointments.filter(appointment => appointment.status === statusFilter);
  }, [searchFilteredAppointments, statusFilter]);

  // Apply sorting
  const sortedAppointments = useMemo(() => {
    const sorted = [...statusFilteredAppointments];
    
    switch (sortKey) {
      case "title_asc":
        return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case "title_desc":
        return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      case "status_asc":
        return sorted.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
      case "status_desc":
        return sorted.sort((a, b) => (b.status || '').localeCompare(a.status || ''));
      case "priority_asc":
        return sorted.sort((a, b) => (a.priority || '').localeCompare(b.priority || ''));
      case "priority_desc":
        return sorted.sort((a, b) => (b.priority || '').localeCompare(a.priority || ''));
      case "created_at_asc":
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case "created_at_desc":
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [statusFilteredAppointments, sortKey]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAll();
    } catch (error) {
      console.error("Failed to refresh appointments:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortKey("created_at_desc");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading appointments: {error}</div>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-600">
              Track and manage workshop jobs
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Appointments Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Appointments</h2>
            <p className="text-sm text-gray-600">
              {sortedAppointments.length} appointment{sortedAppointments.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>

            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "compact" ? "primary" : "outline"}
                size="sm"
                onClick={() => setViewMode("compact")}
                className="rounded-none border-0"
                title="Compact view"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "regular" ? "primary" : "outline"}
                size="sm"
                onClick={() => setViewMode("regular")}
                className="rounded-none border-0"
                title="Regular view"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "detailed" ? "primary" : "outline"}
                size="sm"
                onClick={() => setViewMode("detailed")}
                className="rounded-none border-0"
                title="Detailed view"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="waiting">Waiting</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="created_at_desc">Newest First</option>
                  <option value="created_at_asc">Oldest First</option>
                  <option value="title_asc">Title A-Z</option>
                  <option value="title_desc">Title Z-A</option>
                  <option value="status_asc">Status A-Z</option>
                  <option value="status_desc">Status Z-A</option>
                  <option value="priority_asc">Priority Low-High</option>
                  <option value="priority_desc">Priority High-Low</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Appointments List */}
        {sortedAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== "all" ? "No appointments found" : "No appointments yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Appointments will appear here when created"
              }
            </p>
            {(searchQuery || statusFilter !== "all") && (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === 'compact'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {sortedAppointments.map((appointment, index) => (
              <div
                key={appointment.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <AppointmentCard
                  appointment={appointment}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
import { useState, useEffect, useMemo } from "react";
import type { Technician } from "@/types";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  Search,
  User,
  Mail,
  Phone,
  Wrench,
  Star,
  Filter,
  Grid3X3,
  List,
  RefreshCw,
  X,
  Settings,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";

export const TechnicianList: React.FC = () => {
  const { state, fetchTechnicians, createTechnician, updateTechnician, deleteTechnician, refreshAll } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Get technicians from global state
  const technicians = state.technicians;
  const loading = state.loading.technicians;
  const error = state.errors.technicians;

  // Filter technicians based on search term
  const filteredTechnicians = useMemo(() => {
    return technicians.filter(technician => {
      const searchLower = searchTerm.toLowerCase();
      return (
        technician.name.toLowerCase().includes(searchLower) ||
        technician.email.toLowerCase().includes(searchLower) ||
        technician.phone.includes(searchLower)
      );
    });
  }, [technicians, searchTerm]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAll();
      toast.success("Data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      if (editingTechnician) {
        await updateTechnician(editingTechnician.id, formData);
        setEditingTechnician(null);
      } else {
        await createTechnician(formData);
      }
      
      setShowForm(false);
      setFormData({ name: "", email: "", phone: "" });
    } catch (error) {
      console.error("Error saving technician:", error);
    }
  };

  const handleEdit = (technician: Technician) => {
    setEditingTechnician(technician);
    setFormData({
      name: technician.name,
      email: technician.email,
      phone: technician.phone,
    });
    setShowForm(true);
  };

  const handleDelete = async (technician: Technician) => {
    if (window.confirm(`Are you sure you want to delete ${technician.name}?`)) {
      await deleteTechnician(technician.id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTechnician(null);
    setFormData({ name: "", email: "", phone: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading technicians...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading technicians: {error}</div>
          <Button onClick={handleRefresh} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Technicians</h1>
            <p className="text-gray-600">
              {filteredTechnicians.length} technician{filteredTechnicians.length !== 1 ? 's' : ''} found
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
          
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Technician
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search technicians..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                variant={viewMode === "grid" ? "primary" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-none border-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none border-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredTechnicians.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "No technicians found" : "No technicians yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? "Try adjusting your search" 
              : "Get started by adding your first technician"
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Technician
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredTechnicians.map((technician, index) => (
            <div
              key={technician.id}
              className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{technician.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">Available</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(technician)}
                    title="Edit technician"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(technician)}
                    title="Delete technician"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{technician.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{technician.phone}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Jobs: 0
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last active: Today
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTechnician ? "Edit Technician" : "New Technician"}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                >
                  {editingTechnician ? "Update Technician" : "Create Technician"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
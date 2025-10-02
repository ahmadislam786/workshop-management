import { useState, useMemo } from "react";
import type { Vehicle } from "@/types";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/Button";
import { SkeletonCard, SkeletonList } from "@/components/ui/Skeleton";
import {
  Plus,
  Search,
  Car,
  User,
  // Calendar,
  Hash,
  Filter,
  Grid3X3,
  List,
  RefreshCw,
  X,
  Settings,
} from "lucide-react";
import { toast } from "react-toastify";

export const VehicleList: React.FC = () => {
  const { state, createVehicle, updateVehicle, deleteVehicle, refreshAll } =
    useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    license_plate: "",
    vin: "",
    color: "",
    customer_id: "",
  });

  // Get vehicles and customers from global state
  const vehicles = state.vehicles;
  const customers = state.customers;
  const loading = state.loading.vehicles;
  const error = state.errors.vehicles;

  // Combine vehicles with their customer info
  const vehiclesWithCustomers = useMemo(() => {
    return vehicles.map(vehicle => ({
      ...vehicle,
      customer: customers.find(customer => customer.id === vehicle.customer_id),
    }));
  }, [vehicles, customers]);

  // Filter vehicles based on search term
  const filteredVehicles = useMemo(() => {
    return vehiclesWithCustomers.filter(vehicle => {
      const searchLower = searchTerm.toLowerCase();
      return (
        vehicle.make.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        (vehicle.license_plate ?? "").toLowerCase().includes(searchLower) ||
        (vehicle.vin ?? "").toLowerCase().includes(searchLower) ||
        vehicle.customer?.name.toLowerCase().includes(searchLower)
      );
    });
  }, [vehiclesWithCustomers, searchTerm]);

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

    if (!formData.make.trim() || !formData.model.trim()) {
      toast.error("Make and model are required");
      return;
    }
    if (String(formData.year).length !== 4 || formData.year < 1900) {
      toast.error("Please enter a valid year");
      return;
    }
    if (formData.vin && formData.vin.length < 6) {
      toast.error("VIN looks too short");
      return;
    }

    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, formData);
        setEditingVehicle(null);
      } else {
        await createVehicle(formData);
      }

      setShowForm(false);
      setFormData({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        license_plate: "",
        vin: "",
        color: "",
        customer_id: "",
      });
    } catch (error) {
      console.error("Error saving vehicle:", error);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year ?? new Date().getFullYear(),
      license_plate: vehicle.license_plate ?? "",
      vin: vehicle.vin ?? "",
      color: vehicle.color ?? "",
      customer_id: vehicle.customer_id ?? "",
    });
    setShowForm(true);
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${vehicle.make} ${vehicle.model}?`
      )
    ) {
      await deleteVehicle(vehicle.id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVehicle(null);
    setFormData({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      license_plate: "",
      vin: "",
      color: "",
      customer_id: "",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl" />
          <div className="flex-1">
            <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <SkeletonList items={6} />
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            Error loading vehicles: {error}
          </div>
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
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <Car className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
            <p className="text-gray-600">
              {filteredVehicles.length} vehicle
              {filteredVehicles.length !== 1 ? "s" : ""} found
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
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Vehicle
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
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
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
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "No vehicles found" : "No vehicles yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? "Try adjusting your search"
              : "Get started by adding your first vehicle"}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Vehicle
            </Button>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredVehicles.map((vehicle, index) => (
            <div
              key={vehicle.id}
              className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Car className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-sm text-gray-600">{vehicle.year}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(vehicle)}
                    title="Edit vehicle"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(vehicle)}
                    title="Delete vehicle"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Hash className="h-4 w-4" />
                  <span>{vehicle.license_plate}</span>
                </div>
                {vehicle.vin && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Hash className="h-4 w-4" />
                    <span className="font-mono text-xs">{vehicle.vin}</span>
                  </div>
                )}
                {vehicle.color && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: vehicle.color }}
                    />
                    <span>{vehicle.color}</span>
                  </div>
                )}
              </div>

              {vehicle.customer && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Owner: {vehicle.customer.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingVehicle ? "Edit Vehicle" : "New Vehicle"}
              </h2>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Make *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Make"
                    value={formData.make}
                    onChange={e =>
                      setFormData({ ...formData, make: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Model"
                    value={formData.model}
                    onChange={e =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        year: parseInt(
                          e.target.value || String(new Date().getFullYear())
                        ),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Plate
                  </label>
                  <input
                    type="text"
                    placeholder="License plate"
                    value={formData.license_plate}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        license_plate: e.target.value || "",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VIN
                </label>
                <input
                  type="text"
                  placeholder="Vehicle identification number"
                  value={formData.vin}
                  onChange={e =>
                    setFormData({ ...formData, vin: e.target.value || "" })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  placeholder="Vehicle color"
                  value={formData.color}
                  onChange={e =>
                    setFormData({ ...formData, color: e.target.value || "" })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner
                </label>
                <select
                  value={formData.customer_id}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      customer_id: e.target.value || "",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
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
                <Button type="submit" className="flex-1">
                  {editingVehicle ? "Update Vehicle" : "Create Vehicle"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

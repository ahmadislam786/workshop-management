import { useState, useEffect } from "react";
import type { Vehicle, Customer } from "../../types";
import { useVehicles } from "@/hooks/useVehicles";
import { useCustomers } from "@/hooks/useCustomers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CustomerSearch } from "../customers/CustomerSearch";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Car,
  User,
  Calendar,
  Hash,
} from "lucide-react";
import { toast } from "react-toastify";

export const VehicleList: React.FC = () => {
  const { vehicles, loading, createVehicle, updateVehicle, deleteVehicle } =
    useVehicles();
  const { customers } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    license_plate: "",
    year: "",
    customer_id: "",
  });

  useEffect(() => {
    if (showForm && !editingVehicle) {
      resetForm();
    }
  }, [showForm, editingVehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const vehicleData = {
        ...formData,
        year: parseInt(formData.year) || undefined,
      };

      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, vehicleData);
        // Toast is handled by the hook
      } else {
        await createVehicle(vehicleData);
        // Toast is handled by the hook
      }

      // Trigger refresh event for dashboard data
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("refresh-dashboard-data"));
      }, 100);

      setShowForm(false);
      setEditingVehicle(null);
      resetForm();
    } catch (error) {
      toast.error("Failed to save vehicle");
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      license_plate: vehicle.license_plate,
      year: vehicle.year.toString(),
      customer_id: vehicle.customer_id,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await deleteVehicle(id);
      // Toast is handled by the hook
    } catch {
      toast.error("Failed to delete vehicle");
    }
  };

  const resetForm = () => {
    setFormData({
      make: "",
      model: "",
      license_plate: "",
      year: "",
      customer_id: "",
    });
  };

  const handleCustomerSelect = (customer: Customer, vehicle?: Vehicle) => {
    if (vehicle) {
      setSearchTerm(vehicle.license_plate);
    } else {
      setSearchTerm(customer.name);
    }
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customers
        .find((c) => c.id === vehicle.customer_id)
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getCustomerName = (customerId: string) => {
    return (
      customers.find((c) => c.id === customerId)?.name || "Unknown Customer"
    );
  };

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
        <h2 className="text-2xl font-bold text-gray-900">Vehicles</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Vehicle
        </Button>
      </div>

      {/* Enhanced Search */}
      <div className="space-y-4">
        <CustomerSearch
          onCustomerSelect={handleCustomerSelect}
          placeholder="Search by customer name or license plate..."
          className="max-w-md"
        />

        {/* Traditional search as fallback */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Quick search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingVehicle ? "Edit Vehicle" : "New Vehicle"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Customer"
                value={formData.customer_id}
                onChange={(value) =>
                  setFormData({ ...formData, customer_id: value })
                }
                options={customers.map((customer) => ({
                  value: customer.id,
                  label: customer.name,
                }))}
                placeholder="Select Customer"
                required
              />

              <Input
                placeholder="Make (e.g., Toyota, Honda)"
                value={formData.make}
                onChange={(e) =>
                  setFormData({ ...formData, make: e.target.value })
                }
                required
              />

              <Input
                placeholder="Model (e.g., Camry, Civic)"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                required
              />

              <Input
                placeholder="License Plate"
                value={formData.license_plate}
                onChange={(e) =>
                  setFormData({ ...formData, license_plate: e.target.value })
                }
                required
              />

              <Input
                type="number"
                placeholder="Year"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {editingVehicle ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingVehicle(null);
                    resetForm();
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredVehicles.length === 0 ? (
        <div className="text-center py-12">
          <Car className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500 text-lg">No vehicles found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-sm text-blue-600 font-medium">
                        {vehicle.license_plate}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span className="font-medium">Owner:</span>
                      <span className="ml-1">
                        {getCustomerName(vehicle.customer_id)}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="font-medium">Year:</span>
                      <span className="ml-1">{vehicle.year}</span>
                    </div>

                    <div className="flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      <span className="font-medium">ID:</span>
                      <span className="ml-1 font-mono text-xs">
                        {vehicle.id.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

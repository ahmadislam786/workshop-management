import { useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { useCustomers } from "@/hooks/useCustomers";
import { useVehicles } from "@/hooks/useVehicles";
import { useTechnicians } from "@/hooks/useTechnicians";
import type { Job } from "../../types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  X,
  User,
  Car,
  Wrench,
  Clock,
  Package,
  FileText,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface JobFormProps {
  job?: Job;
  onClose: () => void;
}

export const JobForm: React.FC<JobFormProps> = ({ job, onClose }) => {
  const { createJob, updateJob } = useJobs();
  const { customers } = useCustomers();
  const { technicians } = useTechnicians();
  const { vehicles } = useVehicles();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    customer_id: job?.customer_id || "",
    vehicle_id: job?.vehicle_id || "",
    technician_id: job?.technician_id || "",
    service_type: job?.service_type || "",
    status: job?.status || "pending",
    scheduled_start: job?.scheduled_start || "",
    scheduled_end: job?.scheduled_end || "",
    parts_needed: job?.parts_needed || "",
    duration_hours: job?.duration_hours || undefined,
    ai_duration_hour: job?.ai_duration_hour || undefined,
    source: job?.source || "manual",
    notes: job?.notes || "",
  });

  // Auto-calculate duration when start/end times change
  const calculateDuration = (start: string, end: string) => {
    if (start && end) {
      const startTime = new Date(start);
      const endTime = new Date(end);
      if (startTime < endTime) {
        const diffMs = endTime.getTime() - startTime.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        return Math.round(diffHours * 10) / 10; // Round to 1 decimal place
      }
    }
    return undefined;
  };

  const handleTimeChange = (
    field: "scheduled_start" | "scheduled_end",
    value: string
  ) => {
    const newFormData = { ...formData, [field]: value };

    // Auto-calculate duration if both times are set
    if (field === "scheduled_start" && newFormData.scheduled_end) {
      const duration = calculateDuration(value, newFormData.scheduled_end);
      newFormData.duration_hours = duration;
    } else if (field === "scheduled_end" && newFormData.scheduled_start) {
      const duration = calculateDuration(newFormData.scheduled_start, value);
      newFormData.duration_hours = duration;
    }

    setFormData(newFormData);
    setErrors({ ...errors, [field]: "" });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_id) newErrors.customer_id = "Customer is required";
    if (!formData.vehicle_id) newErrors.vehicle_id = "Vehicle is required";
    if (!formData.service_type)
      newErrors.service_type = "Service type is required";

    if (formData.scheduled_start && formData.scheduled_end) {
      if (
        new Date(formData.scheduled_start) >= new Date(formData.scheduled_end)
      ) {
        newErrors.scheduled_end = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (job) {
        const result = await updateJob(job.id, formData);
        if (result.error) {
          setErrors({ general: result.error });
          return;
        }
      } else {
        const result = await createJob(formData);
        if (result.error) {
          setErrors({ general: result.error });
          return;
        }
      }

      // Wait a moment for the data to refresh, then close
      setTimeout(() => {
        // Trigger refresh event for all components
        window.dispatchEvent(new CustomEvent("refresh-dashboard-data"));
        onClose();
      }, 100);
    } catch {
      setErrors({ general: "Failed to save job. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Filter vehicles based on selected customer
  const availableVehicles = vehicles.filter(
    (v) => v.customer_id === formData.customer_id
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl">
        {/* Enhanced Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {job ? "Edit Job" : "Create New Job"}
                </h3>
                <p className="text-sm text-gray-500">
                  {job
                    ? "Update job details and status"
                    : "Add a new job to the workshop"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Enhanced Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General Error Display */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 text-sm">{errors.general}</span>
            </div>
          )}

          {/* Customer and Vehicle Section */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-4 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Customer & Vehicle Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Customer"
                value={formData.customer_id}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    customer_id: value,
                    vehicle_id: "",
                  });
                  setErrors({ ...errors, customer_id: "" });
                }}
                options={customers.map((customer) => ({
                  value: customer.id,
                  label: customer.name,
                }))}
                placeholder="Select Customer"
                required
                leftIcon={<User className="h-4 w-4" />}
                error={errors.customer_id}
              />

              <Select
                label="Vehicle"
                value={formData.vehicle_id}
                onChange={(value) => {
                  setFormData({ ...formData, vehicle_id: value });
                  setErrors({ ...errors, vehicle_id: "" });
                }}
                options={availableVehicles.map((vehicle) => ({
                  value: vehicle.id,
                  label: `${vehicle.make} ${vehicle.model} (${vehicle.license_plate})`,
                }))}
                placeholder="Select Vehicle"
                required
                disabled={!formData.customer_id}
                leftIcon={<Car className="h-4 w-4" />}
                error={errors.vehicle_id}
              />
            </div>
          </div>

          {/* Job Details Section */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <h4 className="text-sm font-semibold text-green-900 mb-4 flex items-center">
              <Wrench className="h-4 w-4 mr-2" />
              Job Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Technician"
                value={formData.technician_id}
                onChange={(value) =>
                  setFormData({ ...formData, technician_id: value })
                }
                options={technicians.map((tech) => ({
                  value: tech.id,
                  label: `${tech.name} - ${tech.specialization || "General"}`,
                }))}
                placeholder="Select Technician"
                leftIcon={<User className="h-4 w-4" />}
              />

              <Input
                label="Service Type"
                value={formData.service_type}
                onChange={(e) => {
                  setFormData({ ...formData, service_type: e.target.value });
                  setErrors({ ...errors, service_type: "" });
                }}
                placeholder="e.g., Oil Change, Brake Repair"
                required
                leftIcon={<Wrench className="h-4 w-4" />}
                error={errors.service_type}
              />

              <Select
                label="Status"
                value={formData.status}
                onChange={(value) =>
                  setFormData({ ...formData, status: value as Job["status"] })
                }
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "scheduled", label: "Scheduled" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "completed", label: "Completed" },
                  { value: "cancelled", label: "Cancelled" },
                ]}
                leftIcon={<Clock className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Scheduling Section */}
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <h4 className="text-sm font-semibold text-purple-900 mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Scheduling
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Scheduled Start"
                type="datetime-local"
                value={formData.scheduled_start}
                onChange={(e) => {
                  handleTimeChange("scheduled_start", e.target.value);
                }}
                leftIcon={<Clock className="h-4 w-4" />}
              />

              <Input
                label="Scheduled End"
                type="datetime-local"
                value={formData.scheduled_end}
                onChange={(e) => {
                  handleTimeChange("scheduled_end", e.target.value);
                }}
                leftIcon={<Clock className="h-4 w-4" />}
                error={errors.scheduled_end}
              />
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <h4 className="text-sm font-semibold text-orange-900 mb-4 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Additional Information
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-2" />
                    Duration (hours)
                    {formData.scheduled_start && formData.scheduled_end && (
                      <span className="text-xs text-blue-600 ml-2">
                        (Auto-calculated)
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.duration_hours || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_hours: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    className={`block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                      formData.scheduled_start && formData.scheduled_end
                        ? "bg-gray-50 text-gray-600"
                        : ""
                    }`}
                    placeholder="2.5"
                    readOnly={
                      !!(formData.scheduled_start && formData.scheduled_end)
                    }
                    title={
                      formData.scheduled_start && formData.scheduled_end
                        ? "Duration is automatically calculated from start and end times"
                        : ""
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-2" />
                    AI Duration (hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.ai_duration_hour || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ai_duration_hour: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="1.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="h-4 w-4 inline mr-2" />
                    Source
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="source"
                        value="manual"
                        checked={formData.source === "manual"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            source: e.target.value as "email" | "manual",
                          })
                        }
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Manual Entry
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="source"
                        value="email"
                        checked={formData.source === "email"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            source: e.target.value as "email" | "manual",
                          })
                        }
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Email Automation
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="h-4 w-4 inline mr-2" />
                  Parts Needed
                </label>
                <textarea
                  value={formData.parts_needed}
                  onChange={(e) =>
                    setFormData({ ...formData, parts_needed: e.target.value })
                  }
                  rows={3}
                  className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="List required parts..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 inline mr-2" />
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Additional notes, special instructions..."
                />
              </div>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} size="lg">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              size="lg"
              leftIcon={job ? undefined : <Wrench className="h-4 w-4" />}
            >
              {loading ? "Saving..." : job ? "Update Job" : "Create Job"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

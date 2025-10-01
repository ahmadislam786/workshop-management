import React, { useState } from "react";
import type { Appointment } from "@/types";
import { useAuth } from "@/hooks/auth";
import { useAppointments } from "@/hooks/api";
import {
  User,
  Car,
  Clock,
  Edit,
  Check,
  FileText,
  TrendingUp,
  CheckCircle,
  CalendarX,
  MoreVertical,
  AlertCircle,
  Play,
  Pause,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getStatusColor, formatDateTimeLocal } from "@/utils/formatting/utils";

interface AppointmentCardProps {
  appointment: Appointment;
  mode?: "regular" | "compact" | "detailed";
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  mode = "regular",
}) => {
  const { profile } = useAuth();
  const { updateAppointment } = useAppointments();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPostponeConfirm, setShowPostponeConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Editable fields state (ensure inputs are editable)
  const [editTitle, setEditTitle] = useState(appointment.title || "");
  const [editNotes, setEditNotes] = useState(appointment.notes || "");
  const [editPriority, setEditPriority] = useState(
    appointment.priority || "normal"
  );
  const [editAw, setEditAw] = useState<number>(appointment.aw_estimate || 10);
  const [editStatus, setEditStatus] = useState<
    "waiting" | "assigned" | "in_progress" | "paused" | "completed"
  >(appointment.status);

  const handleStatusUpdate = async (
    newStatus: "waiting" | "assigned" | "in_progress" | "paused" | "completed"
  ) => {
    setIsUpdating(true);
    try {
      await updateAppointment(appointment.id, { status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePostpone = async () => {
    try {
      await updateAppointment(appointment.id, {
        status: "waiting",
        date: undefined,
      });
      setShowPostponeConfirm(false);
    } catch (error) {
      console.error("Failed to postpone appointment:", error);
    }
  };

  const handleEdit = () => {
    // Initialize fields from latest appointment data
    setEditTitle(appointment.title || "");
    setEditNotes(appointment.notes || "");
    setEditPriority(appointment.priority || "normal");
    setEditAw(appointment.aw_estimate || 10);
    setEditStatus(appointment.status);
    setShowEditForm(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <Clock className="h-4 w-4" />;
      case "assigned":
        return <AlertCircle className="h-4 w-4" />;
      case "in_progress":
        return <Play className="h-4 w-4" />;
      case "paused":
        return <Pause className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <>
      <div
        data-job-customer={appointment.customer_id}
        data-job-vehicle={appointment.vehicle_id}
        className={`group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 overflow-hidden ${
          mode === "compact" ? "p-3" : mode === "detailed" ? "p-6" : "p-5"
        }`}
        onDoubleClick={() => setShowDetails(true)}
      >
        {/* Status indicator bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            appointment.status === "completed"
              ? "bg-green-500"
              : appointment.status === "in_progress"
                ? "bg-blue-500"
                : appointment.status === "paused"
                  ? "bg-yellow-500"
                  : appointment.status === "assigned"
                    ? "bg-purple-500"
                    : "bg-gray-300"
          }`}
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-gray-900 truncate ${
                mode === "compact" ? "text-sm" : "text-lg"
              }`}
            >
              {appointment.title}
            </h3>
            {mode !== "compact" && (
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(appointment.priority || "normal")}`}
                >
                  {appointment.priority || "normal"}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}
                >
                  {getStatusIcon(appointment.status)}
                  <span className="ml-1 capitalize">
                    {appointment.status.replace("_", " ")}
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {mode === "compact" && (
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}
              >
                {getStatusIcon(appointment.status)}
              </span>
            )}
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className={`space-y-3 ${mode === "compact" ? "text-xs" : "text-sm"}`}
        >
          {appointment.customer && (
            <div className="flex items-center text-gray-600">
              <User className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
              <span className="truncate font-medium">
                {appointment.customer.name}
              </span>
            </div>
          )}

          {appointment.vehicle && (
            <div className="flex items-center text-gray-600">
              <Car className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
              <span className="truncate">
                {appointment.vehicle.make} {appointment.vehicle.model}
                {appointment.vehicle.year && ` (${appointment.vehicle.year})`}
              </span>
            </div>
          )}

          {appointment.date && (
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
              <span className="truncate">
                {formatDateTimeLocal(appointment.date)}
              </span>
            </div>
          )}

          {mode !== "compact" && appointment.aw_estimate && (
            <div className="flex items-center text-gray-600">
              <TrendingUp className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
              <span className="truncate font-medium">
                {appointment.aw_estimate} AW
              </span>
            </div>
          )}

          {appointment.notes && mode !== "compact" && (
            <div className="flex items-start text-gray-600">
              <FileText className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400 mt-0.5" />
              <span className="truncate text-sm">
                {appointment.notes.length > 50
                  ? `${appointment.notes.substring(0, 50)}...`
                  : appointment.notes}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-between items-center">
          {profile?.role === "technician" ? (
            <div className="flex space-x-2">
              {appointment.status === "assigned" && (
                <>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleStatusUpdate("in_progress")}
                    leftIcon={<Play className="h-3 w-3" />}
                    loading={isUpdating}
                    className="flex-1"
                  >
                    Start Work
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPostponeConfirm(true)}
                    leftIcon={<CalendarX className="h-3 w-3" />}
                    className="flex-1"
                  >
                    Postpone
                  </Button>
                </>
              )}
              {appointment.status === "in_progress" && (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleStatusUpdate("completed")}
                  leftIcon={<Check className="h-3 w-3" />}
                  loading={isUpdating}
                  className="flex-1"
                >
                  Complete
                </Button>
              )}
              {appointment.status === "waiting" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleStatusUpdate("in_progress")}
                  leftIcon={<Play className="h-3 w-3" />}
                  loading={isUpdating}
                  className="flex-1"
                >
                  Begin Work
                </Button>
              )}
              {appointment.status === "completed" && (
                <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium">Completed</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-2">
              {appointment.status === "assigned" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPostponeConfirm(true)}
                  leftIcon={<CalendarX className="h-3 w-3" />}
                >
                  Postpone
                </Button>
              )}
              <select
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                value={appointment.status}
                onChange={e =>
                  handleStatusUpdate(
                    e.target.value as
                      | "waiting"
                      | "assigned"
                      | "in_progress"
                      | "paused"
                      | "completed"
                  )
                }
                disabled={isUpdating}
              >
                <option value="waiting">Waiting</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleEdit}
                leftIcon={<Edit className="h-3 w-3" />}
              >
                Edit
              </Button>
            </div>
          )}
        </div>

        {/* Loading overlay */}
        {isUpdating && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Updating...</span>
            </div>
          </div>
        )}
      </div>

      {/* Postpone Confirmation Modal */}
      {showPostponeConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowPostponeConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <CalendarX className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Postpone Appointment
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Are you sure you want to postpone this appointment?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> The appointment will be moved back to
                  "Waiting" status and its schedule will be cleared.
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowPostponeConfirm(false)}
                className="flex-1"
                leftIcon={<X className="h-4 w-4" />}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handlePostpone}
                className="flex-1"
                leftIcon={<CalendarX className="h-4 w-4" />}
              >
                Postpone
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Appointment Details
                  </h3>
                  <p className="text-sm text-gray-500">Complete information</p>
                </div>
              </div>
              <button
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                onClick={() => setShowDetails(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Service Information
                  </h4>
                  <p className="text-gray-700">{appointment.title}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}
                    >
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1 capitalize">
                        {appointment.status.replace("_", " ")}
                      </span>
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(appointment.priority || "normal")}`}
                    >
                      {appointment.priority || "normal"}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Scheduling
                  </h4>
                  {appointment.date ? (
                    <p className="text-gray-700">
                      {formatDateTimeLocal(appointment.date)}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">Not scheduled</p>
                  )}
                  {appointment.aw_estimate && (
                    <p className="text-sm text-gray-600 mt-1">
                      Estimated AW: {appointment.aw_estimate}
                    </p>
                  )}
                </div>
              </div>

              {/* Customer & Vehicle */}
              {(appointment.customer || appointment.vehicle) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appointment.customer && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <User className="h-4 w-4 mr-2 text-blue-600" />
                        Customer
                      </h4>
                      <p className="text-gray-700">
                        {appointment.customer.name}
                      </p>
                    </div>
                  )}

                  {appointment.vehicle && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Car className="h-4 w-4 mr-2 text-green-600" />
                        Vehicle
                      </h4>
                      <p className="text-gray-700">
                        {appointment.vehicle.make} {appointment.vehicle.model}
                        {appointment.vehicle.year &&
                          ` (${appointment.vehicle.year})`}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {appointment.notes && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-yellow-600" />
                    Notes
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {appointment.notes}
                  </p>
                </div>
              )}

              {/* Related Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Related Information
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Customer: {appointment.customer?.name || "Not assigned"}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Vehicle:{" "}
                    {appointment.vehicle
                      ? `${appointment.vehicle.make} ${appointment.vehicle.model}`
                      : "Not assigned"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditForm && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowEditForm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Edit className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Edit Appointment
                  </h3>
                  <p className="text-sm text-gray-500">
                    Update appointment details
                  </p>
                </div>
              </div>
              <button
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                onClick={() => setShowEditForm(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              className="space-y-6"
              onSubmit={async e => {
                e.preventDefault();
                setIsUpdating(true);
                try {
                  await updateAppointment(appointment.id, {
                    title: editTitle,
                    notes: editNotes,
                    priority: editPriority as
                      | "low"
                      | "normal"
                      | "high"
                      | "urgent",
                    aw_estimate: Number(editAw) || 0,
                    status: editStatus,
                  });
                  setShowEditForm(false);
                } catch (error) {
                  console.error("Failed to update appointment:", error);
                } finally {
                  setIsUpdating(false);
                }
              }}
            >
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Appointment Title
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Enter appointment title"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  rows={4}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Add any additional notes or details..."
                />
              </div>

              {/* Priority, AW, and Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    value={editPriority}
                    onChange={e =>
                      setEditPriority(
                        e.target.value as "low" | "normal" | "high" | "urgent"
                      )
                    }
                  >
                    <option value="low">Low Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    AW Estimate
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    value={editAw}
                    onChange={e => setEditAw(Number(e.target.value))}
                    placeholder="AW hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    value={editStatus}
                    onChange={e =>
                      setEditStatus(
                        e.target.value as
                          | "waiting"
                          | "assigned"
                          | "in_progress"
                          | "paused"
                          | "completed"
                      )
                    }
                  >
                    <option value="waiting">Waiting</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowEditForm(false)}
                  leftIcon={<X className="h-4 w-4" />}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  leftIcon={<Save className="h-4 w-4" />}
                  loading={isUpdating}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

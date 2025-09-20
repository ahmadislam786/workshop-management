import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { UserManagementService } from "../../../lib/user-management";
import type { CreateUserData } from "../../../types";
import { toast } from "react-toastify";
import { UserPlus, X } from "lucide-react";

interface UserFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  role: "admin" | "technician";
}

interface UserManagementProps {
  onClose: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onClose }) => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userCounts, setUserCounts] = useState({ admins: 0, technicians: 0 });
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    role: "technician",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch current user counts
  const fetchData = async () => {
    try {
      const counts = await UserManagementService.getUserCounts();
      setUserCounts(counts);
    } catch {
      // Silent error handling
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      phone: "",
      role: "technician",
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.role) newErrors.role = "Role is required";

    // Role-specific validations removed - specialization field removed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const userData: CreateUserData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        phone: formData.phone || undefined,
      };

      const result = await UserManagementService.createUser(userData);

      if (result.success) {
        if (result.requiresEmailConfirmation) {
          toast.success(
            `${
              formData.role === "admin" ? "Admin" : "Technician"
            } account created successfully! User will receive an email confirmation.`,
            { autoClose: 5000 }
          );
        } else {
          toast.success(
            `${
              formData.role === "admin" ? "Admin" : "Technician"
            } account created successfully! User can log in immediately.`
          );
        }

        // Refresh data
        await fetchData();
        resetForm();
        setShowForm(false);
        onClose();
      } else {
        toast.error(result.error || "Failed to create user account");
      }
    } catch {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-screen overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              User Management
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold">
                    {userCounts.admins + userCounts.technicians}
                  </p>
                </div>
                <UserPlus className="h-12 w-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Administrators
                  </p>
                  <p className="text-3xl font-bold">{userCounts.admins}</p>
                </div>
                <UserPlus className="h-12 w-12 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Technicians
                  </p>
                  <p className="text-3xl font-bold">{userCounts.technicians}</p>
                </div>
                <UserPlus className="h-12 w-12 text-green-200" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Create New User
            </Button>
          </div>

          {/* User Creation Form */}
          {showForm && (
            <div className="bg-gray-50 rounded-xl p-6 border">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-800">
                  Create New User Account
                </h4>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={e => handleInputChange("email", e.target.value)}
                      placeholder="user@example.com"
                      error={errors.email}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={e =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Minimum 6 characters"
                      error={errors.password}
                      required
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={e =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      placeholder="Confirm your password"
                      error={errors.confirmPassword}
                      required
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={e => handleInputChange("name", e.target.value)}
                      placeholder="Enter full name"
                      error={errors.name}
                      required
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Role *
                    </label>
                    <Select
                      value={formData.role}
                      onChange={value => handleInputChange("role", value)}
                      options={[
                        { value: "technician", label: "Technician" },
                        { value: "admin", label: "Administrator" },
                      ]}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={e => handleInputChange("phone", e.target.value)}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                {/* Role-specific fields removed - specialization field removed */}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating User...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create User
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

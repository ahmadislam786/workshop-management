import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, Eye, EyeOff, Shield, User, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordResetData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordManagementProps {
  onClose: () => void;
}

export const PasswordManagement: React.FC<PasswordManagementProps> = ({
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"change" | "reset">("change");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    resetNew: false,
    resetConfirm: false,
  });

  const [changePasswordData, setChangePasswordData] =
    useState<PasswordChangeData>({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [resetPasswordData, setResetPasswordData] = useState<PasswordResetData>(
    {
      email: "",
      newPassword: "",
      confirmPassword: "",
    }
  );

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return errors;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    const passwordErrors = validatePassword(changePasswordData.newPassword);
    if (passwordErrors.length > 0) {
      toast.error(passwordErrors.join(", "));
      return;
    }

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Failed to get current user information");
        return;
      }

      // Update password with current password verification
      const { error: updateError } = await supabase.auth.updateUser({
        password: changePasswordData.newPassword,
      });

      if (updateError) {
        // If the error is about current password, show a specific message
        if (
          updateError.message.includes("password") ||
          updateError.message.includes("current")
        ) {
          toast.error(
            "Current password verification failed. Please ensure you're properly authenticated."
          );
        } else {
          toast.error(`Failed to update password: ${updateError.message}`);
        }
        return;
      }

      toast.success("Password updated successfully!");
      setChangePasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Password change error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    const passwordErrors = validatePassword(resetPasswordData.newPassword);
    if (passwordErrors.length > 0) {
      toast.error(passwordErrors.join(", "));
      return;
    }

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      // First, look up the user by email to get their user ID
      const { data: users, error: lookupError } =
        await supabase.auth.admin.listUsers();

      if (lookupError) {
        toast.error(`Failed to look up users: ${lookupError.message}`);
        return;
      }

      const user = users.users.find((u) => u.email === resetPasswordData.email);
      if (!user) {
        toast.error("User with this email address not found");
        return;
      }

      // Use admin service role to reset user password
      const { error } = await supabase.auth.admin.updateUserById(user.id, {
        password: resetPasswordData.newPassword,
      });

      if (error) {
        toast.error(`Failed to reset password: ${error.message}`);
        return;
      }

      toast.success(`Password reset successfully for ${user.email}!`);
      setResetPasswordData({
        email: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Password Management
            </h2>
            <p className="text-gray-600">
              Change your own password or reset passwords for other users
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab("change")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "change"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Lock className="h-4 w-4 inline mr-2" />
            Change My Password
          </button>
          <button
            onClick={() => setActiveTab("reset")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "reset"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Reset User Password
          </button>
        </div>

        {/* Change Password Tab */}
        {activeTab === "change" && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? "text" : "password"}
                  value={changePasswordData.currentPassword}
                  onChange={(e) =>
                    setChangePasswordData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter your current password"
                  leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  value={changePasswordData.newPassword}
                  onChange={(e) =>
                    setChangePasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter new password"
                  leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={changePasswordData.confirmPassword}
                  onChange={(e) =>
                    setChangePasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Confirm new password"
                  leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        )}

        {/* Reset Password Tab */}
        {activeTab === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Email
              </label>
              <Input
                type="email"
                value={resetPasswordData.email}
                onChange={(e) =>
                  setResetPasswordData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="Enter user's email address"
                leftIcon={<User className="h-4 w-4 text-gray-400" />}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.resetNew ? "text" : "password"}
                  value={resetPasswordData.newPassword}
                  onChange={(e) =>
                    setResetPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter new password"
                  leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("resetNew")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.resetNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.resetConfirm ? "text" : "password"}
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) =>
                    setResetPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Confirm new password"
                  leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("resetConfirm")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.resetConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>
        )}

        {/* Password Requirements */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Password Requirements
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• At least 8 characters long</li>
            <li>• Contains uppercase and lowercase letters</li>
            <li>• Contains at least one number</li>
            <li>• Contains at least one special character (!@#$%^&*)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

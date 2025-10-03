import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      // Basic client-side validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        setError("Please enter a valid email address");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      const result = await signIn(email, password);
      if (!result.success) {
        setError(result.error || "An error occurred");
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess?.();
        }, 1000);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-blue-100 text-sm">
            Sign in to your workshop dashboard
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 animate-pulse" />
                  <p className="text-green-700 text-sm font-medium">
                    Signing you in...
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full h-12 text-base font-semibold"
                disabled={loading || isSuccess}
                loading={loading}
                leftIcon={
                  loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : undefined
                }
              >
                {loading ? "Signing in..." : isSuccess ? "Success!" : "Sign In"}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Secure authentication powered by Supabase
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

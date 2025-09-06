import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Wrench, Eye, EyeOff, Car, Shield, Clock, Mail, Lock } from "lucide-react";

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { signIn } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn(email, password);
      if (!result.success) setError(result.error || t("login.signInFailed"));
    } catch (error) {
      setError(t("login.unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden hover:shadow-3xl transition-shadow duration-300">
          {/* Header with Branding */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Wrench className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Autohaus Denker & Brünen
            </h1>
            <p className="text-blue-100 text-sm font-medium">
              Professional Workshop Management
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to access your workshop dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("login.emailPlaceholder")}
                  leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
                  className="h-12 text-base"
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.passwordPlaceholder")}
                  leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  className="h-12 text-base"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? t("login.signingIn") : t("login.signIn")}
              </Button>
            </form>

            {/* Features Section */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Car className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    Vehicle Management
                  </span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Wrench className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    Job Tracking
                  </span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    Scheduling
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <Wrench className="h-4 w-4" />
            <span className="text-sm font-medium">
              Autohaus Denker & Brünen
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

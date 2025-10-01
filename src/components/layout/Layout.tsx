import React, { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/hooks/auth";
import { useLanguage } from "@/contexts/language-context";
import { LoginForm } from "@/components/features/LoginForm";
import { Button } from "@/components/ui/Button";
import { RealtimeStatusIndicator } from "@/components/shared/RealtimeStatus";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const { profile, loading } = useAuth();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Set unique document title per active tab to avoid duplicates
  useEffect(() => {
    const titles: Record<string, string> = {
      dashboard: `${t("nav.dashboard")} • ${t("app.title")}`,
      jobs: `${t("nav.jobs")} • ${t("app.title")}`,
      customers: `${t("nav.customers")} • ${t("app.title")}`,
      vehicles: `${t("nav.vehicles")} • ${t("app.title")}`,
      technicians: `${t("nav.technicians")} • ${t("app.title")}`,
      leitstand: `${t("nav.controlBoard")} • ${t("app.title")}`,
      plantafel: `${t("nav.planningBoard")} • ${t("app.title")}`,
      dayview: `${t("nav.dayview")} • ${t("app.title")}`,
      calendar: `Calendar • ${t("app.title")}`,
    };
    document.title = titles[activeTab] || t("app.title");
  }, [activeTab, t]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Trigger a custom refresh event that components can listen to
    window.dispatchEvent(new CustomEvent("refresh-dashboard-data"));

    // Reset refreshing state after a short delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Enhanced loading state with better accessibility and animations
  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center"
        role="main"
        aria-label="Loading Workshop Manager"
      >
        <div className="text-center animate-fade-in">
          {/* Enhanced loading spinner with multiple layers */}
          <div className="relative mb-8">
            {/* Outer ring */}
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-100 mx-auto"></div>
            {/* Middle ring */}
            <div
              className="absolute inset-2 animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
            {/* Inner ring */}
            <div className="absolute inset-4 animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-600 mx-auto"></div>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-600 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Loading text with better accessibility and staggered animation */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-fade-in-up animate-delay-200">
            {t("app.title")}
          </h2>
          <p className="text-gray-600 text-lg mb-6 animate-fade-in-up animate-delay-300">
            {t("app.signIn")}
          </p>

          {/* Enhanced loading progress indicator */}
          <div className="mt-6 w-64 mx-auto bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full animate-shimmer"
              style={{
                width: "60%",
                background:
                  "linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #3b82f6 100%)",
                backgroundSize: "200% 100%",
              }}
            ></div>
          </div>

          {/* Loading dots animation */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce-gentle"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce-gentle animate-delay-100"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce-gentle animate-delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced login state with better accessibility and animations
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 animate-scale-in">
            {/* Enhanced header with better branding and animations */}
            <div className="text-center">
              <div className="mx-auto h-24 w-24 bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl flex items-center justify-center mb-8 shadow-xl hover-lift animate-float">
                <svg
                  className="h-12 w-12 text-white animate-pulse-soft"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>

              {/* Enhanced branding text with staggered animations */}
              <h1 className="text-4xl font-bold text-gray-900 mb-3 animate-fade-in-up animate-delay-200">
                {t("app.title")}
              </h1>
              <p className="text-gray-600 text-xl mb-6 animate-fade-in-up animate-delay-300">
                {t("app.signIn")}
              </p>

              {/* Enhanced info card with better styling */}
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-lg animate-fade-in-up animate-delay-400 hover-lift">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-blue-800 font-medium text-center">
                  <span className="block mb-1">
                    {t("app.professionalSystem")}
                  </span>
                  <span className="text-blue-600">
                    {t("app.manageDescription")}
                  </span>
                </p>
              </div>
            </div>

            {/* Login form with enhanced animations */}
            <div className="animate-fade-in-up animate-delay-500">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced main layout with sidebar and better animations
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex"
      role="main"
      aria-label="Workshop Manager Dashboard"
    >
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main content area with enhanced animations */}
      <div
        className={`flex-1 transition-all duration-500 ease-in-out ${
          isSidebarCollapsed
            ? "ml-0 md:ml-16 lg:ml-16"
            : "ml-0 md:ml-64 lg:ml-64"
        }`}
      >
        <main className="py-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-8">
            {/* Enhanced page header with better animations */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 animate-fade-in-up">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 capitalize animate-fade-in-left">
                  {activeTab === "dashboard" && t("page.dashboard")}
                  {activeTab === "leitstand" && t("nav.controlBoard")}
                  {activeTab === "plantafel" && t("nav.planningBoard")}
                  {!["dashboard", "leitstand", "plantafel"].includes(
                    activeTab
                  ) && t(`nav.${activeTab}`)}
                </h2>
                <p className="text-gray-600 text-base sm:text-lg animate-fade-in-left animate-delay-200">
                  {activeTab === "leitstand" && t("page.controlBoard.desc")}
                  {activeTab === "plantafel" && t("page.planningBoard.desc")}
                  {!["leitstand", "plantafel"].includes(activeTab) &&
                    t(`page.${activeTab}.desc`)}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Real-time status indicator */}
                <div className="animate-fade-in-right animate-delay-100">
                  <RealtimeStatusIndicator />
                </div>

                {/* Enhanced refresh button with better animations */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 w-full sm:w-auto animate-fade-in-right hover-lift"
                  leftIcon={
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ${refreshing ? "animate-spin" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  }
                >
                  {refreshing ? t("action.refreshing") : t("action.refresh")}
                </Button>
              </div>
            </div>

            {/* Main content with enhanced page transitions */}
            <div
              key={activeTab}
              className="animate-fade-in-up animate-delay-300"
            >
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

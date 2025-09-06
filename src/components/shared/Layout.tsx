import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/language-context";
import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/Button";

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

  const handleRefresh = () => {
    setRefreshing(true);
    // Trigger a custom refresh event that components can listen to
    window.dispatchEvent(new CustomEvent("refresh-dashboard-data"));

    // Reset refreshing state after a short delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Enhanced loading state with better accessibility
  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center"
        role="main"
        aria-label="Loading Workshop Manager"
      >
        <div className="text-center animate-fade-in">
          {/* Enhanced loading spinner */}
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 mx-auto"></div>
          </div>

          {/* Loading text with better accessibility */}
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {t("app.title")}
          </h2>
          <p className="text-gray-500 text-sm">{t("app.signIn")}</p>

          {/* Loading progress indicator */}
          <div className="mt-4 w-48 mx-auto bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full animate-pulse"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced login state with better accessibility
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 animate-scale-in">
            {/* Enhanced header with better branding */}
            <div className="text-center">
              <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg hover-lift">
                <svg
                  className="h-10 w-10 text-white"
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

              {/* Enhanced branding text */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("app.title")}
              </h1>
              <p className="text-gray-600 text-lg">{t("app.signIn")}</p>

              {/* Additional info for better UX */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">
                    {t("app.professionalSystem")}
                  </span>
                  <br />
                  {t("app.manageDescription")}
                </p>
              </div>
            </div>

            {/* Login form */}
            <LoginForm />
          </div>
        </div>
      </div>
    );
  }

  // Enhanced main layout with sidebar
  return (
    <div
      className="min-h-screen bg-gray-50 flex"
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

      {/* Main content area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed
            ? "ml-0 md:ml-16 lg:ml-16"
            : "ml-0 md:ml-64 lg:ml-64"
        }`}
      >
        <main className="py-8 animate-fade-in bg-gradient-to-br from-gray-50 to-white min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-8">
            {/* Page header for better navigation context */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 capitalize">
                  {activeTab === "dashboard" && t("page.dashboard")}
                  {activeTab === "leitstand" && t("nav.controlBoard")}
                  {activeTab === "plantafel" && t("nav.planningBoard")}
                  {activeTab === "dialogannahme" && t("nav.damageReport")}
                  {![
                    "dashboard",
                    "leitstand",
                    "plantafel",
                    "dialogannahme",
                  ].includes(activeTab) && t(`nav.${activeTab}`)}
                </h2>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  {activeTab === "leitstand" && t("page.controlBoard.desc")}
                  {activeTab === "plantafel" && t("page.planningBoard.desc")}
                  {activeTab === "dialogannahme" && t("page.damageReport.desc")}
                  {!["leitstand", "plantafel", "dialogannahme"].includes(
                    activeTab
                  ) && t(`page.${activeTab}.desc`)}
                </p>
              </div>

              {/* Refresh button for manual data refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <svg
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
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
                {refreshing ? t("action.refreshing") : t("action.refresh")}
              </Button>
            </div>

            {/* Main content */}
            <div className="animate-slide-up">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

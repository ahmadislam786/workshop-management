import React, { useState, useEffect } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { DataProvider } from "@/contexts/data-context";
import { RealtimeProvider } from "@/contexts/realtime-context";
import { LanguageProvider } from "@/contexts/language-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import { Layout } from "@/components/layout/Layout";
import { AdminDashboard } from "@/components/features/dashboard/AdminDashboard";
import { TechnicianDashboard } from "@/components/features/dashboard/TechnicianDashboard";
import { AppointmentList } from "@/components/features/appointments/AppointmentList";
import { CustomerList } from "@/components/features/customers/CustomerList";
import { TechnicianList } from "@/components/features/technicians/TechnicianList";
import { VehicleList } from "@/components/features/vehicles/VehicleList";
import { Leitstand } from "@/components/features/scheduling/Leitstand";
import { Plantafel } from "@/components/features/scheduling/Plantafel";
import { DayViewPlanner } from "@/components/features/scheduling/DayViewPlanner";
import { LoginForm } from "@/components/features/LoginForm";
import { NotificationInitializer } from "@/components/shared/NotificationInitializer";
import { FullPageLoading } from "@/components/shared/LoadingSpinner";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppContent: React.FC = () => {
  const { profile, loading, authState } = useAuth();
  const { refreshAll } = useData();
  const [activeTab, setActiveTab] = useState(() =>
    typeof window !== "undefined"
      ? window.localStorage.getItem("activeTab") || "dashboard"
      : "dashboard"
  );

  // Initialize data when user is authenticated
  useEffect(() => {
    if (profile) {
      // Prime caches in the background; do not block UI
      refreshAll().catch(() => {});
    }
  }, [profile, refreshAll]);

  // Persist active tab across refreshes
  useEffect(() => {
    try {
      window.localStorage.setItem("activeTab", activeTab);
    } catch {}
  }, [activeTab]);

  // Reset tab on sign out
  useEffect(() => {
    if (!profile) {
      try {
        window.localStorage.removeItem("activeTab");
      } catch {}
      setActiveTab("dashboard");
    }
  }, [profile]);

  // Auth/UI gating
  // 1) While auth is unknown or loading, show initializing
  if (authState === "unknown" || loading) {
    return <FullPageLoading text="Initializing application..." />;
  }

  // 2) If signed in but profile not yet hydrated, show a quick profile-loading state
  if (authState === "signed_in" && !profile) {
    return <FullPageLoading text="Loading profile..." />;
  }

  // 3) Only show login when explicitly signed out
  if (authState === "signed_out") {
    return <LoginForm />;
  }

  const renderContent = () => {
    if (profile.role === "admin") {
      switch (activeTab) {
        case "dashboard":
          return <AdminDashboard onNavigate={setActiveTab} />;
        case "jobs":
          return <AppointmentList />;
        case "leitstand":
          return <Leitstand />;
        case "plantafel":
          return <Plantafel />;
        case "dayview":
          return <DayViewPlanner />;
        case "calendar":
          return <div>Calendar view not implemented</div>;
        case "customers":
          return <CustomerList />;
        case "vehicles":
          return <VehicleList />;
        case "technicians":
          return <TechnicianList />;
        default:
          return <AdminDashboard onNavigate={setActiveTab} />;
      }
    } else {
      // Technician routing - limited access
      switch (activeTab) {
        case "dashboard":
          return <TechnicianDashboard />;
        case "jobs":
          return <AppointmentList />;
        default:
          return <TechnicianDashboard />;
      }
    }
  };

  return (
    <>
      <NotificationInitializer />
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <DataProvider>
            <RealtimeProvider>
              <NotificationProvider>
                <AppContent />
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
              </NotificationProvider>
            </RealtimeProvider>
          </DataProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;

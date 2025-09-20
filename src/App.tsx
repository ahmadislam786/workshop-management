import React, { useState } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { LanguageProvider } from "@/contexts/language-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/shared/Layout";
import { AdminDashboard } from "@/components/features/AdminDashboard";
import { TechnicianDashboard } from "@/components/features/TechnicianDashboard";
import { AppointmentList } from "@/components/features/appointments/AppointmentList";
import { CustomerList } from "@/components/features/customers/CustomerList";
import { TechnicianList } from "@/components/features/technicians/TechnicianList";
import { VehicleList } from "@/components/features/vehicles/VehicleList";
import { Leitstand } from "@/components/features/Leitstand";
import { Plantafel } from "@/components/features/Plantafel";
import { DayViewPlanner } from "@/components/features/DayViewPlanner";
import { LoginForm } from "@/components/features/LoginForm";
import { NotificationInitializer } from "@/components/shared/NotificationInitializer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppContent: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!profile) {
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
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;

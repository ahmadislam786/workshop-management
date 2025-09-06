import React, { useState } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { LanguageProvider } from "@/contexts/language-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/shared/Layout";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { TechnicianDashboard } from "@/components/dashboard/TechnicianDashboard";
import { JobList } from "@/components/jobs/JobList";
import { JobCalendar } from "@/components/jobs/JobCalendar";
import { CustomerList } from "@/components/customers/CustomerList";
import { TechnicianList } from "@/components/technicians/TechnicianList";
import { VehicleList } from "@/components/vehicles/VehicleList";
import { ScanList } from "@/components/scans/ScanList";
import { Leitstand } from "@/components/dashboard/Leitstand";
import { Plantafel } from "@/components/dashboard/Plantafel";
import { DamageReport } from "@/components/dialogannahme/DamageReport";
import { LoginForm } from "@/components/auth/LoginForm";
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
          return <JobList />;
        case "scans":
          return <ScanList />;
        case "leitstand":
          return <Leitstand />;
        case "plantafel":
          return <Plantafel />;
        case "dialogannahme":
          return <DamageReport />;
        case "calendar":
          return <JobCalendar />;
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
          return <JobList />;
        default:
          return <TechnicianDashboard />;
      }
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
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

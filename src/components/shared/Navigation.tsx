import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import {
  Wrench,
  User,
  LayoutDashboard,
  Users,
  Car,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!profile) return null;

  const isAdmin = profile.role === "admin";

  const adminTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Overview and statistics" },
    { id: "jobs", label: "Jobs", icon: Wrench, description: "Manage workshop jobs" },
    { id: "customers", label: "Customers", icon: Users, description: "Customer management" },
    { id: "technicians", label: "Technicians", icon: User, description: "Team management" },
    { id: "vehicles", label: "Vehicles", icon: Car, description: "Vehicle database" },
  ];

  const technicianTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Your work overview" },
    { id: "jobs", label: "My Jobs", icon: Wrench, description: "Your assigned jobs" },
  ];

  const tabs = isAdmin ? adminTabs : technicianTabs;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // Silent error handling
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu when tab is selected
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand - Enhanced accessibility */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-lg" role="img" aria-label="Workshop Manager Logo">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">
                  Workshop Manager
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Professional System
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs - Enhanced accessibility */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`${tab.label} - ${tab.description}`}
                  title={tab.description}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Side Actions - Enhanced accessibility */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* User Menu */}
            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {isAdmin ? "Administrator" : "Technician"}
                  </p>
                  <p className="text-xs text-gray-500">{profile.role}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-full" role="img" aria-label="User avatar">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            {/* Sign Out Button - Enhanced accessibility */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Sign out of Workshop Manager"
              title="Sign out"
            >
              <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>

            {/* Mobile Menu Toggle - Enhanced accessibility */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation - Better accessibility and UX */}
        <div 
          id="mobile-navigation"
          className={`md:hidden border-t border-gray-100 bg-white shadow-sm transition-all duration-300 ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="py-4 px-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover-lift ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-2 border-transparent"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`${tab.label} - ${tab.description}`}
                  title={tab.description}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <div className="text-left">
                    <span className="block font-medium">{tab.label}</span>
                    <span className="block text-xs text-gray-500 font-normal">{tab.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

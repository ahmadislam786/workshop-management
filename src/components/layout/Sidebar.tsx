import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth";
import { useLanguage } from "@/contexts/language-context";
import { useRBAC } from "@/hooks/rbac";
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
  ChevronLeft,
  ChevronRight,
  Bell,
  Languages,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { profile, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { canAccessNavigation, getFilteredNavigationItems } = useRBAC();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize("mobile");
        setIsCollapsed(false); // Always expanded on mobile
        setIsMobileMenuOpen(false); // Close mobile menu on resize
      } else if (width < 1024) {
        setScreenSize("tablet");
        setIsCollapsed(true); // Collapsed by default on tablet
        setIsMobileMenuOpen(false); // Close mobile menu on resize
      } else {
        setScreenSize("desktop");
        setIsMobileMenuOpen(false); // Close mobile menu on resize
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsCollapsed]);

  if (!profile) return null;

  // Define all possible navigation items
  const allNavigationItems = [
    {
      id: "dashboard",
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
      description: t("nav.dashboard.desc"),
      color: "text-blue-600",
    },
    {
      id: "jobs",
      label: profile.role === "admin" ? t("nav.jobs") : t("nav.myJobs"),
      icon: Wrench,
      description:
        profile.role === "admin" ? t("nav.jobs.desc") : t("nav.myJobs.desc"),
      color: "text-green-600",
    },
    {
      id: "customers",
      label: t("nav.customers"),
      icon: Users,
      description: t("nav.customers.desc"),
      color: "text-purple-600",
    },
    {
      id: "technicians",
      label: t("nav.technicians"),
      icon: User,
      description: t("nav.technicians.desc"),
      color: "text-orange-600",
    },
    {
      id: "vehicles",
      label: t("nav.vehicles"),
      icon: Car,
      description: t("nav.vehicles.desc"),
      color: "text-indigo-600",
    },
    {
      id: "leitstand",
      label: t("nav.controlBoard"),
      icon: LayoutDashboard,
      description: t("nav.controlBoard.desc"),
      color: "text-red-600",
    },
    {
      id: "plantafel",
      label: t("nav.planningBoard"),
      icon: LayoutDashboard,
      description: t("nav.planningBoard.desc"),
      color: "text-pink-600",
    },
    {
      id: "dayview",
      label: t("nav.dayview"),
      icon: LayoutDashboard,
      description: t("nav.dayview.desc"),
      color: "text-cyan-600",
    },
  ];

  // Filter navigation items based on user permissions
  const tabs = getFilteredNavigationItems(allNavigationItems);

  // Check if user is admin
  const isAdmin = profile?.role === "admin";

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

  const toggleCollapse = () => {
    if (screenSize === "desktop") {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleLanguageChange = (newLanguage: "en" | "de") => {
    setLanguage(newLanguage);
    setIsLanguageMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-lg border border-gray-200 hover:bg-gray-50"
        aria-label={
          isMobileMenuOpen ? t("action.closeMenu") : t("action.openMenu")
        }
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 sidebar-overlay z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-white via-gray-50 to-blue-50 border-r border-gray-200 shadow-2xl z-50
          sidebar-collapse sidebar-scroll transition-all duration-500 ease-in-out
          ${
            screenSize === "mobile"
              ? isMobileMenuOpen
                ? "w-80 translate-x-0"
                : "w-80 -translate-x-full"
              : isCollapsed
                ? "w-16 translate-x-0"
                : "w-64 translate-x-0"
          }
          ${isMobileMenuOpen ? "animate-sidebar-in" : ""}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
            {(!isCollapsed || screenSize === "mobile") && (
              <div className="flex items-center space-x-4 animate-fade-in-left">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-3 rounded-2xl shadow-lg hover-lift animate-float">
                  <Wrench className="h-7 w-7 text-white animate-pulse-soft" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 animate-fade-in-up animate-delay-200">
                    {t("app.title")}
                  </h1>
                  <p className="text-sm text-gray-600 font-medium animate-fade-in-up animate-delay-300">
                    {t("app.subtitle")}
                  </p>
                </div>
              </div>
            )}

            {isCollapsed && screenSize !== "mobile" && (
              <div className="mx-auto animate-fade-in">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-3 rounded-2xl shadow-lg hover-lift animate-float">
                  <Wrench className="h-7 w-7 text-white animate-pulse-soft" />
                </div>
              </div>
            )}

            {/* Collapse Toggle - Desktop Only */}
            {screenSize === "desktop" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapse}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                aria-label={
                  isCollapsed ? t("action.expand") : t("action.collapse")
                }
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          {/* Enhanced Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-sm font-medium
                    sidebar-item sidebar-item-hover group relative overflow-hidden
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-2 border-blue-200 shadow-lg"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 border-2 border-transparent hover:border-gray-200"
                    }
                    ${
                      isCollapsed && screenSize !== "mobile"
                        ? "justify-center px-3"
                        : ""
                    }
                    will-change-transform animate-fade-in-up
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={
                    isCollapsed
                      ? tab.label
                      : `${tab.label} - ${tab.description}`
                  }
                  title={isCollapsed ? tab.description : undefined}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full"></div>
                  )}

                  <div
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-blue-100 shadow-md"
                        : "bg-gray-100 group-hover:bg-blue-100 group-hover:shadow-md"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ${
                        isActive
                          ? "text-blue-600 scale-110"
                          : `${tab.color} group-hover:scale-110 group-hover:text-blue-600`
                      }`}
                    />
                  </div>

                  {(!isCollapsed || screenSize === "mobile") && (
                    <div className="text-left flex-1">
                      <span
                        className={`block font-semibold transition-colors duration-200 ${
                          isActive
                            ? "text-blue-700"
                            : "text-gray-700 group-hover:text-blue-700"
                        }`}
                      >
                        {tab.label}
                      </span>
                      <span
                        className={`block text-xs font-normal transition-colors duration-200 ${
                          isActive
                            ? "text-blue-600"
                            : "text-gray-500 group-hover:text-blue-600"
                        }`}
                      >
                        {tab.description}
                      </span>
                    </div>
                  )}

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300 rounded-2xl"></div>
                </button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-200 p-4">
            {/* User Info */}
            <div
              className={`flex items-center space-x-3 mb-4 ${
                isCollapsed && screenSize !== "mobile" ? "justify-center" : ""
              }`}
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-full">
                <User className="h-5 w-5 text-white" />
              </div>
              {(!isCollapsed || screenSize === "mobile") && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {isAdmin ? t("user.administrator") : t("user.technician")}
                  </p>
                  <p className="text-xs text-gray-500">{profile.role}</p>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div
              className={`mb-4 ${
                isCollapsed && screenSize !== "mobile"
                  ? "flex justify-center"
                  : ""
              }`}
            >
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className={`w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${
                    isCollapsed && screenSize !== "mobile"
                      ? "justify-center"
                      : ""
                  }`}
                  aria-label={t("language.switch")}
                >
                  <Languages className="h-4 w-4" />
                  {(!isCollapsed || screenSize === "mobile") && (
                    <span className="ml-2">
                      {language === "en" ? "EN" : "DE"}
                    </span>
                  )}
                </Button>

                {isLanguageMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => handleLanguageChange("en")}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg ${
                        language === "en"
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      🇺🇸 {t("language.english")}
                    </button>
                    <button
                      onClick={() => handleLanguageChange("de")}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg ${
                        language === "de"
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      🇩🇪 {t("language.german")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className={`space-y-2 ${
                isCollapsed && screenSize !== "mobile"
                  ? "flex flex-col items-center"
                  : ""
              }`}
            >
              

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className={`w-full text-red-600 hover:text-red-700 hover:bg-red-50 ${
                  isCollapsed && screenSize !== "mobile" ? "justify-center" : ""
                }`}
                aria-label={t("user.signOut")}
              >
                <LogOut className="h-4 w-4" />
                {(!isCollapsed || screenSize === "mobile") && (
                  <span className="ml-2">{t("user.signOut")}</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </aside>

      
    </>
  );
};

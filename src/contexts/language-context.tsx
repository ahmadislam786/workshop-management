import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "de";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Translation keys
const translations = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.dashboard.desc": "Overview and statistics",
    "nav.jobs": "Jobs",
    "nav.jobs.desc": "Manage workshop jobs",
    "nav.customers": "Customers",
    "nav.customers.desc": "Customer management",
    "nav.technicians": "Technicians",
    "nav.technicians.desc": "Team management",
    "nav.vehicles": "Vehicles",
    "nav.vehicles.desc": "Vehicle database",
    "nav.scans": "Scans",
    "nav.scans.desc": "Search scans and view results",
    "nav.controlBoard": "Control Board",
    "nav.controlBoard.desc": "Realtime board",
    "nav.planningBoard": "Planning Board",
    "nav.planningBoard.desc": "Planning board",
    "nav.damageReport": "Damage Report",
    "nav.damageReport.desc": "Damage report",
    "nav.myJobs": "My Jobs",
    "nav.myJobs.desc": "Your assigned jobs",

    // App
    "app.title": "Workshop Manager",
    "app.subtitle": "Professional System",
    "app.signIn": "Sign in to access your workshop dashboard",
    "app.professionalSystem": "Professional Workshop Management System",
    "app.manageDescription":
      "Manage jobs, customers, technicians, and vehicles efficiently",

    // User
    "user.administrator": "Administrator",
    "user.technician": "Technician",
    "user.notifications": "Notifications",
    "user.settings": "Settings",
    "user.signOut": "Sign Out",

    // Page headers
    "page.dashboard": "Dashboard Overview",
    "page.dashboard.desc": "Manage your workshop operations",
    "page.jobs.desc": "Track and manage workshop jobs",
    "page.customers.desc": "Manage customer relationships",
    "page.technicians.desc": "Manage your team",
    "page.vehicles.desc": "Vehicle database and management",
    "page.scans.desc": "Search and view scan results",
    "page.controlBoard.desc": "Real-time workshop status",
    "page.planningBoard.desc": "Planning and scheduling",
    "page.damageReport.desc": "Damage report management",

    // Actions
    "action.refresh": "Refresh Data",
    "action.refreshing": "Refreshing...",
    "action.collapse": "Collapse sidebar",
    "action.expand": "Expand sidebar",
    "action.openMenu": "Open mobile menu",
    "action.closeMenu": "Close mobile menu",

    // Language
    "language.english": "English",
    "language.german": "Deutsch",
    "language.switch": "Switch Language",

    // Dashboard
    "dashboard.welcome": "Welcome to Autohaus Denker & Brünen",
    "dashboard.professionalSystem": "Professional Workshop Management System",
    "dashboard.manageOperations":
      "Manage your workshop operations, track jobs, and coordinate with your team efficiently.",
    "dashboard.systemOnline": "System Online",
    "dashboard.jobsActive": "Jobs Active",
    "dashboard.welcomeBack": "Welcome back!",
    "dashboard.workToday":
      "Here's what you need to work on today. Keep up the great work!",
    "dashboard.activeTechnician": "Active Technician",
    "dashboard.jobsAssigned": "Jobs Assigned",

    // Stats
    "stats.totalJobs": "Total Jobs",
    "stats.allTimeJobs": "All time jobs",
    "stats.activeCustomers": "Active Customers",
    "stats.engagedCustomers": "Engaged customers",
    "stats.technicians": "Technicians",
    "stats.teamMembers": "Team members",
    "stats.pendingJobs": "Pending Jobs",
    "stats.awaitingStart": "Awaiting start",
    "stats.inProgress": "In Progress",
    "stats.currentlyWorking": "Currently working",
    "stats.completed": "Completed",
    "stats.successfullyFinished": "Successfully finished",
    "stats.active": "Active",
    "stats.none": "None",

    // Quick Actions
    "actions.addJob": "Add New Job",
    "actions.manageCustomers": "Manage Customers",
    "actions.viewReports": "View Reports",
    "actions.scheduleAppointment": "Schedule Appointment",
    "actions.manageInventory": "Manage Inventory",
    "actions.systemSettings": "System Settings",

    // Plantafel
    "plantafel.orderInbox": "Auftragseingang",
    "plantafel.searchInbox": "Suche im Eingang…",
    "plantafel.unassigned": "Unassigned",
  },
  de: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.dashboard.desc": "Übersicht und Statistiken",
    "nav.jobs": "Aufträge",
    "nav.jobs.desc": "Werkstattaufträge verwalten",
    "nav.customers": "Kunden",
    "nav.customers.desc": "Kundenverwaltung",
    "nav.technicians": "Techniker",
    "nav.technicians.desc": "Teamverwaltung",
    "nav.vehicles": "Fahrzeuge",
    "nav.vehicles.desc": "Fahrzeugdatenbank",
    "nav.scans": "Scans",
    "nav.scans.desc": "Scans suchen und Ergebnisse anzeigen",
    "nav.controlBoard": "Leitstand",
    "nav.controlBoard.desc": "Echtzeit-Board",
    "nav.planningBoard": "Plantafel",
    "nav.planningBoard.desc": "Planungsboard",
    "nav.damageReport": "Dialogannahme",
    "nav.damageReport.desc": "Schadensmeldung",
    "nav.myJobs": "Meine Aufträge",
    "nav.myJobs.desc": "Ihre zugewiesenen Aufträge",

    // App
    "app.title": "Werkstatt Manager",
    "app.subtitle": "Professionelles System",
    "app.signIn":
      "Melden Sie sich an, um auf Ihr Werkstatt-Dashboard zuzugreifen",
    "app.professionalSystem": "Professionelles Werkstatt-Management-System",
    "app.manageDescription":
      "Verwalten Sie Aufträge, Kunden, Techniker und Fahrzeuge effizient",

    // User
    "user.administrator": "Administrator",
    "user.technician": "Techniker",
    "user.notifications": "Benachrichtigungen",
    "user.settings": "Einstellungen",
    "user.signOut": "Abmelden",

    // Page headers
    "page.dashboard": "Dashboard Übersicht",
    "page.dashboard.desc": "Verwalten Sie Ihre Werkstattoperationen",
    "page.jobs.desc": "Werkstattaufträge verfolgen und verwalten",
    "page.customers.desc": "Kundenbeziehungen verwalten",
    "page.technicians.desc": "Verwalten Sie Ihr Team",
    "page.vehicles.desc": "Fahrzeugdatenbank und -verwaltung",
    "page.scans.desc": "Scans suchen und Ergebnisse anzeigen",
    "page.controlBoard.desc": "Echtzeit-Werkstattstatus",
    "page.planningBoard.desc": "Planung und Terminierung",
    "page.damageReport.desc": "Schadensmeldungsverwaltung",

    // Actions
    "action.refresh": "Daten aktualisieren",
    "action.refreshing": "Aktualisiere...",
    "action.collapse": "Sidebar einklappen",
    "action.expand": "Sidebar ausklappen",
    "action.openMenu": "Mobiles Menü öffnen",
    "action.closeMenu": "Mobiles Menü schließen",

    // Language
    "language.english": "English",
    "language.german": "Deutsch",
    "language.switch": "Sprache wechseln",

    // Dashboard
    "dashboard.welcome": "Willkommen bei Autohaus Denker & Brünen",
    "dashboard.professionalSystem":
      "Professionelles Werkstatt-Management-System",
    "dashboard.manageOperations":
      "Verwalten Sie Ihre Werkstattoperationen, verfolgen Sie Aufträge und koordinieren Sie effizient mit Ihrem Team.",
    "dashboard.systemOnline": "System Online",
    "dashboard.jobsActive": "Aktive Aufträge",
    "dashboard.welcomeBack": "Willkommen zurück!",
    "dashboard.workToday":
      "Hier ist, woran Sie heute arbeiten müssen. Weiter so!",
    "dashboard.activeTechnician": "Aktiver Techniker",
    "dashboard.jobsAssigned": "Zugewiesene Aufträge",

    // Stats
    "stats.totalJobs": "Gesamte Aufträge",
    "stats.allTimeJobs": "Alle Aufträge",
    "stats.activeCustomers": "Aktive Kunden",
    "stats.engagedCustomers": "Engagierte Kunden",
    "stats.technicians": "Techniker",
    "stats.teamMembers": "Teammitglieder",
    "stats.pendingJobs": "Ausstehende Aufträge",
    "stats.awaitingStart": "Warten auf Start",
    "stats.inProgress": "In Bearbeitung",
    "stats.currentlyWorking": "Aktuell in Arbeit",
    "stats.completed": "Abgeschlossen",
    "stats.successfullyFinished": "Erfolgreich beendet",
    "stats.active": "Aktiv",
    "stats.none": "Keine",

    // Quick Actions
    "actions.addJob": "Neuen Auftrag hinzufügen",
    "actions.manageCustomers": "Kunden verwalten",
    "actions.viewReports": "Berichte anzeigen",
    "actions.scheduleAppointment": "Termin vereinbaren",
    "actions.manageInventory": "Inventar verwalten",
    "actions.systemSettings": "Systemeinstellungen",

    // Plantafel
    "plantafel.orderInbox": "Auftragseingang",
    "plantafel.searchInbox": "Suche im Eingang…",
    "plantafel.unassigned": "Nicht zugewiesen",
  },
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("en");

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem("workshop-language") as Language;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "de")) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("workshop-language", lang);
  };

  // Translation function
  const t = (key: string): string => {
    return (
      translations[language][
        key as keyof (typeof translations)[typeof language]
      ] || key
    );
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

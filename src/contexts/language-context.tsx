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
    "nav.dayview": "Day View Planner",
    "nav.dayview.desc": "Schedule appointments with AW system",
    "nav.damageReport": "Damage Report",
    "nav.damageReport.desc": "Damage report",
    "nav.myJobs": "My Appointments",
    "nav.myJobs.desc": "Your assigned jobs",
    "nav.calendar": "Calendar",

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
    "page.dayview.desc":
      "Schedule appointments for a specific day with AW capacity",

    // Dashboard stats
    "stats.totalAppointments": "Total Appointments",
    "stats.allTimeAppointments": "All-time appointments",
    "stats.activeCustomers": "Active Customers",
    "stats.engagedCustomers": "Engaged customers",
    "stats.technicians": "Technicians",
    "stats.teamMembers": "Team members",
    "stats.pendingAppointments": "Pending Appointments",
    "stats.awaitingStart": "Awaiting start",
    "stats.inProgress": "In Progress",
    "stats.currentlyWorking": "Currently working",
    "stats.completed": "Completed",
    "stats.successfullyFinished": "Successfully finished",
    "stats.active": "Active",
    "stats.none": "None",
    "page.planningBoard.desc": "Planning and scheduling",
    "page.damageReport.desc": "Damage report management",
    "page.calendar.desc": "View and manage the workshop calendar",

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
    "dashboard.jobsActive": "Appointments Active",
    "dashboard.welcomeBack": "Welcome back!",
    "dashboard.workToday":
      "Here's what you need to work on today. Keep up the great work!",
    "dashboard.activeTechnician": "Active Technician",
    "dashboard.jobsAssigned": "Jobs Assigned",

    // Stats (jobs-specific)
    "stats.totalJobs": "Total Jobs",
    "stats.allTimeJobs": "All time jobs",
    "stats.pendingJobs": "Pending Jobs",
    "stats.cancelled": "Cancelled",

    // Quick Actions
    "actions.addJob": "Add New Appointment",
    "actions.manageCustomers": "Manage Customers",
    "actions.viewReports": "View Reports",
    "actions.scheduleAppointment": "Schedule Appointment",
    "actions.manageInventory": "Manage Inventory",
    "actions.systemSettings": "System Settings",

    // Plantafel
    "plantafel.orderInbox": "Order Inbox",
    "plantafel.searchInbox": "Search in inbox...",
    "plantafel.categoryExample": "e.g. Electrical",
    "plantafel.unassigned": "Unassigned",

    // Calendar and Time
    "calendar.january": "January",
    "calendar.february": "February",
    "calendar.march": "March",
    "calendar.april": "April",
    "calendar.may": "May",
    "calendar.june": "June",
    "calendar.july": "July",
    "calendar.august": "August",
    "calendar.september": "September",
    "calendar.october": "October",
    "calendar.november": "November",
    "calendar.december": "December",
    "calendar.sunday": "Sun",
    "calendar.monday": "Mon",
    "calendar.tuesday": "Tue",
    "calendar.wednesday": "Wed",
    "calendar.thursday": "Thu",
    "calendar.friday": "Fri",
    "calendar.saturday": "Sat",

    // Dashboard Actions
    "dashboard.showCalendar": "Show Calendar",
    "dashboard.hideCalendar": "Hide Calendar",
    "dashboard.scheduleManage": "Schedule and manage appointments",
    "dashboard.customerManagement": "Customer Management",
    "dashboard.manageRelationships": "Manage customer relationships",
    "dashboard.teamManagement": "Team Management",
    "dashboard.manageStaff": "Manage technicians and staff",
    "dashboard.passwordManagement": "Password Management",
    "dashboard.changePasswords": "Change user passwords",
    "dashboard.userManagement": "User Management",
    "dashboard.createManageAccounts": "Create and manage user accounts",
    "dashboard.openJobPool": "Open Appointment Pool",
    "dashboard.jobs": "appointments",
    "dashboard.noOpenJobs": "No open appointments in pool",
    "dashboard.workshopCalendar": "Workshop Calendar",
    "dashboard.recentJobs": "Recent Appointments",
    "dashboard.viewAll": "View All",
    "dashboard.newJob": "New Appointment",
    "dashboard.loadingJobs": "Loading jobs...",
    "dashboard.noJobsFound": "No appointments found",
    "dashboard.createFirstJob": "Create First Job",
    "dashboard.totalRevenue": "Total Revenue",
    "dashboard.customerSatisfaction": "Customer Satisfaction",
    "dashboard.efficiencyRate": "Efficiency Rate",

    // Job Details
    "job.details": "Job Details",
    "job.serviceType": "Service Type",
    "job.status": "Status",
    "job.customer": "Customer",
    "job.vehicle": "Vehicle",
    "job.technician": "Technician",
    "job.scheduledTime": "Scheduled Time",
    "job.duration": "Duration (hours)",
    "job.aiDuration": "AI Duration (hours)",
    "job.source": "Source",
    "job.notes": "Notes",
    "job.close": "Close",
    "job.viewFullDetails": "View Full Details",
    "job.unassigned": "Unassigned",
    "job.notScheduled": "Not scheduled",
    "job.noDate": "No date",
    "job.hours": "hours",
    "job.emailAutomation": "📧 Email Automation",
    "job.manualEntry": "✋ Manual Entry",
    "job.schedule": "Schedule",
    "job.viewAllOpenJobs": "View All Open Jobs",

    // Status
    "status.pending": "pending",
    "status.scheduled": "scheduled",
    "status.inProgress": "in progress",
    "status.completed": "completed",
    "status.cancelled": "cancelled",
    "status.new": "new",
    "status.paused": "paused",
    "status.waiting_parts": "waiting parts",
    "status.done": "done",
    "status.delivered": "delivered",

    // Login Form
    "login.signInFailed": "Sign in failed",
    "login.unexpectedError": "An unexpected error occurred",
    "login.emailPlaceholder": "Enter your email",
    "login.passwordPlaceholder": "Enter your password",
    "login.signingIn": "Signing In...",
    "login.signIn": "Sign In",

    // Technicians
    "technicians.title": "Technicians",
    "technicians.newTechnician": "New Technician",
    "technicians.searchPlaceholder": "Search technicians...",
    "technicians.editTechnician": "Edit Technician",
    "technicians.fullName": "Full Name",
    "technicians.email": "Email",
    "technicians.specialization": "Specialization",
    "technicians.phone": "Phone",
    "technicians.update": "Update",
    "technicians.create": "Create",
    "technicians.cancel": "Cancel",
    "technicians.noTechniciansFound": "No technicians found",
    "technicians.availableForAssignments": "Available for assignments",
    "technicians.jobs": "jobs",
    "technicians.deleteConfirm":
      "Are you sure you want to delete this technician?",
    "technicians.updatedSuccessfully": "Technician updated successfully",
    "technicians.createdSuccessfully": "Technician created successfully",
    "technicians.deletedSuccessfully": "Technician deleted successfully",
    "technicians.failedToSave": "Failed to save technician",
    "technicians.failedToDelete": "Failed to delete technician",
    "technicians.failedToFetch": "Failed to fetch technicians",

    // Skills Manager
    "technicians.skillsManager": "Skills Manager",
    "technicians.skillsManagerDesc":
      "Manage technician skills and specializations",
    "technicians.skills": "Skills",
    "technicians.searchSkills": "Search skills...",
    "technicians.allCategories": "All Categories",
    "technicians.availableSkills": "Available Skills",
    "technicians.manage": "Manage",
    "technicians.more": "more",
    "technicians.specializations": "Specializations",
    "technicians.categories": "categories",
    "technicians.tryDifferentSearch": "Try a different search term",

    // Jobs
    "jobs.myJobs": "My Appointments",
    "jobs.allJobs": "All Appointments",
    "jobs.newJob": "New Appointment",
    "jobs.view": "View",
    "jobs.regular": "Regular",
    "jobs.compact": "Compact",
    "jobs.detailed": "Detailed",
    "jobs.status": "Status",
    "jobs.all": "All",
    "jobs.pending": "Pending",
    "jobs.scheduled": "Scheduled",
    "jobs.inProgress": "In Progress",
    "jobs.completed": "Completed",
    "jobs.cancelled": "Cancelled",
    "jobs.new": "New",
    "jobs.paused": "Paused",
    "jobs.waitingParts": "Waiting Parts",
    "jobs.done": "Done",
    "jobs.delivered": "Delivered",
    "jobs.sortBy": "Sort by",
    "jobs.newest": "Newest",
    "jobs.oldest": "Oldest",
    "jobs.scheduledStart": "Scheduled start",
    "jobs.noJobsFound": "No jobs found",
    "jobs.noAssignedJobs": "You don't have any assigned jobs yet",
    "jobs.createFirstJob": "Get started by creating your first job",

    // Skill-based Job Assignment
    "jobs.skillBasedAssignment": "Skill-Based Job Assignment",
    "jobs.skillBasedAssignmentDesc":
      "Intelligently match jobs to technicians based on their skills",
    "jobs.availableJobs": "Available Jobs",
    "jobs.searchJobs": "Search appointments...",
    "jobs.requiredSkills": "Required Skills",
    "jobs.recommendedTechnicians": "Recommended Technicians",
    "jobs.skills": "skills",
    "jobs.assign": "Assign",
    "jobs.skillMatch": "Skill Match",
    "jobs.perfectMatch": "Perfect Match",
    "jobs.goodMatch": "Good Match",
    "jobs.partialMatch": "Partial Match",
    "jobs.noMatch": "No Match",
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
    "nav.dayview": "Tagesplaner",
    "nav.dayview.desc": "Termine mit AW-System planen",
    "nav.damageReport": "Dialogannahme",
    "nav.damageReport.desc": "Schadensmeldung",
    "nav.myJobs": "Meine Aufträge",
    "nav.myJobs.desc": "Ihre zugewiesenen Aufträge",
    "nav.calendar": "Kalender",

    // App
    "app.title": "Werkstatt Manager",
    "app.subtitle": "Professionelles System",
    "app.signIn":
      "Melden Sie sich an, um auf Ihr Werkstatt-Dashboard zuzugreifen",
    "app.professionalSystem": "Professionelles Werkstatt-Management-System",

    // Dashboard stats
    "stats.totalAppointments": "Gesamttermine",
    "stats.allTimeAppointments": "Termine gesamt",
    "stats.activeCustomers": "Aktive Kunden",
    "stats.engagedCustomers": "Aktive Kunden",
    "stats.technicians": "Techniker",
    "stats.teamMembers": "Teammitglieder",
    "stats.pendingAppointments": "Ausstehende Termine",
    "stats.awaitingStart": "Warten auf Start",
    "stats.inProgress": "In Arbeit",
    "stats.currentlyWorking": "Aktuell in Bearbeitung",
    "stats.completed": "Abgeschlossen",
    "stats.successfullyFinished": "Erfolgreich abgeschlossen",
    "stats.active": "Aktiv",
    "stats.none": "Keine",
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
    "page.calendar.desc": "Werkstattkalender anzeigen und verwalten",

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

    // Stats (jobs-specific)
    "stats.totalJobs": "Gesamte Aufträge",
    "stats.allTimeJobs": "Alle Aufträge",
    "stats.pendingJobs": "Ausstehende Aufträge",
    "stats.cancelled": "Storniert",

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
    "plantafel.categoryExample": "z.B. Elektrik",
    "plantafel.unassigned": "Nicht zugewiesen",

    // Calendar and Time
    "calendar.january": "Januar",
    "calendar.february": "Februar",
    "calendar.march": "März",
    "calendar.april": "April",
    "calendar.may": "Mai",
    "calendar.june": "Juni",
    "calendar.july": "Juli",
    "calendar.august": "August",
    "calendar.september": "September",
    "calendar.october": "Oktober",
    "calendar.november": "November",
    "calendar.december": "Dezember",
    "calendar.sunday": "So",
    "calendar.monday": "Mo",
    "calendar.tuesday": "Di",
    "calendar.wednesday": "Mi",
    "calendar.thursday": "Do",
    "calendar.friday": "Fr",
    "calendar.saturday": "Sa",

    // Dashboard Actions
    "dashboard.showCalendar": "Kalender anzeigen",
    "dashboard.hideCalendar": "Kalender ausblenden",
    "dashboard.scheduleManage": "Termine planen und verwalten",
    "dashboard.customerManagement": "Kundenverwaltung",
    "dashboard.manageRelationships": "Kundenbeziehungen verwalten",
    "dashboard.teamManagement": "Teamverwaltung",
    "dashboard.manageStaff": "Techniker und Personal verwalten",
    "dashboard.passwordManagement": "Passwortverwaltung",
    "dashboard.changePasswords": "Benutzerpasswörter ändern",
    "dashboard.userManagement": "Benutzerverwaltung",
    "dashboard.createManageAccounts": "Benutzerkonten erstellen und verwalten",
    "dashboard.openJobPool": "Offener Auftragspool",
    "dashboard.jobs": "Termine",
    "dashboard.noOpenJobs": "Keine offenen Termine im Pool",
    "dashboard.workshopCalendar": "Werkstattkalender",
    "dashboard.recentJobs": "Aktuelle Termine",
    "dashboard.viewAll": "Alle anzeigen",
    "dashboard.newJob": "Neuer Auftrag",
    "dashboard.loadingJobs": "Lade Aufträge...",
    "dashboard.noJobsFound": "Keine Aufträge gefunden",
    "dashboard.createFirstJob": "Ersten Auftrag erstellen",
    "dashboard.totalRevenue": "Gesamtumsatz",
    "dashboard.customerSatisfaction": "Kundenzufriedenheit",
    "dashboard.efficiencyRate": "Effizienzrate",

    // Job Details
    "job.details": "Auftragsdetails",
    "job.serviceType": "Serviceart",
    "job.status": "Status",
    "job.customer": "Kunde",
    "job.vehicle": "Fahrzeug",
    "job.technician": "Techniker",
    "job.scheduledTime": "Geplante Zeit",
    "job.duration": "Dauer (Stunden)",
    "job.aiDuration": "KI-Dauer (Stunden)",
    "job.source": "Quelle",
    "job.notes": "Notizen",
    "job.close": "Schließen",
    "job.viewFullDetails": "Vollständige Details anzeigen",
    "job.unassigned": "Nicht zugewiesen",
    "job.notScheduled": "Nicht geplant",
    "job.noDate": "Kein Datum",
    "job.hours": "Stunden",
    "job.emailAutomation": "📧 E-Mail-Automatisierung",
    "job.manualEntry": "✋ Manueller Eintrag",
    "job.schedule": "Planen",
    "job.viewAllOpenJobs": "Alle offenen Aufträge anzeigen",

    // Status
    "status.pending": "ausstehend",
    "status.scheduled": "geplant",
    "status.inProgress": "in Bearbeitung",
    "status.completed": "abgeschlossen",
    "status.cancelled": "storniert",
    "status.new": "neu",
    "status.paused": "pausiert",
    "status.waiting_parts": "wartet auf Teile",
    "status.done": "erledigt",
    "status.delivered": "ausgeliefert",

    // Login Form
    "login.signInFailed": "Anmeldung fehlgeschlagen",
    "login.unexpectedError": "Ein unerwarteter Fehler ist aufgetreten",
    "login.emailPlaceholder": "E-Mail eingeben",
    "login.passwordPlaceholder": "Passwort eingeben",
    "login.signingIn": "Anmelden...",
    "login.signIn": "Anmelden",

    // Technicians
    "technicians.title": "Techniker",
    "technicians.newTechnician": "Neuer Techniker",
    "technicians.searchPlaceholder": "Techniker suchen...",
    "technicians.editTechnician": "Techniker bearbeiten",
    "technicians.fullName": "Vollständiger Name",
    "technicians.email": "E-Mail",
    "technicians.specialization": "Spezialisierung",
    "technicians.phone": "Telefon",
    "technicians.update": "Aktualisieren",
    "technicians.create": "Erstellen",
    "technicians.cancel": "Abbrechen",
    "technicians.noTechniciansFound": "Keine Techniker gefunden",
    "technicians.availableForAssignments": "Verfügbar für Aufträge",
    "technicians.jobs": "Aufträge",
    "technicians.deleteConfirm":
      "Sind Sie sicher, dass Sie diesen Techniker löschen möchten?",
    "technicians.updatedSuccessfully": "Techniker erfolgreich aktualisiert",
    "technicians.createdSuccessfully": "Techniker erfolgreich erstellt",
    "technicians.deletedSuccessfully": "Techniker erfolgreich gelöscht",
    "technicians.failedToSave": "Fehler beim Speichern des Technikers",
    "technicians.failedToDelete": "Fehler beim Löschen des Technikers",
    "technicians.failedToFetch": "Fehler beim Laden der Techniker",

    // Skills Manager
    "technicians.skillsManager": "Fähigkeiten-Manager",
    "technicians.skillsManagerDesc":
      "Techniker-Fähigkeiten und Spezialisierungen verwalten",
    "technicians.skills": "Fähigkeiten",
    "technicians.searchSkills": "Fähigkeiten suchen...",
    "technicians.allCategories": "Alle Kategorien",
    "technicians.availableSkills": "Verfügbare Fähigkeiten",
    "technicians.manage": "Verwalten",
    "technicians.more": "weitere",
    "technicians.specializations": "Spezialisierungen",
    "technicians.categories": "Kategorien",
    "technicians.tryDifferentSearch": "Versuchen Sie einen anderen Suchbegriff",

    // Jobs
    "jobs.myJobs": "Meine Aufträge",
    "jobs.allJobs": "Alle Aufträge",
    "jobs.newJob": "Neuer Auftrag",
    "jobs.view": "Ansicht",
    "jobs.regular": "Regulär",
    "jobs.compact": "Kompakt",
    "jobs.detailed": "Detailliert",
    "jobs.status": "Status",
    "jobs.all": "Alle",
    "jobs.pending": "Ausstehend",
    "jobs.scheduled": "Geplant",
    "jobs.inProgress": "In Bearbeitung",
    "jobs.completed": "Abgeschlossen",
    "jobs.cancelled": "Storniert",
    "jobs.new": "Neu",
    "jobs.paused": "Pausiert",
    "jobs.waitingParts": "Wartet auf Teile",
    "jobs.done": "Erledigt",
    "jobs.delivered": "Ausgeliefert",
    "jobs.sortBy": "Sortieren nach",
    "jobs.newest": "Neueste",
    "jobs.oldest": "Älteste",
    "jobs.scheduledStart": "Geplanter Start",
    "jobs.noJobsFound": "Keine Aufträge gefunden",
    "jobs.noAssignedJobs": "Sie haben noch keine zugewiesenen Aufträge",
    "jobs.createFirstJob": "Erstellen Sie Ihren ersten Auftrag",

    // Skill-based Job Assignment
    "jobs.skillBasedAssignment": "Fähigkeitsbasierte Auftragszuweisung",
    "jobs.skillBasedAssignmentDesc":
      "Intelligente Zuordnung von Aufträgen zu Technikern basierend auf ihren Fähigkeiten",
    "jobs.availableJobs": "Verfügbare Aufträge",
    "jobs.searchJobs": "Aufträge suchen...",
    "jobs.requiredSkills": "Erforderliche Fähigkeiten",
    "jobs.recommendedTechnicians": "Empfohlene Techniker",
    "jobs.skills": "Fähigkeiten",
    "jobs.assign": "Zuweisen",
    "jobs.skillMatch": "Fähigkeitsübereinstimmung",
    "jobs.perfectMatch": "Perfekte Übereinstimmung",
    "jobs.goodMatch": "Gute Übereinstimmung",
    "jobs.partialMatch": "Teilweise Übereinstimmung",
    "jobs.noMatch": "Keine Übereinstimmung",
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

import { supabase } from "./supabase";

// Type definitions for Supabase query results
interface CustomerData {
  name: string;
}

interface VehicleData {
  make: string;
  model: string;
  license_plate: string;
}

interface TechnicianData {
  name: string;
}

interface ProfileData {
  user_id: string;
}

interface ScheduleAssignmentData {
  technician_id: string;
  technician?: TechnicianData;
}

export interface NotificationData {
  message: string;
  type: "info" | "success" | "warning" | "error";
  action_link?: string;
  action_label?: string;
  user_id?: string;
  technician_id?: string;
  notify_admins?: boolean;
}

// Helper functions to safely extract data from Supabase joins
const extractCustomerName = (
  customer: CustomerData | CustomerData[] | undefined
): string => {
  if (Array.isArray(customer)) {
    return customer[0]?.name || "Unknown Customer";
  }
  return customer?.name || "Unknown Customer";
};

const extractVehicleInfo = (
  vehicle: VehicleData | VehicleData[] | undefined
): string => {
  if (Array.isArray(vehicle)) {
    const v = vehicle[0];
    return v
      ? `${v.make || ""} ${v.model || ""} (${v.license_plate || ""})`
      : "";
  }
  return vehicle
    ? `${vehicle.make || ""} ${vehicle.model || ""} (${vehicle.license_plate || ""})`
    : "";
};

const extractTechnicianName = (
  technician: TechnicianData | TechnicianData[] | undefined
): string => {
  if (Array.isArray(technician)) {
    return technician[0]?.name || "Unknown Technician";
  }
  return technician?.name || "Unknown Technician";
};

const extractUserId = (
  profile: ProfileData | ProfileData[] | undefined
): string | undefined => {
  if (Array.isArray(profile)) {
    return profile[0]?.user_id;
  }
  return profile?.user_id;
};

export class NotificationService {
  /**
   * Create a notification for a specific user
   */
  static async createNotification(data: NotificationData): Promise<void> {
    try {
      const { error } = await supabase.from("notifications").insert([
        {
          user_id: data.user_id,
          message: data.message,
          type: data.type,
          is_read: false,
          action_link: data.action_link,
          action_label: data.action_label,
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Create notifications for all admins
   */
  static async notifyAdmins(
    data: Omit<NotificationData, "user_id" | "technician_id">
  ): Promise<void> {
    try {
      // Get all admin user IDs
      const { data: admins, error: adminError } = await supabase
        .from("profile")
        .select("user_id")
        .eq("role", "admin");

      if (adminError) throw adminError;

      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          user_id: admin.user_id,
          message: data.message,
          type: data.type,
          is_read: false,
          action_link: data.action_link,
          action_label: data.action_label,
        }));

        const { error } = await supabase
          .from("notifications")
          .insert(notifications);

        if (error) throw error;
      }
    } catch (error) {
      console.error("Error notifying admins:", error);
      throw error;
    }
  }

  /**
   * Create notification for a specific technician
   */
  static async notifyTechnician(
    data: NotificationData & { technician_id: string }
  ): Promise<void> {
    try {
      // Get technician's user_id
      const { data: technician, error: techError } = await supabase
        .from("technicians")
        .select(
          `
          profile_id,
          profile!inner(user_id)
        `
        )
        .eq("id", data.technician_id)
        .single();

      if (techError) throw techError;

      const userId = extractUserId(technician?.profile);
      if (userId) {
        await this.createNotification({
          ...data,
          user_id: userId,
        });
      }
    } catch (error) {
      console.error("Error notifying technician:", error);
      throw error;
    }
  }

  /**
   * Create appointment-related notifications
   */
  static async notifyAppointmentCreated(appointmentId: string): Promise<void> {
    try {
      const { data: appointment, error } = await supabase
        .from("appointments")
        .select(
          `
          title,
          customer:customers(name),
          vehicle:vehicles(make, model, license_plate)
        `
        )
        .eq("id", appointmentId)
        .single();

      if (error) throw error;

      const customerName = extractCustomerName(appointment.customer);
      const vehicleInfo = extractVehicleInfo(appointment.vehicle);

      const message = `New appointment created: ${appointment.title} for ${customerName}`;

      await this.notifyAdmins({
        message: `${message}${vehicleInfo ? ` - ${vehicleInfo}` : ""}`,
        type: "info",
        action_link: "/appointments",
        action_label: "View Appointments",
      });
    } catch (error) {
      console.error("Error notifying appointment creation:", error);
    }
  }

  /**
   * Create appointment status change notifications
   */
  static async notifyAppointmentStatusChange(
    appointmentId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    try {
      const { data: appointment, error } = await supabase
        .from("appointments")
        .select(
          `
          title,
          customer:customers(name),
          schedule_assignments(technician_id, technician:technicians(name))
        `
        )
        .eq("id", appointmentId)
        .single();

      if (error) throw error;

      const customerName = extractCustomerName(appointment.customer);
      const message = `Appointment status changed: ${appointment.title} (${customerName}) - ${oldStatus} → ${newStatus}`;

      // Notify admins
      await this.notifyAdmins({
        message,
        type: this.getStatusChangeType(newStatus),
        action_link: "/appointments",
        action_label: "View Appointments",
      });

      // Notify assigned technician if status is scheduled or in_progress
      if (
        (newStatus === "scheduled" || newStatus === "in_progress") &&
        appointment.schedule_assignments?.[0]?.technician_id
      ) {
        await this.notifyTechnician({
          message: `Appointment assigned: ${appointment.title} (${extractCustomerName(appointment.customer)})`,
          type: "info",
          action_link: "/jobs",
          action_label: "View My Jobs",
          technician_id: appointment.schedule_assignments[0].technician_id,
        });
      }
    } catch (error) {
      console.error("Error notifying appointment status change:", error);
    }
  }

  /**
   * Create technician assignment notifications
   */
  static async notifyTechnicianAssignment(
    appointmentId: string,
    technicianId: string
  ): Promise<void> {
    try {
      const { data: appointment, error } = await supabase
        .from("appointments")
        .select(
          `
          title,
          customer:customers(name),
          vehicle:vehicles(make, model, license_plate)
        `
        )
        .eq("id", appointmentId)
        .single();

      if (error) throw error;

      const { data: technician, error: techError } = await supabase
        .from("technicians")
        .select("name")
        .eq("id", technicianId)
        .single();

      if (techError) throw techError;

      // Notify technician
      await this.notifyTechnician({
        message: `New appointment assigned: ${appointment.title} (${extractCustomerName(appointment.customer)})`,
        type: "info",
        action_link: "/jobs",
        action_label: "View My Jobs",
        technician_id: technicianId,
      });

      // Notify admins
      await this.notifyAdmins({
        message: `Technician assigned: ${appointment.title} → ${technician?.name || "Unknown Technician"}`,
        type: "info",
        action_link: "/plantafel",
        action_label: "View Planning Board",
      });
    } catch (error) {
      console.error("Error notifying technician assignment:", error);
    }
  }

  /**
   * Create reminder notifications
   */
  static async createReminders(): Promise<void> {
    try {
      // Find appointments starting in the next 30 minutes
      const { data: appointments, error } = await supabase
        .from("appointments")
        .select(
          `
          id,
          title,
          date,
          customer:customers(name),
          schedule_assignments(technician_id, technician:technicians(name))
        `
        )
        .eq("status", "scheduled")
        .gte("date", new Date().toISOString())
        .lte("date", new Date(Date.now() + 30 * 60 * 1000).toISOString());

      if (error) throw error;

      for (const appointment of appointments || []) {
        if (appointment.schedule_assignments?.[0]?.technician_id) {
          await this.notifyTechnician({
            message: `Reminder: Appointment starting soon - ${appointment.title} (${extractCustomerName(appointment.customer)})`,
            type: "warning",
            action_link: "/jobs",
            action_label: "View My Jobs",
            technician_id: appointment.schedule_assignments[0].technician_id,
          });
        }
      }
    } catch (error) {
      console.error("Error creating reminders:", error);
    }
  }

  /**
   * Check for overdue appointments
   */
  static async checkOverdueAppointments(): Promise<void> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { data: appointments, error } = await supabase
        .from("appointments")
        .select(
          `
          id,
          title,
          date,
          customer:customers(name),
          schedule_assignments(technician_id, technician:technicians(name))
        `
        )
        .eq("status", "in_progress")
        .lt("date", oneHourAgo);

      if (error) throw error;

      for (const appointment of appointments || []) {
        // Notify technician
        if (appointment.schedule_assignments?.[0]?.technician_id) {
          await this.notifyTechnician({
            message: `Overdue appointment: ${appointment.title} (${extractCustomerName(appointment.customer)})`,
            type: "error",
            action_link: "/jobs",
            action_label: "View My Jobs",
            technician_id: appointment.schedule_assignments[0].technician_id,
          });
        }

        // Notify admins
        await this.notifyAdmins({
          message: `Overdue appointment: ${appointment.title} (${extractCustomerName(appointment.customer)}) - ${extractTechnicianName(appointment.schedule_assignments?.[0]?.technician) || "Unassigned"}`,
          type: "error",
          action_link: "/leitstand",
          action_label: "View Control Board",
        });
      }
    } catch (error) {
      console.error("Error checking overdue appointments:", error);
    }
  }

  /**
   * Get notification type based on status
   */
  private static getStatusChangeType(
    status: string
  ): "info" | "success" | "warning" | "error" {
    switch (status) {
      case "done":
      case "delivered":
        return "success";
      case "cancelled":
        return "error";
      case "in_progress":
        return "info";
      case "paused":
      case "waiting_parts":
        return "warning";
      default:
        return "info";
    }
  }

  /**
   * Schedule periodic checks (call this from your app)
   */
  static startPeriodicChecks(): void {
    // Check for reminders every 15 minutes
    setInterval(
      () => {
        this.createReminders();
      },
      15 * 60 * 1000
    );

    // Check for overdue appointments every hour
    setInterval(
      () => {
        this.checkOverdueAppointments();
      },
      60 * 60 * 1000
    );
  }
}

// Export for use in components
export const notificationService = NotificationService;

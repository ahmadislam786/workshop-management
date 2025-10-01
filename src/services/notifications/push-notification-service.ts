import React from "react";
import { useNotifications } from "@/contexts/notification-context";

export interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{ action: string; title: string }>;
  requireInteraction?: boolean;
  silent?: boolean;
}

export class PushNotificationService {
  private static permission: NotificationPermission = "default";
  private static isSupported: boolean = false;

  /**
   * Initialize push notification service
   */
  static async initialize(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    this.isSupported = true;
    this.permission = Notification.permission;

    // Request permission if not granted
    if (this.permission === "default") {
      this.permission = await Notification.requestPermission();
    }

    return this.permission === "granted";
  }

  /**
   * Check if notifications are supported and permitted
   */
  static isAvailable(): boolean {
    return this.isSupported && this.permission === "granted";
  }

  /**
   * Show a push notification
   */
  static async showNotification(
    options: PushNotificationOptions
  ): Promise<void> {
    if (!this.isAvailable()) {
      console.warn("Notifications not available or not permitted");
      return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || "/workshop.svg",
        badge: options.badge || "/workshop.svg",
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
      });

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      // Handle notification click
      notification.onclick = event => {
        event.preventDefault();
        window.focus();

        // If there's an action link in the data, navigate to it
        if (
          options.data?.action_link &&
          typeof options.data.action_link === "string"
        ) {
          window.location.href = options.data.action_link;
        }

        notification.close();
      };

      return Promise.resolve();
    } catch (error) {
      console.error("Error showing notification:", error);
      throw error;
    }
  }

  /**
   * Show notification for new appointment
   */
  static async notifyNewAppointment(
    appointmentTitle: string,
    customerName: string
  ): Promise<void> {
    await this.showNotification({
      title: "New Appointment Created",
      body: `${appointmentTitle} for ${customerName}`,
      tag: "new-appointment",
      data: {
        action_link: "/appointments",
        type: "appointment",
      },
      actions: [
        {
          action: "view",
          title: "View Appointments",
        },
      ],
    });
  }

  /**
   * Show notification for appointment assignment
   */
  static async notifyAppointmentAssignment(
    appointmentTitle: string,
    customerName: string
  ): Promise<void> {
    await this.showNotification({
      title: "Appointment Assigned",
      body: `${appointmentTitle} for ${customerName}`,
      tag: "appointment-assigned",
      data: {
        action_link: "/jobs",
        type: "assignment",
      },
      actions: [
        {
          action: "view",
          title: "View My Jobs",
        },
      ],
    });
  }

  /**
   * Show notification for appointment status change
   */
  static async notifyStatusChange(
    appointmentTitle: string,
    customerName: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    const statusEmoji = this.getStatusEmoji(newStatus);

    await this.showNotification({
      title: "Appointment Status Changed",
      body: `${statusEmoji} ${appointmentTitle} (${customerName}) - ${oldStatus} → ${newStatus}`,
      tag: "status-change",
      data: {
        action_link: "/appointments",
        type: "status_change",
      },
    });
  }

  /**
   * Show reminder notification
   */
  static async notifyReminder(
    appointmentTitle: string,
    customerName: string,
    minutesUntil: number
  ): Promise<void> {
    await this.showNotification({
      title: "Appointment Reminder",
      body: `${appointmentTitle} (${customerName}) starts in ${minutesUntil} minutes`,
      tag: "reminder",
      requireInteraction: true,
      data: {
        action_link: "/jobs",
        type: "reminder",
      },
      actions: [
        {
          action: "view",
          title: "View My Jobs",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
    });
  }

  /**
   * Show overdue notification
   */
  static async notifyOverdue(
    appointmentTitle: string,
    customerName: string
  ): Promise<void> {
    await this.showNotification({
      title: "Overdue Appointment",
      body: `${appointmentTitle} (${customerName}) is overdue`,
      tag: "overdue",
      requireInteraction: true,
      data: {
        action_link: "/jobs",
        type: "overdue",
      },
      actions: [
        {
          action: "view",
          title: "View My Jobs",
        },
      ],
    });
  }

  /**
   * Show technician absence notification
   */
  static async notifyTechnicianAbsence(
    technicianName: string,
    reason: string,
    date: string
  ): Promise<void> {
    await this.showNotification({
      title: "Technician Absence",
      body: `${technicianName} - ${reason} on ${date}`,
      tag: "absence",
      data: {
        action_link: "/technicians",
        type: "absence",
      },
    });
  }

  /**
   * Show system notification
   */
  static async notifySystem(
    message: string,
    type: "info" | "success" | "warning" | "error" = "info"
  ): Promise<void> {
    const emoji = this.getTypeEmoji(type);

    await this.showNotification({
      title: "System Notification",
      body: `${emoji} ${message}`,
      tag: "system",
      data: {
        type: "system",
      },
    });
  }

  /**
   * Get status emoji
   */
  private static getStatusEmoji(status: string): string {
    switch (status) {
      case "waiting":
        return "🆕";
      case "assigned":
        return "📅";
      case "in_progress":
        return "🔧";
      case "paused":
        return "⏸️";
      case "completed":
        return "✅";
      default:
        return "ℹ️";
    }
  }

  /**
   * Get type emoji
   */
  private static getTypeEmoji(type: string): string {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  }

  /**
   * Close all notifications with a specific tag
   */
  static closeNotificationsByTag(tag: string): void {
    // Note: This is a limitation of the Web Notifications API
    // We can't programmatically close notifications by tag
    // The browser handles this automatically
    console.log(
      `Notifications with tag "${tag}" will be closed by the browser`
    );
  }

  /**
   * Get current permission status
   */
  static getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  /**
   * Request permission (if not already granted)
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error("Notifications not supported in this browser");
    }

    this.permission = await Notification.requestPermission();
    return this.permission;
  }
}

// Enhanced notification context integration
export const usePushNotifications = () => {
  const { notifications } = useNotifications();

  // Show push notification when new notification arrives
  React.useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];

      // Only show push notification if it's very recent (within last 5 seconds)
      const notificationTime = new Date(
        latestNotification.created_at
      ).getTime();
      const now = Date.now();

      if (now - notificationTime < 5000) {
        PushNotificationService.showNotification({
          title: "Workshop Management",
          body: latestNotification.message,
          tag: "workshop-notification",
          data: {
            action_link: latestNotification.action_link,
            type: latestNotification.type,
          },
        }).catch(console.error);
      }
    }
  }, [notifications]);

  return {
    initialize: PushNotificationService.initialize,
    isAvailable: PushNotificationService.isAvailable,
    showNotification: PushNotificationService.showNotification,
    requestPermission: PushNotificationService.requestPermission,
    getPermissionStatus: PushNotificationService.getPermissionStatus,
  };
};

// Export the service
export const pushNotificationService = PushNotificationService;

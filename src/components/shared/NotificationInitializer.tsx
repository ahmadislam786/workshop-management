import React, { useEffect } from "react";
import { NotificationService } from "@/services/notifications/notification-service";
import { PushNotificationService } from "@/services/notifications/push-notification-service";
import { useAuth } from "@/contexts/auth-context";

/**
 * Component that initializes the notification system
 * This should be included in the main App component
 */
export const NotificationInitializer: React.FC = () => {
  const { profile } = useAuth();

  useEffect(() => {
    // Initialize push notifications
    const initializePushNotifications = async () => {
      try {
        await PushNotificationService.initialize();
        console.log("Push notifications initialized");
      } catch (error) {
        console.error("Failed to initialize push notifications:", error);
      }
    };

    // Start periodic notification checks
    const startPeriodicChecks = () => {
      try {
        NotificationService.startPeriodicChecks();
        console.log("Periodic notification checks started");
      } catch (error) {
        console.error("Failed to start periodic checks:", error);
      }
    };

    if (profile?.id) {
      // Initialize everything once user is known (prevents double-run on sign-out)
      initializePushNotifications();
      startPeriodicChecks();
    }

    // Cleanup function
    return () => {
      NotificationService.stopPeriodicChecks();
    };
  }, [profile?.id]);

  // This component doesn't render anything
  return null;
};

export default NotificationInitializer;

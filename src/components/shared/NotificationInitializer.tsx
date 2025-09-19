import React, { useEffect } from "react";
import { NotificationService } from "@/lib/notification-service";
import { PushNotificationService } from "@/lib/push-notification-service";

/**
 * Component that initializes the notification system
 * This should be included in the main App component
 */
export const NotificationInitializer: React.FC = () => {
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

    // Initialize everything
    initializePushNotifications();
    startPeriodicChecks();

    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default NotificationInitializer;

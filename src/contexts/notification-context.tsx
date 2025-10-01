import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/hooks/auth";
import { PushNotificationService } from "@/services/notifications/push-notification-service";

export interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_read: boolean;
  created_at: string;
  user_id: string;
  action_link?: string;
  action_label?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (
    notification: Omit<
      Notification,
      "id" | "created_at" | "is_read" | "user_id"
    >
  ) => Promise<void>;
  loading: boolean;
  isLive: boolean;
  pushNotificationsEnabled: boolean;
  enablePushNotifications: () => Promise<boolean>;
  disablePushNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] =
    useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    if (!profile) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", profile.id)
        .eq("is_read", false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const addNotification = async (
    notification: Omit<
      Notification,
      "id" | "created_at" | "is_read" | "user_id"
    >
  ) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert([
          {
            ...notification,
            user_id: profile.id,
            is_read: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setNotifications(prev => [data, ...prev]);
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  // Initialize push notifications when a user id exists
  useEffect(() => {
    const initializePushNotifications = async () => {
      try {
        const enabled = await PushNotificationService.initialize();
        setPushNotificationsEnabled(enabled);
      } catch (error) {
        console.error("Failed to initialize push notifications:", error);
      }
    };

    if (profile?.id) {
      initializePushNotifications();
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile) {
      fetchNotifications();

      // Subscribe to real-time notifications: INSERT/UPDATE/DELETE
      const channel = supabase
        .channel("notifications-realtime")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${profile.id}`,
          },
          payload => {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);

            // Show push notification if enabled
            if (
              pushNotificationsEnabled &&
              PushNotificationService.isAvailable()
            ) {
              PushNotificationService.showNotification({
                title: "Workshop Management",
                body: newNotification.message,
                tag: "workshop-notification",
                data: {
                  action_link: newNotification.action_link,
                  type: newNotification.type,
                },
              }).catch(console.error);
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${profile.id}`,
          },
          payload => {
            const updated = payload.new as Notification;
            setNotifications(prev =>
              prev.map(n => (n.id === updated.id ? { ...n, ...updated } : n))
            );
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${profile.id}`,
          },
          payload => {
            const deleted = payload.old as Notification;
            setNotifications(prev => prev.filter(n => n.id !== deleted.id));
          }
        )
        .subscribe(status => {
          if (status === "SUBSCRIBED") setIsLive(true);
        });

      return () => {
        setIsLive(false);
        supabase.removeChannel(channel);
      };
    }
  }, [profile, pushNotificationsEnabled, fetchNotifications]);

  const enablePushNotifications = async (): Promise<boolean> => {
    try {
      const permission = await PushNotificationService.requestPermission();
      const enabled = permission === "granted";
      setPushNotificationsEnabled(enabled);
      return enabled;
    } catch (error) {
      console.error("Failed to enable push notifications:", error);
      return false;
    }
  };

  const disablePushNotifications = () => {
    setPushNotificationsEnabled(false);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        loading,
        isLive,
        pushNotificationsEnabled,
        enablePushNotifications,
        disablePushNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

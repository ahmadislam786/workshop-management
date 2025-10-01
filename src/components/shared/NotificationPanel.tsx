import React from "react";
import { Bell, X, Check, CheckCheck, ExternalLink, Settings, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNotifications } from "@/contexts/notification-context";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/utils/formatting/utils";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loading,
    isLive,
    pushNotificationsEnabled,
    enablePushNotifications,
    disablePushNotifications,
  } = useNotifications();
  const { t } = useLanguage();
  const [showSettings, setShowSettings] = React.useState(false);

  const getNotificationIcon = (type: string) => {
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
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-green-500 bg-green-50";
      case "warning":
        return "border-l-yellow-500 bg-yellow-50";
      case "error":
        return "border-l-red-500 bg-red-50";
      default:
        return "border-l-blue-500 bg-blue-50";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-25 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl animate-slide-in-right">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                {t("user.notifications")}
              </h2>
              {isLive && (
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                  LIVE
                </span>
              )}
              {pushNotificationsEnabled && (
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  PUSH
                </span>
              )}
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-400 hover:text-gray-600"
                title="Notification Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Notification Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {pushNotificationsEnabled ? (
                      <Volume2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-700">Push Notifications</span>
                  </div>
                  <Button
                    variant={pushNotificationsEnabled ? "outline" : "primary"}
                    size="sm"
                    onClick={pushNotificationsEnabled ? disablePushNotifications : enablePushNotifications}
                    className="text-xs"
                  >
                    {pushNotificationsEnabled ? "Disable" : "Enable"}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {pushNotificationsEnabled 
                    ? "You'll receive browser notifications for new messages"
                    : "Enable to receive browser notifications for new messages"
                  }
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          {unreadCount > 0 && (
            <div className="border-b border-gray-200 px-6 py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Mark All as Read
              </Button>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <Bell className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 border-l-4 transition-colors hover:bg-gray-50",
                      getNotificationColor(notification.type),
                      !notification.is_read && "bg-white"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className={cn(
                              "text-sm font-medium",
                              !notification.is_read
                                ? "text-gray-900"
                                : "text-gray-600"
                            )}
                          >
                            {notification.message}
                          </h3>

                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-gray-400 hover:text-gray-600 p-1"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {new Date(notification.created_at).toLocaleString()}
                          </span>

                          {notification.action_link && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 p-1"
                              onClick={() =>
                                window.open(notification.action_link, "_blank")
                              }
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/config/supabase";
import { toast } from "react-toastify";

interface RealtimeConnection {
  connected: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

interface RealtimeConnections {
  appointments: RealtimeConnection;
  customers: RealtimeConnection;
  vehicles: RealtimeConnection;
  technicians: RealtimeConnection;
  absences: RealtimeConnection;
  assignments: RealtimeConnection;
}

export const useRealtime = () => {
  const [connections, setConnections] = useState<RealtimeConnections>({
    appointments: { connected: false, error: null, lastUpdate: null },
    customers: { connected: false, error: null, lastUpdate: null },
    vehicles: { connected: false, error: null, lastUpdate: null },
    technicians: { connected: false, error: null, lastUpdate: null },
    absences: { connected: false, error: null, lastUpdate: null },
    assignments: { connected: false, error: null, lastUpdate: null },
  });

  const [overallConnected, setOverallConnected] = useState(false);
  const [reconnectionAttempts, setReconnectionAttempts] = useState(0);
  const [maxReconnectionAttempts] = useState(5);

  const updateConnection = useCallback(
    (
      table: keyof RealtimeConnections,
      connected: boolean,
      error: string | null = null
    ) => {
      setConnections(prev => ({
        ...prev,
        [table]: {
          connected,
          error,
          lastUpdate: connected ? new Date() : prev[table].lastUpdate,
        },
      }));
    },
    []
  );

  const reconnectAll = useCallback(async () => {
    if (reconnectionAttempts >= maxReconnectionAttempts) {
      toast.error(
        "Maximum reconnection attempts reached. Please refresh the page."
      );
      return;
    }

    setReconnectionAttempts(prev => prev + 1);
    toast.info(
      `Attempting to reconnect... (${reconnectionAttempts + 1}/${maxReconnectionAttempts})`
    );

    // Reset all connections
    Object.keys(connections).forEach(table => {
      updateConnection(table as keyof RealtimeConnections, false, null);
    });

    // Wait a bit before attempting reconnection
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("reconnect-realtime"));
    }, 2000);
  }, [
    connections,
    reconnectionAttempts,
    maxReconnectionAttempts,
    updateConnection,
  ]);

  const checkOverallConnection = useCallback(() => {
    const allConnected = Object.values(connections).every(
      conn => conn.connected
    );
    const hasErrors = Object.values(connections).some(conn => conn.error);

    setOverallConnected(allConnected && !hasErrors);

    if (hasErrors && reconnectionAttempts < maxReconnectionAttempts) {
      setTimeout(() => {
        reconnectAll();
      }, 5000);
    }
  }, [
    connections,
    reconnectionAttempts,
    maxReconnectionAttempts,
    reconnectAll,
  ]);

  useEffect(() => {
    checkOverallConnection();
  }, [checkOverallConnection]);

  // Listen for reconnection events
  useEffect(() => {
    const handleReconnect = () => {
      setReconnectionAttempts(0);
    };

    window.addEventListener("reconnect-realtime", handleReconnect);
    return () => {
      window.removeEventListener("reconnect-realtime", handleReconnect);
    };
  }, []);

  // Monitor connection health
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const staleConnections = Object.entries(connections).filter(
        ([, conn]) => {
          if (!conn.connected || !conn.lastUpdate) return false;
          const timeSinceUpdate = now.getTime() - conn.lastUpdate.getTime();
          return timeSinceUpdate > 60000; // 1 minute
        }
      );

      if (staleConnections.length > 0) {
        console.warn(
          "Stale connections detected:",
          staleConnections.map(([table]) => table)
        );
        staleConnections.forEach(([table]) => {
          updateConnection(
            table as keyof RealtimeConnections,
            false,
            "Connection timeout"
          );
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [connections, updateConnection]);

  const getConnectionStatus = useCallback(
    (table: keyof RealtimeConnections) => {
      return connections[table];
    },
    [connections]
  );

  const getOverallStatus = useCallback(() => {
    const connectedCount = Object.values(connections).filter(
      conn => conn.connected
    ).length;
    const totalCount = Object.keys(connections).length;
    const hasErrors = Object.values(connections).some(conn => conn.error);

    return {
      connected: overallConnected,
      connectedCount,
      totalCount,
      hasErrors,
      percentage: Math.round((connectedCount / totalCount) * 100),
    };
  }, [connections, overallConnected]);

  return {
    connections,
    overallConnected,
    getConnectionStatus,
    getOverallStatus,
    reconnectAll,
    reconnectionAttempts,
    maxReconnectionAttempts,
  };
};

// Hook for managing individual table subscriptions
interface RealtimePayload {
  new?: Record<string, unknown>;
  old?: Record<string, unknown>;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  schema: string;
  table: string;
}

export const useRealtimeSubscription = (
  table: keyof RealtimeConnections,
  onInsert?: (payload: RealtimePayload) => void,
  onUpdate?: (payload: RealtimePayload) => void,
  onDelete?: (payload: RealtimePayload) => void
) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`${table}-realtime`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table },
        payload => {
          setConnected(true);
          setError(null);
          onInsert?.(payload);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table },
        payload => {
          setConnected(true);
          setError(null);
          onUpdate?.(payload);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table },
        payload => {
          setConnected(true);
          setError(null);
          onDelete?.(payload);
        }
      )
      .subscribe(status => {
        setConnected(status === "SUBSCRIBED");
        if (status === "CHANNEL_ERROR") {
          setError("Connection failed");
          console.error(`Real-time subscription error for ${table}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, onInsert, onUpdate, onDelete]);

  return { connected, error };
};

// RealtimeProvider component for context
interface RealtimeProviderProps {
  children: React.ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({
  children,
}) => {
  return React.createElement(React.Fragment, null, children);
};

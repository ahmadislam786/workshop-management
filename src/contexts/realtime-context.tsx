import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import type { Customer, Vehicle, Appointment } from "@/types";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// =====================================================
// REAL-TIME CONTEXT - PRODUCTION-READY IMPLEMENTATION
// =====================================================

interface RealtimeContextType {
  connected: boolean;
  error: string | null;
  reconnect: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { userId, authState } = useAuth();
  const { dispatch, refreshAll } = useData();

  const channelsRef = useRef<Map<string, ReturnType<typeof supabase.channel>>>(
    new Map()
  );
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resubscribeKey, setResubscribeKey] = useState(0);

  // Keep realtime auth token in sync with current session and reconnect when it changes
  useEffect(() => {
    let isMounted = true;
    const syncToken = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token || null;
      try {
        const rt: unknown = (supabase as unknown as { realtime?: { setAuth?: (token: string | null) => void } }).realtime;
        if (rt && typeof (rt as { setAuth?: (token: string | null) => void }).setAuth === "function") {
          (rt as { setAuth: (token: string | null) => void }).setAuth(accessToken);
        }
      } catch {
        // noop
      }
      // If we have a token and are signed in, ensure subscriptions are active
      if (isMounted && authState === "signed_in" && userId) {
        setResubscribeKey(k => k + 1);
      }
    };

    syncToken();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      try {
        const rt: unknown = (supabase as unknown as { realtime?: { setAuth?: (token: string | null) => void } }).realtime;
        if (rt && typeof (rt as { setAuth?: (token: string | null) => void }).setAuth === "function") {
          (rt as { setAuth: (token: string | null) => void }).setAuth(session?.access_token || null);
        }
      } catch {
        // noop
      }
      if (isMounted && session?.access_token) {
        // Token rotated/refreshed – resubscribe and refresh data
        setResubscribeKey(k => k + 1);
        if (authState === "signed_in" && userId) {
          refreshAll();
        }
      }
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [authState, userId, refreshAll]);

  // Ensure we never leak channels
  const removeAllChannels = useMemo(
    () => () => {
      channelsRef.current.forEach(ch => {
        try {
          supabase.removeChannel(ch);
        } catch {
          // suppress noisy logs in production
        }
      });
      channelsRef.current.clear();
      setConnected(false);
    },
    []
  );

  // Subscribe helper that de-dupes per table
  const subscribeTable = (
    table: string,
    handlers: {
      onInsert?: (
        payload: RealtimePostgresChangesPayload<Record<string, unknown>>
      ) => void;
      onUpdate?: (
        payload: RealtimePostgresChangesPayload<Record<string, unknown>>
      ) => void;
      onDelete?: (
        payload: RealtimePostgresChangesPayload<Record<string, unknown>>
      ) => void;
    }
  ) => {
    // Remove existing channel for this table if present (prevents duplicates)
    const existing = channelsRef.current.get(table);
    if (existing) {
      try {
        supabase.removeChannel(existing);
      } catch {
        // suppress noisy logs in production
      }
      channelsRef.current.delete(table);
    }

    const channel = supabase
      .channel(`${table}-realtime`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table },
        payload => {
          handlers.onInsert?.(payload);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table },
        payload => {
          handlers.onUpdate?.(payload);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table },
        payload => {
          handlers.onDelete?.(payload);
        }
      )
      .subscribe(status => {
        if (status === "SUBSCRIBED") {
          setConnected(true);
        }
        if (status === "CHANNEL_ERROR") {
          setError(`Realtime channel error on ${table}`);
        }
        if (status === "TIMED_OUT") {
          setError(`Realtime channel timeout on ${table}`);
        }
      });

    channelsRef.current.set(table, channel);
  };

  // Setup subscriptions when authenticated
  useEffect(() => {
    if (authState !== "signed_in" || !userId) {
      removeAllChannels();
      return;
    }

    setError(null);

    // customers
    subscribeTable("customers", {
      onInsert: payload => {
        const row = payload.new as Customer;
        dispatch({ type: "ADD_CUSTOMER", customer: row });
      },
      onUpdate: payload => {
        const row = payload.new as Customer;
        dispatch({ type: "UPDATE_CUSTOMER", id: row.id, updates: row });
      },
      onDelete: payload => {
        const oldRow = payload.old as { id: string };
        dispatch({ type: "DELETE_CUSTOMER", id: oldRow.id });
      },
    });

    // vehicles
    subscribeTable("vehicles", {
      onInsert: payload => {
        const row = payload.new as Vehicle;
        dispatch({ type: "ADD_VEHICLE", vehicle: row });
      },
      onUpdate: payload => {
        const row = payload.new as Vehicle;
        dispatch({ type: "UPDATE_VEHICLE", id: row.id, updates: row });
      },
      onDelete: payload => {
        const oldRow = payload.old as { id: string };
        dispatch({ type: "DELETE_VEHICLE", id: oldRow.id });
      },
    });

    // appointments
    subscribeTable("appointments", {
      onInsert: payload => {
        const row = payload.new as Appointment;
        dispatch({ type: "ADD_APPOINTMENT", appointment: row });
      },
      onUpdate: payload => {
        const row = payload.new as Appointment;
        dispatch({ type: "UPDATE_APPOINTMENT", id: row.id, updates: row });
      },
      onDelete: payload => {
        const oldRow = payload.old as { id: string };
        dispatch({ type: "DELETE_APPOINTMENT", id: oldRow.id });
      },
    });

    // jobs table removed in schema cleanup; no subscription

    return () => {
      removeAllChannels();
    };
  }, [
    authState,
    userId,
    dispatch,
    refreshAll,
    removeAllChannels,
    resubscribeKey,
  ]);

  const value: RealtimeContextType = {
    connected,
    error,
    reconnect: () => {
      // Force re-subscribe by clearing and letting effect run
      removeAllChannels();
      // Toggle a key to force the effect to re-run and resubscribe immediately
      setResubscribeKey(k => k + 1);
      if (authState === "signed_in" && userId) {
        refreshAll();
      }
    },
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
};

// Network and visibility-aware auto-reconnect hook
// Ensures realtime subscriptions are restored when the app regains focus or network
export const useRealtimeAutoReconnect = () => {
  const { reconnect } = useRealtime();
  const { authState } = useAuth();

  React.useEffect(() => {
    const onOnline = () => reconnect();
    const onVisibility = () => {
      if (document.visibilityState === "visible") reconnect();
    };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reconnect, authState]);
};

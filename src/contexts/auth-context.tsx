import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase } from "@/lib/supabase";
import type { Profile, Technician } from "@/types";

// =====================================================
// AUTHENTICATION CONTEXT
// =====================================================

interface AuthContextType {
  profile: Profile | null;
  technician: Technician | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  clearAllAuth: () => void;
}

// Create context with default values to avoid Fast Refresh issues
const AuthContext = createContext<AuthContextType>({
  profile: null,
  technician: null,
  loading: true,
  signIn: async () => ({ success: false, error: "Context not initialized" }),
  signOut: async () => {},
  clearAllAuth: () => {},
});

// Export the context
export { AuthContext };

// Export the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [isManualLogin, setIsManualLogin] = useState(false);
  const listenerSetupRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        setProfile(data);

        // If user is a technician, fetch technician record
        if (data.role === "technician") {
          const { data: techData, error: techError } = await supabase
            .from("technicians")
            .select("*")
            .eq("profile_id", data.id)
            .single();

          if (techError) {
            console.error("Error fetching technician record:", techError);
          } else if (techData) {
            setTechnician(techData);
          }
        }

        setLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error in fetchProfile:", error);
    }
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        // Set manual login flag to prevent conflicts
        setIsManualLogin(true);

        // Clear any existing session first
        await supabase.auth.signOut();

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setIsManualLogin(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          await fetchProfile(data.user.id);
          setIsManualLogin(false);
          return { success: true };
        }

        setIsManualLogin(false);
        return { success: false, error: "No user data returned" };
      } catch (error) {
        setIsManualLogin(false);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        };
      }
    },
    [fetchProfile]
  );

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setTechnician(null);
      setLoading(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  const clearAllAuth = useCallback(() => {
    setProfile(null);
    setTechnician(null);
    setLoading(false);
    setIsManualLogin(false);
    listenerSetupRef.current = false;
  }, []);

  useEffect(() => {
    // Don't set up auth state change listener if we're doing manual login
    if (isManualLogin) {
      return;
    }

    // Don't set up listener if it's already been set up
    if (listenerSetupRef.current) {
      return;
    }

    // Check if there's already an active session - if so, don't set up listener
    const checkAndSetupListener = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        return;
      }

      listenerSetupRef.current = true;

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        // Double-check manual login flag inside the listener
        if (isManualLogin) {
          return;
        }

        if (event === "SIGNED_IN" && session?.user) {
          await fetchProfile(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setProfile(null);
          setTechnician(null);
          setLoading(false);
        }
      });

      // Store subscription for cleanup
      return subscription;
    };

    let subscription: any;
    checkAndSetupListener().then(sub => {
      subscription = sub;
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
        listenerSetupRef.current = false;
      }
    };
  }, [fetchProfile, isManualLogin]);

  const value: AuthContextType = {
    profile,
    technician,
    loading,
    signIn,
    signOut,
    clearAllAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

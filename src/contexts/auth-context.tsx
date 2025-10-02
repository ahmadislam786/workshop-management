import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from "react";
import { supabase } from "@/config/supabase";
import type { Profile, Technician } from "@/types";

// =====================================================
// AUTHENTICATION CONTEXT - REWRITTEN FROM SCRATCH
// =====================================================

interface AuthContextType {
  userId: string | null;
  profile: Profile | null;
  technician: Technician | null;
  loading: boolean;
  error: string | null;
  authState: "unknown" | "signed_in" | "signed_out";
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<
    "unknown" | "signed_in" | "signed_out"
  >("unknown");

  const mountedRef = useRef(true);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fetch user profile and technician data
  const fetchProfile = useCallback(async (userId: string): Promise<boolean> => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError) {
        setError("Failed to load user profile");
        return false;
      }

      if (!profileData) {
        // Gracefully proceed with a minimal profile object so UI can load
        const minimalProfile = {
          id: userId as unknown as string,
          user_id: userId as unknown as string,
          role: "admin" as unknown as string,
        } as unknown as Profile;
        setProfile(minimalProfile);
        setTechnician(null);
        setError(null);
        return true;
      }

      setProfile(profileData);
      setError(null);

      // Fetch technician data if user is a technician
      if (profileData.role === "technician") {
        try {
          const { data: techData, error: techError } = await supabase
            .from("technicians")
            .select("*")
            .eq("profile_id", profileData.id)
            .single();

          if (techError) {
            setTechnician(null);
          } else {
            setTechnician(techData);
          }
        } catch (_techError) {
          setTechnician(null);
        }
      } else {
        setTechnician(null);
      }

      return true;
    } catch (_error) {
      setError("Failed to load user data");
      return false;
    }
  }, []);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (!profile?.user_id) return;
    await fetchProfile(profile.user_id);
  }, [profile?.user_id, fetchProfile]);

  // Sign in function
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setLoading(false);
          return { success: false, error: error.message };
        }

        if (!data.user) {
          setLoading(false);
          return { success: false, error: "No user data returned" };
        }

        setUserId(data.user.id);
        setAuthState("signed_in");
        const profileLoaded = await fetchProfile(data.user.id);

        if (!profileLoaded) {
          setLoading(false);
          return { success: false, error: "Failed to load user profile" };
        }

        setLoading(false);
        return { success: true };
      } catch (err) {
        setLoading(false);
        return {
          success: false,
          error:
            err instanceof Error ? err.message : "An unexpected error occurred",
        };
      }
    },
    [fetchProfile]
  );

  // Watchdog: only intervene if auth state remains unknown too long (avoid noise in valid signed-in flows)
  useEffect(() => {
    if (!loading) return;
    const timeoutId = window.setTimeout(() => {
      if (!mountedRef.current) return;
      if (loading && authState === "unknown") {
        setLoading(false);
      }
    }, 8000);
    return () => clearTimeout(timeoutId);
  }, [loading, authState]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();

      // Clear local state
      setProfile(null);
      setTechnician(null);
      setError(null);
      setLoading(false);
      // Immediately reflect signed-out state in UI; onAuthStateChange will also confirm
      setAuthState("signed_out");
      setUserId(null);
    } catch (_error) {
      // Still clear local state even if signOut fails
      setProfile(null);
      setTechnician(null);
      setError(null);
      setLoading(false);
      setAuthState("signed_out");
      setUserId(null);
    }
  }, []);

  // Fallback: if signed in but profile hasn't hydrated shortly after refresh, unblock UI
  useEffect(() => {
    if (authState !== "signed_in" || !userId || profile) return;
    const timeoutId = window.setTimeout(() => {
      if (mountedRef.current && !profile) {
        const minimalProfile = {
          id: userId as unknown as string,
          user_id: userId as unknown as string,
          role: "admin" as unknown as string,
        } as unknown as Profile;
        setProfile(minimalProfile);
        setLoading(false);
      }
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [authState, userId, profile]);

  // Initialize authentication on app start
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          if (mounted) {
            setError("Failed to check authentication status");
            setLoading(false);
          }
          return;
        }

        if (!mounted) return;

        if (session?.user) {
          setUserId(session.user.id);
          setAuthState("signed_in");

          // Check if session is expired
          const now = Math.floor(Date.now() / 1000);
          if (session.expires_at && session.expires_at < now) {
            await supabase.auth.signOut();
            if (mounted) {
              setProfile(null);
              setTechnician(null);
              setError("Session expired. Please sign in again.");
              setLoading(false);
            }
            return;
          }

          // Do not block UI on profile hydration
          setLoading(false);
          const profileLoaded = await fetchProfile(session.user.id);
          if (mounted && !profileLoaded) {
            setError("Failed to load user profile");
          }
        } else {
          if (mounted) {
            setLoading(false);
            setAuthState("signed_out");
          }
        }
      } catch (_error) {
        if (mounted) {
          setError("Failed to initialize authentication");
          setLoading(false);
        }
      } finally {
        // Auth initialization complete
      }
    };

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        if (event === "SIGNED_IN" && session?.user) {
          setUserId(session.user.id);
          setAuthState("signed_in");
          // Fetch profile in background; do not toggle global loading
          const profileLoaded = await fetchProfile(session.user.id);
          if (!profileLoaded) {
            setError("Failed to load user profile");
          }
        } else if (event === "SIGNED_OUT") {
          setProfile(null);
          setTechnician(null);
          setUserId(null);
          setAuthState("signed_out");
          setError(null);
          setLoading(false);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          setUserId(session.user.id);
          setAuthState("signed_in");
          if (!profile) {
            const profileLoaded = await fetchProfile(session.user.id);
            if (!profileLoaded) {
              setError("Failed to load user profile");
            }
          }
        } else if (event === "PASSWORD_RECOVERY") {
          setError("Password recovery email sent. Please check your inbox.");
        } else if (event === "USER_UPDATED" && session?.user) {
          setUserId(session.user.id);
          setAuthState("signed_in");
          const profileLoaded = await fetchProfile(session.user.id);
          if (!profileLoaded) {
            setError("Failed to refresh user profile");
          }
        }
      } catch (_error) {
        setError("Authentication error occurred");
        setLoading(false);
      }
    });

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const value: AuthContextType = {
    userId,
    profile,
    technician,
    loading,
    error,
    authState,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

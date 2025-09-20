import { supabase } from "./supabase";
import config from "../../config";
import type { CreateUserData, UserCreationResult } from "../types";

// =====================================================
// USER MANAGEMENT SERVICE
// =====================================================

/**
 * Service class for managing user creation and management
 */
export class UserManagementService {
  /**
   * Create a new user with the specified role
   */
  static async createUser(
    userData: CreateUserData
  ): Promise<UserCreationResult> {
    try {
      // Strategy 1: Service Role Key (Production Recommended)
      if (config.serviceRoleKey) {
        const result = await this.createUserWithServiceRole(userData);
        if (result.success) {
          return result;
        }
      }

      // Strategy 2: Fallback to self-service registration
      return await this.createUserWithSelfService(userData);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Method 1: Service Role Key (Production Recommended)
   * This bypasses RLS policies and creates users directly
   */
  private static async createUserWithServiceRole(
    userData: CreateUserData
  ): Promise<UserCreationResult> {
    try {
      // Create user account
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true, // Auto-confirm for immediate access
          user_metadata: {
            name: userData.name,
            role: userData.role,
          },
        });

      if (authError) {
        return {
          success: false,
          error: `Authentication error: ${authError.message}`,
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: "No user returned from authentication",
        };
      }

      const userId = authData.user.id;

      // Create profile record
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .insert([
          {
            user_id: userId,
            role: userData.role,
          },
        ])
        .select("id")
        .single();

      if (profileError) {
        return {
          success: false,
          error: `Profile creation error: ${profileError.message}`,
        };
      }

      // Create technician record if needed
      if (userData.role === "technician") {
        const { error: technicianError } = await supabase
          .from("technicians")
          .insert([
            {
              profile_id: profileData.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone || null,
            },
          ]);

        if (technicianError) {
          return {
            success: false,
            error: `Technician creation error: ${technicianError.message}`,
          };
        }
      }

      return {
        success: true,
        userId,
        profileId: profileData.id,
        requiresEmailConfirmation: false,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Service role method failed",
      };
    }
  }

  /**
   * Method 2: Self-service registration (Fallback)
   * This requires email confirmation but works without service role key
   */
  private static async createUserWithSelfService(
    userData: CreateUserData
  ): Promise<UserCreationResult> {
    try {
      // Create user account
      const { data: signupData, error: signupError } =
        await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              role: userData.role,
            },
          },
        });

      if (signupError) {
        return {
          success: false,
          error: `Signup error: ${signupError.message}`,
        };
      }

      if (!signupData.user) {
        return {
          success: false,
          error: "No user returned from signup",
        };
      }

      const userId = signupData.user.id;

      // Create profile record
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .insert([
          {
            user_id: userId,
            role: userData.role,
          },
        ])
        .select("id")
        .single();

      if (profileError) {
        return {
          success: false,
          error: `Profile creation error: ${profileError.message}`,
        };
      }

      // Create technician record if needed
      if (userData.role === "technician") {
        const { error: technicianError } = await supabase
          .from("technicians")
          .insert([
            {
              profile_id: profileData.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone || null,
            },
          ]);

        if (technicianError) {
          return {
            success: false,
            error: `Technician creation error: ${technicianError.message}`,
          };
        }
      }

      return {
        success: true,
        userId,
        profileId: profileData.id,
        requiresEmailConfirmation: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Self-service method failed",
      };
    }
  }

  /**
   * Get user counts for dashboard
   */
  static async getUserCounts() {
    try {
      const { data: profiles, error } = await supabase
        .from("profile")
        .select("role");

      if (error) throw error;

      const admins = profiles?.filter(p => p.role === "admin").length || 0;
      const technicians =
        profiles?.filter(p => p.role === "technician").length || 0;

      return { admins, technicians };
    } catch {
      return { admins: 0, technicians: 0 };
    }
  }
}

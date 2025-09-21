import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Appointment, ScheduleAssignment } from "@/types";
import { toast } from "react-toastify";
import { NotificationService } from "@/lib/notification-service";

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          customer:customers(*),
          vehicle:vehicles(*),
          service:services(*)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAppointments(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch appointments";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = useCallback(
    async (appointmentData: Partial<Appointment>) => {
      try {
        const { data, error } = await supabase
          .from("appointments")
          .insert([appointmentData])
          .select(
            `
          *,
          customer:customers(*),
          vehicle:vehicles(*),
          service:services(*)
        `
          )
          .single();

        if (error) throw error;

        setAppointments(prev => [data, ...prev]);
        toast.success("Appointment created successfully");

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create appointment";
        toast.error(errorMessage);
        throw err;
      }
    },
    []
  );

  const updateAppointment = useCallback(
    async (id: string, updates: Partial<Appointment>) => {
      try {
        // Get the old appointment data to compare status changes
        const oldAppointment = appointments.find(apt => apt.id === id);

        const { data, error } = await supabase
          .from("appointments")
          .update(updates)
          .eq("id", id)
          .select(
            `
          *,
          customer:customers(*),
          vehicle:vehicles(*),
          service:services(*)
        `
          )
          .single();

        if (error) throw error;

        setAppointments(prev =>
          prev.map(appointment => (appointment.id === id ? data : appointment))
        );
        // Don't show toast here - let the calling component handle it

        // Create notification for status changes (only for important status changes)
        if (
          oldAppointment &&
          updates.status &&
          oldAppointment.status !== updates.status &&
          (updates.status === "done" || updates.status === "delivered")
        ) {
          try {
            await NotificationService.notifyAppointmentStatusChange(
              id,
              oldAppointment.status,
              updates.status
            );
          } catch (notificationError) {
            console.error(
              "Failed to create status change notification:",
              notificationError
            );
          }
        }

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update appointment";
        toast.error(errorMessage);
        throw err;
      }
    },
    [appointments]
  );

  const deleteAppointment = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setAppointments(prev =>
        prev.filter(appointment => appointment.id !== id)
      );
      toast.success("Appointment deleted successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete appointment";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const getAppointmentsForDate = useCallback(async (date: string) => {
    try {
      //
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          customer:customers(*),
          vehicle:vehicles(*),
          service:services(*)
        `
        )
        .eq("date", date)
        .order("created_at", { ascending: false });

      if (error) throw error;
      //
      return data || [];
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch appointments for date";
      toast.error(errorMessage);
      return [];
    }
  }, []);

  const getUnassignedAppointments = useCallback(() => {
    return appointments.filter(appointment => appointment.status === "new");
  }, [appointments]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsForDate,
    getUnassignedAppointments,
  };
};

export const useScheduleAssignments = () => {
  const [assignments, setAssignments] = useState<ScheduleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("schedule_assignments")
        .select(
          `
          *,
          appointment:appointments(*),
          technician:technicians(*)
        `
        )
        .order("start_time", { ascending: true });

      if (error) throw error;

      setAssignments(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch schedule assignments";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAssignment = useCallback(
    async (assignmentData: Partial<ScheduleAssignment>) => {
      try {
        const { data, error } = await supabase
          .from("schedule_assignments")
          .insert([assignmentData])
          .select(
            `
          *,
          appointment:appointments(*),
          technician:technicians(*)
        `
          )
          .single();

        if (error) throw error;

        setAssignments(prev =>
          [...prev, data].sort(
            (a, b) =>
              new Date(a.start_time).getTime() -
              new Date(b.start_time).getTime()
          )
        );
        // Don't show toast here - let the calling component handle it
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to create schedule assignment";
        toast.error(errorMessage);
        throw err;
      }
    },
    []
  );

  const updateAssignment = useCallback(
    async (id: string, updates: Partial<ScheduleAssignment>) => {
      try {
        const { data, error } = await supabase
          .from("schedule_assignments")
          .update(updates)
          .eq("id", id)
          .select(
            `
          *,
          appointment:appointments(*),
          technician:technicians(*)
        `
          )
          .single();

        if (error) throw error;

        setAssignments(prev =>
          prev
            .map(assignment => (assignment.id === id ? data : assignment))
            .sort(
              (a, b) =>
                new Date(a.start_time).getTime() -
                new Date(b.start_time).getTime()
            )
        );
        toast.success("Schedule assignment updated successfully");
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to update schedule assignment";
        toast.error(errorMessage);
        throw err;
      }
    },
    []
  );

  const deleteAssignment = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("schedule_assignments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setAssignments(prev => prev.filter(assignment => assignment.id !== id));
      toast.success("Schedule assignment deleted successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to delete schedule assignment";
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const getAssignmentsForDate = useCallback(async (date: string) => {
    try {
      const { data, error } = await supabase
        .from("schedule_assignments")
        .select(
          `
          *,
          appointment:appointments(*),
          technician:technicians(*)
        `
        )
        .gte("start_time", `${date}T00:00:00`)
        .lt("start_time", `${date}T23:59:59`)
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch assignments for date";
      toast.error(errorMessage);
      return [];
    }
  }, []);

  const getAssignmentsForTechnician = useCallback(
    async (technicianId: string, date: string) => {
      try {
        const { data, error } = await supabase
          .from("schedule_assignments")
          .select(
            `
          *,
          appointment:appointments(*),
          technician:technicians(*)
        `
          )
          .eq("technician_id", technicianId)
          .gte("start_time", `${date}T00:00:00`)
          .lt("start_time", `${date}T23:59:59`)
          .order("start_time", { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch assignments for technician";
        toast.error(errorMessage);
        return [];
      }
    },
    []
  );

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    loading,
    error,
    fetchAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentsForDate,
    getAssignmentsForTechnician,
  };
};

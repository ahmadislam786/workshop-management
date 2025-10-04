import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "@/config/supabase";
import type { Customer, Vehicle, Appointment, Technician } from "@/types";
import { toast } from "react-toastify";
import { useAuth } from "./auth-context";

// =====================================================
// DATA CONTEXT - REWRITTEN WITH PROPER STATE MANAGEMENT
// =====================================================

interface DataState {
  customers: Customer[];
  vehicles: Vehicle[];
  appointments: Appointment[];
  technicians: Technician[];
  loading: {
    customers: boolean;
    vehicles: boolean;
    appointments: boolean;
    technicians: boolean;
  };
  errors: {
    customers: string | null;
    vehicles: string | null;
    appointments: string | null;
    technicians: string | null;
  };
  lastFetch: {
    customers: Date | null;
    vehicles: Date | null;
    appointments: Date | null;
    technicians: Date | null;
  };
  cache: {
    customers: Map<string, Customer>;
    vehicles: Map<string, Vehicle>;
    appointments: Map<string, Appointment>;
    technicians: Map<string, Technician>;
  };
}

type DataAction =
  | {
      type: "SET_LOADING";
      entity: keyof DataState["loading"];
      loading: boolean;
    }
  | {
      type: "SET_ERROR";
      entity: keyof DataState["errors"];
      error: string | null;
    }
  | { type: "SET_CUSTOMERS"; customers: Customer[] }
  | { type: "SET_VEHICLES"; vehicles: Vehicle[] }
  | { type: "SET_APPOINTMENTS"; appointments: Appointment[] }
  | { type: "SET_TECHNICIANS"; technicians: Technician[] }
  | { type: "ADD_CUSTOMER"; customer: Customer }
  | { type: "UPDATE_CUSTOMER"; id: string; updates: Partial<Customer> }
  | { type: "DELETE_CUSTOMER"; id: string }
  | { type: "ADD_VEHICLE"; vehicle: Vehicle }
  | { type: "UPDATE_VEHICLE"; id: string; updates: Partial<Vehicle> }
  | { type: "DELETE_VEHICLE"; id: string }
  | { type: "ADD_APPOINTMENT"; appointment: Appointment }
  | { type: "UPDATE_APPOINTMENT"; id: string; updates: Partial<Appointment> }
  | { type: "DELETE_APPOINTMENT"; id: string }
  | { type: "ADD_TECHNICIAN"; technician: Technician }
  | { type: "UPDATE_TECHNICIAN"; id: string; updates: Partial<Technician> }
  | { type: "DELETE_TECHNICIAN"; id: string }
  | {
      type: "SET_LAST_FETCH";
      entity: keyof DataState["lastFetch"];
      timestamp: Date;
    }
  | { type: "CLEAR_CACHE" };

const initialState: DataState = {
  customers: [],
  vehicles: [],
  appointments: [],
  technicians: [],
  loading: {
    customers: false,
    vehicles: false,
    appointments: false,
    technicians: false,
  },
  errors: {
    customers: null,
    vehicles: null,
    appointments: null,
    technicians: null,
  },
  lastFetch: {
    customers: null,
    vehicles: null,
    appointments: null,
    technicians: null,
  },
  cache: {
    customers: new Map(),
    vehicles: new Map(),
    appointments: new Map(),
    technicians: new Map(),
  },
};

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.entity]: action.loading,
        },
      };

    case "SET_ERROR":
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.entity]: action.error,
        },
      };

    case "SET_CUSTOMERS":
      const customerCache = new Map(state.cache.customers);
      action.customers.forEach(customer =>
        customerCache.set(customer.id, customer)
      );
      return {
        ...state,
        customers: action.customers,
        cache: { ...state.cache, customers: customerCache },
        lastFetch: {
          ...state.lastFetch,
          customers: new Date(),
        },
      };

    case "SET_VEHICLES":
      const vehicleCache = new Map(state.cache.vehicles);
      action.vehicles.forEach(vehicle => vehicleCache.set(vehicle.id, vehicle));
      return {
        ...state,
        vehicles: action.vehicles,
        cache: { ...state.cache, vehicles: vehicleCache },
        lastFetch: {
          ...state.lastFetch,
          vehicles: new Date(),
        },
      };

    case "SET_APPOINTMENTS":
      const appointmentCache = new Map(state.cache.appointments);
      action.appointments.forEach(appointment =>
        appointmentCache.set(appointment.id, appointment)
      );
      return {
        ...state,
        appointments: action.appointments,
        cache: { ...state.cache, appointments: appointmentCache },
        lastFetch: {
          ...state.lastFetch,
          appointments: new Date(),
        },
      };

    case "SET_TECHNICIANS":
      const technicianCache = new Map(state.cache.technicians);
      action.technicians.forEach(technician =>
        technicianCache.set(technician.id, technician)
      );
      return {
        ...state,
        technicians: action.technicians,
        cache: { ...state.cache, technicians: technicianCache },
        lastFetch: {
          ...state.lastFetch,
          technicians: new Date(),
        },
      };

    case "ADD_CUSTOMER":
      const newCustomerCache = new Map(state.cache.customers);
      newCustomerCache.set(action.customer.id, action.customer);
      return {
        ...state,
        customers: [action.customer, ...state.customers],
        cache: { ...state.cache, customers: newCustomerCache },
      };

    case "UPDATE_CUSTOMER":
      const updatedCustomerCache = new Map(state.cache.customers);
      const existingCustomer = updatedCustomerCache.get(action.id);
      if (existingCustomer) {
        const updatedCustomer = { ...existingCustomer, ...action.updates };
        updatedCustomerCache.set(action.id, updatedCustomer);
      }
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.id
            ? { ...customer, ...action.updates }
            : customer
        ),
        cache: { ...state.cache, customers: updatedCustomerCache },
      };

    case "DELETE_CUSTOMER":
      const deletedCustomerCache = new Map(state.cache.customers);
      deletedCustomerCache.delete(action.id);
      return {
        ...state,
        customers: state.customers.filter(
          customer => customer.id !== action.id
        ),
        cache: { ...state.cache, customers: deletedCustomerCache },
      };

    case "ADD_VEHICLE":
      const newVehicleCache = new Map(state.cache.vehicles);
      newVehicleCache.set(action.vehicle.id, action.vehicle);
      return {
        ...state,
        vehicles: [action.vehicle, ...state.vehicles],
        cache: { ...state.cache, vehicles: newVehicleCache },
      };

    case "UPDATE_VEHICLE":
      const updatedVehicleCache = new Map(state.cache.vehicles);
      const existingVehicle = updatedVehicleCache.get(action.id);
      if (existingVehicle) {
        const updatedVehicle = { ...existingVehicle, ...action.updates };
        updatedVehicleCache.set(action.id, updatedVehicle);
      }
      return {
        ...state,
        vehicles: state.vehicles.map(vehicle =>
          vehicle.id === action.id ? { ...vehicle, ...action.updates } : vehicle
        ),
        cache: { ...state.cache, vehicles: updatedVehicleCache },
      };

    case "DELETE_VEHICLE":
      const deletedVehicleCache = new Map(state.cache.vehicles);
      deletedVehicleCache.delete(action.id);
      return {
        ...state,
        vehicles: state.vehicles.filter(vehicle => vehicle.id !== action.id),
        cache: { ...state.cache, vehicles: deletedVehicleCache },
      };

    case "ADD_APPOINTMENT":
      const newAppointmentCache = new Map(state.cache.appointments);
      newAppointmentCache.set(action.appointment.id, action.appointment);
      return {
        ...state,
        appointments: [action.appointment, ...state.appointments],
        cache: { ...state.cache, appointments: newAppointmentCache },
      };

    case "UPDATE_APPOINTMENT":
      const updatedAppointmentCache = new Map(state.cache.appointments);
      const existingAppointment = updatedAppointmentCache.get(action.id);
      if (existingAppointment) {
        const updatedAppointment = {
          ...existingAppointment,
          ...action.updates,
        };
        updatedAppointmentCache.set(action.id, updatedAppointment);
      }
      return {
        ...state,
        appointments: state.appointments.map(appointment =>
          appointment.id === action.id
            ? { ...appointment, ...action.updates }
            : appointment
        ),
        cache: { ...state.cache, appointments: updatedAppointmentCache },
      };

    case "DELETE_APPOINTMENT":
      const deletedAppointmentCache = new Map(state.cache.appointments);
      deletedAppointmentCache.delete(action.id);
      return {
        ...state,
        appointments: state.appointments.filter(
          appointment => appointment.id !== action.id
        ),
        cache: { ...state.cache, appointments: deletedAppointmentCache },
      };

    case "ADD_TECHNICIAN":
      const newTechnicianCache = new Map(state.cache.technicians);
      newTechnicianCache.set(action.technician.id, action.technician);
      return {
        ...state,
        technicians: [action.technician, ...state.technicians],
        cache: { ...state.cache, technicians: newTechnicianCache },
      };

    case "UPDATE_TECHNICIAN":
      const updatedTechnicianCache = new Map(state.cache.technicians);
      const existingTechnician = updatedTechnicianCache.get(action.id);
      if (existingTechnician) {
        const updatedTechnician = { ...existingTechnician, ...action.updates };
        updatedTechnicianCache.set(action.id, updatedTechnician);
      }
      return {
        ...state,
        technicians: state.technicians.map(technician =>
          technician.id === action.id
            ? { ...technician, ...action.updates }
            : technician
        ),
        cache: { ...state.cache, technicians: updatedTechnicianCache },
      };

    case "DELETE_TECHNICIAN":
      const deletedTechnicianCache = new Map(state.cache.technicians);
      deletedTechnicianCache.delete(action.id);
      return {
        ...state,
        technicians: state.technicians.filter(
          technician => technician.id !== action.id
        ),
        cache: { ...state.cache, technicians: deletedTechnicianCache },
      };

    case "SET_LAST_FETCH":
      return {
        ...state,
        lastFetch: {
          ...state.lastFetch,
          [action.entity]: action.timestamp,
        },
      };

    case "CLEAR_CACHE":
      return {
        ...state,
        cache: {
          customers: new Map(),
          vehicles: new Map(),
          appointments: new Map(),
          technicians: new Map(),
        },
      };

    default:
      return state;
  }
}

interface DataContextType {
  state: DataState;
  dispatch: React.Dispatch<DataAction>;
  fetchCustomers: () => Promise<void>;
  fetchVehicles: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
  fetchTechnicians: () => Promise<void>;
  createCustomer: (data: Partial<Customer>) => Promise<Customer | null>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;
  createVehicle: (data: Partial<Vehicle>) => Promise<Vehicle | null>;
  updateVehicle: (id: string, data: Partial<Vehicle>) => Promise<boolean>;
  deleteVehicle: (id: string) => Promise<boolean>;
  createAppointment: (
    data: Partial<Appointment>
  ) => Promise<Appointment | null>;
  updateAppointment: (
    id: string,
    data: Partial<Appointment>
  ) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;
  createTechnician: (data: Partial<Technician>) => Promise<Technician | null>;
  updateTechnician: (id: string, data: Partial<Technician>) => Promise<boolean>;
  deleteTechnician: (id: string) => Promise<boolean>;
  refreshAll: () => Promise<void>;
  clearCache: () => void;
  getFromCache: <T>(entity: keyof DataState["cache"], id: string) => T | null;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Import useAuth to check authentication status
  const { userId, loading: authLoading, authState } = useAuth();

  // ---------------------------------------------
  // Local storage cache for fast hydration on refresh
  // ---------------------------------------------
  const getCacheKey = useCallback(
    (entity: keyof DataState["cache"]) => `wm-cache:${userId}:${entity}`,
    [userId]
  );

  // Hydrate from localStorage when user becomes authenticated
  useEffect(() => {
    if (authLoading) return;
    if (authState !== "signed_in" || !userId) return;

    try {
      const customersJson = window.localStorage.getItem(
        getCacheKey("customers")
      );
      const vehiclesJson = window.localStorage.getItem(getCacheKey("vehicles"));
      const appointmentsJson = window.localStorage.getItem(
        getCacheKey("appointments")
      );
      const techniciansJson = window.localStorage.getItem(
        getCacheKey("technicians")
      );

      if (customersJson) {
        const customers = JSON.parse(customersJson) as Customer[];
        dispatch({ type: "SET_CUSTOMERS", customers });
      }
      if (vehiclesJson) {
        const vehicles = JSON.parse(vehiclesJson) as Vehicle[];
        dispatch({ type: "SET_VEHICLES", vehicles });
      }
      if (appointmentsJson) {
        const appointments = JSON.parse(appointmentsJson) as Appointment[];
        dispatch({ type: "SET_APPOINTMENTS", appointments });
      }
      if (techniciansJson) {
        const technicians = JSON.parse(techniciansJson) as Technician[];
        dispatch({ type: "SET_TECHNICIANS", technicians });
      }
    } catch {
      // Ignore hydration errors; network fetch will correct state
    }
  }, [authLoading, authState, userId, getCacheKey]);

  // Generic fetch function with caching
  const fetchData = useCallback(
    async (
      entity: keyof DataState["loading"],
      table: string,
      selectQuery?: string
    ) => {
      try {
        dispatch({ type: "SET_LOADING", entity, loading: true });
        dispatch({ type: "SET_ERROR", entity, error: null });

        

        const { data, error } = await supabase
          .from(table)
          .select(selectQuery || "*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Dispatch the correct action based on entity
        switch (entity) {
          case "customers":
            dispatch({
              type: "SET_CUSTOMERS",
              customers: Array.isArray(data) ? (data as unknown as Customer[]) : [],
            });
            break;
          case "vehicles":
            dispatch({
              type: "SET_VEHICLES",
              vehicles: Array.isArray(data) ? (data as unknown as Vehicle[]) : [],
            });
            break;
          case "appointments":
            dispatch({
              type: "SET_APPOINTMENTS",
              appointments: Array.isArray(data) ? (data as unknown as Appointment[]) : [],
            });
            break;
          case "technicians":
            dispatch({
              type: "SET_TECHNICIANS",
              technicians: Array.isArray(data) ? (data as unknown as Technician[]) : [],
            });
            break;
          default:
            break;
        }

        
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        dispatch({ type: "SET_ERROR", entity, error: errorMessage });
        toast.error(`Failed to load ${entity}`);
      } finally {
        dispatch({ type: "SET_LOADING", entity, loading: false });
      }
    },
    []
  );

  // Fetch functions
  const fetchCustomers = useCallback(async () => {
    await fetchData("customers", "customers");
  }, [fetchData]);

  const fetchVehicles = useCallback(async () => {
    await fetchData("vehicles", "vehicles");
  }, [fetchData]);

  const fetchAppointments = useCallback(async () => {
    await fetchData(
      "appointments",
      "appointments",
      `
      *,
      customer:customers(*),
      vehicle:vehicles(*),
      service:services(*)
    `
    );
  }, [fetchData]);

  const fetchTechnicians = useCallback(async () => {
    await fetchData("technicians", "technicians");
  }, [fetchData]);

  // Persist slices to localStorage whenever they change (only when authenticated)
  useEffect(() => {
    if (authState !== "signed_in" || !userId) return;
    try {
      window.localStorage.setItem(
        getCacheKey("customers"),
        JSON.stringify(state.customers)
      );
      window.localStorage.setItem(
        getCacheKey("vehicles"),
        JSON.stringify(state.vehicles)
      );
      window.localStorage.setItem(
        getCacheKey("appointments"),
        JSON.stringify(state.appointments)
      );
      window.localStorage.setItem(
        getCacheKey("technicians"),
        JSON.stringify(state.technicians)
      );
    } catch {}
  }, [
    state.customers,
    state.vehicles,
    state.appointments,
    state.technicians,
    authState,
    userId,
    getCacheKey,
  ]);

  // CRUD operations for customers
  const createCustomer = useCallback(async (data: Partial<Customer>) => {
    try {
      
      const { data: result, error } = await supabase
        .from("customers")
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: "ADD_CUSTOMER", customer: result });
      toast.success("Customer created successfully");
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create customer";
      toast.error(errorMessage);
      
      return null;
    }
  }, []);

  const updateCustomer = useCallback(
    async (id: string, data: Partial<Customer>) => {
      try {
        
        const { error } = await supabase
          .from("customers")
          .update(data)
          .eq("id", id);

        if (error) throw error;

        dispatch({ type: "UPDATE_CUSTOMER", id, updates: data });
        toast.success("Customer updated successfully");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update customer";
        toast.error(errorMessage);
        
        return false;
      }
    },
    []
  );

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      
      const { error } = await supabase.from("customers").delete().eq("id", id);

      if (error) throw error;

      dispatch({ type: "DELETE_CUSTOMER", id });
      toast.success("Customer deleted successfully");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete customer";
      toast.error(errorMessage);
      
      return false;
    }
  }, []);

  // CRUD operations for vehicles
  const createVehicle = useCallback(async (data: Partial<Vehicle>) => {
    try {
      
      const { data: result, error } = await supabase
        .from("vehicles")
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: "ADD_VEHICLE", vehicle: result });
      toast.success("Vehicle created successfully");
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create vehicle";
      toast.error(errorMessage);
      
      return null;
    }
  }, []);

  const updateVehicle = useCallback(
    async (id: string, data: Partial<Vehicle>) => {
      try {
        
        const { error } = await supabase
          .from("vehicles")
          .update(data)
          .eq("id", id);

        if (error) throw error;

        dispatch({ type: "UPDATE_VEHICLE", id, updates: data });
        toast.success("Vehicle updated successfully");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update vehicle";
        toast.error(errorMessage);
        
        return false;
      }
    },
    []
  );

  const deleteVehicle = useCallback(async (id: string) => {
    try {
      
      const { error } = await supabase.from("vehicles").delete().eq("id", id);

      if (error) throw error;

      dispatch({ type: "DELETE_VEHICLE", id });
      toast.success("Vehicle deleted successfully");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete vehicle";
      toast.error(errorMessage);
      
      return false;
    }
  }, []);

  // CRUD operations for appointments
  const createAppointment = useCallback(async (data: Partial<Appointment>) => {
    try {
      
      const { data: result, error } = await supabase
        .from("appointments")
        .insert([data])
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

      dispatch({ type: "ADD_APPOINTMENT", appointment: result });
      toast.success("Appointment created successfully");
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create appointment";
      toast.error(errorMessage);
      
      return null;
    }
  }, []);

  const updateAppointment = useCallback(
    async (id: string, data: Partial<Appointment>) => {
      try {
        
        const { error } = await supabase
          .from("appointments")
          .update(data)
          .eq("id", id);

        if (error) throw error;

        dispatch({ type: "UPDATE_APPOINTMENT", id, updates: data });
        toast.success("Appointment updated successfully");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update appointment";
        toast.error(errorMessage);
        
        return false;
      }
    },
    []
  );

  const deleteAppointment = useCallback(async (id: string) => {
    try {
      
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      dispatch({ type: "DELETE_APPOINTMENT", id });
      toast.success("Appointment deleted successfully");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete appointment";
      toast.error(errorMessage);
      
      return false;
    }
  }, []);

  // CRUD operations for technicians
  const createTechnician = useCallback(async (data: Partial<Technician>) => {
    try {
      
      const { data: result, error } = await supabase
        .from("technicians")
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: "ADD_TECHNICIAN", technician: result });
      toast.success("Technician created successfully");
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create technician";
      toast.error(errorMessage);
      
      return null;
    }
  }, []);

  const updateTechnician = useCallback(
    async (id: string, data: Partial<Technician>) => {
      try {
        
        const { error } = await supabase
          .from("technicians")
          .update(data)
          .eq("id", id);

        if (error) throw error;

        dispatch({ type: "UPDATE_TECHNICIAN", id, updates: data });
        toast.success("Technician updated successfully");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update technician";
        toast.error(errorMessage);
        
        return false;
      }
    },
    []
  );

  const deleteTechnician = useCallback(async (id: string) => {
    try {
      
      const { error } = await supabase
        .from("technicians")
        .delete()
        .eq("id", id);

      if (error) throw error;

      dispatch({ type: "DELETE_TECHNICIAN", id });
      toast.success("Technician deleted successfully");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete technician";
      toast.error(errorMessage);
      
      return false;
    }
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    
    await Promise.all([
      fetchCustomers(),
      fetchVehicles(),
      fetchAppointments(),
      fetchTechnicians(),
    ]);
  }, [fetchCustomers, fetchVehicles, fetchAppointments, fetchTechnicians]);

  // Clear cache
  const clearCache = useCallback(() => {
    
    dispatch({ type: "CLEAR_CACHE" });
  }, []);

  // Get item from cache
  const getFromCache = useCallback(
    <T,>(entity: keyof DataState["cache"], id: string): T | null => {
      const cache = state.cache[entity];
      return (cache.get(id) as T) || null;
    },
    [state.cache]
  );

  // Auto-fetch data only when user id changes (avoid identity thrash)
  const profileUserId = userId || null;
  useEffect(() => {
    if (authLoading) return;
    if (authState === "signed_in" && profileUserId) {
      // Mark entities as loading immediately to avoid empty UI flash after refresh
      dispatch({ type: "SET_LOADING", entity: "customers", loading: true });
      dispatch({ type: "SET_LOADING", entity: "vehicles", loading: true });
      dispatch({ type: "SET_LOADING", entity: "appointments", loading: true });
      dispatch({ type: "SET_LOADING", entity: "technicians", loading: true });
      refreshAll();
    }
    if (authState === "signed_out") {
      
      dispatch({ type: "CLEAR_CACHE" });
      try {
        if (userId) {
          window.localStorage.removeItem(getCacheKey("customers"));
          window.localStorage.removeItem(getCacheKey("vehicles"));
          window.localStorage.removeItem(getCacheKey("appointments"));
          window.localStorage.removeItem(getCacheKey("technicians"));
        }
      } catch {}
    }
  }, [profileUserId, refreshAll, authLoading, authState, userId, getCacheKey]);

  const value: DataContextType = {
    state,
    dispatch,
    fetchCustomers,
    fetchVehicles,
    fetchAppointments,
    fetchTechnicians,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    createTechnician,
    updateTechnician,
    deleteTechnician,
    refreshAll,
    clearCache,
    getFromCache,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

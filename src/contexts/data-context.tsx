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

        console.log(`Data: Fetching ${entity} from ${table}`);

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
              customers: (data as Customer[]) || [],
            });
            break;
          case "vehicles":
            dispatch({
              type: "SET_VEHICLES",
              vehicles: (data as Vehicle[]) || [],
            });
            break;
          case "appointments":
            dispatch({
              type: "SET_APPOINTMENTS",
              appointments: (data as Appointment[]) || [],
            });
            break;
          case "technicians":
            dispatch({
              type: "SET_TECHNICIANS",
              technicians: (data as Technician[]) || [],
            });
            break;
          default:
            console.warn(`Unknown entity type: ${entity}`);
        }

        console.log(
          `Data: Successfully fetched ${data?.length || 0} ${entity}`
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        dispatch({ type: "SET_ERROR", entity, error: errorMessage });
        console.error(`Data: Failed to fetch ${entity}:`, errorMessage);
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

  // CRUD operations for customers
  const createCustomer = useCallback(async (data: Partial<Customer>) => {
    try {
      console.log("Data: Creating customer", data);
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
      console.error("Data: Failed to create customer:", errorMessage);
      return null;
    }
  }, []);

  const updateCustomer = useCallback(
    async (id: string, data: Partial<Customer>) => {
      try {
        console.log("Data: Updating customer", id, data);
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
        console.error("Data: Failed to update customer:", errorMessage);
        return false;
      }
    },
    []
  );

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      console.log("Data: Deleting customer", id);
      const { error } = await supabase.from("customers").delete().eq("id", id);

      if (error) throw error;

      dispatch({ type: "DELETE_CUSTOMER", id });
      toast.success("Customer deleted successfully");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete customer";
      toast.error(errorMessage);
      console.error("Data: Failed to delete customer:", errorMessage);
      return false;
    }
  }, []);

  // CRUD operations for vehicles
  const createVehicle = useCallback(async (data: Partial<Vehicle>) => {
    try {
      console.log("Data: Creating vehicle", data);
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
      console.error("Data: Failed to create vehicle:", errorMessage);
      return null;
    }
  }, []);

  const updateVehicle = useCallback(
    async (id: string, data: Partial<Vehicle>) => {
      try {
        console.log("Data: Updating vehicle", id, data);
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
        console.error("Data: Failed to update vehicle:", errorMessage);
        return false;
      }
    },
    []
  );

  const deleteVehicle = useCallback(async (id: string) => {
    try {
      console.log("Data: Deleting vehicle", id);
      const { error } = await supabase.from("vehicles").delete().eq("id", id);

      if (error) throw error;

      dispatch({ type: "DELETE_VEHICLE", id });
      toast.success("Vehicle deleted successfully");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete vehicle";
      toast.error(errorMessage);
      console.error("Data: Failed to delete vehicle:", errorMessage);
      return false;
    }
  }, []);

  // CRUD operations for appointments
  const createAppointment = useCallback(async (data: Partial<Appointment>) => {
    try {
      console.log("Data: Creating appointment", data);
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
      console.error("Data: Failed to create appointment:", errorMessage);
      return null;
    }
  }, []);

  const updateAppointment = useCallback(
    async (id: string, data: Partial<Appointment>) => {
      try {
        console.log("Data: Updating appointment", id, data);
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
        console.error("Data: Failed to update appointment:", errorMessage);
        return false;
      }
    },
    []
  );

  const deleteAppointment = useCallback(async (id: string) => {
    try {
      console.log("Data: Deleting appointment", id);
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
      console.error("Data: Failed to delete appointment:", errorMessage);
      return false;
    }
  }, []);

  // CRUD operations for technicians
  const createTechnician = useCallback(async (data: Partial<Technician>) => {
    try {
      console.log("Data: Creating technician", data);
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
      console.error("Data: Failed to create technician:", errorMessage);
      return null;
    }
  }, []);

  const updateTechnician = useCallback(
    async (id: string, data: Partial<Technician>) => {
      try {
        console.log("Data: Updating technician", id, data);
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
        console.error("Data: Failed to update technician:", errorMessage);
        return false;
      }
    },
    []
  );

  const deleteTechnician = useCallback(async (id: string) => {
    try {
      console.log("Data: Deleting technician", id);
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
      console.error("Data: Failed to delete technician:", errorMessage);
      return false;
    }
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    console.log("Data: Refreshing all data");
    await Promise.all([
      fetchCustomers(),
      fetchVehicles(),
      fetchAppointments(),
      fetchTechnicians(),
    ]);
  }, [fetchCustomers, fetchVehicles, fetchAppointments, fetchTechnicians]);

  // Clear cache
  const clearCache = useCallback(() => {
    console.log("Data: Clearing cache");
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
      console.log("Data: User authenticated, fetching all data");
      refreshAll();
    }
    if (authState === "signed_out") {
      console.log("Data: User not authenticated, clearing data");
      dispatch({ type: "CLEAR_CACHE" });
    }
  }, [profileUserId, refreshAll, authLoading, authState]);

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

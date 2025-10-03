-- =============================================
-- RLS POLICIES MIGRATION
-- Workshop Management System - Security Layer
-- =============================================

-- =============================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT p.role 
    FROM profile p 
    WHERE p.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is technician
CREATE OR REPLACE FUNCTION is_technician()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'technician';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's technician ID
CREATE OR REPLACE FUNCTION get_technician_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT t.id 
    FROM technicians t
    JOIN profile p ON t.profile_id = p.id
    WHERE p.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if appointment is assigned to current technician
CREATE OR REPLACE FUNCTION is_appointment_assigned_to_technician(appointment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM schedule_assignments sa
    WHERE sa.appointment_id = appointment_id
    AND sa.technician_id = get_technician_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_skills ENABLE ROW LEVEL SECURITY;
-- notifications removed

-- =============================================
-- DROP EXISTING POLICIES
-- =============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view profile" ON profile;
DROP POLICY IF EXISTS "Anyone can manage profile" ON profile;
DROP POLICY IF EXISTS "Anyone can view technicians" ON technicians;
DROP POLICY IF EXISTS "Anyone can manage technicians" ON technicians;
DROP POLICY IF EXISTS "Anyone can view customers" ON customers;
DROP POLICY IF EXISTS "Anyone can manage customers" ON customers;
DROP POLICY IF EXISTS "Anyone can view vehicles" ON vehicles;
DROP POLICY IF EXISTS "Anyone can manage vehicles" ON vehicles;
DROP POLICY IF EXISTS "Anyone can view appointments" ON appointments;
DROP POLICY IF EXISTS "Anyone can manage appointments" ON appointments;
DROP POLICY IF EXISTS "Anyone can view schedule_assignments" ON schedule_assignments;
DROP POLICY IF EXISTS "Anyone can manage schedule_assignments" ON schedule_assignments;
DROP POLICY IF EXISTS "Anyone can view technician_absences" ON technician_absences;
DROP POLICY IF EXISTS "Anyone can manage technician_absences" ON technician_absences;
DROP POLICY IF EXISTS "Anyone can view services" ON services;
DROP POLICY IF EXISTS "Anyone can manage services" ON services;
DROP POLICY IF EXISTS "Anyone can view parts" ON parts;
DROP POLICY IF EXISTS "Anyone can manage parts" ON parts;
DROP POLICY IF EXISTS "Anyone can view skills" ON skills;
DROP POLICY IF EXISTS "Anyone can manage skills" ON skills;
DROP POLICY IF EXISTS "Anyone can view technician skills" ON technician_skills;
DROP POLICY IF EXISTS "Anyone can manage technician skills" ON technician_skills;
-- notifications removed

-- =============================================
-- PROFILE POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "profile_select_own" ON profile
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profile_update_own" ON profile
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "profile_select_admin" ON profile
  FOR SELECT USING (is_admin());

-- Admins can manage all profiles
CREATE POLICY "profile_manage_admin" ON profile
  FOR ALL USING (is_admin());

-- =============================================
-- TECHNICIANS POLICIES
-- =============================================

-- Everyone can view technicians (for scheduling purposes)
CREATE POLICY "technicians_select_all" ON technicians
  FOR SELECT USING (true);

-- Technicians can view their own record
CREATE POLICY "technicians_select_own" ON technicians
  FOR SELECT USING (profile_id IN (
    SELECT p.id FROM profile p WHERE p.user_id = auth.uid()
  ));

-- Technicians can update their own record (limited fields)
CREATE POLICY "technicians_update_own" ON technicians
  FOR UPDATE USING (profile_id IN (
    SELECT p.id FROM profile p WHERE p.user_id = auth.uid()
  ));

-- Admins can manage all technicians
CREATE POLICY "technicians_manage_admin" ON technicians
  FOR ALL USING (is_admin());

-- =============================================
-- CUSTOMERS POLICIES
-- =============================================

-- Everyone can view customers (for appointment context)
CREATE POLICY "customers_select_all" ON customers
  FOR SELECT USING (true);

-- Admins can manage customers
CREATE POLICY "customers_manage_admin" ON customers
  FOR ALL USING (is_admin());

-- =============================================
-- VEHICLES POLICIES
-- =============================================

-- Everyone can view vehicles (for appointment context)
CREATE POLICY "vehicles_select_all" ON vehicles
  FOR SELECT USING (true);

-- Admins can manage vehicles
CREATE POLICY "vehicles_manage_admin" ON vehicles
  FOR ALL USING (is_admin());

-- =============================================
-- APPOINTMENTS POLICIES
-- =============================================

-- Admins can view all appointments
CREATE POLICY "appointments_select_admin" ON appointments
  FOR SELECT USING (is_admin());

-- Admins can manage all appointments
CREATE POLICY "appointments_manage_admin" ON appointments
  FOR ALL USING (is_admin());

-- Technicians can view appointments assigned to them
CREATE POLICY "appointments_select_assigned" ON appointments
  FOR SELECT USING (
    is_technician() AND 
    is_appointment_assigned_to_technician(id)
  );

-- Technicians can update status of their assigned appointments
CREATE POLICY "appointments_update_assigned" ON appointments
  FOR UPDATE USING (
    is_technician() AND 
    is_appointment_assigned_to_technician(id)
  );

-- =============================================
-- SCHEDULE ASSIGNMENTS POLICIES
-- =============================================

-- Admins can view all schedule assignments
CREATE POLICY "schedule_assignments_select_admin" ON schedule_assignments
  FOR SELECT USING (is_admin());

-- Admins can manage all schedule assignments
CREATE POLICY "schedule_assignments_manage_admin" ON schedule_assignments
  FOR ALL USING (is_admin());

-- Technicians can view their own assignments
CREATE POLICY "schedule_assignments_select_own" ON schedule_assignments
  FOR SELECT USING (
    is_technician() AND 
    technician_id = get_technician_id()
  );

-- Technicians can update their own assignments (limited fields)
CREATE POLICY "schedule_assignments_update_own" ON schedule_assignments
  FOR UPDATE USING (
    is_technician() AND 
    technician_id = get_technician_id()
  );

-- =============================================
-- TECHNICIAN ABSENCES POLICIES
-- =============================================

-- Admins can view all absences
CREATE POLICY "technician_absences_select_admin" ON technician_absences
  FOR SELECT USING (is_admin());

-- Admins can manage all absences
CREATE POLICY "technician_absences_manage_admin" ON technician_absences
  FOR ALL USING (is_admin());

-- Technicians can view their own absences
CREATE POLICY "technician_absences_select_own" ON technician_absences
  FOR SELECT USING (
    is_technician() AND 
    technician_id = get_technician_id()
  );

-- Technicians can create their own absences
CREATE POLICY "technician_absences_insert_own" ON technician_absences
  FOR INSERT WITH CHECK (
    is_technician() AND 
    technician_id = get_technician_id()
  );

-- Technicians can update their own absences
CREATE POLICY "technician_absences_update_own" ON technician_absences
  FOR UPDATE USING (
    is_technician() AND 
    technician_id = get_technician_id()
  );

-- =============================================
-- SERVICES POLICIES
-- =============================================

-- Everyone can view services
CREATE POLICY "services_select_all" ON services
  FOR SELECT USING (true);

-- Admins can manage services
CREATE POLICY "services_manage_admin" ON services
  FOR ALL USING (is_admin());

-- =============================================
-- PARTS POLICIES
-- =============================================

-- Everyone can view parts
CREATE POLICY "parts_select_all" ON parts
  FOR SELECT USING (true);

-- Admins can manage parts
CREATE POLICY "parts_manage_admin" ON parts
  FOR ALL USING (is_admin());

-- =============================================
-- SKILLS POLICIES
-- =============================================

-- Everyone can view skills
CREATE POLICY "skills_select_all" ON skills
  FOR SELECT USING (true);

-- Admins can manage skills
CREATE POLICY "skills_manage_admin" ON skills
  FOR ALL USING (is_admin());

-- =============================================
-- TECHNICIAN SKILLS POLICIES
-- =============================================

-- Everyone can view technician skills
CREATE POLICY "technician_skills_select_all" ON technician_skills
  FOR SELECT USING (true);

-- Admins can manage technician skills
CREATE POLICY "technician_skills_manage_admin" ON technician_skills
  FOR ALL USING (is_admin());

-- =============================================
-- NOTIFICATIONS POLICIES
-- =============================================

-- notifications removed

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_technician() TO authenticated;
GRANT EXECUTE ON FUNCTION get_technician_id() TO authenticated;
GRANT EXECUTE ON FUNCTION is_appointment_assigned_to_technician(UUID) TO authenticated;

-- =============================================
-- VERIFICATION
-- =============================================

SELECT 'RLS policies migration completed successfully!' as status;
SELECT 'RLS enabled on ' || COUNT(*) as table_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relkind = 'r'  -- ordinary tables
AND c.relrowsecurity = true;

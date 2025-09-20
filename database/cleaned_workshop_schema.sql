-- Workshop Planner Database Schema - CLEANED VERSION
-- Removed unused columns and tables for better performance and maintainability

-- =============================================
-- CLEANUP AND PREPARATION
-- =============================================

-- Drop existing tables if they have wrong structure
DROP TABLE IF EXISTS schedule_assignments CASCADE;
DROP TABLE IF EXISTS technician_absences CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS jobs CASCADE; -- Remove legacy jobs table
DROP TABLE IF EXISTS teams CASCADE; -- Remove unused teams table

-- =============================================
-- CORE TABLES
-- =============================================

-- Profile table (user roles) - SINGULAR to match app
CREATE TABLE IF NOT EXISTS profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'technician')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technicians table - Simplified (removed specialization, job_count)
CREATE TABLE IF NOT EXISTS technicians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profile(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  -- AW system fields
  shift_start TIME DEFAULT '07:00:00',
  shift_end TIME DEFAULT '18:00:00',
  aw_capacity_per_day INTEGER DEFAULT 80, -- Default 80 AW per day
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technician absences table
CREATE TABLE IF NOT EXISTS technician_absences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('vacation', 'sick', 'training', 'other')),
  from_time TIME,
  to_time TIME,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(technician_id, date, from_time, to_time)
);

-- Customers table - Simplified (removed whatsapp)
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  license_plate VARCHAR(20) NOT NULL UNIQUE,
  year INTEGER NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table (for appointment service types)
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  default_aw_estimate INTEGER DEFAULT 10, -- Default AW estimate
  required_skills TEXT[], -- Array of skill names
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parts table - Simplified (removed part_number, min_stock_level, unit_price)
CREATE TABLE IF NOT EXISTS parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table - Simplified (removed sla_promised_at, flags)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  notes TEXT,
  aw_estimate INTEGER NOT NULL DEFAULT 10, -- AW estimate (1 AW = 6 minutes)
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'scheduled', 'in_progress', 'paused', 'waiting_parts', 'done', 'delivered')),
  required_skills TEXT[], -- Array of skill names
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedule assignments table (links appointments to technicians with time slots)
CREATE TABLE IF NOT EXISTS schedule_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  aw_planned INTEGER NOT NULL, -- Planned AW for this assignment
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(appointment_id, technician_id, start_time)
);

-- =============================================
-- SKILL-BASED SYSTEM TABLES
-- =============================================

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technician-Skills junction table (many-to-many)
CREATE TABLE IF NOT EXISTS technician_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level INTEGER DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(technician_id, skill_id)
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(100),
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  action_link TEXT,
  action_label VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Primary indexes
CREATE INDEX IF NOT EXISTS idx_technicians_email ON technicians(email);
CREATE INDEX IF NOT EXISTS idx_technicians_profile_id ON technicians(profile_id);
CREATE INDEX IF NOT EXISTS idx_technicians_active ON technicians(active);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON vehicles(customer_id);

-- Appointment indexes
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_vehicle_id ON appointments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at);

-- Schedule assignment indexes
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_appointment_id ON schedule_assignments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_technician_id ON schedule_assignments(technician_id);
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_start_time ON schedule_assignments(start_time);
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_end_time ON schedule_assignments(end_time);

-- Absence indexes
CREATE INDEX IF NOT EXISTS idx_technician_absences_technician_id ON technician_absences(technician_id);
CREATE INDEX IF NOT EXISTS idx_technician_absences_date ON technician_absences(date);

-- Skill-based indexes
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_technician_skills_technician_id ON technician_skills(technician_id);
CREATE INDEX IF NOT EXISTS idx_technician_skills_skill_id ON technician_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_technician_skills_proficiency ON technician_skills(proficiency_level);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- =============================================
-- VIEWS FOR EASY QUERYING
-- =============================================

-- Technician skills view - Simplified
CREATE OR REPLACE VIEW technician_skills_view AS
SELECT 
  t.id,
  t.name,
  t.email,
  t.shift_start,
  t.shift_end,
  t.aw_capacity_per_day,
  t.active,
  t.created_at,
  t.updated_at,
  COALESCE(
    STRING_AGG(s.name, ', ' ORDER BY s.name),
    ''
  ) as skills_list,
  COALESCE(
    STRING_AGG(s.category, ', ' ORDER BY s.name),
    ''
  ) as skill_categories,
  COUNT(ts.skill_id) as skill_count
FROM technicians t
LEFT JOIN technician_skills ts ON t.id = ts.technician_id
LEFT JOIN skills s ON ts.skill_id = s.id
GROUP BY t.id, t.name, t.email, t.shift_start, t.shift_end, t.aw_capacity_per_day, t.active, t.created_at, t.updated_at;

-- Appointment details view with customer and vehicle info - Simplified
CREATE OR REPLACE VIEW appointment_details_view AS
SELECT 
  a.id,
  a.date,
  a.title,
  a.notes,
  a.aw_estimate,
  a.priority,
  a.status,
  a.required_skills,
  a.created_at,
  a.updated_at,
  c.name as customer_name,
  c.email as customer_email,
  c.phone as customer_phone,
  v.make as vehicle_make,
  v.model as vehicle_model,
  v.license_plate,
  v.year as vehicle_year,
  s.name as service_name,
  s.default_aw_estimate as service_default_aw
FROM appointments a
JOIN customers c ON a.customer_id = c.id
JOIN vehicles v ON a.vehicle_id = v.id
LEFT JOIN services s ON a.service_id = s.id;

-- Daily capacity view for technicians
CREATE OR REPLACE VIEW daily_technician_capacity AS
SELECT 
  t.id as technician_id,
  t.name as technician_name,
  d.date,
  t.aw_capacity_per_day as total_capacity,
  COALESCE(SUM(
    CASE 
      WHEN ta.from_time IS NULL AND ta.to_time IS NULL THEN t.aw_capacity_per_day
      WHEN ta.from_time IS NULL THEN 
        EXTRACT(HOUR FROM (t.shift_end - ta.to_time)) * 10 + 
        EXTRACT(MINUTE FROM (t.shift_end - ta.to_time)) / 6
      WHEN ta.to_time IS NULL THEN 
        EXTRACT(HOUR FROM (ta.from_time - t.shift_start)) * 10 + 
        EXTRACT(MINUTE FROM (ta.from_time - t.shift_start)) / 6
      ELSE 
        EXTRACT(HOUR FROM (ta.from_time - t.shift_start)) * 10 + 
        EXTRACT(MINUTE FROM (ta.from_time - t.shift_start)) / 6 +
        EXTRACT(HOUR FROM (t.shift_end - ta.to_time)) * 10 + 
        EXTRACT(MINUTE FROM (t.shift_end - ta.to_time)) / 6
    END
  ), t.aw_capacity_per_day) as available_capacity,
  COALESCE(SUM(sa.aw_planned), 0) as planned_aw,
  COALESCE(SUM(sa.aw_planned), 0) / NULLIF(t.aw_capacity_per_day, 0) * 100 as utilization_percentage
FROM technicians t
CROSS JOIN generate_series(
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '30 days',
  '1 day'::interval
) as d(date)
LEFT JOIN technician_absences ta ON t.id = ta.technician_id AND ta.date = d.date
LEFT JOIN schedule_assignments sa ON t.id = sa.technician_id AND DATE(sa.start_time) = d.date
WHERE t.active = TRUE
GROUP BY t.id, t.name, d.date, t.aw_capacity_per_day
ORDER BY d.date, t.name;

-- =============================================
-- FUNCTIONS FOR WORKSHOP PLANNER
-- =============================================

-- Function to calculate available AW for a technician on a specific date
CREATE OR REPLACE FUNCTION get_technician_available_aw(
  tech_id UUID,
  target_date DATE
) RETURNS INTEGER AS $$
DECLARE
  tech_capacity INTEGER;
  total_absence_aw INTEGER := 0;
  planned_aw INTEGER := 0;
  absence_record RECORD;
BEGIN
  -- Get technician's daily capacity
  SELECT aw_capacity_per_day INTO tech_capacity
  FROM technicians
  WHERE id = tech_id AND active = TRUE;
  
  IF tech_capacity IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate absence AW
  FOR absence_record IN 
    SELECT from_time, to_time
    FROM technician_absences
    WHERE technician_id = tech_id AND date = target_date
  LOOP
    IF absence_record.from_time IS NULL AND absence_record.to_time IS NULL THEN
      total_absence_aw := tech_capacity; -- Full day absence
    ELSIF absence_record.from_time IS NULL THEN
      -- Absence from start of day to to_time
      total_absence_aw := total_absence_aw + 
        EXTRACT(HOUR FROM absence_record.to_time) * 10 + 
        EXTRACT(MINUTE FROM absence_record.to_time) / 6;
    ELSIF absence_record.to_time IS NULL THEN
      -- Absence from from_time to end of day
      total_absence_aw := total_absence_aw + 
        (18 - EXTRACT(HOUR FROM absence_record.from_time)) * 10 - 
        EXTRACT(MINUTE FROM absence_record.from_time) / 6;
    ELSE
      -- Partial day absence
      total_absence_aw := total_absence_aw + 
        EXTRACT(HOUR FROM (absence_record.to_time - absence_record.from_time)) * 10 + 
        EXTRACT(MINUTE FROM (absence_record.to_time - absence_record.from_time)) / 6;
    END IF;
  END LOOP;
  
  -- Calculate planned AW
  SELECT COALESCE(SUM(aw_planned), 0) INTO planned_aw
  FROM schedule_assignments
  WHERE technician_id = tech_id AND DATE(start_time) = target_date;
  
  RETURN GREATEST(0, tech_capacity - total_absence_aw - planned_aw);
END;
$$ LANGUAGE plpgsql;

-- Function to check for scheduling conflicts
CREATE OR REPLACE FUNCTION check_scheduling_conflict(
  tech_id UUID,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  exclude_assignment_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM schedule_assignments
  WHERE technician_id = tech_id
    AND (exclude_assignment_id IS NULL OR id != exclude_assignment_id)
    AND (
      (start_time < end_time AND start_time < sa.end_time AND end_time > sa.start_time) OR
      (start_time >= sa.start_time AND start_time < sa.end_time) OR
      (end_time > sa.start_time AND end_time <= sa.end_time)
    );
  
  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get appointments for day view - Simplified
CREATE OR REPLACE FUNCTION get_day_appointments(
  target_date DATE
) RETURNS TABLE (
  appointment_id UUID,
  title TEXT,
  customer_name TEXT,
  vehicle_info TEXT,
  aw_estimate INTEGER,
  priority TEXT,
  status TEXT,
  required_skills TEXT[],
  technician_id UUID,
  technician_name TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  aw_planned INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title::TEXT,
    c.name::TEXT,
    CONCAT(v.make, ' ', v.model, ' (', v.license_plate, ')')::TEXT,
    a.aw_estimate,
    a.priority::TEXT,
    a.status::TEXT,
    a.required_skills,
    sa.technician_id,
    t.name::TEXT,
    sa.start_time,
    sa.end_time,
    sa.aw_planned
  FROM appointments a
  JOIN customers c ON a.customer_id = c.id
  JOIN vehicles v ON a.vehicle_id = v.id
  LEFT JOIN schedule_assignments sa ON a.id = sa.appointment_id AND DATE(sa.start_time) = target_date
  LEFT JOIN technicians t ON sa.technician_id = t.id
  WHERE a.date = target_date
  ORDER BY 
    CASE WHEN sa.start_time IS NULL THEN 1 ELSE 0 END,
    sa.start_time,
    a.priority DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at timestamp
CREATE TRIGGER trigger_technicians_updated_at
  BEFORE UPDATE ON technicians
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_profile_updated_at
  BEFORE UPDATE ON profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_schedule_assignments_updated_at
  BEFORE UPDATE ON schedule_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
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
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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
DROP POLICY IF EXISTS "Anyone can view notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can manage notifications" ON notifications;

-- Simplified RLS policies (no authentication dependencies)
-- These policies allow full access for development - customize for production

-- Profile policies
CREATE POLICY "Anyone can view profile" ON profile
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage profile" ON profile
  FOR ALL USING (true);

-- Technicians policies
CREATE POLICY "Anyone can view technicians" ON technicians
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage technicians" ON technicians
  FOR ALL USING (true);

-- Customers policies
CREATE POLICY "Anyone can view customers" ON customers
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage customers" ON customers
  FOR ALL USING (true);

-- Vehicles policies
CREATE POLICY "Anyone can view vehicles" ON vehicles
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage vehicles" ON vehicles
  FOR ALL USING (true);

-- Appointments policies
CREATE POLICY "Anyone can view appointments" ON appointments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage appointments" ON appointments
  FOR ALL USING (true);

-- Schedule assignments policies
CREATE POLICY "Anyone can view schedule_assignments" ON schedule_assignments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage schedule_assignments" ON schedule_assignments
  FOR ALL USING (true);

-- Technician absences policies
CREATE POLICY "Anyone can view technician_absences" ON technician_absences
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage technician_absences" ON technician_absences
  FOR ALL USING (true);

-- Services policies
CREATE POLICY "Anyone can view services" ON services
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage services" ON services
  FOR ALL USING (true);

-- Parts policies
CREATE POLICY "Anyone can view parts" ON parts
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage parts" ON parts
  FOR ALL USING (true);

-- Skills policies
CREATE POLICY "Anyone can view skills" ON skills
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage skills" ON skills
  FOR ALL USING (true);

-- Technician skills policies
CREATE POLICY "Anyone can view technician skills" ON technician_skills
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage technician skills" ON technician_skills
  FOR ALL USING (true);

-- Notifications policies
CREATE POLICY "Anyone can view notifications" ON notifications
  FOR SELECT USING (true);

CREATE POLICY "Anyone can manage notifications" ON notifications
  FOR ALL USING (true);

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert skills first
INSERT INTO skills (name, category, description) VALUES
-- Engine & Mechanical
('timing belt', 'engine', 'Timing belt replacement and maintenance'),
('brakes', 'mechanical', 'Brake system repair and maintenance'),
('suspension', 'mechanical', 'Suspension system repair and maintenance'),
('failure search', 'diagnostics', 'Diagnostic troubleshooting and repair'),

-- Body & Glass
('body work', 'body', 'Body repair and restoration'),
('glass', 'body', 'Glass replacement and repair'),

-- Tires & Inspection
('tyres', 'tires', 'Tire replacement and maintenance'),
('inspection', 'safety', 'Vehicle inspection and safety checks')

ON CONFLICT (name) DO NOTHING;

-- Clear existing technicians and insert fresh data
DELETE FROM technician_skills;
DELETE FROM technicians;

-- Insert technicians with AW capacity (simplified)
INSERT INTO technicians (name, email, shift_start, shift_end, aw_capacity_per_day, active, created_at, updated_at) VALUES
-- Row 1
('Markus', 'markus@db-auto.de', '07:00:00', '18:00:00', 80, true, NOW(), NOW()),
('Viktor', 'viktor@db-auto.de', '07:00:00', '18:00:00', 80, true, NOW(), NOW()),
('Andi', 'andi@db-auto.de', '07:00:00', '18:00:00', 80, true, NOW(), NOW()),

-- Row 2
('Kai', 'kai@db-auto.de', '07:00:00', '18:00:00', 80, true, NOW(), NOW()),
('Anton', 'anton@db-auto.de', '07:00:00', '18:00:00', 80, true, NOW(), NOW()),
('Michel', 'michel@db-auto.de', '07:00:00', '18:00:00', 80, true, NOW(), NOW()),

-- Row 3
('Jakob', 'jakob@db-auto.de', '07:00:00', '18:00:00', 80, true, NOW(), NOW()),
('Niko', 'niko@db-auto.de', '07:00:00', '18:00:00', 80, true, NOW(), NOW()),
('Ahmad', 'ahmad@db-auto.de', '07:00:00', '18:00:00', 80, true, NOW(), NOW());

-- Function to assign skills to technicians
CREATE OR REPLACE FUNCTION assign_technician_skills(
  tech_name VARCHAR,
  skill_names TEXT[]
) RETURNS VOID AS $$
DECLARE
  tech_uuid UUID;
  skill_uuid UUID;
  skill_name TEXT;
BEGIN
  -- Get technician ID
  SELECT id INTO tech_uuid FROM technicians WHERE name = tech_name;
  
  IF tech_uuid IS NULL THEN
    RAISE EXCEPTION 'Technician % not found', tech_name;
  END IF;
  
  -- Assign each skill
  FOREACH skill_name IN ARRAY skill_names
  LOOP
    SELECT id INTO skill_uuid FROM skills WHERE name = skill_name;
    
    IF skill_uuid IS NOT NULL THEN
      INSERT INTO technician_skills (technician_id, skill_id, proficiency_level)
      VALUES (tech_uuid, skill_uuid, 4) -- Default proficiency level 4 (out of 5)
      ON CONFLICT (technician_id, skill_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Assign skills to each mechanic
SELECT assign_technician_skills('Markus', ARRAY['timing belt', 'brakes', 'suspension', 'failure search', 'glass', 'tyres']);
SELECT assign_technician_skills('Viktor', ARRAY['timing belt', 'brakes', 'suspension', 'failure search', 'glass', 'tyres', 'body work']);
SELECT assign_technician_skills('Andi', ARRAY['body work', 'brakes', 'suspension', 'failure search', 'glass', 'tyres']);
SELECT assign_technician_skills('Kai', ARRAY['brakes', 'suspension', 'failure search', 'glass', 'tyres', 'inspection']);
SELECT assign_technician_skills('Anton', ARRAY['timing belt', 'brakes', 'suspension', 'failure search', 'glass', 'tyres']);
SELECT assign_technician_skills('Michel', ARRAY['brakes', 'suspension', 'glass', 'tyres', 'inspection']);
SELECT assign_technician_skills('Jakob', ARRAY['brakes', 'suspension', 'glass', 'tyres', 'inspection']);
SELECT assign_technician_skills('Niko', ARRAY['timing belt', 'brakes', 'suspension', 'failure search', 'glass', 'tyres', 'body work']);
SELECT assign_technician_skills('Ahmad', ARRAY['brakes', 'suspension', 'glass', 'tyres', 'inspection']);

-- Clean up the function
DROP FUNCTION IF EXISTS assign_technician_skills(VARCHAR, TEXT[]);

-- Insert sample services
INSERT INTO services (name, description, default_aw_estimate, required_skills) VALUES
('Oil Change', 'Regular oil and filter change', 10, ARRAY['inspection']),
('Brake Service', 'Brake pad and disc replacement', 40, ARRAY['brakes']),
('Timing Belt', 'Timing belt and water pump replacement', 60, ARRAY['timing belt']),
('Suspension Check', 'Suspension system inspection and repair', 30, ARRAY['suspension']),
('Glass Replacement', 'Windshield or window replacement', 20, ARRAY['glass']),
('Tire Service', 'Tire replacement and balancing', 15, ARRAY['tyres']),
('Vehicle Inspection', 'Annual safety and emissions inspection', 20, ARRAY['inspection']),
('Body Work', 'Dent repair and body panel replacement', 80, ARRAY['body work']),
('Diagnostic', 'Engine diagnostic and troubleshooting', 20, ARRAY['failure search'])

ON CONFLICT DO NOTHING;

-- Insert sample parts (simplified)
INSERT INTO parts (name, description, stock_quantity) VALUES
('Brake Pads Front', 'Front brake pads for most vehicles', 25),
('Brake Discs Front', 'Front brake discs', 15),
('Oil Filter', 'Standard oil filter', 50),
('Engine Oil 5W-30', 'Synthetic engine oil 5W-30', 30),
('Timing Belt Kit', 'Complete timing belt replacement kit', 8),
('Windshield Glass', 'Standard windshield glass', 5),
('Tire 205/55R16', 'All-season tire 205/55R16', 20)

ON CONFLICT DO NOTHING;

-- Insert sample customers (simplified)
INSERT INTO customers (name, email, phone, status, created_at) VALUES
('Hans Mueller', 'hans.mueller@email.com', '+49 123 456 7890', 'active', NOW()),
('Maria Schmidt', 'maria.schmidt@email.com', '+49 123 456 7891', 'active', NOW()),
('Peter Weber', 'peter.weber@email.com', '+49 123 456 7892', 'active', NOW()),
('Anna Fischer', 'anna.fischer@email.com', '+49 123 456 7893', 'active', NOW()),
('Thomas Wagner', 'thomas.wagner@email.com', '+49 123 456 7894', 'active', NOW())

ON CONFLICT DO NOTHING;

-- Insert sample vehicles
INSERT INTO vehicles (make, model, license_plate, year, customer_id, created_at) VALUES
('BMW', '3 Series', 'M-AB 123', 2020, (SELECT id FROM customers WHERE email = 'hans.mueller@email.com'), NOW()),
('Mercedes', 'C-Class', 'M-CD 456', 2019, (SELECT id FROM customers WHERE email = 'maria.schmidt@email.com'), NOW()),
('Audi', 'A4', 'M-EF 789', 2021, (SELECT id FROM customers WHERE email = 'peter.weber@email.com'), NOW()),
('Volkswagen', 'Golf', 'M-GH 012', 2018, (SELECT id FROM customers WHERE email = 'anna.fischer@email.com'), NOW()),
('Ford', 'Focus', 'M-IJ 345', 2020, (SELECT id FROM customers WHERE email = 'thomas.wagner@email.com'), NOW())

ON CONFLICT (license_plate) DO NOTHING;

-- Insert sample appointments (simplified)
INSERT INTO appointments (date, customer_id, vehicle_id, service_id, title, notes, aw_estimate, priority, status, required_skills, created_at, updated_at) VALUES
(CURRENT_DATE, (SELECT id FROM customers WHERE email = 'hans.mueller@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'M-AB 123'), (SELECT id FROM services WHERE name = 'Brake Service'), 'Front Brake Service', 'Customer reported squeaking noise', 40, 'high', 'new', ARRAY['brakes'], NOW(), NOW()),
(CURRENT_DATE + INTERVAL '1 day', (SELECT id FROM customers WHERE email = 'maria.schmidt@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'M-CD 456'), (SELECT id FROM services WHERE name = 'Oil Change'), 'Regular Oil Change', 'Regular maintenance', 10, 'normal', 'new', ARRAY['inspection'], NOW(), NOW()),
(CURRENT_DATE + INTERVAL '2 days', (SELECT id FROM customers WHERE email = 'peter.weber@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'M-EF 789'), (SELECT id FROM services WHERE name = 'Timing Belt'), 'Timing Belt Replacement', 'Preventive maintenance', 60, 'normal', 'new', ARRAY['timing belt'], NOW(), NOW()),
(CURRENT_DATE + INTERVAL '1 day', (SELECT id FROM customers WHERE email = 'anna.fischer@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'M-GH 012'), (SELECT id FROM services WHERE name = 'Suspension Check'), 'Suspension Inspection', 'Customer complaint about noise', 30, 'normal', 'new', ARRAY['suspension'], NOW(), NOW()),
(CURRENT_DATE, (SELECT id FROM customers WHERE email = 'thomas.wagner@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'M-IJ 345'), (SELECT id FROM services WHERE name = 'Glass Replacement'), 'Windshield Replacement', 'Crack repair', 20, 'urgent', 'new', ARRAY['glass'], NOW(), NOW())

ON CONFLICT DO NOTHING;

-- Insert sample technician absences
INSERT INTO technician_absences (technician_id, date, type, from_time, to_time, description) VALUES
((SELECT id FROM technicians WHERE name = 'Markus'), CURRENT_DATE + INTERVAL '1 day', 'vacation', NULL, NULL, 'Annual vacation'),
((SELECT id FROM technicians WHERE name = 'Viktor'), CURRENT_DATE, 'training', '09:00:00', '12:00:00', 'Safety training course'),
((SELECT id FROM technicians WHERE name = 'Kai'), CURRENT_DATE + INTERVAL '2 days', 'sick', NULL, NULL, 'Medical appointment')

ON CONFLICT DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (user_id, message, type, is_read, created_at) VALUES
('admin', 'New appointment created for Hans Mueller', 'info', false, NOW()),
('admin', 'Parts ordered for brake service', 'success', false, NOW()),
('admin', 'Technician Markus on vacation tomorrow', 'warning', false, NOW());

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

SELECT 'Workshop Planner Database setup complete!' as status;
SELECT 'Technicians: ' || COUNT(*) as technician_count FROM technicians;
SELECT 'Skills: ' || COUNT(*) as skill_count FROM skills;
SELECT 'Services: ' || COUNT(*) as service_count FROM services;
SELECT 'Parts: ' || COUNT(*) as part_count FROM parts;
SELECT 'Customers: ' || COUNT(*) as customer_count FROM customers;
SELECT 'Appointments: ' || COUNT(*) as appointment_count FROM appointments;
SELECT 'Technician Absences: ' || COUNT(*) as absence_count FROM technician_absences;

-- Test the new functions
SELECT 'Testing technician capacity calculation:' as info;
SELECT name, get_technician_available_aw(id, CURRENT_DATE) as available_aw_today
FROM technicians 
WHERE active = TRUE 
ORDER BY name;

-- Test daily appointments view
SELECT 'Testing daily appointments view:' as info;
SELECT * FROM get_day_appointments(CURRENT_DATE);

-- Test daily capacity view
SELECT 'Testing daily capacity view:' as info;
SELECT technician_name, date, total_capacity, available_capacity, planned_aw, utilization_percentage
FROM daily_technician_capacity 
WHERE date = CURRENT_DATE 
ORDER BY technician_name;

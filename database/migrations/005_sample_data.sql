-- =============================================
-- SAMPLE DATA MIGRATION
-- Workshop Management System - Development Data
-- =============================================

-- =============================================
-- SAMPLE SKILLS
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

-- =============================================
-- SAMPLE TECHNICIANS
-- =============================================

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
('Ahmad', 'ahmad@db-auto.de', '07:00:00', '18:00:00', 80, true, NOW(), NOW())

ON CONFLICT (email) DO NOTHING;

-- =============================================
-- ASSIGN SKILLS TO TECHNICIANS
-- =============================================

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

-- =============================================
-- SAMPLE SERVICES
-- =============================================

-- Idempotent insert of services by name
INSERT INTO services (name, description, aw_estimate, required_skills)
SELECT v.name, v.description, v.aw_estimate, v.required_skills
FROM (
  VALUES
    ('Oil Change', 'Regular oil and filter change', 10, ARRAY['inspection']::text[]),
    ('Brake Service', 'Brake pad and disc replacement', 40, ARRAY['brakes']::text[]),
    ('Timing Belt', 'Timing belt and water pump replacement', 60, ARRAY['timing belt']::text[]),
    ('Suspension Check', 'Suspension system inspection and repair', 30, ARRAY['suspension']::text[]),
    ('Glass Replacement', 'Windshield or window replacement', 20, ARRAY['glass']::text[]),
    ('Tire Service', 'Tire replacement and balancing', 15, ARRAY['tyres']::text[]),
    ('Vehicle Inspection', 'Annual safety and emissions inspection', 20, ARRAY['inspection']::text[]),
    ('Body Work', 'Dent repair and body panel replacement', 80, ARRAY['body work']::text[]),
    ('Diagnostic', 'Engine diagnostic and troubleshooting', 20, ARRAY['failure search']::text[])
) AS v(name, description, aw_estimate, required_skills)
WHERE NOT EXISTS (
  SELECT 1 FROM services s WHERE s.name = v.name
);

-- =============================================
-- SAMPLE PARTS
-- =============================================

-- Idempotent insert of parts by name
INSERT INTO parts (name, description, stock_quantity)
SELECT v.name, v.description, v.stock_quantity
FROM (
  VALUES
    ('Brake Pads Front', 'Front brake pads for most vehicles', 25),
    ('Brake Discs Front', 'Front brake discs', 15),
    ('Oil Filter', 'Standard oil filter', 50),
    ('Engine Oil 5W-30', 'Synthetic engine oil 5W-30', 30),
    ('Timing Belt Kit', 'Complete timing belt replacement kit', 8),
    ('Windshield Glass', 'Standard windshield glass', 5),
    ('Tire 205/55R16', 'All-season tire 205/55R16', 20)
) AS v(name, description, stock_quantity)
WHERE NOT EXISTS (
  SELECT 1 FROM parts p WHERE p.name = v.name
);

-- =============================================
-- SAMPLE CUSTOMERS
-- =============================================

-- Idempotent insert of customers by email
INSERT INTO customers (name, email, phone, status, created_at)
SELECT v.name, v.email, v.phone, v.status, NOW()
FROM (
  VALUES
    ('Hans Mueller', 'hans.mueller@email.com', '+49 123 456 7890', 'active'),
    ('Maria Schmidt', 'maria.schmidt@email.com', '+49 123 456 7891', 'active'),
    ('Peter Weber', 'peter.weber@email.com', '+49 123 456 7892', 'active'),
    ('Anna Fischer', 'anna.fischer@email.com', '+49 123 456 7893', 'active'),
    ('Thomas Wagner', 'thomas.wagner@email.com', '+49 123 456 7894', 'active')
) AS v(name, email, phone, status)
WHERE NOT EXISTS (
  SELECT 1 FROM customers c WHERE c.email = v.email
);

-- =============================================
-- SAMPLE VEHICLES
-- =============================================

-- Idempotent insert of vehicles by license_plate
INSERT INTO vehicles (make, model, license_plate, year, customer_id, created_at)
SELECT v.make, v.model, v.license_plate, v.year, v.customer_id, NOW()
FROM (
  VALUES
    ('BMW', '3 Series', 'M-AB 123', 2020, (SELECT id FROM customers WHERE email = 'hans.mueller@email.com')),
    ('Mercedes', 'C-Class', 'M-CD 456', 2019, (SELECT id FROM customers WHERE email = 'maria.schmidt@email.com')),
    ('Audi', 'A4', 'M-EF 789', 2021, (SELECT id FROM customers WHERE email = 'peter.weber@email.com')),
    ('Volkswagen', 'Golf', 'M-GH 012', 2018, (SELECT id FROM customers WHERE email = 'anna.fischer@email.com')),
    ('Ford', 'Focus', 'M-IJ 345', 2020, (SELECT id FROM customers WHERE email = 'thomas.wagner@email.com'))
) AS v(make, model, license_plate, year, customer_id)
WHERE NOT EXISTS (
  SELECT 1 FROM vehicles ve WHERE ve.license_plate = v.license_plate
);

-- =============================================
-- SAMPLE APPOINTMENTS
-- =============================================

-- Insert sample appointments (simplified)
INSERT INTO appointments (date, customer_id, vehicle_id, service_id, title, notes, aw_estimate, priority, status, required_skills, created_at, updated_at) VALUES
(CURRENT_DATE, (SELECT id FROM customers WHERE email = 'hans.mueller@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'M-AB 123'), (SELECT id FROM services WHERE name = 'Brake Service'), 'Front Brake Service', 'Customer reported squeaking noise', 40, 'high', 'waiting', ARRAY['brakes'], NOW(), NOW()),
(CURRENT_DATE + INTERVAL '1 day', (SELECT id FROM customers WHERE email = 'maria.schmidt@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'M-CD 456'), (SELECT id FROM services WHERE name = 'Oil Change'), 'Regular Oil Change', 'Regular maintenance', 10, 'normal', 'waiting', ARRAY['inspection'], NOW(), NOW()),
(CURRENT_DATE + INTERVAL '2 days', (SELECT id FROM customers WHERE email = 'peter.weber@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'M-EF 789'), (SELECT id FROM services WHERE name = 'Timing Belt'), 'Timing Belt Replacement', 'Preventive maintenance', 60, 'normal', 'waiting', ARRAY['timing belt'], NOW(), NOW()),
(CURRENT_DATE + INTERVAL '1 day', (SELECT id FROM customers WHERE email = 'anna.fischer@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'M-GH 012'), (SELECT id FROM services WHERE name = 'Suspension Check'), 'Suspension Inspection', 'Customer complaint about noise', 30, 'normal', 'waiting', ARRAY['suspension'], NOW(), NOW()),
(CURRENT_DATE, (SELECT id FROM customers WHERE email = 'thomas.wagner@email.com'), (SELECT id FROM vehicles WHERE license_plate = 'M-IJ 345'), (SELECT id FROM services WHERE name = 'Glass Replacement'), 'Windshield Replacement', 'Crack repair', 20, 'urgent', 'waiting', ARRAY['glass'], NOW(), NOW());

-- =============================================
-- SAMPLE TECHNICIAN ABSENCES
-- =============================================

-- Insert sample technician absences
-- Idempotent insert of technician absences
INSERT INTO technician_absences (technician_id, start_date, end_date, reason, status, type)
SELECT v.technician_id, v.start_date, v.end_date, v.reason, v.status, v.type
FROM (
  VALUES
    ((SELECT id FROM technicians WHERE name = 'Markus'), CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day', 'Annual vacation', 'approved', 'vacation'),
    ((SELECT id FROM technicians WHERE name = 'Viktor'), CURRENT_DATE, CURRENT_DATE, 'Safety training course', 'approved', 'training'),
    ((SELECT id FROM technicians WHERE name = 'Kai'), CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '2 days', 'Medical appointment', 'approved', 'sick')
) AS v(technician_id, start_date, end_date, reason, status, type)
WHERE NOT EXISTS (
  SELECT 1 FROM technician_absences ta
  WHERE ta.technician_id = v.technician_id
    AND ta.start_date = v.start_date
    AND ta.end_date = v.end_date
    AND ta.type = v.type
);

-- =============================================
-- SAMPLE NOTIFICATIONS
-- =============================================

-- Insert sample notifications (these would normally be created by triggers)
INSERT INTO notifications (user_id, message, type, is_read, created_at) VALUES
-- Note: These are sample notifications - in production, these would be created by the notification system
-- For now, we'll insert them with a placeholder user_id
('00000000-0000-0000-0000-000000000000', 'New appointment created for Hans Mueller', 'info', false, NOW()),
('00000000-0000-0000-0000-000000000000', 'Parts ordered for brake service', 'success', false, NOW()),
('00000000-0000-0000-0000-000000000000', 'Technician Markus on vacation tomorrow', 'warning', false, NOW());

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

SELECT 'Sample data migration completed successfully!' as status;
SELECT 'Technicians: ' || COUNT(*) as technician_count FROM technicians;
SELECT 'Skills: ' || COUNT(*) as skill_count FROM skills;
SELECT 'Services: ' || COUNT(*) as service_count FROM services;
SELECT 'Parts: ' || COUNT(*) as part_count FROM parts;
SELECT 'Customers: ' || COUNT(*) as customer_count FROM customers;
SELECT 'Vehicles: ' || COUNT(*) as vehicle_count FROM vehicles;
SELECT 'Appointments: ' || COUNT(*) as appointment_count FROM appointments;
SELECT 'Technician Absences: ' || COUNT(*) as absence_count FROM technician_absences;
SELECT 'Technician Skills: ' || COUNT(*) as technician_skill_count FROM technician_skills;

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

-- =============================================
-- INDEXES AND VIEWS MIGRATION
-- Workshop Management System - Performance Layer
-- =============================================

-- =============================================
-- COMPOSITE INDEXES FOR PERFORMANCE
-- =============================================

-- Appointment + Status + Date (common query pattern)
CREATE INDEX IF NOT EXISTS idx_appointments_status_date ON appointments(status, date);

-- Technician + Date + Status (scheduling queries)
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_tech_date_status ON schedule_assignments(technician_id, start_time, status);

-- Customer + Vehicle lookups (appointment context)
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_license ON vehicles(customer_id, license_plate);

-- Notification queries (user + read status)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- Skill-based queries (technician + skill proficiency)
CREATE INDEX IF NOT EXISTS idx_technician_skills_tech_proficiency ON technician_skills(technician_id, proficiency_level);

-- Absence queries (technician + date range)
CREATE INDEX IF NOT EXISTS idx_technician_absences_tech_dates ON technician_absences(technician_id, start_date, end_date);

-- =============================================
-- BUSINESS LOGIC VIEWS
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
  s.aw_estimate as service_default_aw
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
  CASE WHEN COUNT(ta.id) > 0 THEN 0 ELSE t.aw_capacity_per_day END as available_capacity,
  COALESCE(SUM(sa.aw_planned), 0) as planned_aw,
  COALESCE(SUM(sa.aw_planned), 0) / NULLIF(t.aw_capacity_per_day, 0) * 100 as utilization_percentage
FROM technicians t
CROSS JOIN generate_series(
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '30 days',
  '1 day'::interval
) as d(date)
LEFT JOIN technician_absences ta ON t.id = ta.technician_id AND d.date BETWEEN ta.start_date AND ta.end_date
LEFT JOIN schedule_assignments sa ON t.id = sa.technician_id AND DATE(sa.start_time) = d.date
WHERE t.active = TRUE
GROUP BY t.id, t.name, d.date, t.aw_capacity_per_day
ORDER BY d.date, t.name;

-- =============================================
-- BUSINESS LOGIC FUNCTIONS
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
  
  -- If any absence exists on the target date, treat as full-day absence
  IF EXISTS (
    SELECT 1 FROM technician_absences
    WHERE technician_id = tech_id AND target_date BETWEEN start_date AND end_date
  ) THEN
    total_absence_aw := tech_capacity;
  ELSE
    total_absence_aw := 0;
  END IF;
  
  -- Calculate planned AW
  SELECT COALESCE(SUM(aw_planned), 0) INTO planned_aw
  FROM schedule_assignments
  WHERE technician_id = tech_id AND DATE(start_time) = target_date;
  
  RETURN GREATEST(0, tech_capacity - total_absence_aw - planned_aw);
END;
$$ LANGUAGE plpgsql;

-- Function to roll over non-completed appointments to next day after business hours
CREATE OR REPLACE FUNCTION rollover_uncompleted_appointments(
  p_cutoff_time TIME DEFAULT '17:00:00'
) RETURNS INTEGER AS $$
DECLARE
  moved_count INTEGER := 0;
BEGIN
  -- Only roll over appointments for today whose status is NOT 'completed'
  -- and only when current time is past cutoff (server time)
  IF NOW()::time < p_cutoff_time THEN
    RETURN 0;
  END IF;

  UPDATE appointments a
  SET date = a.date + INTERVAL '1 day',
      updated_at = NOW()
  WHERE a.date = CURRENT_DATE
    AND a.status <> 'completed';

  GET DIAGNOSTICS moved_count = ROW_COUNT;

  RETURN moved_count;
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
      (start_time < end_time AND start_time < schedule_assignments.end_time AND end_time > schedule_assignments.start_time) OR
      (start_time >= schedule_assignments.start_time AND start_time < schedule_assignments.end_time) OR
      (end_time > schedule_assignments.start_time AND end_time <= schedule_assignments.end_time)
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
-- GRANT PERMISSIONS
-- =============================================

-- Grant execute permissions on business logic functions
GRANT EXECUTE ON FUNCTION get_technician_available_aw(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION rollover_uncompleted_appointments(TIME) TO authenticated;
GRANT EXECUTE ON FUNCTION check_scheduling_conflict(UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_day_appointments(DATE) TO authenticated;

-- Grant select permissions on views
GRANT SELECT ON technician_skills_view TO authenticated;
GRANT SELECT ON appointment_details_view TO authenticated;
GRANT SELECT ON daily_technician_capacity TO authenticated;

-- =============================================
-- VERIFICATION
-- =============================================

SELECT 'Indexes and views migration completed successfully!' as status;
SELECT 'Views created: ' || COUNT(*) as view_count 
FROM information_schema.views 
WHERE table_schema = 'public';

SELECT 'Functions created: ' || COUNT(*) as function_count 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
AND routine_name LIKE '%get_%' OR routine_name LIKE '%check_%' OR routine_name LIKE '%rollover_%';

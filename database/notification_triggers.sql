-- =============================================
-- ENHANCED NOTIFICATION SYSTEM
-- Database Triggers for Automatic Notifications
-- =============================================

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id VARCHAR(100),
  p_message TEXT,
  p_type VARCHAR(20) DEFAULT 'info',
  p_action_link TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO notifications (user_id, message, type, is_read, action_link, action_label, created_at)
  VALUES (p_user_id, p_message, p_type, false, p_action_link, p_action_label, NOW());
END;
$$ LANGUAGE plpgsql;

-- Function to notify all admins
CREATE OR REPLACE FUNCTION notify_all_admins(
  p_message TEXT,
  p_type VARCHAR(20) DEFAULT 'info',
  p_action_link TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO notifications (user_id, message, type, is_read, action_link, action_label, created_at)
  SELECT user_id, p_message, p_type, false, p_action_link, p_action_label, NOW()
  FROM profile 
  WHERE role = 'admin';
END;
$$ LANGUAGE plpgsql;

-- Function to notify specific technician
CREATE OR REPLACE FUNCTION notify_technician(
  p_technician_id VARCHAR(100),
  p_message TEXT,
  p_type VARCHAR(20) DEFAULT 'info',
  p_action_link TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  tech_user_id VARCHAR(100);
BEGIN
  -- Get the user_id for the technician
  SELECT p.user_id INTO tech_user_id
  FROM profile p
  JOIN technicians t ON p.id = t.profile_id
  WHERE t.id = p_technician_id;
  
  IF tech_user_id IS NOT NULL THEN
    PERFORM create_notification(tech_user_id, p_message, p_type, p_action_link, p_action_label);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- APPOINTMENT TRIGGERS
-- =============================================

-- Trigger function for new appointments
CREATE OR REPLACE FUNCTION notify_new_appointment() RETURNS TRIGGER AS $$
BEGIN
  -- Notify all admins about new appointment
  PERFORM notify_all_admins(
    'New appointment created: ' || NEW.title || ' for ' || 
    (SELECT name FROM customers WHERE id = NEW.customer_id),
    'info',
    '/appointments',
    'View Appointments'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for appointment status changes
CREATE OR REPLACE FUNCTION notify_appointment_status_change() RETURNS TRIGGER AS $$
DECLARE
  customer_name TEXT;
  vehicle_info TEXT;
BEGIN
  -- Only notify if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get customer and vehicle info
    SELECT c.name, CONCAT(v.make, ' ', v.model, ' (', v.license_plate, ')')
    INTO customer_name, vehicle_info
    FROM customers c
    JOIN vehicles v ON c.id = v.customer_id
    WHERE c.id = NEW.customer_id AND v.id = NEW.vehicle_id;
    
    -- Notify all admins
    PERFORM notify_all_admins(
      'Appointment status changed: ' || NEW.title || ' (' || customer_name || ') - ' || 
      OLD.status || ' → ' || NEW.status,
      CASE 
        WHEN NEW.status IN ('done', 'delivered') THEN 'success'
        WHEN NEW.status = 'cancelled' THEN 'error'
        WHEN NEW.status = 'in_progress' THEN 'info'
        ELSE 'info'
      END,
      '/appointments',
      'View Appointments'
    );
    
    -- If appointment is assigned to a technician, notify them
    IF NEW.status = 'scheduled' OR NEW.status = 'in_progress' THEN
      PERFORM notify_technician(
        (SELECT technician_id FROM schedule_assignments WHERE appointment_id = NEW.id LIMIT 1),
        'Appointment assigned: ' || NEW.title || ' (' || customer_name || ')',
        'info',
        '/jobs',
        'View My Jobs'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SCHEDULE ASSIGNMENT TRIGGERS
-- =============================================

-- Trigger for new technician assignments
CREATE OR REPLACE FUNCTION notify_technician_assignment() RETURNS TRIGGER AS $$
DECLARE
  appointment_title TEXT;
  customer_name TEXT;
  vehicle_info TEXT;
BEGIN
  -- Get appointment details
  SELECT a.title, c.name, CONCAT(v.make, ' ', v.model, ' (', v.license_plate, ')')
  INTO appointment_title, customer_name, vehicle_info
  FROM appointments a
  JOIN customers c ON a.customer_id = c.id
  JOIN vehicles v ON a.vehicle_id = v.id
  WHERE a.id = NEW.appointment_id;
  
  -- Notify the assigned technician
  PERFORM notify_technician(
    NEW.technician_id,
    'New appointment assigned: ' || appointment_title || ' (' || customer_name || ')',
    'info',
    '/jobs',
    'View My Jobs'
  );
  
  -- Notify all admins
  PERFORM notify_all_admins(
    'Technician assigned: ' || appointment_title || ' → ' || 
    (SELECT name FROM technicians WHERE id = NEW.technician_id),
    'info',
    '/plantafel',
    'View Planning Board'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for assignment changes
CREATE OR REPLACE FUNCTION notify_assignment_change() RETURNS TRIGGER AS $$
DECLARE
  appointment_title TEXT;
  customer_name TEXT;
BEGIN
  -- Get appointment details
  SELECT a.title, c.name
  INTO appointment_title, customer_name
  FROM appointments a
  JOIN customers c ON a.customer_id = c.id
  WHERE a.id = COALESCE(NEW.appointment_id, OLD.appointment_id);
  
  -- If technician changed
  IF OLD.technician_id IS DISTINCT FROM NEW.technician_id THEN
    -- Notify old technician (if exists)
    IF OLD.technician_id IS NOT NULL THEN
      PERFORM notify_technician(
        OLD.technician_id,
        'Appointment reassigned: ' || appointment_title || ' (' || customer_name || ')',
        'warning',
        '/jobs',
        'View My Jobs'
      );
    END IF;
    
    -- Notify new technician (if exists)
    IF NEW.technician_id IS NOT NULL THEN
      PERFORM notify_technician(
        NEW.technician_id,
        'Appointment assigned: ' || appointment_title || ' (' || customer_name || ')',
        'info',
        '/jobs',
        'View My Jobs'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TECHNICIAN ABSENCE TRIGGERS
-- =============================================

-- Trigger for technician absences
CREATE OR REPLACE FUNCTION notify_technician_absence() RETURNS TRIGGER AS $$
DECLARE
  technician_name TEXT;
BEGIN
  -- Get technician name
  SELECT name INTO technician_name
  FROM technicians
  WHERE id = NEW.technician_id;
  
  -- Notify all admins
  PERFORM notify_all_admins(
    'Technician absence: ' || technician_name || ' - ' || NEW.reason || 
    ' on ' || NEW.date::text,
    CASE 
      WHEN NEW.reason ILIKE '%sick%' OR NEW.reason ILIKE '%emergency%' THEN 'error'
      WHEN NEW.reason ILIKE '%vacation%' OR NEW.reason ILIKE '%holiday%' THEN 'warning'
      ELSE 'info'
    END,
    '/technicians',
    'View Technicians'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CREATE TRIGGERS
-- =============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_notify_new_appointment ON appointments;
DROP TRIGGER IF EXISTS trigger_notify_appointment_status_change ON appointments;
DROP TRIGGER IF EXISTS trigger_notify_technician_assignment ON schedule_assignments;
DROP TRIGGER IF EXISTS trigger_notify_assignment_change ON schedule_assignments;
DROP TRIGGER IF EXISTS trigger_notify_technician_absence ON technician_absences;

-- Create triggers
CREATE TRIGGER trigger_notify_new_appointment
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_appointment();

CREATE TRIGGER trigger_notify_appointment_status_change
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_status_change();

CREATE TRIGGER trigger_notify_technician_assignment
  AFTER INSERT ON schedule_assignments
  FOR EACH ROW
  EXECUTE FUNCTION notify_technician_assignment();

CREATE TRIGGER trigger_notify_assignment_change
  AFTER UPDATE ON schedule_assignments
  FOR EACH ROW
  EXECUTE FUNCTION notify_assignment_change();

CREATE TRIGGER trigger_notify_technician_absence
  AFTER INSERT ON technician_absences
  FOR EACH ROW
  EXECUTE FUNCTION notify_technician_absence();

-- =============================================
-- REMINDER FUNCTIONS
-- =============================================

-- Function to create appointment reminders
CREATE OR REPLACE FUNCTION create_appointment_reminders() RETURNS VOID AS $$
DECLARE
  appointment_record RECORD;
  technician_user_id VARCHAR(100);
BEGIN
  -- Find appointments starting in the next 30 minutes
  FOR appointment_record IN
    SELECT a.*, sa.technician_id, c.name as customer_name,
           CONCAT(v.make, ' ', v.model, ' (', v.license_plate, ')') as vehicle_info
    FROM appointments a
    JOIN schedule_assignments sa ON a.id = sa.appointment_id
    JOIN customers c ON a.customer_id = c.id
    JOIN vehicles v ON a.vehicle_id = v.id
    WHERE a.status = 'scheduled'
      AND a.date::timestamp + INTERVAL '30 minutes' <= NOW() + INTERVAL '30 minutes'
      AND a.date::timestamp > NOW()
  LOOP
    -- Get technician's user_id
    SELECT p.user_id INTO technician_user_id
    FROM profile p
    JOIN technicians t ON p.id = t.profile_id
    WHERE t.id = appointment_record.technician_id;
    
    -- Create reminder notification
    IF technician_user_id IS NOT NULL THEN
      PERFORM create_notification(
        technician_user_id,
        'Reminder: Appointment starting soon - ' || appointment_record.title || 
        ' (' || appointment_record.customer_name || ')',
        'warning',
        '/jobs',
        'View My Jobs'
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check for overdue appointments
CREATE OR REPLACE FUNCTION check_overdue_appointments() RETURNS VOID AS $$
DECLARE
  appointment_record RECORD;
  technician_user_id VARCHAR(100);
BEGIN
  -- Find overdue appointments (past scheduled time but still in progress)
  FOR appointment_record IN
    SELECT a.*, sa.technician_id, c.name as customer_name
    FROM appointments a
    JOIN schedule_assignments sa ON a.id = sa.appointment_id
    JOIN customers c ON a.customer_id = c.id
    WHERE a.status = 'in_progress'
      AND a.date::timestamp < NOW() - INTERVAL '1 hour'
  LOOP
    -- Get technician's user_id
    SELECT p.user_id INTO technician_user_id
    FROM profile p
    JOIN technicians t ON p.id = t.profile_id
    WHERE t.id = appointment_record.technician_id;
    
    -- Create overdue notification
    IF technician_user_id IS NOT NULL THEN
      PERFORM create_notification(
        technician_user_id,
        'Overdue appointment: ' || appointment_record.title || 
        ' (' || appointment_record.customer_name || ')',
        'error',
        '/jobs',
        'View My Jobs'
      );
    END IF;
    
    -- Also notify admins
    PERFORM notify_all_admins(
      'Overdue appointment: ' || appointment_record.title || 
      ' (' || appointment_record.customer_name || ') - ' ||
      (SELECT name FROM technicians WHERE id = appointment_record.technician_id),
      'error',
      '/leitstand',
      'View Control Board'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SCHEDULED JOBS (using pg_cron if available)
-- =============================================

-- Note: These require pg_cron extension to be enabled in Supabase
-- You can also run these functions manually or via application cron jobs

-- Schedule reminder checks every 15 minutes
-- SELECT cron.schedule('appointment-reminders', '*/15 * * * *', 'SELECT create_appointment_reminders();');

-- Schedule overdue checks every hour
-- SELECT cron.schedule('overdue-appointments', '0 * * * *', 'SELECT check_overdue_appointments();');

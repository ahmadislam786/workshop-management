# Supabase Database Organization Guide

## Workshop Management System

### 📋 Table of Contents

1. [Database Structure Overview](#database-structure-overview)
2. [Schema Organization](#schema-organization)
3. [File Organization](#file-organization)
4. [Migration Strategy](#migration-strategy)
5. [RLS Policy Organization](#rls-policy-organization)
6. [Function Organization](#function-organization)
7. [Index Strategy](#index-strategy)
8. [Deployment Checklist](#deployment-checklist)

---

## 🏗️ Database Structure Overview

### Core Tables (Priority Order)

```
1. profile (users/roles)
2. technicians (linked to profile)
3. customers
4. vehicles (linked to customers)
5. appointments (core business logic)
6. schedule_assignments (appointment scheduling)
7. technician_absences (availability)
8. services (catalog)
9. parts (inventory)
10. skills (competency system)
11. technician_skills (many-to-many)
12. notifications (system messages)
```

---

## 📁 Schema Organization

### Recommended Supabase Project Structure

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_rls_policies.sql
│   ├── 003_notification_system.sql
│   ├── 004_indexes_and_views.sql
│   └── 005_sample_data.sql
├── functions/
│   ├── get_technician_available_aw.sql
│   ├── rollover_uncompleted_appointments.sql
│   ├── check_scheduling_conflict.sql
│   └── get_day_appointments.sql
├── triggers/
│   ├── notification_triggers.sql
│   └── audit_triggers.sql
└── policies/
    ├── rbac_policies.sql
    └── data_access_policies.sql
```

---

## 🗂️ File Organization

### 1. **Initial Schema** (`001_initial_schema.sql`)

```sql
-- Core tables only (no RLS, no functions)
-- Tables: profile, technicians, customers, vehicles,
--         appointments, schedule_assignments, etc.
-- Indexes: Primary indexes only
-- Constraints: Foreign keys and basic constraints
```

### 2. **RLS Policies** (`002_rls_policies.sql`)

```sql
-- All Row Level Security policies
-- Helper functions for RLS
-- Policy grants and permissions
```

### 3. **Notification System** (`003_notification_system.sql`)

```sql
-- Notification functions
-- Trigger functions
-- Notification triggers
-- RLS for notifications
```

### 4. **Indexes and Views** (`004_indexes_and_views.sql`)

```sql
-- Performance indexes
-- Business logic views
-- Materialized views (if needed)
```

### 5. **Sample Data** (`005_sample_data.sql`)

```sql
-- Sample data for development
-- Test users and roles
-- Sample appointments and assignments
```

---

## 🔄 Migration Strategy

### Phase 1: Core Schema

```sql
-- 1. Create tables in dependency order
-- 2. Add foreign key constraints
-- 3. Add basic indexes
-- 4. Test basic CRUD operations
```

### Phase 2: Security Layer

```sql
-- 1. Enable RLS on all tables
-- 2. Create helper functions
-- 3. Add RLS policies
-- 4. Test with different user roles
```

### Phase 3: Business Logic

```sql
-- 1. Add notification system
-- 2. Add trigger functions
-- 3. Add business logic functions
-- 4. Test end-to-end workflows
```

### Phase 4: Performance

```sql
-- 1. Add performance indexes
-- 2. Create views for common queries
-- 3. Optimize slow queries
-- 4. Monitor performance
```

---

## 🔐 RLS Policy Organization

### Policy Naming Convention

```sql
-- Format: {table}_{action}_{role}_{condition}
-- Examples:
-- "profile_select_own" - Users can select their own profile
-- "appointments_select_admin" - Admins can select all appointments
-- "technicians_select_assigned" - Technicians can select assigned appointments
```

### Policy Categories

```sql
-- 1. Profile Policies (user management)
-- 2. Technician Policies (role-based access)
-- 3. Customer/Vehicle Policies (business data)
-- 4. Appointment Policies (core business logic)
-- 5. Schedule Policies (scheduling system)
-- 6. Notification Policies (user-specific)
```

---

## ⚙️ Function Organization

### Function Categories

#### 1. **RLS Helper Functions**

```sql
-- get_user_role()
-- is_admin()
-- is_technician()
-- get_technician_id()
```

#### 2. **Business Logic Functions**

```sql
-- get_technician_available_aw()
-- check_scheduling_conflict()
-- rollover_uncompleted_appointments()
-- get_day_appointments()
```

#### 3. **Notification Functions**

```sql
-- create_notification()
-- notify_technician()
-- notify_all_admins()
-- create_appointment_reminders()
```

#### 4. **Trigger Functions**

```sql
-- notify_technician_assignment()
-- notify_assignment_change()
-- notify_appointment_status_change()
```

---

## 📊 Index Strategy

### Primary Indexes (Performance Critical)

```sql
-- User lookups
CREATE INDEX idx_profile_user_id ON profile(user_id);
CREATE INDEX idx_technicians_profile_id ON technicians(profile_id);

-- Appointment queries
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);

-- Schedule assignments
CREATE INDEX idx_schedule_assignments_technician_id ON schedule_assignments(technician_id);
CREATE INDEX idx_schedule_assignments_start_time ON schedule_assignments(start_time);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

### Composite Indexes (Query Optimization)

```sql
-- Appointment + Status + Date
CREATE INDEX idx_appointments_status_date ON appointments(status, date);

-- Technician + Date + Status
CREATE INDEX idx_schedule_assignments_tech_date_status ON schedule_assignments(technician_id, start_time, status);

-- Customer + Vehicle lookups
CREATE INDEX idx_vehicles_customer_license ON vehicles(customer_id, license_plate);
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All migrations tested locally
- [ ] RLS policies verified with test users
- [ ] Functions tested with sample data
- [ ] Indexes created for performance
- [ ] Backup strategy in place

### Deployment Steps

1. **Create Supabase Project**
2. **Run Initial Schema Migration**
3. **Set up RLS Policies**
4. **Deploy Functions and Triggers**
5. **Add Performance Indexes**
6. **Insert Sample Data**
7. **Test with Real Users**

### Post-Deployment

- [ ] Monitor query performance
- [ ] Check RLS policy effectiveness
- [ ] Verify notification system
- [ ] Test user workflows
- [ ] Set up monitoring alerts

---

## 🔧 Supabase-Specific Best Practices

### 1. **Use Supabase CLI**

```bash
# Initialize project
supabase init

# Start local development
supabase start

# Generate migration
supabase db diff --schema public > migrations/001_initial_schema.sql

# Deploy to production
supabase db push
```

### 2. **Environment Management**

```bash
# Development
supabase start

# Staging
supabase link --project-ref <staging-project-ref>

# Production
supabase link --project-ref <production-project-ref>
```

### 3. **Database Functions**

```sql
-- Use SECURITY DEFINER for RLS functions
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
```

### 4. **Real-time Subscriptions**

```sql
-- Enable real-time for critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE schedule_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

---

## 📈 Performance Monitoring

### Key Metrics to Monitor

- Query execution time
- RLS policy performance
- Real-time subscription usage
- Database connection count
- Storage usage

### Supabase Dashboard

- Use the Supabase dashboard to monitor:
  - Database performance
  - API usage
  - Real-time connections
  - Storage usage
  - Error logs

---

## 🛡️ Security Considerations

### 1. **RLS Policy Testing**

```sql
-- Test policies with different user roles
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "user-uuid", "role": "technician"}';
SELECT * FROM appointments; -- Should only see assigned appointments
```

### 2. **Function Security**

```sql
-- Use SECURITY DEFINER for system functions
-- Use SECURITY INVOKER for user functions
-- Grant minimal required permissions
```

### 3. **Data Validation**

```sql
-- Add CHECK constraints for data integrity
-- Use triggers for complex validation
-- Implement audit trails for sensitive operations
```

---

## 📝 Maintenance Tasks

### Daily

- Monitor error logs
- Check notification system
- Verify real-time connections

### Weekly

- Review slow queries
- Check index usage
- Update statistics

### Monthly

- Review RLS policy effectiveness
- Analyze user access patterns
- Optimize performance bottlenecks

---

This organization strategy will give you a maintainable, scalable, and secure database structure in Supabase! 🚀

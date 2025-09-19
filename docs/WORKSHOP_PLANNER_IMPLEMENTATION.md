# Workshop Planner Implementation

## Overview

This document describes the implementation of the new Workshop Planner system that replaces the basic job management with a comprehensive AW (Arbeitswerte) based scheduling system.

## Key Features Implemented

### 1. AW (Arbeitswerte) System
- **1 AW = 6 minutes** of work time
- **Default capacity: 80 AW/day** per technician (configurable)
- Real-time capacity and utilization calculations
- Visual indicators for overbooked (red), near capacity (amber), OK (green)

### 2. Day-View Planner
- **Top buffer** with all unassigned appointments (today only)
- **Bottom area** with one swimlane per technician (07:00–18:00)
- **Drag & drop** appointments from buffer → technician's timeline
- **15-minute time grid** with snap-to-grid functionality
- **Bar length = AW × 6 minutes** for visual representation

### 3. Enhanced Data Model

#### New Tables:
- `appointments` - Replaces jobs with AW system
- `schedule_assignments` - Links appointments to technicians with time slots
- `technician_absences` - Manages vacation, sick, training absences
- `services` - Service types with default AW estimates
- `parts` - Parts inventory with stock levels

#### Enhanced Tables:
- `technicians` - Added AW capacity, shift times, active status
- `skills` - Required skills per appointment
- `notifications` - Enhanced notification system

### 4. Scheduling & Validation Rules

#### Hard Checks (Block):
- Technician absent during time slot
- Time overlap with existing assignments
- Missing required skills
- Parts not available (if policy = block)
- Outside working hours (07:00-18:00)

#### Soft Checks (Warn/Confirm):
- SLA risk (deadline approaching)
- Vehicle not onsite
- High utilization (>90%)
- Skill mismatch warnings

### 5. Status Flow
```
New → Scheduled → In Progress → Paused/Waiting Parts → Done → Delivered
```

### 6. UI/UX Features

#### Header Bar:
- Date selector with navigation
- Workshop filter
- KPI chips: planned AW, available AW, utilization %, waiting customers, vehicles onsite, pending parts

#### Buffer:
- Unassigned jobs with details (customer/vehicle, summary, AW, SLA, flags, required skills)
- Tooltip with notes/parts information
- Drag & drop to technician lanes

#### Technician Swimlanes:
- Time grid with 15-minute ticks
- Drag & drop jobs
- Bar length = AW × 6 min
- Absence blocks = non-droppable zones
- Utilization warnings

## Database Schema

### Core Tables

```sql
-- Technicians with AW capacity
CREATE TABLE technicians (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  shift_start TIME DEFAULT '07:00:00',
  shift_end TIME DEFAULT '18:00:00',
  aw_capacity_per_day INTEGER DEFAULT 80,
  active BOOLEAN DEFAULT TRUE,
  -- ... other fields
);

-- Appointments with AW system
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  date DATE NOT NULL,
  customer_id UUID NOT NULL,
  vehicle_id UUID NOT NULL,
  service_id UUID,
  title VARCHAR(255) NOT NULL,
  aw_estimate INTEGER NOT NULL DEFAULT 10,
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(20) DEFAULT 'new',
  required_skills TEXT[],
  sla_promised_at TIMESTAMP WITH TIME ZONE,
  flags TEXT[],
  -- ... other fields
);

-- Schedule assignments
CREATE TABLE schedule_assignments (
  id UUID PRIMARY KEY,
  appointment_id UUID NOT NULL,
  technician_id UUID NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  aw_planned INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled',
  -- ... other fields
);

-- Technician absences
CREATE TABLE technician_absences (
  id UUID PRIMARY KEY,
  technician_id UUID NOT NULL,
  date DATE NOT NULL,
  type VARCHAR(20) NOT NULL,
  from_time TIME,
  to_time TIME,
  description TEXT,
  -- ... other fields
);
```

### Views and Functions

```sql
-- Daily capacity view
CREATE VIEW daily_technician_capacity AS
SELECT 
  t.id as technician_id,
  t.name as technician_name,
  d.date,
  t.aw_capacity_per_day as total_capacity,
  -- Calculate available capacity considering absences
  -- Calculate planned AW and utilization percentage
FROM technicians t
CROSS JOIN generate_series(...) as d(date)
-- ... complex calculations

-- Function to get available AW
CREATE FUNCTION get_technician_available_aw(
  tech_id UUID,
  target_date DATE
) RETURNS INTEGER AS $$
-- ... implementation
$$ LANGUAGE plpgsql;
```

## API Layer

### New Hooks

#### `useAppointments`
```typescript
const {
  appointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsForDate,
  getUnassignedAppointments
} = useAppointments();
```

#### `useScheduleAssignments`
```typescript
const {
  assignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentsForDate,
  getAssignmentsForTechnician
} = useScheduleAssignments();
```

#### `useTechnicianAbsences`
```typescript
const {
  absences,
  createAbsence,
  updateAbsence,
  deleteAbsence,
  getAbsencesForDate,
  getAbsencesForTechnician
} = useTechnicianAbsences();
```

### AW Utilities

```typescript
import { 
  awToMinutes, 
  minutesToAW, 
  calculateEndTime, 
  calculateAvailableAW,
  generateTimeSlots,
  snapToGrid 
} from '@/lib/aw-utils';

// Convert AW to minutes
const minutes = awToMinutes(10); // 60 minutes

// Calculate end time
const endTime = calculateEndTime(startTime, 20); // 20 AW = 120 minutes

// Generate time slots
const slots = generateTimeSlots(date, 15); // 15-minute intervals
```

## Components

### DayViewPlanner
Main component for the day-view scheduling interface.

**Features:**
- Date navigation
- KPI dashboard
- Unassigned appointments buffer
- Technician swimlanes with drag & drop
- Real-time capacity calculations
- Conflict detection and validation

### SchedulingValidator
Component for validating scheduling decisions.

**Features:**
- Hard and soft validation checks
- Visual feedback with icons and colors
- Confirmation dialog with warnings
- Skill requirement checking
- SLA risk assessment

## Usage

### 1. Access Day View Planner
Navigate to the Day View Planner from the admin dashboard or sidebar.

### 2. Schedule Appointments
1. Drag unassigned appointments from the buffer
2. Drop onto technician lanes at desired time slots
3. System validates the drop and shows warnings/errors
4. Confirm or cancel based on validation results

### 3. Monitor Capacity
- View real-time utilization percentages
- See available AW for each technician
- Monitor overall workshop capacity

### 4. Manage Absences
- Add technician absences (vacation, sick, training)
- System automatically adjusts available capacity
- Visual indicators show non-droppable zones

## Configuration

### AW Capacity
Default capacity can be configured per technician:
```typescript
technician.aw_capacity_per_day = 80; // 80 AW = 8 hours
```

### Working Hours
Default working hours are 07:00-18:00, configurable per technician:
```typescript
technician.shift_start = '07:00:00';
technician.shift_end = '18:00:00';
```

### Time Grid
15-minute intervals by default, configurable:
```typescript
const TIME_SLOT_MINUTES = 15;
```

## Migration from Old System

The new system maintains backward compatibility with the existing job system:

1. **Jobs table** remains for legacy data
2. **Appointments table** is the new primary system
3. **Migration scripts** can convert jobs to appointments
4. **Gradual transition** allows running both systems in parallel

## Performance Considerations

### Database Indexes
- Optimized indexes on date, technician_id, start_time
- Composite indexes for common query patterns
- Views for complex capacity calculations

### Real-time Updates
- Supabase real-time subscriptions for live updates
- Optimistic UI updates for better UX
- Efficient re-rendering with React.memo and useMemo

### Caching
- Local state management with React hooks
- Efficient data fetching with parallel queries
- Memoized calculations for capacity and utilization

## Security

### Row Level Security (RLS)
All tables have RLS policies enabled:
- Users can only access their own data
- Admins have full access
- Technicians can only see their assignments

### Validation
- Client-side validation for immediate feedback
- Server-side validation for security
- Input sanitization and type checking

## Testing

### Unit Tests
- AW calculation utilities
- Validation logic
- Component rendering

### Integration Tests
- Database operations
- API endpoints
- Real-time subscriptions

### E2E Tests
- Complete scheduling workflows
- Drag & drop functionality
- Capacity calculations

## Future Enhancements

### Planned Features
1. **Multi-day view** for week/month planning
2. **Auto-scheduling** based on skills and capacity
3. **Resource management** for tools and equipment
4. **Mobile optimization** for technicians
5. **Advanced reporting** and analytics
6. **Integration** with external systems

### Performance Improvements
1. **Virtual scrolling** for large datasets
2. **Web Workers** for heavy calculations
3. **Progressive loading** for better UX
4. **Offline support** with service workers

## Troubleshooting

### Common Issues

#### Drag & Drop Not Working
- Check if appointment is in correct status
- Verify technician is active
- Ensure time slot is within working hours

#### Capacity Calculations Wrong
- Verify technician AW capacity settings
- Check for overlapping absences
- Ensure assignments are properly linked

#### Performance Issues
- Check database indexes
- Monitor real-time subscription limits
- Optimize component re-renders

### Debug Mode
Enable debug logging:
```typescript
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) {
  console.log('AW calculation:', { aw, minutes, utilization });
}
```

## Support

For technical support or feature requests, please refer to the main project documentation or contact the development team.

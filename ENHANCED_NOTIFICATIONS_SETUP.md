# 🚀 Enhanced Real-Time Notifications Setup Guide

This guide will help you set up the enhanced real-time notification system for your Workshop Management application.

## 📋 **What's Included**

### ✅ **Database Triggers**

- Automatic notifications for new appointments
- Status change notifications
- Technician assignment notifications
- Absence notifications
- Reminder and overdue appointment checks

### ✅ **Push Notifications**

- Browser push notifications
- Real-time delivery
- User-configurable settings
- Action buttons and navigation

### ✅ **Event-Based Notifications**

- Appointment reminders (30 minutes before)
- Overdue appointment alerts
- Technician availability changes
- System-wide notifications

## 🛠️ **Installation Steps**

### **Step 1: Database Setup**

1. **Run the notification triggers SQL:**

   ```bash
   # Connect to your Supabase database and run:
   psql -h your-db-host -U postgres -d postgres -f database/notification_triggers.sql
   ```

2. **Enable pg_cron extension (optional, for scheduled jobs):**

   ```sql
   -- In your Supabase SQL editor:
   CREATE EXTENSION IF NOT EXISTS pg_cron;

   -- Schedule reminder checks every 15 minutes
   SELECT cron.schedule('appointment-reminders', '*/15 * * * *', 'SELECT create_appointment_reminders();');

   -- Schedule overdue checks every hour
   SELECT cron.schedule('overdue-appointments', '0 * * * *', 'SELECT check_overdue_appointments();');
   ```

### **Step 2: Application Setup**

The following files have been created/updated:

#### **New Files:**

- `database/notification_triggers.sql` - Database triggers and functions
- `src/lib/notification-service.ts` - Centralized notification service
- `src/lib/push-notification-service.ts` - Browser push notifications
- `src/components/shared/NotificationInitializer.tsx` - System initialization

#### **Updated Files:**

- `src/contexts/notification-context.tsx` - Enhanced with push notifications
- `src/components/shared/NotificationPanel.tsx` - Added push notification settings
- `src/hooks/useAppointments.ts` - Integrated notification triggers
- `src/App.tsx` - Added notification initializer

### **Step 3: Test the System**

1. **Test Database Triggers:**

   ```sql
   -- Create a new appointment to test
   INSERT INTO appointments (date, customer_id, vehicle_id, service_id, title, notes, aw_estimate, priority, status, required_skills, sla_promised_at, flags, created_at, updated_at)
   VALUES (CURRENT_DATE, (SELECT id FROM customers LIMIT 1), (SELECT id FROM vehicles LIMIT 1), (SELECT id FROM services LIMIT 1), 'Test Appointment', 'Test notification', 10, 'normal', 'new', ARRAY['inspection'], NOW() + INTERVAL '1 day', ARRAY[]::text[], NOW(), NOW());
   ```

2. **Test Push Notifications:**
   - Open the notification panel
   - Click the settings icon
   - Enable push notifications
   - Create a new appointment to see the notification

3. **Test Real-Time Updates:**
   - Open the app in two browser tabs
   - Create an appointment in one tab
   - Watch it appear in real-time in the other tab

## 🎯 **Features Overview**

### **Automatic Notifications**

#### **New Appointment Created**

- **Recipients:** All admins
- **Message:** "New appointment created: [Title] for [Customer]"
- **Action:** Link to appointments page

#### **Appointment Status Changed**

- **Recipients:** All admins + assigned technician
- **Message:** "Appointment status changed: [Title] - [Old Status] → [New Status]"
- **Action:** Link to appointments/jobs page

#### **Technician Assigned**

- **Recipients:** Assigned technician + all admins
- **Message:** "New appointment assigned: [Title] for [Customer]"
- **Action:** Link to jobs page

#### **Technician Absence**

- **Recipients:** All admins
- **Message:** "Technician absence: [Name] - [Reason] on [Date]"
- **Action:** Link to technicians page

### **Scheduled Notifications**

#### **Appointment Reminders**

- **Trigger:** 30 minutes before appointment start
- **Recipients:** Assigned technician
- **Message:** "Reminder: Appointment starting soon - [Title] ([Customer])"
- **Action:** Link to jobs page

#### **Overdue Appointments**

- **Trigger:** 1 hour after scheduled start time
- **Recipients:** Assigned technician + all admins
- **Message:** "Overdue appointment: [Title] ([Customer])"
- **Action:** Link to jobs/control board

### **Push Notifications**

#### **Browser Notifications**

- Real-time delivery
- Clickable with action buttons
- Auto-dismiss after 5 seconds (configurable)
- Custom icons and badges

#### **User Settings**

- Enable/disable push notifications
- Visual indicators in notification panel
- Permission management

## 🔧 **Configuration Options**

### **Notification Types**

```typescript
type NotificationType = "info" | "success" | "warning" | "error";
```

### **Customization**

You can customize notification behavior by modifying:

1. **Database Functions** (`database/notification_triggers.sql`):
   - Change notification messages
   - Modify trigger conditions
   - Add new notification types

2. **Service Configuration** (`src/lib/notification-service.ts`):
   - Adjust reminder timing
   - Change overdue thresholds
   - Customize notification content

3. **Push Notification Settings** (`src/lib/push-notification-service.ts`):
   - Modify notification appearance
   - Change auto-dismiss timing
   - Add custom actions

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Notifications Not Appearing**

1. Check database triggers are installed
2. Verify Supabase real-time is enabled
3. Check browser console for errors

#### **Push Notifications Not Working**

1. Ensure browser supports notifications
2. Check permission is granted
3. Verify HTTPS connection (required for push notifications)

#### **Database Triggers Not Firing**

1. Check trigger functions exist
2. Verify table permissions
3. Check Supabase logs for errors

### **Debug Mode**

Enable debug logging by adding to your browser console:

```javascript
localStorage.setItem("debug", "notifications");
```

## 📊 **Monitoring**

### **Check Notification Status**

```sql
-- View recent notifications
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;

-- Check trigger status
SELECT * FROM pg_trigger WHERE tgname LIKE '%notification%';

-- View scheduled jobs (if pg_cron enabled)
SELECT * FROM cron.job;
```

### **Performance Monitoring**

- Monitor notification table size
- Check real-time connection status
- Track push notification delivery rates

## 🎉 **You're All Set!**

Your enhanced real-time notification system is now ready! Users will receive:

- ✅ **Instant notifications** for all important events
- ✅ **Browser push notifications** for real-time updates
- ✅ **Automatic reminders** for upcoming appointments
- ✅ **Overdue alerts** for delayed work
- ✅ **Role-based notifications** (admins vs technicians)

The system is fully integrated and will work seamlessly with your existing Workshop Management application.

## 🔄 **Next Steps**

Consider adding:

- Email notifications
- SMS notifications
- Mobile app push notifications
- Custom notification templates
- Notification analytics dashboard

---

**Need Help?** Check the troubleshooting section or review the code comments for detailed implementation notes.

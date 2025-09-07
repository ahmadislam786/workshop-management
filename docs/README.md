# 🚗 Workshop Management System

A comprehensive workshop management system built with React, TypeScript, and Supabase for Autohaus Denker & Brünen.

## ✨ Features

### 🎯 Core Functionality
- **Customer Management** - Complete customer database with contact information
- **Vehicle Management** - Track customer vehicles with detailed specifications
- **Job Management** - Comprehensive job tracking with status updates
- **Technician Management** - Manage technicians with skill-based assignments
- **Skill-Based Assignment** - Intelligent job matching based on technician skills

### 🔧 Advanced Features
- **Real-time Updates** - Live data synchronization with Supabase
- **Multi-language Support** - English and German interface
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Scan Management** - Vehicle diagnostic scan tracking
- **Damage Reports** - Document vehicle damage and issues
- **Team Organization** - Group technicians into specialized teams

### 👥 User Roles
- **Admin** - Full access to all features and user management
- **Technician** - Limited access to assigned jobs and personal dashboard

## 🏗️ Project Structure

```
workshop-management/
├── 📁 public/                          # Static assets
├── 📁 src/                            # Source code
│   ├── 📁 components/                 # React components
│   │   ├── 📁 features/               # Feature-specific components
│   │   │   ├── 📁 customers/          # Customer management
│   │   │   ├── 📁 vehicles/           # Vehicle management
│   │   │   ├── 📁 jobs/               # Job management
│   │   │   ├── 📁 technicians/        # Technician management
│   │   │   ├── 📁 scans/              # Scan management
│   │   │   ├── 📁 damage-reports/     # Damage reporting
│   │   │   └── 📁 admin/              # Admin features
│   │   ├── 📁 shared/                 # Shared components
│   │   └── 📁 ui/                     # UI components
│   ├── 📁 contexts/                   # React contexts
│   ├── 📁 hooks/                      # Custom hooks
│   ├── 📁 lib/                        # Utility libraries
│   ├── 📁 types/                      # TypeScript definitions
│   └── 📁 styles/                     # Global styles
├── 📁 database/                       # Database schema
└── 📁 docs/                           # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workshop-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the database schema from `database/fixed_supabase_schema.sql`
   - Copy your Supabase URL and anon key

4. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase credentials to `.env.local`

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The system uses a comprehensive PostgreSQL database with the following key tables:

- **profile** - User roles and authentication
- **technicians** - Technician information and specializations
- **customers** - Customer database
- **vehicles** - Vehicle information linked to customers
- **jobs** - Job tracking and management
- **skills** - Available skills for technicians
- **technician_skills** - Many-to-many relationship between technicians and skills
- **scans** - Vehicle diagnostic scans
- **damage_reports** - Damage documentation
- **notifications** - System notifications
- **teams** - Team organization

### 🎯 Skill-Based System

The system includes 9 pre-configured technicians with their specializations:

1. **Markus** - timing belt, brakes, suspension, failure search, glass, tyres
2. **Viktor** - timing belt, brakes, suspension, failure search, glass, tyres, body work
3. **Andi** - body work, brakes, suspension, failure search, glass, tyres
4. **Kai** - brakes, suspension, failure search, glass, tyres, inspection
5. **Anton** - timing belt, brakes, suspension, failure search, glass, tyres
6. **Michel** - brakes, suspension, glass, tyres, inspection
7. **Jakob** - brakes, suspension, glass, tyres, inspection
8. **Niko** - timing belt, brakes, suspension, failure search, glass, tyres, body work
9. **Ahmad** - brakes, suspension, glass, tyres, inspection

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Real-time, Auth)
- **State Management**: React Context API
- **UI Components**: Custom components with Lucide React icons
- **Notifications**: React Toastify
- **Build Tool**: Vite

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first** approach
- **Tablet optimization** for medium screens
- **Desktop enhancement** for large screens
- **Touch-friendly** interface elements

## 🌐 Internationalization

- **English** and **German** language support
- **Dynamic language switching**
- **Persistent language preference**
- **Complete UI translation**

## 🔐 Security

- **Row Level Security (RLS)** enabled on all tables
- **Role-based access control**
- **Secure authentication** with Supabase Auth
- **Input validation** and sanitization

## 📊 Features Overview

### Dashboard
- **Admin Dashboard**: Overview of all operations, statistics, and quick actions
- **Technician Dashboard**: Personal job assignments and status

### Job Management
- **Job Creation**: Create new jobs with customer and vehicle details
- **Status Tracking**: Track job progress from pending to completion
- **Skill-Based Assignment**: Automatically suggest technicians based on required skills
- **Calendar View**: Visual job scheduling and timeline

### Customer & Vehicle Management
- **Customer Database**: Complete customer information management
- **Vehicle Tracking**: Link vehicles to customers with detailed specifications
- **Service History**: Track all services performed on vehicles

### Technician Management
- **Skill Management**: Assign and manage technician skills
- **Workload Tracking**: Monitor technician job assignments
- **Performance Metrics**: Track job completion and efficiency

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your repository
2. Set environment variables
3. Deploy automatically on push

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for Autohaus Denker & Brünen.

## 🆘 Support

For support and questions, please contact the development team.

---

**Built with ❤️ for Autohaus Denker & Brünen**
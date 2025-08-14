# 🚗 Workshop Management System

A modern, role-based workshop management application built with React, TypeScript, and Supabase.

## ✨ Features

- **🔐 Role-Based Authentication** - Admin and Technician roles
- **📊 Dashboard** - Real-time statistics and job overview
- **📅 Job Management** - Create, assign, and track jobs
- **👥 Customer Management** - Manage customer information
- **🚗 Vehicle Management** - Track vehicle details
- **👨‍🔧 Technician Management** - Manage technician profiles
- **📱 Responsive Design** - Works on all devices
- **⚡ Real-time Updates** - Live data synchronization

## 🏗️ Project Structure

```
workshop_manag/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── jobs/           # Job management components
│   │   ├── customers/      # Customer management components
│   │   ├── technicians/    # Technician management components
│   │   ├── vehicles/       # Vehicle management components
│   │   ├── shared/         # Shared layout components
│   │   └── ui/             # Reusable UI components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # External library configurations
│   ├── styles/             # Global styles and CSS
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── config.js               # Supabase configuration
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workshop_manag
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Copy `config.example.js` to `config.js`
   - Update with your Supabase credentials:
     ```javascript
     export default {
       supabaseUrl: "YOUR_SUPABASE_URL",
       anonKey: "YOUR_SUPABASE_ANON_KEY"
     }
     ```

4. **Set up database**
   - Run the SQL schema in your Supabase SQL editor
   - Ensure RLS policies are properly configured

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:5173`

## 🗄️ Database Schema

The application uses the following tables:
- `profile` - User roles and authentication
- `technicians` - Technician information
- `customers` - Customer details
- `vehicles` - Vehicle information
- `jobs` - Job assignments and tracking

## 🔐 Authentication

- **Admin Role**: Full access to all features
- **Technician Role**: Limited access to assigned jobs and profile

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Dark/Light Mode** - Automatic theme switching
- **Smooth Animations** - Enhanced user experience
- **Accessibility** - WCAG compliant components

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **State Management**: React Context + Custom Hooks
- **Build Tool**: Vite
- **Package Manager**: npm

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Tailwind CSS

The project uses Tailwind CSS v3 with custom configuration in `tailwind.config.js`.

## 🚨 Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check Supabase configuration in `config.js`
   - Verify RLS policies are correctly set
   - Check browser console for errors

2. **Data not loading**
   - Verify database connection
   - Check RLS policies
   - Ensure proper user roles

3. **Styling issues**
   - Clear browser cache
   - Restart development server
   - Check Tailwind CSS configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review Supabase documentation
- Open an issue on GitHub

# Scanbit - Digital Menu & Business Solutions Platform

A modern, full-stack web application for creating and managing digital menus, QR codes, and business solutions.

**Developed by Rudransh Infotech Private Limited**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Dependencies](#dependencies)
- [Available Scripts](#available-scripts)
- [Building for Production](#building-for-production)

---

## 🎯 Overview

Scanbit is a comprehensive platform that enables businesses to:
- Create and manage digital menus
- Generate QR codes for easy menu access
- Track analytics and customer engagement
- Manage subscriptions and pricing plans
- Provide admin dashboard for platform management

The platform supports multiple business types:
- **Food Mall** - Restaurants, Cafés, Hotels, Cloud Kitchens, etc.
- **Retail / E-Commerce** - Clothing Stores, Furniture Stores, Electronic Shops, etc.
- **Creative & Design** - Logo Designers, Graphic Designers, Freelancers, etc.

---

## ✨ Features

### Frontend Features

- 🎨 **Modern UI/UX** - Built with shadcn/ui and Tailwind CSS
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🔐 **Authentication** - Secure login and registration with OTP verification
- 📊 **Dashboard** - Comprehensive dashboard for businesses
- 👤 **Admin Panel** - Full-featured admin dashboard
- 🎯 **Role-based Access** - Different views for admin and regular users
- 📋 **Menu Management** - Create, edit, and organize menu items
- 📈 **Analytics** - Track QR scans and customer engagement
- 💳 **Pricing Plans** - View and manage subscription plans
- 🎨 **Theme Support** - Dark and light mode support

### Backend Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 🏪 **Business Management** - Complete CRUD operations
- 📋 **Menu & Category Management** - Organize menu items
- 📊 **Analytics Tracking** - QR scan tracking and analytics
- 👤 **Admin Dashboard API** - Admin management endpoints
- 📤 **File Upload** - Image uploads via Cloudinary
- 🎯 **Role-based Access Control** - Admin and User roles

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- **Git** (for cloning the repository)
- **Backend Server** - The backend API should be running (see backend README)

### Browser & device support

The app targets **iOS Safari 12+**, **Android Chrome 64+**, and modern desktop browsers (see `package.json` → `browserslist` and `engines`). Build output is compatible with mobile WebViews and PWA use.

### Stability (maximum call stack)

Route guards (`PricingRoute`, `PublicRoute`, `SubscriptionGuard`, `ProtectedRoute`) use a single auth/subscription effect with empty or stable dependencies to avoid redirect loops. Context (`SiteSettingsContext`) uses `useCallback`/`useMemo` for stable values. React StrictMode is disabled to reduce effect double-invocation on iOS Safari. No render-time navigation or setState-in-render patterns are used.

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd "Menu card App/menu-maestro"
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory (if not already present):

```bash
# Copy example if available
cp .env.example .env
```

Update the `.env` file with your configuration (see [Environment Variables](#environment-variables) section).

### Step 4: Start the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:8080` (or the port specified in your Vite configuration).

### Step 5: Start the Backend Server

In a separate terminal, navigate to the backend directory and start the backend server:

```bash
cd backend
npm install
npm run dev
```

The backend will run on `http://localhost:5000` (or the port specified in your backend `.env` file).

---

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Scanbit

# Company Information
VITE_COMPANY_NAME=Scanbit
VITE_COMPANY_PHONE=+1-234-567-8900
VITE_COMPANY_EMAIL=support@scanbit.com

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PRICING=true
```

**⚠️ Important:** 
- All Vite environment variables must be prefixed with `VITE_`
- Never commit your `.env` file to version control
- Set `VITE_API_URL` in `.env` to your API base URL

---

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

This starts the Vite development server with hot module replacement (HMR).

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

### Linting

```bash
npm run lint
```

This runs ESLint to check for code quality issues.

### Testing

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

---

## 📁 Project Structure

```
menu-maestro/
├── public/                 # Static assets
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/         # React components
│   │   ├── landing/        # Landing page components
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and API client
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin pages
│   │   └── hotel/          # Business dashboard pages
│   ├── test/               # Test files
│   ├── App.tsx             # Main App component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── backend/                # Backend API (see backend README)
├── .env                    # Environment variables
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

---

## 🛠 Technology Stack

### Frontend

- **Framework:** React 18.3.1
- **Language:** TypeScript 5.8.3
- **Build Tool:** Vite 5.4.19
- **UI Library:** shadcn/ui (Radix UI components)
- **Styling:** Tailwind CSS 3.4.17
- **Routing:** React Router DOM 6.30.1
- **State Management:** TanStack Query 5.83.0
- **Forms:** React Hook Form 7.61.1 + Zod 3.25.76
- **Icons:** Lucide React 0.462.0 + React Icons 5.5.0
- **Charts:** Recharts 2.15.4
- **Maps:** React Leaflet 4.2.1
- **QR Codes:** qrcode.react 4.2.0
- **Notifications:** Sonner 1.7.4
- **Themes:** next-themes 0.3.0

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT
- **File Upload:** Cloudinary

---

## 📦 Dependencies

### Production Dependencies

```json
{
  "@hookform/resolvers": "^3.10.0",        // Form validation resolvers
  "@radix-ui/react-accordion": "^1.2.11",  // UI components
  "@radix-ui/react-alert-dialog": "^1.1.14",
  "@radix-ui/react-aspect-ratio": "^1.1.7",
  "@radix-ui/react-avatar": "^1.1.10",
  "@radix-ui/react-checkbox": "^1.3.2",
  "@radix-ui/react-collapsible": "^1.1.11",
  "@radix-ui/react-context-menu": "^2.2.15",
  "@radix-ui/react-dialog": "^1.1.14",
  "@radix-ui/react-dropdown-menu": "^2.1.15",
  "@radix-ui/react-hover-card": "^1.1.14",
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-menubar": "^1.1.15",
  "@radix-ui/react-navigation-menu": "^1.2.13",
  "@radix-ui/react-popover": "^1.1.14",
  "@radix-ui/react-progress": "^1.1.7",
  "@radix-ui/react-radio-group": "^1.3.7",
  "@radix-ui/react-scroll-area": "^1.2.9",
  "@radix-ui/react-select": "^2.2.5",
  "@radix-ui/react-separator": "^1.1.7",
  "@radix-ui/react-slider": "^1.3.5",
  "@radix-ui/react-slot": "^1.2.3",
  "@radix-ui/react-switch": "^1.2.5",
  "@radix-ui/react-tabs": "^1.1.12",
  "@radix-ui/react-toast": "^1.2.14",
  "@radix-ui/react-toggle": "^1.1.9",
  "@radix-ui/react-toggle-group": "^1.1.10",
  "@radix-ui/react-tooltip": "^1.2.7",
  "@tanstack/react-query": "^5.83.0",      // Data fetching and caching
  "class-variance-authority": "^0.7.1",    // Component variants
  "clsx": "^2.1.1",                        // Conditional class names
  "cmdk": "^1.1.1",                        // Command menu
  "date-fns": "^3.6.0",                    // Date utilities
  "embla-carousel-react": "^8.6.0",        // Carousel component
  "input-otp": "^1.4.2",                   // OTP input component
  "leaflet": "^1.9.4",                     // Maps
  "lucide-react": "^0.462.0",              // Icon library
  "next-themes": "^0.3.0",                 // Theme management
  "qrcode.react": "^4.2.0",                // QR code generation
  "react": "^18.3.1",                      // React library
  "react-day-picker": "^8.10.1",           // Date picker
  "react-dom": "^18.3.1",                  // React DOM
  "react-hook-form": "^7.61.1",            // Form handling
  "react-icons": "^5.5.0",                 // Icon library
  "react-leaflet": "^4.2.1",               // React wrapper for Leaflet
  "react-resizable-panels": "^2.1.9",       // Resizable panels
  "react-router-dom": "^6.30.1",           // Routing
  "recharts": "^2.15.4",                   // Charts and graphs
  "sonner": "^1.7.4",                      // Toast notifications
  "tailwind-merge": "^2.6.0",              // Merge Tailwind classes
  "tailwindcss-animate": "^1.0.7",         // Tailwind animations
  "vaul": "^0.9.9",                        // Drawer component
  "zod": "^3.25.76"                        // Schema validation
}
```

### Development Dependencies

```json
{
  "@eslint/js": "^9.32.0",                 // ESLint core
  "@tailwindcss/typography": "^0.5.16",    // Typography plugin
  "@testing-library/jest-dom": "^6.6.0",   // Testing utilities
  "@testing-library/react": "^16.0.0",    // React testing utilities
  "@types/node": "^22.16.5",              // Node.js type definitions
  "@types/react": "^18.3.23",              // React type definitions
  "@types/react-dom": "^18.3.7",          // React DOM type definitions
  "@vitejs/plugin-react-swc": "^3.11.0",  // Vite React plugin
  "autoprefixer": "^10.4.21",              // CSS autoprefixer
  "eslint": "^9.32.0",                     // Linting
  "eslint-plugin-react-hooks": "^5.2.0",   // React hooks linting
  "eslint-plugin-react-refresh": "^0.4.20", // React refresh linting
  "globals": "^15.15.0",                   // Global variables
  "jsdom": "^20.0.3",                      // DOM implementation for testing
  "postcss": "^8.5.6",                     // CSS processing
  "tailwindcss": "^3.4.17",                // Tailwind CSS
  "typescript": "^5.8.3",                  // TypeScript
  "typescript-eslint": "^8.38.0",          // TypeScript ESLint
  "vite": "^5.4.19",                       // Build tool
  "vitest": "^3.2.4"                       // Testing framework
}
```

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

---

## 🏗 Building for Production

### Step 1: Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

### Step 2: Preview the Build

```bash
npm run preview
```

### Step 3: Deploy

Deploy the `dist` directory to any static host. Set `VITE_API_URL` at build time to your API base URL. Ensure backend CORS allows your frontend origin.

---

## 🐛 Troubleshooting

### Port Already in Use

If port 8080 is already in use, Vite will automatically try the next available port. You can also specify a port:

```bash
npm run dev -- --port 3000
```

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check TypeScript errors: `npx tsc --noEmit`

### API Connection Issues

- Verify backend server is running
- Check `VITE_API_URL` in `.env`
- Verify CORS configuration on backend
- Check browser console for CORS errors

---

## 📝 License

ISC License

---

## 👨‍💻 Developed by

**Rudransh Infotech Private Limited**

---

## 📞 Support

For support and inquiries, please contact Rudransh Infotech Private Limited.

---

## 🔄 Version

**Version:** 1.0.0

---

## 📚 Additional Resources

- [Backend Documentation](./backend/README.md)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

---

**Last Updated:** 2025

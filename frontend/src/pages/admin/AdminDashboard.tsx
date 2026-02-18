// Professional Admin Dashboard with Clean Architecture
// This file now uses a modular structure with separate components for better maintainability

import AdminDashboardNew from "./AdminDashboardNew";

/**
 * Main Admin Dashboard Component
 * 
 * This component has been refactored from a 15,500+ line monolithic file
 * into a clean, modular architecture with the following structure:
 * 
 * /components/layout/
 *   - AdminSidebar.tsx (Navigation sidebar)
 *   - AdminHeader.tsx (Top header with search and profile)
 * 
 * /sections/
 *   - dashboard/DashboardOverview.tsx (Main dashboard stats and charts)
 *   - users/UsersManagement.tsx (User management interface)
 *   - businesses/BusinessesManagement.tsx (Business management interface)
 * 
 * /components/
 *   - AdminContentRouter.tsx (Routes content based on active tab)
 *   - AddNewUser.tsx (Add new user form)
 *   - BusinessCategoriesManager.tsx (Business categories management)
 * 
 * Benefits of this architecture:
 * - Better maintainability and readability
 * - Easier testing and debugging
 * - Improved performance with lazy loading
 * - Cleaner separation of concerns
 * - Reusable components
 * - Professional folder structure
 */

export default function AdminDashboard() {
  return <AdminDashboardNew />;
}
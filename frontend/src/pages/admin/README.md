# Admin Dashboard - Professional File Structure

This directory contains a professionally organized admin dashboard with separate components for each section.

## 📁 Directory Structure

```
admin/
├── components/
│   ├── sidebar/
│   │   └── AdminSidebar.tsx          # Main sidebar navigation component
│   ├── topnav/
│   │   └── AdminTopNav.tsx           # Top navigation bar with search, notifications, profile
│   ├── shared/                       # Shared UI components (DataTable, StatsCard, etc.)
│   └── AdminPageRouter.tsx           # Routes to appropriate page based on activeTab
│
├── sections/
│   ├── dashboard/
│   │   └── DashboardPage.tsx        # Main dashboard with stats and charts
│   ├── businesses/
│   │   ├── AllBusinesses.tsx
│   │   ├── FoodMall.tsx
│   │   ├── Retail.tsx
│   │   ├── Creative.tsx
│   │   ├── PendingApproval.tsx
│   │   └── Archived.tsx
│   ├── users/
│   │   ├── AllUsers.tsx
│   │   ├── AddUser.tsx
│   │   ├── RolesPermissions.tsx
│   │   └── UserActivity.tsx
│   ├── subscriptions/
│   │   ├── AllSubscriptions.tsx
│   │   ├── ActivePlans.tsx
│   │   ├── ExpiredPlans.tsx
│   │   ├── PaymentHistory.tsx
│   │   └── Renewals.tsx
│   ├── plans/
│   │   ├── AllPlans.tsx
│   │   ├── CreatePlan.tsx
│   │   └── ManagePlans.tsx
│   ├── advertisements/
│   │   ├── AdsDashboard.tsx
│   │   ├── CreateAd.tsx
│   │   ├── ActiveCampaigns.tsx
│   │   ├── ScheduledAds.tsx
│   │   ├── Drafts.tsx
│   │   ├── Analytics.tsx
│   │   └── GlobalSettings.tsx
│   ├── analytics/
│   │   ├── OverviewAnalytics.tsx
│   │   ├── BusinessAnalytics.tsx
│   │   ├── RevenueAnalytics.tsx
│   │   ├── QRAnalytics.tsx
│   │   ├── CustomReports.tsx
│   │   └── ExportData.tsx
│   ├── website/
│   │   ├── GeneralSettings.tsx
│   │   ├── LogoBranding.tsx
│   │   ├── Typography.tsx
│   │   ├── ColorsTheme.tsx
│   │   ├── LayoutStructure.tsx
│   │   ├── ImagesMedia.tsx
│   │   ├── AnimationsEffects.tsx
│   │   ├── SectionsComponents.tsx
│   │   ├── SEOMetaTags.tsx
│   │   └── PreviewPublish.tsx
│   ├── system/
│   │   ├── GeneralSettings.tsx
│   │   ├── APIKeys.tsx
│   │   ├── Database.tsx
│   │   ├── ServerStatus.tsx
│   │   ├── Notifications.tsx
│   │   ├── Performance.tsx
│   │   └── AuditLog.tsx
│   └── support/
│       ├── HelpCenter.tsx
│       └── SystemInfo.tsx
│
├── hooks/
│   ├── useAdminData.ts               # Admin data fetching and global search
│   ├── useNotifications.ts           # Notifications management
│   └── useStats.ts                   # Dashboard stats and analytics
│
├── utils/
│   ├── constants.ts                  # Navigation categories, business types, etc.
│   ├── formatters.ts                 # Currency, date, number formatters
│   └── validators.ts                 # Form validation utilities
│
├── AdminDashboard.tsx                # OLD - Monolithic file (to be deprecated)
├── AdminDashboardNew.tsx              # NEW - Clean layout using new structure
└── AdminLogin.tsx                    # Admin login page
```

## 🚀 Migration Guide

### Step 1: Use the New Structure
The new structure is ready to use. The main entry point is `AdminDashboardNew.tsx`.

### Step 2: Extract Content from Old File
1. Open `AdminDashboard.tsx` (the old monolithic file)
2. Find the section you want to extract (e.g., dashboard content starting at line 2463)
3. Copy the JSX and logic for that section
4. Create a new component in the appropriate `sections/` folder
5. Update `AdminPageRouter.tsx` to import and use the new component

### Step 3: Extract Shared Logic
- Move data fetching logic to `hooks/`
- Move utility functions to `utils/`
- Move reusable UI components to `components/shared/`

## 📝 Component Guidelines

### Page Components
Each page component should:
- Be self-contained with its own state management
- Accept props only for shared data (currentAdmin, etc.)
- Handle its own data fetching
- Export as a named export

Example:
```tsx
// sections/businesses/AllBusinesses.tsx
export const AllBusinesses = ({ currentAdmin }: { currentAdmin: any }) => {
  // Component logic
  return <div>...</div>;
};
```

### Shared Components
Place reusable components in `components/shared/`:
- `DataTable.tsx` - Reusable table component
- `StatsCard.tsx` - Stats display card
- `FilterBar.tsx` - Filtering UI
- `Pagination.tsx` - Pagination controls

### Hooks
Custom hooks should:
- Start with `use` prefix
- Return an object with state and functions
- Handle loading and error states

Example:
```tsx
// hooks/useBusinesses.ts
export const useBusinesses = (filters: any) => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  // ... logic
  return { businesses, loading, refetch };
};
```

## 🔄 Current Status

✅ **Completed:**
- Folder structure created
- Sidebar component extracted
- TopNav component extracted
- Page router created
- Constants file created
- Admin data hooks created
- New AdminDashboard layout created

⏳ **In Progress:**
- Extracting individual page components from AdminDashboard.tsx
- Creating shared components
- Migrating business logic to hooks

## 📌 Next Steps

1. Extract Dashboard page content
2. Extract Businesses section pages
3. Extract Users section pages
4. Extract Subscriptions section pages
5. Extract Plans section pages
6. Extract Advertisement Manager pages
7. Extract remaining sections
8. Create shared components (DataTable, StatsCard, etc.)
9. Update route in App.tsx to use AdminDashboardNew
10. Remove old AdminDashboard.tsx file

## 🎯 Benefits

- **Maintainability**: Each section is in its own file
- **Scalability**: Easy to add new sections
- **Reusability**: Shared components and hooks
- **Performance**: Code splitting opportunities
- **Developer Experience**: Easier to navigate and understand

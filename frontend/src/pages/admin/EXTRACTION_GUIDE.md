# Admin Dashboard Extraction Guide

This guide explains how to extract remaining sections from `AdminDashboard.tsx` into separate page components.

## Structure

All sections should be placed in `sections/` directory:
```
sections/
├── dashboard/
│   └── DashboardPage.tsx ✅ (Completed)
├── businesses/
│   ├── AllBusinesses.tsx
│   ├── FoodMall.tsx
│   ├── Retail.tsx
│   ├── Creative.tsx
│   ├── PendingApproval.tsx
│   └── Archived.tsx
├── users/
│   ├── AllUsers.tsx
│   ├── AddUser.tsx
│   ├── RolesPermissions.tsx
│   └── UserActivity.tsx
├── subscriptions/
│   ├── AllSubscriptions.tsx
│   ├── ActivePlans.tsx
│   ├── ExpiredPlans.tsx
│   ├── PaymentHistory.tsx
│   └── Renewals.tsx
├── plans/
│   ├── AllPlans.tsx
│   ├── CreatePlan.tsx
│   └── ManagePlans.tsx
├── advertisements/
│   ├── AdsDashboard.tsx
│   ├── CreateAd.tsx
│   ├── ActiveCampaigns.tsx
│   ├── PausedCampaigns.tsx
│   ├── ScheduledAds.tsx
│   ├── Drafts.tsx
│   ├── Analytics.tsx
│   └── GlobalSettings.tsx
├── analytics/
│   ├── OverviewAnalytics.tsx
│   ├── BusinessAnalytics.tsx
│   ├── RevenueAnalytics.tsx
│   ├── QRAnalytics.tsx
│   ├── CustomReports.tsx
│   └── ExportData.tsx
├── website/
│   ├── GeneralSettings.tsx
│   ├── LogoBranding.tsx
│   ├── Typography.tsx
│   ├── ColorsTheme.tsx
│   ├── LayoutStructure.tsx
│   ├── ImagesMedia.tsx
│   ├── AnimationsEffects.tsx
│   ├── SectionsComponents.tsx
│   ├── SEOMetaTags.tsx
│   └── PreviewPublish.tsx
├── system/
│   ├── GeneralSettings.tsx
│   ├── APIKeys.tsx
│   ├── Database.tsx
│   ├── ServerStatus.tsx
│   ├── Notifications.tsx
│   ├── Performance.tsx
│   └── AuditLog.tsx
└── support/
    ├── SupportTickets.tsx
    ├── FAQManagement.tsx
    ├── KnowledgeBase.tsx
    ├── SupportAnalytics.tsx
    └── SystemInfo.tsx
```

## Pattern for Extraction

Each section component should:

1. **Import the hook:**
```typescript
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
```

2. **Use the hook to get state and functions:**
```typescript
export const SectionName = () => {
  const {
    // Extract only what you need from the hook
    stateVariable,
    setStateVariable,
    fetchFunction,
    formatCurrency,
    // ... etc
  } = useAdminDashboard();

  // Add useEffect for data fetching if needed
  useEffect(() => {
    fetchFunction();
  }, [fetchFunction]);

  // Return JSX extracted from AdminDashboard.tsx
  return (
    <div className="space-y-6">
      {/* Section content */}
    </div>
  );
};
```

3. **Find the JSX in AdminDashboard.tsx:**
   - Search for `activeTab === "section-id"`
   - Copy the entire JSX block for that section
   - Replace state variables with hook values
   - Replace functions with hook functions

4. **Update AdminPageRouter.tsx:**
   - Import the new section component
   - Add case in switch statement

## Key Points

- **No logic changes**: Only move code, don't modify functionality
- **Use hook values**: All state comes from `useAdminDashboard()`
- **Keep imports**: Copy necessary imports to each section file
- **Maintain structure**: Keep the same JSX structure and styling
- **Handle loading states**: Use loading states from the hook
- **Preserve dialogs**: Move dialog components to section files if they're section-specific

## Example: Extracting a Section

### Step 1: Find the section in AdminDashboard.tsx
```typescript
{activeTab === "restaurants" && (
  <div className="space-y-6">
    {/* ... section content ... */}
  </div>
)}
```

### Step 2: Create the section file
```typescript
// sections/businesses/AllBusinesses.tsx
import { useEffect } from "react";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";

export const AllBusinesses = () => {
  const {
    restaurants,
    restaurantsLoading,
    restaurantFilters,
    setRestaurantFilters,
    fetchRestaurants,
    // ... other needed values
  } = useAdminDashboard();

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return (
    <div className="space-y-6">
      {/* Paste the JSX from AdminDashboard.tsx here */}
    </div>
  );
};
```

### Step 3: Update AdminPageRouter.tsx
```typescript
import { AllBusinesses } from "../sections/businesses/AllBusinesses";

// In switch statement:
case "restaurants":
  return <AllBusinesses />;
```

## Remaining Work

1. Extract all section components following the pattern above
2. Update `AdminPageRouter.tsx` to import and use all sections
3. Update `AdminDashboard.tsx` to:
   - Use `useAdminDashboard()` hook
   - Remove all state management (moved to hook)
   - Remove all fetch functions (moved to hook)
   - Keep only the layout (sidebar, header, main content wrapper)
   - Use `AdminPageRouter` to render sections

## Notes

- The hook (`useAdminDashboard`) contains ALL state and functions
- Each section component is a "view" that uses the hook
- The main `AdminDashboard` becomes a thin wrapper
- All logic remains unchanged, just reorganized

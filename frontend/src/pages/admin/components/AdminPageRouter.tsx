import { DashboardPage } from "../sections/dashboard/DashboardPage";
import { PagePlaceholder } from "./PagePlaceholder";


// Import all section pages (will be created as they are extracted)
// import { AllBusinesses } from "../sections/businesses/AllBusinesses";
// import { FoodMall } from "../sections/businesses/FoodMall";
// ... etc

interface AdminPageRouterProps {
  activeTab: string;
}

export const AdminPageRouter = ({ activeTab }: AdminPageRouterProps) => {
  // Route to appropriate page component based on activeTab
  switch (activeTab) {
    case "dashboard":
      return <DashboardPage />;
    
    // Businesses
    case "restaurants":
      return <PagePlaceholder title="All Businesses" description="Manage all registered businesses, their verification status, and subscriptions" />;
    case "businesses-categories":
      return <PagePlaceholder title="Business Categories" description="Manage businesses by categories with professional filtering" />;
    case "businesses-pending":
      return <PagePlaceholder title="Pending Approval" description="Review and approve pending business registrations" />;
    case "businesses-archived":
      return <PagePlaceholder title="Archived Businesses" description="View archived and inactive business accounts" />;
    
    // Users
    case "users":
      return <PagePlaceholder title="All Users" description="Manage system users, roles, and permissions" />;
    case "users-add":
      return <PagePlaceholder title="Add New User" description="Create new admin or user accounts" />;
    case "users-roles":
      return <PagePlaceholder title="Roles & Permissions" description="Configure user roles and access permissions" />;
    case "users-activity":
      return <PagePlaceholder title="User Activity" description="Monitor user activity logs and logins" />;
    
    // Subscriptions
    case "subscriptions":
      return <PagePlaceholder title="All Subscriptions" description="View and manage all active subscriptions" />;
    case "subscriptions-active":
      return <PagePlaceholder title="Active Plans" description="Filter and view currently active subscription plans" />;
    case "subscriptions-expired":
      return <PagePlaceholder title="Expired Plans" description="View expired and inactive subscription plans" />;
    case "subscriptions-payments":
      return <PagePlaceholder title="Payment History" description="View all payment transactions and history" />;
    case "subscriptions-renewals":
      return <PagePlaceholder title="Renewals" description="Manage subscription renewals and upcoming dates" />;
    
    // Plans
    case "plans":
      return <PagePlaceholder title="All Plans" description="View and manage subscription plans across all business types" />;
    case "plans-create":
      return <PagePlaceholder title="Create Plan" description="Create new subscription plans for businesses" />;
    case "plans-manage":
      return <PagePlaceholder title="Manage Plans" description="Edit, update, and manage existing plans" />;
    
    // Advertisements
    case "ads-dashboard":
      return <PagePlaceholder title="Ads Dashboard" description="Overview of all advertisements and campaigns" />;
    case "ads-create":
      return <PagePlaceholder title="Create Advertisement" description="Create new advertisement campaigns" />;
    case "ads-active":
      return <PagePlaceholder title="Active Campaigns" description="View all currently active advertisement campaigns" />;
    case "ads-scheduled":
      return <PagePlaceholder title="Scheduled Ads" description="View upcoming scheduled advertisements" />;
    case "ads-drafts":
      return <PagePlaceholder title="Drafts" description="View draft advertisements not yet published" />;
    case "ads-analytics":
      return <PagePlaceholder title="Analytics & Performance" description="View advertisement performance metrics and analytics" />;
    case "ads-settings":
      return <PagePlaceholder title="Global Settings" description="Configure global advertisement settings" />;
    
    // Analytics
    case "analytics":
      return <PagePlaceholder title="Overview Analytics" description="Platform-wide analytics and statistics" />;
    case "analytics-businesses":
      return <PagePlaceholder title="Business Analytics" description="Detailed analytics for each business" />;
    case "analytics-revenue":
      return <PagePlaceholder title="Revenue Analytics" description="Revenue trends and financial analytics" />;
    case "analytics-qr":
      return <PagePlaceholder title="QR Scan Analytics" description="QR code scan statistics and patterns" />;
    case "reports":
      return <PagePlaceholder title="Custom Reports" description="Generate custom reports and insights" />;
    case "reports-export":
      return <PagePlaceholder title="Export Data" description="Export platform data for analysis" />;
    
    // Website
    case "website-general":
      return <PagePlaceholder title="General Settings" description="Configure general website settings" />;
    case "website-logo":
      return <PagePlaceholder title="Logo & Branding" description="Manage site logo and branding" />;
    case "website-typography":
      return <PagePlaceholder title="Typography" description="Configure typography and fonts" />;
    case "website-colors":
      return <PagePlaceholder title="Colors & Theme" description="Configure color scheme and theme" />;
    case "website-layout":
      return <PagePlaceholder title="Layout & Structure" description="Configure layout and structure settings" />;
    case "website-media":
      return <PagePlaceholder title="Images & Media" description="Manage images and media files" />;
    case "website-animations":
      return <PagePlaceholder title="Animations & Effects" description="Configure animations and effects" />;
    case "website-sections":
      return <PagePlaceholder title="Sections & Components" description="Manage sections and components" />;
    case "website-seo":
      return <PagePlaceholder title="SEO & Meta Tags" description="Configure SEO and meta tags" />;
    case "website-preview":
      return <PagePlaceholder title="Preview & Publish" description="Preview and publish changes" />;
    
    // System
    case "settings":
      return <PagePlaceholder title="General Settings" description="Configure general system settings" />;
    case "settings-api":
      return <PagePlaceholder title="API Keys" description="Manage API keys and integrations" />;
    case "settings-database":
      return <PagePlaceholder title="Database" description="Database management and statistics" />;
    case "settings-server":
      return <PagePlaceholder title="Server Status" description="Monitor server status and performance" />;
    case "settings-notifications":
      return <PagePlaceholder title="Notifications" description="Configure notification settings" />;
    case "settings-performance":
      return <PagePlaceholder title="Performance" description="Monitor system performance" />;
    case "settings-audit":
      return <PagePlaceholder title="Audit Log" description="View system audit logs" />;
    
    // Support
    case "support-help":
      return <PagePlaceholder title="Help Center" description="Help center and FAQs" />;
    case "support-info":
      return <PagePlaceholder title="System Info" description="System information and details" />;
    
    // Notifications
    case "notifications":
      return <PagePlaceholder title="All Notifications" description="View and manage notifications" />;
    
    // Admin Profile
    case "admin-profile":
      return <PagePlaceholder title="Admin Profile" description="View and edit admin profile" />;
    
    default:
      return <PagePlaceholder title="Page Not Found" description={`The page "${activeTab}" was not found`} />;
  }
};

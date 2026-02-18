import { Card, CardContent } from "@/components/ui/card";
import { Loader2, LayoutDashboard } from "lucide-react";
import { Suspense, lazy } from "react";

// Import dashboard directly (not lazy) to avoid loading issues
import DashboardPage from "../sections/dashboard/DashboardPage";


// Lazy load other components for better performance
const UsersManagement = lazy(() => import("../sections/users/UsersManagement"));
const RolesPermissions = lazy(() => import("../sections/users/RolesPermissions"));
const UserActivity = lazy(() => import("../sections/users/UserActivity"));
const BusinessesManagement = lazy(() => import("../sections/businesses/BusinessesManagement"));
const AddNewUser = lazy(() => import("./AddNewUser"));
const BusinessCategoriesManager = lazy(() => import("./BusinessCategoriesManager"));

// Subscriptions
const AllSubscriptions = lazy(() => import("../sections/subscriptions/AllSubscriptions"));
const ActiveSubscriptions = lazy(() => import("../sections/subscriptions/ActiveSubscriptions"));
const ExpiredSubscriptions = lazy(() => import("../sections/subscriptions/ExpiredSubscriptions"));
const PaymentHistory = lazy(() => import("../sections/subscriptions/PaymentHistory"));
const Renewals = lazy(() => import("../sections/subscriptions/Renewals"));

// Plans
const AllPlans = lazy(() => import("../sections/plans/AllPlans"));
const CreatePlan = lazy(() => import("../sections/plans/CreatePlan"));
const ManagePlans = lazy(() => import("../sections/plans/ManagePlans"));

// Analytics
const OverviewAnalytics = lazy(() => import("../sections/analytics/OverviewAnalytics"));
const BusinessAnalytics = lazy(() => import("../sections/analytics/BusinessAnalytics"));
const RevenueAnalytics = lazy(() => import("../sections/analytics/RevenueAnalytics"));
const QRScanAnalytics = lazy(() => import("../sections/analytics/QRScanAnalytics"));

// Support
const HelpDesk = lazy(() => import("../sections/support/HelpDesk"));
const SupportTickets = lazy(() => import("../sections/support/SupportTickets"));
const KnowledgeBase = lazy(() => import("../sections/support/KnowledgeBase"));
const FAQs = lazy(() => import("../sections/support/FAQs"));
const SupportAnalytics = lazy(() => import("../sections/support/SupportAnalytics"));

// Legal Documents
const PrivacyPolicy = lazy(() => import("../sections/legal/PrivacyPolicy"));
const TermsConditions = lazy(() => import("../sections/legal/TermsConditions"));
const AllLegalDocuments = lazy(() => import("../sections/legal/AllLegalDocuments"));

// Advertisements
const AdsDashboard = lazy(() => import("../sections/advertisements/AdsDashboard"));
const CreateAd = lazy(() => import("../sections/advertisements/CreateAd"));
const ActiveAds = lazy(() => import("../sections/advertisements/ActiveAds"));
const PausedAds = lazy(() => import("../sections/advertisements/PausedAds"));
const ScheduledAds = lazy(() => import("../sections/advertisements/ScheduledAds"));
const DraftAds = lazy(() => import("../sections/advertisements/DraftAds"));
const AdsAnalytics = lazy(() => import("../sections/advertisements/AdsAnalytics"));
const AdsSettings = lazy(() => import("../sections/advertisements/AdsSettings"));

// Website customization components
const GeneralSettings = lazy(() => import("../customization/GeneralSettings"));
const LogoBranding = lazy(() => import("../customization/LogoBranding"));
const Typography = lazy(() => import("../customization/Typography"));
const ColorsTheme = lazy(() => import("../customization/ColorsTheme"));
const LayoutStructure = lazy(() => import("../customization/LayoutStructure"));
const ImagesMedia = lazy(() => import("../customization/ImagesMedia"));
const AnimationsEffects = lazy(() => import("../customization/AnimationsEffects"));
const SectionsComponents = lazy(() => import("../customization/SectionsComponents"));
const SEOMetaTags = lazy(() => import("../customization/SEOMetaTags"));
const PreviewPublish = lazy(() => import("../customization/PreviewPublish"));

// Profile
const MyProfile = lazy(() => import("../sections/profile/MyProfile"));

// Brochure / Leads
const BrochureDownloads = lazy(() => import("../sections/brochure/BrochureDownloads"));

// Emails (direct import - lazy was causing blank page)
import BulkEmails from "../sections/emails/BulkEmails";
import EmailHistory from "../sections/emails/EmailHistory";

// Blogs
const BlogsManagement = lazy(() => import("../sections/blogs/BlogsManagement"));

interface AdminContentRouterProps {
  activeTab: string;
  // Dashboard props
  dashboardStats?: any;
  dashboardChartData?: any[];
  dashboardRevenueData?: any[];
  dashboardLoading?: boolean;
  
  // Users props
  users?: any[];
  usersLoading?: boolean;
  userFilters?: any;
  usersPagination?: any;
  onUserFiltersChange?: (filters: any) => void;
  onUsersPaginationChange?: (pagination: any) => void;
  onUserAction?: (action: string, userId: string) => void;
  onUsersRefresh?: () => void;
  
  // Businesses props
  businesses?: any[];
  businessesLoading?: boolean;
  businessFilters?: any;
  businessesPagination?: any;
  onBusinessFiltersChange?: (filters: any) => void;
  onBusinessesPaginationChange?: (pagination: any) => void;
  onBusinessAction?: (action: string, businessId: string) => void;
  onBusinessesRefresh?: () => void;
  
  // Website customization props
  websiteSettings?: any;
  onWebsiteSettingsChange?: (settings: any) => void;
  
  // Generic handlers
  onRefresh?: () => void;
  onExport?: () => void;
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex items-center gap-2">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span>Loading...</span>
    </div>
  </div>
);

// Placeholder component for unimplemented sections
const PlaceholderSection = ({ title, description }: { title: string; description: string }) => (
  <Card>
    <CardContent className="flex items-center justify-center h-64">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </CardContent>
  </Card>
);

export default function AdminContentRouter(props: AdminContentRouterProps) {
  const { activeTab } = props;

  const renderContent = () => {
    switch (activeTab) {
      // Dashboard
      case "dashboard":
        return <DashboardPage />;

      // Users Management
      case "users":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <UsersManagement
              users={props.users || []}
              loading={props.usersLoading || false}
              filters={props.userFilters || {}}
              pagination={props.usersPagination || { page: 1, limit: 10, total: 0, totalPages: 0 }}
              onFiltersChange={props.onUserFiltersChange || (() => {})}
              onPaginationChange={props.onUsersPaginationChange || (() => {})}
              onUserAction={props.onUserAction || (() => {})}
              onRefresh={props.onUsersRefresh || (() => {})}
              activeTab={activeTab}
            />
          </Suspense>
        );
      case "users-roles":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <RolesPermissions />
          </Suspense>
        );
      case "users-activity":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <UserActivity />
          </Suspense>
        );

      case "users-add":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AddNewUser />
          </Suspense>
        );

      // Businesses Management
      case "restaurants":
      case "businesses-all":
      case "businesses-pending":
      case "businesses-archived":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <BusinessesManagement
              activeTab={activeTab}
            />
          </Suspense>
        );

      case "businesses-categories":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <BusinessCategoriesManager />
          </Suspense>
        );

      // Website Customization
      case "website-general":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <GeneralSettings />
          </Suspense>
        );

      case "website-logo":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <LogoBranding />
          </Suspense>
        );

      case "website-typography":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Typography />
          </Suspense>
        );

      case "website-colors":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ColorsTheme />
          </Suspense>
        );

      case "website-layout":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <LayoutStructure />
          </Suspense>
        );

      case "website-images":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ImagesMedia />
          </Suspense>
        );

      case "website-animations":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AnimationsEffects />
          </Suspense>
        );

      case "website-sections":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <SectionsComponents />
          </Suspense>
        );

      case "website-seo":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <SEOMetaTags />
          </Suspense>
        );

      case "website-preview":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PreviewPublish />
          </Suspense>
        );

      // Profile
      case "profile":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MyProfile />
          </Suspense>
        );

      // Subscriptions
      case "subscriptions":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AllSubscriptions />
          </Suspense>
        );
      case "subscriptions-active":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ActiveSubscriptions />
          </Suspense>
        );
      case "subscriptions-expired":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ExpiredSubscriptions />
          </Suspense>
        );
      case "subscriptions-payments":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PaymentHistory />
          </Suspense>
        );
      case "subscriptions-renewals":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Renewals />
          </Suspense>
        );

      // Plans
      case "plans":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AllPlans />
          </Suspense>
        );
      case "plans-create":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CreatePlan />
          </Suspense>
        );
      case "plans-manage":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ManagePlans />
          </Suspense>
        );

      // Advertisements
      case "ads-dashboard":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AdsDashboard />
          </Suspense>
        );
      case "ads-create":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CreateAd />
          </Suspense>
        );
      case "ads-active":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ActiveAds />
          </Suspense>
        );
      case "ads-paused":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PausedAds />
          </Suspense>
        );
      case "ads-scheduled":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ScheduledAds />
          </Suspense>
        );
      case "ads-drafts":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <DraftAds />
          </Suspense>
        );
      case "ads-analytics":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AdsAnalytics />
          </Suspense>
        );
      case "ads-settings":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AdsSettings />
          </Suspense>
        );

      // Analytics
      case "analytics":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <OverviewAnalytics />
          </Suspense>
        );
      case "analytics-businesses":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <BusinessAnalytics />
          </Suspense>
        );
      case "analytics-revenue":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <RevenueAnalytics />
          </Suspense>
        );
      case "analytics-qr":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <QRScanAnalytics />
          </Suspense>
        );

      // Support
      case "support-help":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <HelpDesk />
          </Suspense>
        );
      case "support-tickets":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <SupportTickets />
          </Suspense>
        );
      case "support-knowledge":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <KnowledgeBase />
          </Suspense>
        );
      case "support-faqs":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <FAQs />
          </Suspense>
        );
      case "support-analytics":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <SupportAnalytics />
          </Suspense>
        );

      // Legal Documents
      case "legal-privacy":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PrivacyPolicy />
          </Suspense>
        );
      case "legal-terms":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <TermsConditions />
          </Suspense>
        );
      case "legal-all":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AllLegalDocuments />
          </Suspense>
        );

      case "brochure-downloads":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <BrochureDownloads />
          </Suspense>
        );

      case "emails-bulk":
        return <BulkEmails />;
      case "emails-history":
        return <EmailHistory />;

      case "blogs":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <BlogsManagement />
          </Suspense>
        );

      case "coming-soon-notifications":
      case "coming-soon-campaigns":
      case "coming-soon-reviews":
      case "coming-soon-reports":
      case "coming-soon-system":
        return (
          <PlaceholderSection
            title="Coming Soon"
            description="This feature is under development and will be available in a future update."
          />
        );

      default:
        return (
          <PlaceholderSection
            title="Page Not Found"
            description={`The section "${activeTab}" is not implemented yet.`}
          />
        );
    }
  };

  return (
    <main className="p-6">
      {renderContent()}
    </main>
  );
}
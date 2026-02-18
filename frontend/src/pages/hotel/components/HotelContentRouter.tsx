import { Suspense, lazy } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Lazy load components for better performance
const Overview = lazy(() => import("../sections/Overview"));
const QRCode = lazy(() => import("../sections/QRCode"));
const Analytics = lazy(() => import("../sections/Analytics"));
const SubscriptionSection = lazy(() => import("../sections/Subscription"));
const Promotions = lazy(() => import("../sections/Promotions"));
const Payments = lazy(() => import("../sections/Payments"));
const Reports = lazy(() => import("../sections/Reports"));
const MediaLibrary = lazy(() => import("../sections/MediaLibrary"));
const Integrations = lazy(() => import("../sections/Integrations"));
const Support = lazy(() => import("../sections/Support"));
const Advertisements = lazy(() => import("../sections/Advertisements"));
const Notifications = lazy(() => import("../sections/Notifications"));
const MenuManagement = lazy(() => import("../sections/menu/MenuManagement"));
const Settings = lazy(() => import("../Settings"));
const Profile = lazy(() => import("../Profile"));

interface HotelContentRouterProps {
  activeTab: string;
  // Common props that might be needed by multiple components
  restaurant?: any;
  user?: any;
  menuItems?: any[];
  categories?: any[];
  analytics?: any;
  logo?: string;
  menuUrl?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onTabChange?: (tab: string) => void;
  onCategoriesChange?: () => void;
  onItemsChange?: () => void;
  onUpgrade?: () => void;
  onUpdate?: () => void;
  formatCurrency?: (amount: number) => string;
  // Add other props as needed for specific components
  [key: string]: any;
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

export default function HotelContentRouter(props: HotelContentRouterProps) {
  const { activeTab } = props;

  // Provide default values for required props
  const defaultProps = {
    ...props,
    restaurant: props.restaurant || {},
    analytics: props.analytics || {},
    menuItems: props.menuItems || [],
    categories: props.categories || [],
    logo: props.logo || '',
    menuUrl: props.menuUrl || '',
    onTabChange: props.onTabChange || (() => {}),
    onCategoriesChange: props.onCategoriesChange || (() => {}),
    onItemsChange: props.onItemsChange || (() => {}),
    onUpgrade: props.onUpgrade || (() => {}),
    onUpdate: props.onUpdate || (() => {}),
    onRefresh: props.onRefresh || (() => {}),
    formatCurrency: props.formatCurrency || ((amount: number) => `₹${amount.toFixed(2)}`),
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Overview {...defaultProps} />
          </Suspense>
        );

      case "menu":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MenuManagement {...defaultProps} />
          </Suspense>
        );

      case "qr":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <QRCode {...defaultProps} />
          </Suspense>
        );

      case "analytics":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Analytics {...defaultProps} />
          </Suspense>
        );

      case "promotions":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Promotions {...(defaultProps as any)} />
          </Suspense>
        );

      case "payments":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Payments {...(defaultProps as any)} />
          </Suspense>
        );

      case "reports":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Reports {...(defaultProps as any)} />
          </Suspense>
        );

      case "mediaLibrary":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MediaLibrary {...defaultProps} />
          </Suspense>
        );

      case "integrations":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Integrations {...(defaultProps as any)} />
          </Suspense>
        );

      case "support":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Support {...(defaultProps as any)} />
          </Suspense>
        );

      case "subscription":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <SubscriptionSection {...defaultProps} />
          </Suspense>
        );

      case "profile":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Profile {...defaultProps} />
          </Suspense>
        );

      case "settings":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Settings {...defaultProps} />
          </Suspense>
        );

      case "advertisements":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Advertisements {...defaultProps} />
          </Suspense>
        );

      case "notifications":
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <Notifications {...defaultProps} />
          </Suspense>
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
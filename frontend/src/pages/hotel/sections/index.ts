// Hotel Dashboard Sections - Professional Module Exports
// Each section is a self-contained component with its own logic

export { Overview } from './Overview';
export { QRCode } from './QRCode';
export { Analytics } from './Analytics';
export { SubscriptionSection } from './Subscription';
export { Promotions } from './Promotions';
export { Payments } from './Payments';
export { Reports } from './Reports';
export { MediaLibrary } from './MediaLibrary';
export { Integrations } from './Integrations';
export { Support } from './Support';
export { Advertisements } from './Advertisements';
export { Notifications } from './Notifications';

// New Professional Sections
export { default as Orders } from './Orders';
export { default as Customers } from './Customers';
export { default as Inventory } from './Inventory';
export { default as Reviews } from './Reviews';
export { default as Team } from './Team';
export { default as Marketing } from './Marketing';
export { default as Campaigns } from './Campaigns';
export { default as Transactions } from './Transactions';
export { default as Growth } from './Growth';
export { default as BusinessInformation } from './BusinessInformation';
export { default as PortfolioForm } from './PortfolioForm';
export { default as AgencyPortfolioForm } from './AgencyPortfolioForm';

// Menu Management Module
export { MenuManagement, Categories, Items, getBusinessConfig, BUSINESS_CONFIGS } from './menu';

// Type exports for sections
export interface SectionProps {
  restaurant?: any;
  menuItems?: any[];
  categories?: any[];
  analytics?: any;
  onTabChange?: (tab: string) => void;
  formatCurrency?: (amount: number) => string;
  onRefresh?: () => void;
}

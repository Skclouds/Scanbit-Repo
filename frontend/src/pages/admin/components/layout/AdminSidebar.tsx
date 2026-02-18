import { Link } from "react-router-dom";
import { 
  Building2, 
  CreditCard, 
  Settings, 
  Users, 
  BarChart3, 
  LogOut, 
  X,
  QrCode,
  Package,
  Archive,
  UserPlus,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  Receipt,
  Calendar,
  Plus,
  Edit,
  Megaphone,
  Target,
  Play,
  Pause,
  Filter as FilterIcon,
  Download as DownloadIcon,
  BookOpen,
  MessageSquare,
  Star,
  Send,
  Briefcase,
  ChevronDown,
  ChevronRight,
  FileText,
  Mail
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSiteSettings } from "@/context/SiteSettingsContext";

// Categorized navigation items with sub-items
const navCategories = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { icon: BarChart3, label: "Dashboard", id: "dashboard" },
    ],
  },
  {
    id: "businesses",
    label: "Businesses",
    items: [
      { icon: Building2, label: "All Businesses", id: "restaurants" },
      { icon: Building2, label: "Categories", id: "businesses-categories" },
      { icon: Package, label: "Pending Approval", id: "businesses-pending" },
      { icon: Archive, label: "Archived", id: "businesses-archived" },
    ],
  },
  {
    id: "users",
    label: "User Management",
    items: [
      { icon: Users, label: "All Users", id: "users" },
      { icon: UserPlus, label: "Add User", id: "users-add" },
      { icon: Shield, label: "Roles & Permissions", id: "users-roles" },
      { icon: Activity, label: "User Activity", id: "users-activity" },
    ],
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    items: [
      { icon: CreditCard, label: "All Subscriptions", id: "subscriptions" },
      { icon: TrendingUp, label: "Active Plans", id: "subscriptions-active" },
      { icon: TrendingDown, label: "Expired Plans", id: "subscriptions-expired" },
      { icon: Receipt, label: "Payment History", id: "subscriptions-payments" },
      { icon: Calendar, label: "Renewals", id: "subscriptions-renewals" },
    ],
  },
  {
    id: "plans",
    label: "Custom Plans",
    items: [
      { icon: Package, label: "All Plans", id: "plans" },
      { icon: Plus, label: "Create Plan", id: "plans-create" },
      { icon: Edit, label: "Manage Plans", id: "plans-manage" },
    ],
  },
  {
    id: "emails",
    label: "Emails",
    items: [
      { icon: Mail, label: "Bulk Emails", id: "emails-bulk" },
      { icon: Send, label: "Email History", id: "emails-history" },
    ],
  },
  {
    id: "advertisements",
    label: "Advertisement Manager",
    items: [
      { icon: BarChart3, label: "Dashboard", id: "ads-dashboard" },
      { icon: Plus, label: "Create Ad", id: "ads-create" },
      { icon: Play, label: "Active Ads", id: "ads-active" },
      { icon: Pause, label: "Paused Ads", id: "ads-paused" },
      { icon: Calendar, label: "Scheduled Ads", id: "ads-scheduled" },
      { icon: Archive, label: "Draft Ads", id: "ads-drafts" },
      { icon: BarChart3, label: "Analytics", id: "ads-analytics" },
      { icon: Settings, label: "Settings", id: "ads-settings" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics & Reports",
    items: [
      { icon: BarChart3, label: "Overview", id: "analytics" },
      { icon: Building2, label: "Business Analytics", id: "analytics-businesses" },
      { icon: CreditCard, label: "Revenue Analytics", id: "analytics-revenue" },
      { icon: QrCode, label: "QR Scan Analytics", id: "analytics-qr" },
    ],
  },
  {
    id: "support",
    label: "Support Center",
    items: [
      { icon: MessageSquare, label: "Help Desk", id: "support-help" },
      { icon: Star, label: "Support Tickets", id: "support-tickets" },
      { icon: BookOpen, label: "Knowledge Base", id: "support-knowledge" },
      { icon: Send, label: "FAQs", id: "support-faqs" },
      { icon: BarChart3, label: "Support Analytics", id: "support-analytics" },
    ],
  },
  {
    id: "blogs",
    label: "Blogs",
    items: [
      { icon: BookOpen, label: "All Blogs", id: "blogs" },
    ],
  },
  {
    id: "legal",
    label: "Legal Documents",
    items: [
      { icon: Shield, label: "Privacy Policy", id: "legal-privacy" },
      { icon: FileText, label: "Terms & Conditions", id: "legal-terms" },
      { icon: Settings, label: "All Documents", id: "legal-all" },
    ],
  },
  {
    id: "website",
    label: "Website Customization",
    items: [
      { icon: Settings, label: "General Settings", id: "website-general" },
      { icon: Briefcase, label: "Logo & Branding", id: "website-logo" },
      { icon: Settings, label: "Typography", id: "website-typography" },
      { icon: Settings, label: "Colors & Theme", id: "website-colors" },
      { icon: Settings, label: "Layout & Structure", id: "website-layout" },
      { icon: Settings, label: "Images & Media", id: "website-images" },
      { icon: Settings, label: "Animations & Effects", id: "website-animations" },
      { icon: Settings, label: "Sections & Components", id: "website-sections" },
      { icon: Settings, label: "SEO & Meta Tags", id: "website-seo" },
      { icon: Settings, label: "Preview & Publish", id: "website-preview" },
    ],
  },
  {
    id: "brochure",
    label: "Leads & Brochure",
    items: [
      { icon: FileText, label: "Brochure Downloads", id: "brochure-downloads" },
    ],
  },
  {
    id: "more",
    label: "More (Coming Soon)",
    items: [
      { icon: Megaphone, label: "Bulk Notifications", id: "coming-soon-notifications" },
      { icon: Target, label: "Campaigns", id: "coming-soon-campaigns" },
      { icon: Star, label: "Reviews & Ratings", id: "coming-soon-reviews" },
      { icon: BarChart3, label: "Advanced Reports", id: "coming-soon-reports" },
      { icon: Settings, label: "System Settings", id: "coming-soon-system" },
    ],
  },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  onRequestLogout: () => void;
}

export default function AdminSidebar({ 
  activeTab, 
  onTabChange, 
  sidebarOpen, 
  setSidebarOpen, 
  searchQuery,
  onRequestLogout 
}: AdminSidebarProps) {
  const { settings } = useSiteSettings();

  // Filter navigation based on search
  const filteredNavCategories = navCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative flex items-center justify-center py-2 px-2 border-b border-gray-200">
            <Link to="/" className="flex flex-col items-center gap-0.5 hover:opacity-80 transition-opacity w-full">
              <img
                src={settings?.branding?.logoUrl || "/logo.png"}
                alt="Logo"
                className="w-32 h-32 object-contain"
              />
              <p className="text-xs font-medium text-gray-700">Admin Panel</p>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors absolute top-1 right-1"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-6 pb-4 space-y-1">
            {filteredNavCategories.map((category) => {
              const hasActiveItem = category.items.some(item => activeTab === item.id);
              
              return (
                <Collapsible key={category.id} defaultOpen={hasActiveItem}>
                  <CollapsibleTrigger className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700 transition-colors mb-1 ${
                    hasActiveItem ? "text-gray-900" : ""
                  }`}>
                    <span>{category.label}</span>
                    <ChevronDown className="w-4 h-4 transition-transform ui-open:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleTabClick(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeTab === item.id
                              ? "bg-orange-100 text-orange-900 font-medium"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onRequestLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
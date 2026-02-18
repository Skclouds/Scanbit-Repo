import { MdQrCode, MdCheckCircle, MdStar, MdEvent, MdRestaurantMenu, MdDashboard, MdShoppingBag, MdBrush, MdWork, MdDevices } from "react-icons/md";
import { FiTrendingUp, FiUser, FiPlus, FiInfo, FiStar } from "react-icons/fi";
import { FaStar, FaFire } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { getBusinessConfig } from "./menu";

interface OverviewProps {
  restaurant: any;
  menuItems: any[];
  categories: any[];
  analytics: any;
  onTabChange: (tab: string) => void;
  formatCurrency: (amount: number) => string;
}

export const Overview = ({
  restaurant,
  menuItems,
  categories,
  analytics,
  onTabChange,
  formatCurrency
}: OverviewProps) => {
  // Get business-specific configuration
  const config = getBusinessConfig(restaurant?.businessCategory, restaurant?.businessType);
  
  // Icon component mapping
  const IconMap: Record<string, any> = {
    MdRestaurantMenu,
    MdShoppingBag,
    MdBrush,
    MdWork,
    MdDevices
  };
  
  const BusinessIcon = IconMap[config.icon] || MdRestaurantMenu;
  const hasItems = menuItems.length > 0;
  const hasCategories = categories.length > 0;
  const isAgencyStudio = config.pageTitle === 'Agency Portfolio';

  return (
    <div className="space-y-6 sm:space-y-8 pb-8 sm:pb-12 min-w-0">
      {/* Professional Welcome Section */}
      <div className="bg-white rounded-xl sm:rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden group">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5 sm:p-8 md:p-10 text-white relative">
          <div className="relative z-10">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3 tracking-tight break-words">
              Welcome back, {restaurant?.name || 'User'}! 👋
            </h2>
            <p className="text-orange-50 text-sm sm:text-lg font-medium opacity-90 max-w-xl">
              {isAgencyStudio
                ? "Here’s your portfolio and showcase performance at a glance. Manage projects, gallery, and services."
                : `Here's a professional overview of your ${restaurant?.businessType?.toLowerCase() || 'business'} performance and digital presence for today.`}
            </p>
          </div>
          <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 transform transition-transform group-hover:scale-110 duration-500">
            <MdDashboard className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      {/* Subscription Status Card - Professionalized */}
      <div className="p-4 sm:p-6 rounded-xl sm:rounded-3xl bg-white border border-orange-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0 border border-orange-100">
            <MdEvent className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="font-black text-slate-900 text-base sm:text-lg uppercase tracking-tight truncate">
                {restaurant?.subscription?.plan || 'Standard'} Plan
              </p>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                restaurant?.subscription?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {restaurant?.subscription?.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-slate-500 font-medium text-xs sm:text-sm line-clamp-2 sm:line-clamp-none">
              {restaurant?.subscription?.endDate 
                ? `Renewal: ${new Date(restaurant.subscription.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` 
                : 'Your business profile is live and active'}
              <span className="mx-1.5 text-slate-300">•</span>
              <span className="text-orange-600 font-bold">{restaurant?.subscription?.daysRemaining ?? 0} days left</span>
            </p>
          </div>
        </div>
        <Button 
          onClick={() => onTabChange("subscription")} 
          className="w-full md:w-auto h-11 sm:h-12 px-6 sm:px-8 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl shadow-lg shadow-orange-600/20 transition-all active:scale-95 touch-manipulation"
        >
          Upgrade Plan
        </Button>
      </div>

      {/* Stats Grid - Professional Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Items Count */}
        <div className="bg-white rounded-xl sm:rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 sm:p-8 group min-w-0">
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-orange-50 group-hover:bg-orange-100 transition-colors flex items-center justify-center border border-orange-100">
              <BusinessIcon className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" />
            </div>
            <span className={`text-[10px] font-black px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest shrink-0 ${
              hasItems ? 'text-orange-700 bg-orange-100' : 'text-slate-400 bg-slate-100'
            }`}>
              {hasItems ? 'Live' : 'Initial'}
            </span>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 mb-1 tracking-tighter">{menuItems.length}</p>
          <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">{config.itemLabelPlural}</p>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-50">
            <p className="text-xs font-medium text-slate-400 line-clamp-1">
              {hasItems ? `Account Limit: ${restaurant?.menuItemsLimit || 'Unlimited'}` : 'Start building your catalog'}
            </p>
          </div>
        </div>

        {/* Total QR Scans */}
        <div className="bg-white rounded-xl sm:rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 sm:p-8 group min-w-0">
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-50 group-hover:bg-blue-100 transition-colors flex items-center justify-center border border-blue-100">
              <MdQrCode className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            </div>
            {(analytics?.stats?.totalScans > 0 || restaurant?.qrScans > 0) && (
              <div className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-100 px-2 py-1 rounded-full uppercase tracking-widest">
                <FiTrendingUp className="w-3 h-3" />
                Active
              </div>
            )}
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 mb-1 tracking-tighter">
            {analytics?.stats?.totalScans?.toLocaleString() || restaurant?.qrScans?.toLocaleString() || '0'}
          </p>
          <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Total Interactions</p>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-50">
            <p className="text-xs font-medium text-slate-400 italic">Total digital engagement</p>
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="bg-white rounded-xl sm:rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 sm:p-8 group min-w-0">
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-50 group-hover:bg-purple-100 transition-colors flex items-center justify-center border border-purple-100">
              <FiTrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
            </div>
            <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest shrink-0">
              30 Days
            </span>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 mb-1 tracking-tighter">
            {analytics?.stats?.thisMonthScans?.toLocaleString() || restaurant?.qrScansThisMonth?.toLocaleString() || '0'}
          </p>
          <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Monthly Traffic</p>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-50">
            <p className="text-xs font-medium text-slate-400">Activity in {new Date().toLocaleString('default', { month: 'long' })}</p>
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-xl sm:rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 sm:p-8 group min-w-0">
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-yellow-50 group-hover:bg-yellow-100 transition-colors flex items-center justify-center border border-yellow-100">
              <FiStar className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-600" />
            </div>
            <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest shrink-0">
              Reputation
            </span>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 mb-1 tracking-tighter">
            {restaurant?.rating || '0.0'}
          </p>
          <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Average Rating</p>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-50">
            <p className="text-xs font-medium text-slate-400">
              From {restaurant?.totalReviews || 0} customer reviews
            </p>
          </div>
        </div>
      </div>

      {/* Professional Quick Stats Row */}
      {hasItems && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 min-w-0">
          <div className="bg-slate-50/50 rounded-xl sm:rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all hover:bg-white hover:shadow-sm min-w-0">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center border border-green-200 shrink-0">
              <MdCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Items</p>
              <p className="text-lg sm:text-xl font-black text-slate-900">{menuItems.filter(i => i.isAvailable !== false).length}</p>
            </div>
          </div>
          <div className="bg-slate-50/50 rounded-xl sm:rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all hover:bg-white hover:shadow-sm min-w-0">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center border border-yellow-200 shrink-0">
              <FaStar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Featured Items</p>
              <p className="text-lg sm:text-xl font-black text-slate-900">{menuItems.filter(i => i.isPopular).length}</p>
            </div>
          </div>
          <div className="bg-slate-50/50 rounded-xl sm:rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all hover:bg-white hover:shadow-sm min-w-0">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center border border-red-200 shrink-0">
              <FaFire className="w-6 h-6 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">High Demand</p>
              <p className="text-lg sm:text-xl font-black text-slate-900">{menuItems.filter(i => i.isSpicy).length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Professional Getting Started */}
      {!hasItems && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-[2rem] p-5 sm:p-8 md:p-10 text-white shadow-2xl relative overflow-hidden min-w-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-5 sm:gap-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-[2rem] bg-orange-600 flex items-center justify-center flex-shrink-0 shadow-xl shadow-orange-600/20">
              <FiPlus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="flex-1 text-center lg:text-left min-w-0">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-2 sm:mb-3 tracking-tight">
                {isAgencyStudio ? "Showcase Your Work" : "Scale Your Digital Presence"}
              </h3>
              <p className="text-slate-300 text-sm sm:text-lg font-medium max-w-2xl">
                {isAgencyStudio
                  ? "Set up your portfolio: add services, featured projects, and gallery. Then share your Portfolio link with clients."
                  : `You haven't initialized your ${config.itemLabel.toLowerCase()} yet. Add your first ${config.itemLabelPlural.toLowerCase()} to build your digital presence.`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Button onClick={() => onTabChange("menu")} className="h-12 sm:h-14 px-6 sm:px-8 bg-white text-slate-900 hover:bg-orange-50 font-black rounded-xl sm:rounded-2xl shadow-xl transition-all active:scale-95 touch-manipulation w-full sm:w-auto">
                {isAgencyStudio ? "Set Up Portfolio" : `Add ${config.itemLabel}`}
              </Button>
              <Button variant="outline" onClick={() => onTabChange("qr")} className="h-12 sm:h-14 px-6 sm:px-8 border-white/20 text-white hover:bg-white/10 font-black rounded-xl sm:rounded-2xl backdrop-blur-md touch-manipulation w-full sm:w-auto">
                Configure QR Code
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Quick Actions */}
      <div className="min-w-0">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-4 sm:mb-6 uppercase tracking-tight">{isAgencyStudio ? "Quick Actions" : "Operational Shortcuts"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { id: 'menu', label: isAgencyStudio ? "Portfolio & Services" : `Manage ${config.itemLabelPlural}`, desc: isAgencyStudio ? "Services, projects & gallery" : `Update your ${config.itemLabel.toLowerCase()} assets`, icon: BusinessIcon, color: 'orange' },
            { id: 'qr', label: 'Digital QR Engine', desc: 'Manage your smart QR codes', icon: MdQrCode, color: 'blue' },
            { id: 'analytics', label: 'Insight Analytics', desc: 'Review business intelligence', icon: FiTrendingUp, color: 'purple' },
            { id: 'profile', label: 'Brand Identity', desc: 'Refine your public profile', icon: FiUser, color: 'green' }
          ].map((action) => (
            <button
              key={action.id}
              onClick={() => onTabChange(action.id)}
              className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-3xl border border-slate-200 hover:border-orange-500 hover:shadow-xl hover:-translate-y-1 transition-all text-left group flex flex-col h-full min-w-0 touch-manipulation active:scale-[0.99]"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-${action.color}-50 group-hover:bg-${action.color}-100 transition-all flex items-center justify-center mb-3 sm:mb-5 border border-${action.color}-100`}>
                <action.icon className={`w-6 h-6 sm:w-7 sm:h-7 text-${action.color}-600`} />
              </div>
              <h4 className="font-black text-slate-900 text-base sm:text-lg mb-1 leading-tight group-hover:text-orange-600 transition-colors line-clamp-2">{action.label}</h4>
              <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed line-clamp-2">{action.desc}</p>
              <div className="mt-auto pt-6 flex justify-end">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                  <FiPlus className="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Items Showcase */}
      {menuItems.filter(i => i.isPopular).length > 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 group">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center border border-yellow-100">
                <FaStar className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">High Performing {config.itemLabelPlural}</h3>
                <p className="text-slate-500 font-medium text-sm">Your most engaged digital assets</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onTabChange("menu")} className="font-black text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-4">
              Explore All →
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.filter(i => i.isPopular).slice(0, 3).map((item, index) => (
              <div key={item.id || item._id || `popular-${index}`} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg hover:border-orange-200 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-black text-slate-900 text-lg tracking-tight leading-tight">{item.name}</p>
                  <span className="text-xs font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md">TOP</span>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-1 line-clamp-2 leading-relaxed h-10">{item.description}</p>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <p className="text-xl font-black text-orange-600">{formatCurrency(item.price)}</p>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-white shadow-sm border border-slate-100 text-slate-400">
                    <FiInfo className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;

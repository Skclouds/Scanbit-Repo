import { useState } from "react";
import { MdRestaurantMenu, MdShoppingBag, MdBrush, MdWork, MdCategory, MdList, MdCheckCircle, MdDevices } from "react-icons/md";
import { FiGrid, FiList, FiInfo } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Categories } from "./Categories";
import { Items } from "./Items";
import { getBusinessConfig, getBusinessType } from "./config";
import { cn } from "@/lib/utils";
import { HiSparkles } from "react-icons/hi";

interface MenuManagementProps {
  restaurant: any;
  categories: any[];
  menuItems: any[];
  onCategoriesChange: (categories: any[]) => void;
  onItemsChange: (items: any[]) => void;
  formatCurrency: (amount: number) => string;
}

export const MenuManagement = ({
  restaurant,
  categories,
  menuItems,
  onCategoriesChange,
  onItemsChange,
  formatCurrency
}: MenuManagementProps) => {
  const config = getBusinessConfig(restaurant?.businessCategory, restaurant?.businessType);
  const businessType = getBusinessType(restaurant?.businessCategory, restaurant?.businessType);
  
  // For Food Mall businesses, default to 'categories', otherwise 'items'
  const isFoodMall = !businessType || businessType === 'foodmall' || 
    (restaurant?.businessCategory?.toLowerCase().includes('food') || 
     restaurant?.businessCategory?.toLowerCase().includes('mall') ||
     restaurant?.businessCategory?.toLowerCase().includes('restaurant') ||
     restaurant?.businessCategory?.toLowerCase().includes('cafe'));
  const isRetail = businessType === 'retail';
  const isCreative = businessType === 'creative';
  const isCategoriesFirst = isFoodMall || isRetail || isCreative;
  
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>(isCategoriesFirst ? 'categories' : 'items');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get icon based on business type
  const getBusinessIcon = () => {
    const cls = "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8";
    switch (businessType) {
      case 'retail': return <MdShoppingBag className={cls} />;
      case 'agency': return <MdBrush className={cls} />;
      case 'creative': return <MdBrush className={cls} />;
      case 'professional': return <MdWork className={cls} />;
      case 'wellness': return <MdDevices className={cls} />;
      default: return <MdRestaurantMenu className={cls} />;
    }
  };

  // Get gradient colors based on business type
  const getGradientColors = () => {
    switch (businessType) {
      case 'retail': return 'from-blue-500 to-blue-600';
      case 'agency': return 'from-indigo-500 to-indigo-600';
      case 'creative': return 'from-purple-500 to-purple-600';
      case 'professional': return 'from-slate-700 to-slate-800';
      case 'wellness': return 'from-teal-500 to-teal-600';
      default: return 'from-orange-500 to-orange-600';
    }
  };

  // Get business-specific tips
  const getBusinessTips = () => {
    switch (businessType) {
      case 'retail':
        return [];
      case 'agency':
        return [
          'Highlight the business impact and ROI of your marketing services.',
          'Use case studies to demonstrate your agency\'s strategic approach.',
          'Clearly define deliverables for each service package to manage expectations.',
        ];
      case 'creative':
        return [
          'Showcase project outcomes and client testimonials to build authority.',
          'Organize portfolio assets by industry or service type for targeted browsing.',
          'Use professional case studies to explain your creative process.',
        ];
      case 'professional':
        return [
          'Clearly articulate the value proposition and deliverables for each service.',
          'Structured pricing tiers help clients choose the right level of engagement.',
          'Display relevant certifications and professional credentials prominently.',
        ];
      case 'wellness':
        return [
          'Highlight the therapeutic benefits and expected outcomes of each treatment.',
          'Include information about practitioner expertise and facility environment.',
          'Specify duration and preparation required for specific sessions.',
        ];
      default:
        return [
          'Professional food photography is the primary driver for digital menu engagement.',
          'Clearly label dietary preferences (Vegetarian, Vegan, GF) and spice levels.',
          'Keep descriptions concise but descriptive of primary flavors and ingredients.',
        ];
    }
  };

  const tips = getBusinessTips();

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-8 sm:pb-12 min-w-0 overflow-x-hidden">
      {/* Professional Management Header — mobile-optimized */}
      <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 md:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 md:gap-10">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl md:rounded-[2rem] bg-gradient-to-br ${getGradientColors()} flex items-center justify-center text-white shadow-xl shadow-slate-900/10 flex-shrink-0`}>
              {getBusinessIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase truncate">{config.pageTitle}</h1>
                <Badge variant="outline" className="h-5 sm:h-6 px-2 sm:px-3 rounded-lg border-orange-200 bg-orange-50 text-orange-700 font-black text-[10px] uppercase tracking-widest shrink-0">
                  {restaurant?.businessCategory || 'Standard'}
                </Badge>
              </div>
              <p className="text-slate-500 font-medium text-xs sm:text-base max-w-md line-clamp-2">
                Master control for your {config.categoryLabelPlural.toLowerCase()} and digital {config.itemLabelPlural.toLowerCase()} infrastructure.
              </p>
            </div>
          </div>
          {/* Enhanced Stats — responsive grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 min-w-0">
            {[
              { label: config.categoryLabelPlural, value: categories.length, icon: MdCategory },
              { label: config.itemLabelPlural, value: menuItems.length, icon: MdList },
              { label: 'Available', value: menuItems.filter(i => i.isAvailable !== false).length, icon: MdCheckCircle }
            ].map((stat, i) => (
              <div key={stat.label} className="p-2 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center group hover:bg-white hover:shadow-md transition-all min-w-0">
                <p className="text-base sm:text-2xl font-black text-slate-900 leading-tight tracking-tighter">{stat.value}</p>
                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1 truncate w-full px-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Operational Tips — mobile padding - Hidden on mobile for Food Mall */}
      {tips.length > 0 && (
      <div className={cn(
        "bg-slate-900 rounded-2xl md:rounded-[2rem] p-4 sm:p-6 md:p-8 text-white shadow-2xl relative overflow-hidden group",
        isFoodMall && "hidden md:block"
      )}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-start gap-4 sm:gap-6 md:gap-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl md:rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10 backdrop-blur-md">
            <HiSparkles className="w-6 h-6 sm:w-7 sm:h-7 text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-base sm:text-lg mb-3 sm:mb-4 tracking-tight uppercase tracking-widest text-orange-400">Strategic Performance Tips</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {tips.map((tip, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Insight 0{index + 1}</span>
                  </div>
                  <p className="text-slate-300 font-medium leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Tab Navigation — touch-friendly on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 min-w-0">
        <div className="bg-slate-100/80 p-1.5 rounded-xl md:rounded-2xl inline-flex flex-wrap gap-1.5 sm:gap-1 border border-slate-200/50 w-full sm:w-auto">
          {/* For Food Mall and Retail: Categories first, then Items */}
          {isCategoriesFirst ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setActiveTab('categories')}
                className={cn(
                  "h-10 sm:h-11 px-4 sm:px-6 rounded-lg sm:rounded-xl gap-1.5 sm:gap-2 font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-all flex-1 sm:flex-none min-h-[44px] touch-manipulation",
                  activeTab === 'categories' ? "bg-white text-orange-600 shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                )}
              >
                <MdCategory className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{config.categoryLabelPlural}</span>
                <span className="ml-0.5 opacity-50 shrink-0">({categories.length})</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab('items')}
                className={cn(
                  "h-10 sm:h-11 px-4 sm:px-6 rounded-lg sm:rounded-xl gap-1.5 sm:gap-2 font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-all flex-1 sm:flex-none min-h-[44px] touch-manipulation",
                  activeTab === 'items' ? "bg-white text-orange-600 shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                )}
              >
                <FiGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{config.itemLabelPlural}</span>
                <span className="ml-0.5 opacity-50 shrink-0">({menuItems.length})</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => setActiveTab('items')}
                className={cn(
                  "h-10 sm:h-11 px-4 sm:px-6 rounded-lg sm:rounded-xl gap-1.5 sm:gap-2 font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-all flex-1 sm:flex-none min-h-[44px] touch-manipulation",
                  activeTab === 'items' ? "bg-white text-orange-600 shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                )}
              >
                <FiGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{config.itemLabelPlural}</span>
                <span className="ml-0.5 opacity-50 shrink-0">({menuItems.length})</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab('categories')}
                className={cn(
                  "h-10 sm:h-11 px-4 sm:px-6 rounded-lg sm:rounded-xl gap-1.5 sm:gap-2 font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-all flex-1 sm:flex-none min-h-[44px] touch-manipulation",
                  activeTab === 'categories' ? "bg-white text-orange-600 shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                )}
              >
                <MdCategory className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{config.categoryLabelPlural}</span>
                <span className="ml-0.5 opacity-50 shrink-0">({categories.length})</span>
              </Button>
            </>
          )}
        </div>

        {/* Selected Category Badge */}
        {selectedCategory && activeTab === 'items' && (
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-orange-50 rounded-xl sm:rounded-2xl border border-orange-100 min-w-0 shrink-0">
            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest shrink-0">Filter:</span>
            <Badge variant="outline" className="h-7 gap-2 border-orange-200 bg-white text-orange-700 font-bold rounded-lg min-w-0 max-w-full">
              <span className="text-sm shrink-0">{(categories || []).find(c => (c._id || c.id) === selectedCategory)?.emoji}</span>
              <span className="truncate">{(categories || []).find(c => (c._id || c.id) === selectedCategory)?.name}</span>
              <button 
                onClick={() => setSelectedCategory(null)}
                className="ml-1 hover:text-red-600 transition-colors shrink-0 touch-manipulation"
                aria-label="Clear filter"
              >
                ×
              </button>
            </Badge>
          </div>
        )}
      </div>

      {/* Content Container — mobile padding */}
      <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm p-4 sm:p-6 md:p-8 group min-w-0">
        {activeTab === 'categories' ? (
          <Categories
            categories={categories}
            restaurant={restaurant}
            selectedCategory={selectedCategory}
            onSelectCategory={(id) => {
              setSelectedCategory(id);
              if (id) setActiveTab('items');
            }}
            onCategoriesChange={onCategoriesChange}
            menuItems={menuItems}
          />
        ) : (
          <Items
            menuItems={menuItems}
            categories={categories}
            restaurant={restaurant}
            selectedCategory={selectedCategory}
            onItemsChange={onItemsChange}
            formatCurrency={formatCurrency}
          />
        )}
      </div>

      {/* Quick Category Filter for Items Tab — mobile scroll/wrap */}
      {activeTab === 'items' && categories.length > 0 && (
        <div className="bg-slate-50/50 rounded-2xl md:rounded-[2rem] border border-slate-100 p-4 sm:p-6 md:p-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 sm:mb-6 ml-1">Quick Sector Access</p>
          <div className="flex flex-wrap gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "h-11 px-6 rounded-xl flex items-center gap-2 font-bold text-xs transition-all",
                selectedCategory === null 
                  ? "bg-slate-900 text-white shadow-lg" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              )}
            >
              <FiList className="w-4 h-4" />
              Complete {config.itemLabelPlural}
            </button>
            {(categories || []).map((cat) => {
              const itemCount = (menuItems || []).filter(item => {
                const itemCat = item.category ? (typeof item.category === 'object' ? item.category._id : item.category) : null;
                return itemCat === (cat._id || cat.id);
              }).length;
              
              return (
                <button
                  key={cat._id || cat.id}
                  onClick={() => setSelectedCategory(cat._id || cat.id)}
                  className={cn(
                    "h-11 px-6 rounded-xl flex items-center gap-2 font-bold text-xs transition-all",
                    selectedCategory === (cat._id || cat.id)
                      ? "bg-orange-600 text-white shadow-lg"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <span>{cat.emoji}</span>
                  {cat.name}
                  <span className="ml-1 opacity-50 font-medium">({itemCount})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;

/**
 * Subscription page copy by business category and type.
 * Use for all categories and business types so the subscription page reads professionally.
 */
export type SubscriptionCopy = {
  pageTitle: string;
  pageSubtitle: string;
  resourceUsageLabel: string;
  resourceUsageDescription: string;
  itemsCreatedLabel: string;
  availableLabel: string;
  planCapabilitiesTitle: string;
  planCapabilitiesDescription: (planName: string) => string;
  currentPlanTagline: (planName: string) => string;
  expiringTitle: string;
  expiringMessage: (days: number) => string;
  expiredTitle: string;
  expiredMessage: string;
  renewCta: string;
  upgradeCta: string;
  getPremiumCta: string;
  totalInvestmentLabel: string;
  successfulTransactionsLabel: string;
  latestPaymentLabel: string;
  billingHistoryTitle: string;
  billingHistoryDescription: string;
  noInvoicesTitle: string;
  noInvoicesDescription: string;
  viewPricingCta: string;
  secureBillingTitle: string;
  secureBillingDescription: string;
  syncDataCta: string;
  upgradeBannerTitle: string;
  upgradeBannerDescription: string;
};

function getItemLabel(category?: string, businessType?: string): string {
  const c = (category || '').toLowerCase();
  const t = (businessType || '').toLowerCase();
  const combined = `${c} ${t}`;
  if (combined.includes('retail') || combined.includes('e-commerce') || combined.includes('store') || combined.includes('shop')) return 'Products';
  if (combined.includes('creative') || combined.includes('design') || combined.includes('agency') || combined.includes('studio') || combined.includes('portfolio')) return 'Portfolio items';
  return 'Menu items';
}

export function getSubscriptionCopy(
  businessCategory?: string,
  businessType?: string
): SubscriptionCopy {
  const itemLabel = getItemLabel(businessCategory, businessType);
  const category = (businessCategory || '').toLowerCase();
  const isRestaurant = category.includes('food') || category.includes('restaurant') || !category;
  const isRetail = category.includes('retail') || category.includes('e-commerce');
  const isCreative = category.includes('creative') || category.includes('design') || category.includes('agency') || category.includes('studio');

  return {
    pageTitle: 'Subscription',
    pageSubtitle: isRestaurant
      ? 'Manage your plan and billing for your digital menu'
      : isRetail
        ? 'Manage your plan and billing for your product catalog'
        : isCreative
          ? 'Manage your plan and billing for your portfolio'
          : 'Manage your business plan and billing',

    resourceUsageLabel: isRestaurant ? 'Digital menu items' : isRetail ? 'Catalog products' : 'Portfolio items',
    resourceUsageDescription: 'Your current quota and usage',
    itemsCreatedLabel: 'items created',
    availableLabel: 'available',

    planCapabilitiesTitle: 'Plan capabilities',
    planCapabilitiesDescription: (planName: string) => `Included in your ${planName} plan`,

    currentPlanTagline: (planName: string) => {
      const n = (planName || '').toLowerCase();
      if (n === 'pro' || n.includes('pro') || n.includes('scale') || n.includes('unlimited')) return 'Full access with priority support and advanced tools';
      if (n === 'basic' || n.includes('basic') || n.includes('growth') || n.includes('starter')) return 'Standard toolkit for your business';
      return 'Essential features to get your business online';
    },

    expiringTitle: 'Subscription expiring soon',
    expiringMessage: (days: number) => `Your plan expires in ${days} day${days === 1 ? '' : 's'}. Renew now to avoid any interruption.`,
    expiredTitle: 'Subscription expired',
    expiredMessage: 'Your premium access has ended. Renew now to unlock all features.',
    renewCta: 'Renew subscription',
    upgradeCta: 'Upgrade plan',
    getPremiumCta: 'Get premium plan',

    totalInvestmentLabel: 'Total investment',
    successfulTransactionsLabel: 'successful transactions',
    latestPaymentLabel: 'Latest payment',

    billingHistoryTitle: 'Billing history',
    billingHistoryDescription: 'Invoices and payment records',
    noInvoicesTitle: 'No invoices yet',
    noInvoicesDescription: 'Your payment history will appear here once you subscribe to a paid plan.',
    viewPricingCta: 'View pricing plans',

    secureBillingTitle: 'Secure billing',
    secureBillingDescription: 'We use industry-standard encryption and are PCI DSS compliant. Your payment data is secure.',
    syncDataCta: 'Sync data',

    upgradeBannerTitle: 'Ready for more?',
    upgradeBannerDescription: 'Unlock higher limits, premium features, and priority support.',
  };
}

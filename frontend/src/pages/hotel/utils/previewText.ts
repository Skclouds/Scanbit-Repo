/**
 * Get preview text based on business category
 * Returns appropriate preview label for the top navbar preview button
 */
export function getPreviewText(businessCategory?: string, businessType?: string): string {
  const category = (businessCategory || '').trim();
  const type = (businessType || '').toLowerCase();
  const combined = `${category} ${type}`.toLowerCase();

  // Retail / E-Commerce Businesses
  if (
    category === 'Retail / E-Commerce Businesses' ||
    combined.includes('retail') ||
    combined.includes('e-commerce') ||
    combined.includes('store') ||
    combined.includes('shop') ||
    combined.includes('boutique')
  ) {
    return 'Preview Catalog';
  }

  // Creative & Design — catalog-style preview (same as ScanBit Demo — Creative & Design)
  if (
    category === 'Creative & Design' ||
    combined.includes('creative') ||
    combined.includes('design')
  ) {
    return 'Preview Catalog';
  }

  // Portfolio (professional / legal / advisory)
  if (combined.includes('portfolio')) {
    return 'Preview Portfolio';
  }

  // Professional Services
  if (
    combined.includes('professional') ||
    combined.includes('service') ||
    combined.includes('consult') ||
    combined.includes('legal') ||
    combined.includes('account') ||
    combined.includes('advisory')
  ) {
    return 'Preview Services';
  }

  // Health / Wellness / Medical
  if (
    combined.includes('health') ||
    combined.includes('wellness') ||
    combined.includes('medical') ||
    combined.includes('clinic') ||
    combined.includes('spa') ||
    combined.includes('yoga') ||
    combined.includes('therapy')
  ) {
    return 'Preview Services';
  }

  // Agencies & Studios (all business types: Digital Marketing, Branding, Web Design, UI/UX, Photography, Advertising, etc.)
  if (
    category === 'Agencies & Studios' ||
    combined.includes('agency') ||
    combined.includes('marketing') ||
    combined.includes('advert') ||
    combined.includes('studios')
  ) {
    return 'Preview Portfolio';
  }

  // Default: Food Mall / Restaurant
  return 'Preview Menu';
}

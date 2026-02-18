/**
 * Canonical public website URL for emails, messages, and customer-facing links.
 * Always use scanbit.in (production) in sent content — never development.scanbit.in.
 * In production, all URLs are normalized to HTTPS.
 */
const PRODUCTION_DOMAIN = 'https://scanbit.in';
const isProduction = process.env.NODE_ENV === 'production';

function ensureHttps(url) {
  if (!url || typeof url !== 'string') return url;
  return url.replace(/^http:\/\//i, 'https://').replace(/\/$/, '');
}

function getPublicWebsiteUrl() {
  const explicit = process.env.PUBLIC_WEBSITE_URL || process.env.CANONICAL_FRONTEND_URL;
  if (explicit && String(explicit).trim()) {
    const url = String(explicit).trim().replace(/\/$/, '');
    return isProduction ? ensureHttps(url) : url;
  }
  const fromFrontend = (process.env.FRONTEND_URL || '').split(',')[0].trim().replace(/\/$/, '');
  if (fromFrontend && fromFrontend.includes('development.scanbit.in')) {
    return PRODUCTION_DOMAIN;
  }
  if (fromFrontend) {
    return isProduction ? ensureHttps(fromFrontend) : fromFrontend;
  }
  return PRODUCTION_DOMAIN;
}

export default getPublicWebsiteUrl;
export { getPublicWebsiteUrl, PRODUCTION_DOMAIN, ensureHttps };

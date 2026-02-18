/**
 * Google Analytics (gtag.js) utilities
 * Measurement ID: G-TBNMZHMXWV
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const GA_MEASUREMENT_ID = 'G-TBNMZHMXWV';

export function trackPageView(path: string, title?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title || document.title,
    });
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

export function trackConversion(label: string, value?: number) {
  trackEvent('conversion', { send_to: GA_MEASUREMENT_ID, label, value: value ?? 0 });
}

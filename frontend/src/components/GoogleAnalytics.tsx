import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';

/**
 * Tracks SPA route changes as page views in Google Analytics.
 * Must be rendered inside BrowserRouter.
 */
export default function GoogleAnalytics() {
  const { pathname } = useLocation();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}

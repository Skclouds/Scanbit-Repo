import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import api from '../lib/api';
import ScanBitLoader from '../components/ui/ScanBitLoader';

function readCachedSettings(): SiteSettings | null {
  try {
    const raw = localStorage.getItem('siteSettingsCache');
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : null;
  } catch {
    return null;
  }
}

export type SiteSettings = {
  general?: { siteName?: string; siteDescription?: string; contactEmail?: string };
  branding?: {
    logoUrl?: string;
    darkLogoUrl?: string;
    mobileLogoUrl?: string;
    footerLogoUrl?: string;
    faviconUrl?: string;
    appIconUrl?: string;
  };
  typography?: { fontFamily?: string; baseFontSize?: number };
  colors?: { primary?: string; secondary?: string; background?: string; text?: string };
  layout?: { contentWidth?: 'boxed' | 'full'; headerStyle?: 'transparent' | 'solid'; footerStyle?: 'minimal' | 'detailed' };
  media?: { heroImageUrl?: string; bannerImageUrl?: string };
  animations?: { enabled?: boolean; durationMs?: number };
  sections?: { showFeatures?: boolean; showPricing?: boolean; showTestimonials?: boolean; showFAQ?: boolean };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    canonicalUrl?: string;
    author?: string;
    themeColor?: string;
    locale?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogImageWidth?: number;
    ogImageHeight?: number;
    ogType?: string;
    ogSiteName?: string;
    ogLocale?: string;
    ogUrl?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    twitterSite?: string;
    twitterCreator?: string;
    robotsIndex?: string;
    robotsFollow?: string;
    robotsExtra?: string;
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    googleSiteVerification?: string;
    bingSiteVerification?: string;
    jsonLdOrganization?: string;
    jsonLdWebSite?: string;
    jsonLdBreadcrumb?: string;
    extraMetaTags?: Array<{ name?: string; property?: string; content: string }>;
  };
  publish?: { isDraft?: boolean; publishedAt?: string };
};

interface ContextValue {
  settings: SiteSettings | null;
  isInitialized: boolean;
  refresh: () => Promise<void>;
  applyToDocument: (s: SiteSettings | null) => void;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(href: string) {
  if (!href) {
    const el = document.querySelector('link[rel="canonical"]');
    if (el) el.remove();
    return;
  }
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

function removeScriptsBySelector(selector: string) {
  document.querySelectorAll(selector).forEach((el) => el.remove());
}

const SiteSettingsContext = createContext<ContextValue>({
  settings: null,
  isInitialized: false,
  refresh: async () => {},
  applyToDocument: () => {},
});

// On iOS, show app sooner so the page never appears "stuck" (avoids 12s fallback and user confusion).
const isIOS = typeof navigator !== 'undefined' && (
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
);
const INITIAL_LOAD_TIMEOUT_MS = isIOS ? 2500 : 6000; // iOS: 2.5s so website loads even if API is slow/hangs
const FETCH_TIMEOUT_MS = isIOS ? 4000 : 8000; // Abort fetch after this so we don't hang forever

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(readCachedSettings);
  const [isInitialized] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(() => {
    if (typeof navigator === 'undefined') return !!readCachedSettings();
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return false;
    return !!readCachedSettings();
  });
  const applyingRef = useRef(false);
  const applyToDocumentRef = useRef<(s: SiteSettings | null) => void>(() => {});

  const applyToDocument = useCallback((s: SiteSettings | null) => {
    if (typeof document === 'undefined') return;
    if (applyingRef.current) return;
    applyingRef.current = true;
    try {
    const root = document.documentElement;
    const colors = s?.colors || {};
    const typography = s?.typography || {};
    const branding = s?.branding || {};
    const seo = s?.seo || {};

    // Apply colors and typography
    if (colors.primary) root.style.setProperty('--primary-color', colors.primary);
    if (colors.secondary) root.style.setProperty('--secondary-color', colors.secondary);
    if (colors.background) root.style.setProperty('--bg-color', colors.background);
    if (colors.text) root.style.setProperty('--text-color', colors.text);
    if (typography.fontFamily) root.style.setProperty('--font-family', typography.fontFamily);
    if (typography.baseFontSize) root.style.setProperty('--base-font-size', `${typography.baseFontSize}px`);

    // Update favicon
    if (branding.faviconUrl) {
      let favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = branding.faviconUrl;
    }

    // Title: prefer SEO meta title, then site name
    const title = seo.metaTitle?.trim() || s?.general?.siteName || '';
    if (title) document.title = title;

    // SEO meta tags
    if (seo.metaDescription?.trim()) setMeta('name', 'description', seo.metaDescription.trim());
    if (Array.isArray(seo.metaKeywords) && seo.metaKeywords.length) setMeta('name', 'keywords', seo.metaKeywords.join(', '));
    if (seo.author?.trim()) setMeta('name', 'author', seo.author.trim());
    if (seo.themeColor?.trim()) setMeta('name', 'theme-color', seo.themeColor.trim());

    const index = seo.robotsIndex || 'index';
    const follow = seo.robotsFollow || 'follow';
    const extra = seo.robotsExtra?.trim() || '';
    const robotsContent = [index, follow, extra].filter(Boolean).join(', ');
    setMeta('name', 'robots', robotsContent);

    if (seo.canonicalUrl?.trim()) setCanonical(seo.canonicalUrl.trim());
    else setCanonical('');

    const siteName = s?.general?.siteName || '';
    const ogTitle = seo.ogTitle?.trim() || seo.metaTitle?.trim() || siteName;
    const ogDesc = seo.ogDescription?.trim() || seo.metaDescription?.trim() || '';
    const ogImage = seo.ogImage?.trim() || s?.media?.heroImageUrl || '';
    const ogUrl = seo.ogUrl?.trim() || seo.canonicalUrl?.trim() || (typeof window !== 'undefined' ? window.location.origin : '');
    if (ogTitle) setMeta('property', 'og:title', ogTitle);
    if (ogDesc) setMeta('property', 'og:description', ogDesc);
    if (ogImage) setMeta('property', 'og:image', ogImage);
    if (seo.ogType) setMeta('property', 'og:type', seo.ogType);
    if (seo.ogSiteName?.trim()) setMeta('property', 'og:site_name', seo.ogSiteName.trim());
    if (seo.ogLocale?.trim()) setMeta('property', 'og:locale', seo.ogLocale.trim());
    if (ogUrl) setMeta('property', 'og:url', ogUrl);

    const twTitle = seo.twitterTitle?.trim() || ogTitle;
    const twDesc = seo.twitterDescription?.trim() || ogDesc;
    const twImage = seo.twitterImage?.trim() || ogImage;
    if (twTitle) setMeta('name', 'twitter:title', twTitle);
    if (twDesc) setMeta('name', 'twitter:description', twDesc);
    if (twImage) setMeta('name', 'twitter:image', twImage);
    if (seo.twitterCard) setMeta('name', 'twitter:card', seo.twitterCard);
    if (seo.twitterSite?.trim()) setMeta('name', 'twitter:site', seo.twitterSite.trim());
    if (seo.twitterCreator?.trim()) setMeta('name', 'twitter:creator', seo.twitterCreator.trim());

    if (seo.googleSiteVerification?.trim()) setMeta('name', 'google-site-verification', seo.googleSiteVerification.trim());
    if (seo.bingSiteVerification?.trim()) setMeta('name', 'msvalidate.01', seo.bingSiteVerification.trim());

    if (Array.isArray(seo.extraMetaTags)) {
      seo.extraMetaTags.forEach((t) => {
        if (!t.content?.trim()) return;
        if (t.property?.trim()) setMeta('property', t.property.trim(), t.content.trim());
        else if (t.name?.trim()) setMeta('name', t.name.trim(), t.content.trim());
      });
    }

    removeScriptsBySelector('script[data-dynamic="seo-jsonld"]');
    [seo.jsonLdOrganization, seo.jsonLdWebSite, seo.jsonLdBreadcrumb].forEach((raw) => {
      if (!raw?.trim()) return;
      try {
        JSON.parse(raw);
      } catch {
        return;
      }
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-dynamic', 'seo-jsonld');
      script.textContent = raw.trim();
      document.head.appendChild(script);
    });

    removeScriptsBySelector('script[data-dynamic="ga4"]');
    if (seo.googleAnalyticsId?.trim()) {
      const gid = seo.googleAnalyticsId.trim();
      const s1 = document.createElement('script');
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${gid}`;
      s1.async = true;
      s1.setAttribute('data-dynamic', 'ga4');
      document.head.appendChild(s1);
      const s2 = document.createElement('script');
      s2.setAttribute('data-dynamic', 'ga4');
      s2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gid}');`;
      document.head.appendChild(s2);
    }

    removeScriptsBySelector('script[data-dynamic="gtm"]');
    if (seo.googleTagManagerId?.trim()) {
      const gtmId = seo.googleTagManagerId.trim();
      const s = document.createElement('script');
      s.setAttribute('data-dynamic', 'gtm');
      s.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`;
      document.head.appendChild(s);
    }
    } finally {
      applyingRef.current = false;
    }
  }, []);
  applyToDocumentRef.current = applyToDocument;

  useLayoutEffect(() => {
    if (settings) applyToDocumentRef.current(settings);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await api.getPublicSiteSettings();
      if (res?.success && res?.data) {
        setSettings(res.data);
        try {
          localStorage.setItem('siteSettingsCache', JSON.stringify(res.data));
        } catch {
          /* ignore */
        }
        setTimeout(() => {
          try { applyToDocumentRef.current(res.data); } catch (_) {}
        }, 0);
      }
    } catch {
      setSettings(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      setInitialLoadDone(true);
    }, INITIAL_LOAD_TIMEOUT_MS);

    const fetchWithTimeout = (): Promise<{ success: boolean; data?: any }> => {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), FETCH_TIMEOUT_MS)
      );
      return Promise.race([api.getPublicSiteSettings(), timeoutPromise]);
    };

    const run = async () => {
      try {
        const res = await fetchWithTimeout();
        if (cancelled) return;
        const data = (res && typeof res === 'object' && res.data != null) ? res.data : (res && typeof res === 'object' && (res.general != null || res.branding != null) ? res : null);
        if (data && typeof data === 'object') {
          setSettings(data);
          try {
            localStorage.setItem('siteSettingsCache', JSON.stringify(data));
          } catch { /* ignore */ }
          try {
            applyToDocumentRef.current(data);
          } catch (_) {}
        } else {
          const cached = readCachedSettings();
          if (cached) {
            setSettings(cached);
            applyToDocumentRef.current(cached);
          }
        }
      } catch {
        if (!cancelled) {
          const cached = readCachedSettings();
          if (cached) {
            setSettings(cached);
            try {
              applyToDocumentRef.current(cached);
            } catch (_) {}
          }
        }
      } finally {
        if (!cancelled) {
          clearTimeout(timeoutId);
          setInitialLoadDone(true);
        }
      }
    };
    run().catch(() => {
      if (!cancelled) {
        clearTimeout(timeoutId);
        setInitialLoadDone(true);
      }
    });
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  const value = useMemo(
    () => ({ settings, isInitialized, refresh, applyToDocument }),
    [settings, isInitialized, refresh, applyToDocument]
  );

  useEffect(() => {
    try {
      const root = document.getElementById('root');
      if (root) root.setAttribute('data-scanbit-mounted', '1');
    } catch (_) {}
  }, []);

  return (
    <SiteSettingsContext.Provider value={value}>
      {!initialLoadDone ? (
        <ScanBitLoader fullScreen size="lg" showDots />
      ) : (
        children
      )}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);

export const useSiteSettingsLoading = () => {
  const { isInitialized } = useSiteSettings();
  return !isInitialized;
};

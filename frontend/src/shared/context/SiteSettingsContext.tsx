import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import api from '../lib/api';


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
  seo?: { metaTitle?: string; metaDescription?: string; metaKeywords?: string[] };
  publish?: { isDraft?: boolean; publishedAt?: string };
};

interface ContextValue {
  settings: SiteSettings | null;
  refresh: () => Promise<void>;
  applyToDocument: (s: SiteSettings | null) => void;
}

const SiteSettingsContext = createContext<ContextValue>({
  settings: null,
  refresh: async () => {},
  applyToDocument: () => {},
});

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const applyToDocument = (s: SiteSettings | null) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const colors = s?.colors || {};
    const typography = s?.typography || {};
    const branding = s?.branding || {};

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

    // Update site title if available
    if (s?.general?.siteName) {
      document.title = s.general.siteName;
    }
  };

  const refresh = async () => {
    try {
      const res = await api.getPublicSiteSettings();
      if (res?.success && res?.data) {
        setSettings(res.data);
        applyToDocument(res.data);
      }
    } catch (e) {
      // Ignore fetch errors for public settings
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(() => ({ settings, refresh, applyToDocument }), [settings]);

  return (
    <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);

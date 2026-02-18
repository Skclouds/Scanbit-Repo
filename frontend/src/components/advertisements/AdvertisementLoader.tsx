import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "@/lib/api";

import { CTAFloatingButton } from "./ad-types/CTAFloatingButton";
import { FullWidthBanner } from "./ad-types/FullWidthBanner";
import { ExitIntentPopup } from "./ad-types/ExitIntentPopup";
import { AnnouncementBar } from "./ad-types/AnnouncementBar";
import { StickyTopBar } from "./ad-types/StickyTopBar";
import { SlideInPopup } from "./ad-types/SlideInPopup";
import { HeaderBanner } from "./ad-types/HeaderBanner";
import { PopupModal } from "./ad-types/PopupModal";

interface AdvertisementLoaderProps {
  businessCategory?: string;
}

export const AdvertisementLoader = ({ businessCategory }: AdvertisementLoaderProps) => {
  const location = useLocation();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shownAds, setShownAds] = useState<Set<string>>(new Set());
  const sessionIdRef = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);
  const exitIntentTriggered = useRef(false);
  const scrollTriggeredAds = useRef<Set<string>>(new Set());
  const impressionLogged = useRef<Set<string>>(new Set());
  const [visibleTopAds, setVisibleTopAds] = useState<Map<string, number>>(new Map());
  const deviceTypeRef = useRef<'mobile' | 'desktop' | 'tablet'>('desktop');

  // Detect device type
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < 768) {
        deviceTypeRef.current = 'mobile';
      } else if (width < 1024) {
        deviceTypeRef.current = 'tablet';
      } else {
        deviceTypeRef.current = 'desktop';
      }
    };
    
    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  const lastAdTopOffsetRef = useRef<number>(-1);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const totalOffset = Array.from(visibleTopAds.values()).reduce((sum, h) => sum + (h || 0), 0);
    if (lastAdTopOffsetRef.current === totalOffset) return;
    lastAdTopOffsetRef.current = totalOffset;
    document.documentElement.style.setProperty('--ad-top-offset', `${totalOffset}px`);
  }, [visibleTopAds]);

  // Get current page name from route
  const getCurrentPage = useCallback(() => {
    const path = location.pathname.toLowerCase();
    
    // More comprehensive page detection
    if (path === "/" || path === "/home" || path === "/index") return "home";
    if (path.includes("/menu") || path.includes("/products") || path.includes("/items")) return "menu";
    if (path.includes("/product/") || path.includes("/item/") || path.includes("/detail")) return "product-detail";
    if (path.includes("/cart") || path.includes("/basket")) return "cart";
    if (path.includes("/checkout") || path.includes("/payment")) return "checkout";
    if (path.includes("/portfolio") || path.includes("/gallery")) return "portfolio";
    if (path.includes("/contact") || path.includes("/about")) return "contact";
    if (path.includes("/admin")) return null; // Don't show ads on admin pages
    if (path.includes("/hotel") || path.includes("/dashboard")) return "menu"; // Hotel dashboard = menu context
    
    return "home";
  }, [location.pathname]);

  // Check if ad should be shown based on custom URL targeting
  const matchesCustomUrl = useCallback((ad: any) => {
    if (!ad.pageTargeting?.includes('custom') || !ad.customUrls || ad.customUrls.length === 0) {
      return true; // Not using custom URL targeting
    }

    const currentPath = location.pathname.toLowerCase();
    return ad.customUrls.some((url: string) => {
      const normalizedUrl = url.toLowerCase().trim();
      // Exact match
      if (normalizedUrl === currentPath) return true;
      // Path includes
      if (normalizedUrl.includes('*')) {
        const pattern = normalizedUrl.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(currentPath);
      }
      return false;
    });
  }, [location.pathname]);

  // Check if ad should be shown based on scheduling rules
  const shouldShowAd = useCallback((ad: any) => {
    // Check if already shown
    if (shownAds.has(ad._id || ad.id)) return false;

    // Check custom URL targeting
    if (!matchesCustomUrl(ad)) return false;

    // Check weekend rule
    if (ad.schedulingRules?.showOnlyOnWeekends) {
      const day = new Date().getDay();
      if (day !== 0 && day !== 6) return false; // Not Saturday or Sunday
    }

    // Check specific dates rule
    if (ad.schedulingRules?.showOnlyOnDates && ad.schedulingRules.showOnlyOnDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const showDates = ad.schedulingRules.showOnlyOnDates.map((date: string | Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });
      if (!showDates.includes(today.getTime())) return false;
    }

    // Check show once per session
    if (ad.schedulingRules?.showOncePerSession) {
      try {
        const sessionKey = `ad_shown_${ad._id || ad.id}`;
        if (sessionStorage.getItem(sessionKey)) return false;
      } catch { /* Safari private mode */ }
    }

    // Check scroll trigger (handled separately in scroll handler)
    if (ad.schedulingRules?.scrollTriggerPercent) {
      if (!scrollTriggeredAds.current.has(ad._id || ad.id)) {
        const scrollPercent = 
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent < ad.schedulingRules.scrollTriggerPercent) {
          return false;
        }
        scrollTriggeredAds.current.add(ad._id || ad.id);
      }
    }

    return true;
  }, [shownAds, matchesCustomUrl]);

  // Fetch active advertisements
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const page = getCurrentPage();
        
        // Don't fetch ads for admin pages
        if (!page) {
          setAds([]);
          setLoading(false);
          return;
        }

        const response = await api.getActiveAdvertisements({
          page,
          businessCategory: businessCategory || undefined,
        });

        if (response.success && response.data) {
          // Filter ads based on display settings (mobile/desktop/tablet)
          const isMobile = deviceTypeRef.current === 'mobile';
          const isTablet = deviceTypeRef.current === 'tablet';
          const isDesktop = !isMobile && !isTablet;

          const filteredAds = response.data.filter((ad: any) => {
            const ds = ad.displaySettings || {};
            // When undefined, treat as true (show). Only filter when explicitly false.
            const showOnMobile = ds.showOnMobile !== false;
            const showOnDesktop = ds.showOnDesktop !== false;

            if (isMobile && !showOnMobile) return false;
            // Tablet: schema has no showOnTablet, use showOnDesktop (tablet more like desktop)
            if (isTablet && !showOnDesktop) return false;
            if (isDesktop && !showOnDesktop) return false;

            return true;
          });

          setAds(filteredAds);
        }
      } catch (error) {

        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
    
    // Reset shown ads when page changes
    setShownAds(new Set());
    scrollTriggeredAds.current.clear();
    exitIntentTriggered.current = false; // Reset exit intent trigger on page change
  }, [location.pathname, businessCategory, getCurrentPage]);

  // Handle exit intent detection
  useEffect(() => {
    if (ads.length === 0) return;

    // Track mouse movement to detect upward movement
    let lastMouseY = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      lastMouseY = e.clientY;
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Exit intent: mouse leaves the top of the viewport
      // Check if mouse is moving upward (clientY <= 0 means leaving from top)
      if (e.clientY <= 0 && !exitIntentTriggered.current) {
        exitIntentTriggered.current = true;
        
        // Find exit intent ads that haven't been shown yet
        const exitIntentAd = ads.find(
          (ad) => 
            ad.adType === "exit-intent-popup" && 
            !shownAds.has(ad._id || ad.id)
        );
        
        if (exitIntentAd) {

          // Force a re-render by updating state
          setShownAds((prev) => new Set(prev));
        }
      }
    };

    // Also listen for mouseout on document for better cross-browser support
    const handleMouseOut = (e: MouseEvent) => {
      // Check if mouse is leaving the document (relatedTarget is null)
      // and moving upward (clientY is near top)
      if (
        e.relatedTarget === null && 
        e.clientY <= 10 && // Within 10px of top
        !exitIntentTriggered.current
      ) {
        exitIntentTriggered.current = true;
        const exitIntentAd = ads.find(
          (ad) => 
            ad.adType === "exit-intent-popup" && 
            !shownAds.has(ad._id || ad.id)
        );
        if (exitIntentAd) {
          setShownAds((prev) => new Set(prev));
        }
      }
    };

    // Track mouse movement
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseout", handleMouseOut);
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [ads, shownAds]);

  // Handle scroll triggers
  useEffect(() => {
    if (ads.length === 0) return;

    const handleScroll = () => {
      const scrollPercent = 
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      ads.forEach((ad) => {
        if (
          ad.schedulingRules?.scrollTriggerPercent &&
          scrollPercent >= ad.schedulingRules.scrollTriggerPercent &&
          !scrollTriggeredAds.current.has(ad._id || ad.id) &&
          shouldShowAd(ad)
        ) {
          scrollTriggeredAds.current.add(ad._id || ad.id);
          setShownAds((prev) => new Set([...prev, ad._id || ad.id]));
        }
      });
    };

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [ads, shouldShowAd]);

  // Log impression when ad is shown (only once per ad)
  const logImpression = useCallback(async (ad: any) => {
    const adId = ad._id || ad.id;
    if (impressionLogged.current.has(adId)) return;
    
    try {
      impressionLogged.current.add(adId);
      await api.logAdImpression({
        advertisementId: adId,
        page: getCurrentPage() || 'unknown',
        businessCategory: businessCategory || null,
        sessionId: sessionIdRef.current,
        device: {
          type: deviceTypeRef.current,
          userAgent: navigator.userAgent,
        },
      });
    } catch (error) {

      // Remove from logged set on error so it can retry
      impressionLogged.current.delete(adId);
    }
  }, [getCurrentPage, businessCategory]);

  // Handle ad close/dismiss
  const handleAdClose = useCallback((adId: string) => {
    setShownAds((prev) => new Set([...prev, adId]));
  }, []);

  if (loading) return null;

  // Filter and group ads by type for proper rendering
  const visibleAds = ads.filter(shouldShowAd);
  
  // Exit intent ads need special handling - they should be available even if exit intent hasn't triggered yet
  // but only shown when exitIntentTriggered is true
  // We check conditions manually here instead of using shouldShowAd to avoid the shownAds check
  const exitIntentAds = ads.filter((ad) => {
    if (ad.adType !== "exit-intent-popup") return false;
    if (shownAds.has(ad._id || ad.id)) return false;
    
    // Check custom URL targeting
    if (!matchesCustomUrl(ad)) return false;
    
    // Check weekend rule
    if (ad.schedulingRules?.showOnlyOnWeekends) {
      const day = new Date().getDay();
      if (day !== 0 && day !== 6) return false; // Not Saturday or Sunday
    }
    
    // Check specific dates rule
    if (ad.schedulingRules?.showOnlyOnDates && ad.schedulingRules.showOnlyOnDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const showDates = ad.schedulingRules.showOnlyOnDates.map((date: string | Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });
      if (!showDates.includes(today.getTime())) return false;
    }
    
    // Check show once per session
    if (ad.schedulingRules?.showOncePerSession) {
      try {
        const sessionKey = `ad_shown_${ad._id || ad.id}`;
        if (sessionStorage.getItem(sessionKey)) return false;
      } catch { /* Safari private mode */ }
    }
    
    return true;
  });
  
  const headerBanners = visibleAds.filter((ad) => ad.adType === "header-banner");
  const stickyBars = visibleAds.filter((ad) => ad.adType === "sticky-top-bar");
  const popups = visibleAds.filter((ad) => ad.adType === "popup-modal");
  const slideIns = visibleAds.filter((ad) => ad.adType === "slide-in-popup");
  const announcements = visibleAds.filter((ad) => ad.adType === "announcement-bar");
  const fullWidthBanners = visibleAds.filter((ad) => ad.adType === "full-width-banner");
  const floatingButtons = visibleAds.filter((ad) => ad.adType === "cta-floating-button");

  return (
    <>
      {/* Header Banners - Positioned below navbar, sticky when visible */}
      {headerBanners.map((ad) => (
        <HeaderBanner
          key={ad._id || ad.id}
          ad={ad}
          onClose={() => {
            handleAdClose(ad._id || ad.id);
            // Header banners don't affect navbar offset since they're below it
          }}
          onShow={(height?: number) => {
            logImpression(ad);
            // Header banners don't affect navbar offset since they're below it
          }}
        />
      ))}

      {/* Sticky Top Bars - Positioned below navbar, sticky when scrolling */}
      {stickyBars.map((ad) => (
        <StickyTopBar
          key={ad._id || ad.id}
          ad={ad}
          onClose={() => {
            handleAdClose(ad._id || ad.id);
            // Sticky top bars don't affect navbar offset since they're below it
          }}
          onShow={(height?: number) => {
            logImpression(ad);
            // Sticky top bars don't affect navbar offset since they're below it
          }}
        />
      ))}

      {/* Announcement Bars */}
      {announcements.map((ad) => (
        <AnnouncementBar
          key={ad._id || ad.id}
          ad={ad}
          onClose={() => {
            handleAdClose(ad._id || ad.id);
            setVisibleTopAds((prev) => {
              const next = new Map(prev);
              next.delete(ad._id || ad.id);
              return next;
            });
          }}
          onShow={(height?: number) => {
            logImpression(ad);
            setVisibleTopAds((prev) => {
              const next = new Map(prev);
              next.set(ad._id || ad.id, Number(height || ad.displaySettings?.height || 48));
              return next;
            });
          }}
        />
      ))}

      {/* Full Width Banners */}
      {fullWidthBanners.map((ad) => (
        <FullWidthBanner
          key={ad._id || ad.id}
          ad={ad}
          onClose={() => handleAdClose(ad._id || ad.id)}
          onShow={() => logImpression(ad)}
        />
      ))}

      {/* Popup Modals - Only show one at a time */}
      {popups
        .slice(0, 1)
        .map((ad) => (
          <PopupModal
            key={ad._id || ad.id}
            ad={ad}
            delay={ad.schedulingRules?.delaySeconds || 0}
            onClose={() => {
              handleAdClose(ad._id || ad.id);
              try {
                if (ad.schedulingRules?.showOncePerSession) {
                  sessionStorage.setItem(`ad_shown_${ad._id || ad.id}`, "true");
                }
              } catch { /* Safari private mode */ }
            }}
            onShow={() => logImpression(ad)}
          />
        ))}

      {/* Slide-In Popups - Only show one at a time */}
      {slideIns
        .slice(0, 1)
        .map((ad) => (
          <SlideInPopup
            key={ad._id || ad.id}
            ad={ad}
            delay={ad.schedulingRules?.delaySeconds || 0}
            onClose={() => {
              handleAdClose(ad._id || ad.id);
              try {
                if (ad.schedulingRules?.showOncePerSession) {
                  sessionStorage.setItem(`ad_shown_${ad._id || ad.id}`, "true");
                }
              } catch { /* Safari private mode */ }
            }}
            onShow={() => logImpression(ad)}
          />
        ))}

      {/* Exit Intent Popups - Only show when exit intent is triggered */}
      {exitIntentTriggered.current && exitIntentAds.length > 0 && (
        <ExitIntentPopup
          key={exitIntentAds[0]._id || exitIntentAds[0].id}
          ad={exitIntentAds[0]}
          onClose={() => {
            handleAdClose(exitIntentAds[0]._id || exitIntentAds[0].id);
            try {
              if (exitIntentAds[0].schedulingRules?.showOncePerSession) {
                sessionStorage.setItem(`ad_shown_${exitIntentAds[0]._id || exitIntentAds[0].id}`, "true");
              }
            } catch { /* Safari private mode */ }
          }}
          onShow={() => logImpression(exitIntentAds[0])}
        />
      )}

      {/* Floating CTA Buttons */}
      {floatingButtons.map((ad) => (
        <CTAFloatingButton
          key={ad._id || ad.id}
          ad={ad}
          onShow={() => logImpression(ad)}
        />
      ))}
    </>
  );
};

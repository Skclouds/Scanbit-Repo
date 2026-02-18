import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import api from "@/lib/api";


interface HeaderBannerProps {
  ad: any;
  onClose: () => void;
  onShow: () => void;
}

export const HeaderBanner = ({ ad, onClose, onShow }: HeaderBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Check if dismissed in localStorage
    const dismissedKey = `ad_dismissed_${ad._id || ad.id}`;
    if (localStorage.getItem(dismissedKey)) {
      setIsClosed(true);
      return;
    }

    // Show with delay if specified
    const delay = ad.schedulingRules?.delaySeconds || 0;
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Notify parent about visible height to allow layout offset
      onShow?.(Number(ad.displaySettings?.height || 60));
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [ad, onShow]);

  const handleClose = () => {
    setIsClosed(true);
    if (ad.displaySettings?.dismissible) {
      const dismissedKey = `ad_dismissed_${ad._id || ad.id}`;
      localStorage.setItem(dismissedKey, "true");
    }
    onClose();
  };

  const handleClick = async () => {
    try {
      await api.logAdClick({
        advertisementId: ad._id || ad.id,
        sessionId: `session_${Date.now()}`,
      });
    } catch (error) {

    }
  };

  if (isClosed || !isVisible) return null;

  const bgStyle = ad.gradient?.enabled
    ? {
        background: `linear-gradient(${
          ad.gradient.direction === "to-right"
            ? "to right"
            : ad.gradient.direction === "to-left"
            ? "to left"
            : ad.gradient.direction === "to-bottom"
            ? "to bottom"
            : ad.gradient.direction === "to-top"
            ? "to top"
            : "135deg"
        }, ${ad.gradient.colors.join(", ")})`,
      }
    : { backgroundColor: ad.backgroundColor };

  const CTAComponent = ad.ctaType === "whatsapp" ? "a" : Link;
  const ctaProps =
    ad.ctaType === "whatsapp"
      ? { href: ad.ctaButtonLink, target: "_blank", rel: "noopener noreferrer" }
      : { to: ad.ctaButtonLink };

  // Calculate navbar height (typically 64px for h-16, but we'll use a safe value)
  const navbarHeight = 64; // h-16 = 4rem = 64px

  return (
    <div
      className="sticky left-0 right-0 z-40 flex items-center justify-center px-4 py-3 text-sm font-medium text-white shadow-lg"
      style={{
        ...bgStyle,
        color: ad.textColor,
        height: ad.displaySettings?.height || "60px",
        top: `${navbarHeight}px`, // Position below navbar
      }}
    >
      <div className="flex items-center gap-4 max-w-7xl w-full justify-center">
        <div className="flex-1 text-center">
          <p className="font-bold">{ad.headline}</p>
          {ad.subHeadline && <p className="text-xs opacity-90">{ad.subHeadline}</p>}
        </div>
        <CTAComponent
          {...ctaProps}
          onClick={handleClick}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-semibold whitespace-nowrap"
          style={{ color: ad.textColor }}
        >
          {ad.ctaButtonText || "Learn More"}
        </CTAComponent>
        {ad.displaySettings?.closeable && (
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

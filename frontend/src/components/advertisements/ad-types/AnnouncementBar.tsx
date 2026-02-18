import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import api from "@/lib/api";


interface AnnouncementBarProps {
  ad: any;
  onClose: () => void;
  onShow: (height?: number) => void;
}

export const AnnouncementBar = ({ ad, onClose, onShow }: AnnouncementBarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const onShowRef = useRef(onShow);
  onShowRef.current = onShow;

  useEffect(() => {
    const dismissedKey = `ad_dismissed_${ad._id || ad.id}`;
    if (localStorage.getItem(dismissedKey)) {
      setIsClosed(true);
      return;
    }

    setIsVisible(true);
    onShowRef.current?.(Number(ad.displaySettings?.height || 48));
  }, [ad._id, ad.id, ad.displaySettings?.height]);

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

  const bgStyle = { backgroundColor: ad.backgroundColor };

  const CTAComponent = ad.ctaType === "whatsapp" ? "a" : Link;
  const ctaProps =
    ad.ctaType === "whatsapp"
      ? { href: ad.ctaButtonLink, target: "_blank", rel: "noopener noreferrer" }
      : { to: ad.ctaButtonLink };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center px-4 text-sm font-medium text-white shadow-md"
      style={{
        ...bgStyle,
        color: ad.textColor,
        height: ad.displaySettings?.height || "48px",
      }}
    >
      <div className="flex items-center gap-3 max-w-7xl w-full justify-center">
        <p className="font-semibold">{ad.headline}</p>
        {ad.subHeadline && <p className="text-xs opacity-90">• {ad.subHeadline}</p>}
        <CTAComponent
          {...ctaProps}
          onClick={handleClick}
          className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors text-xs font-semibold"
          style={{ color: ad.textColor }}
        >
          {ad.ctaButtonText || "Learn More"}
        </CTAComponent>
        {ad.displaySettings?.closeable && (
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded transition-colors ml-auto"
            aria-label="Close"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

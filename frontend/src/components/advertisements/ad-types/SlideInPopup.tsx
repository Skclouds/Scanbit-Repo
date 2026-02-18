import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";

interface SlideInPopupProps {
  ad: any;
  delay?: number;
  onClose: () => void;
  onShow: () => void;
}

export const SlideInPopup = ({ ad, delay = 0, onClose, onShow }: SlideInPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      onShow();
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [delay, onShow]);

  const handleClose = () => {
    setIsVisible(false);
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

  if (!isVisible) return null;

  const bgStyle = { backgroundColor: ad.backgroundColor };
  const position = ad.displaySettings?.position || "right";

  const positionClasses = {
    right: "right-0 top-1/2 -translate-y-1/2 animate-in slide-in-from-right",
    left: "left-0 top-1/2 -translate-y-1/2 animate-in slide-in-from-left",
    bottom: "bottom-0 left-1/2 -translate-x-1/2 animate-in slide-in-from-bottom",
  };

  const CTAComponent = ad.ctaType === "whatsapp" ? "a" : Link;
  const ctaProps =
    ad.ctaType === "whatsapp"
      ? { href: ad.ctaButtonLink, target: "_blank", rel: "noopener noreferrer" }
      : { to: ad.ctaButtonLink };

  return (
    <div className={`fixed z-[5000] ${positionClasses[position as keyof typeof positionClasses] || positionClasses.right}`}>
      <div
        className="rounded-lg shadow-2xl p-6 m-4"
        style={{
          ...bgStyle,
          color: ad.textColor,
          width: ad.displaySettings?.width || "350px",
        }}
      >
        {ad.displaySettings?.closeable && (
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="space-y-3">
          <h3 className="font-bold text-lg">{ad.headline}</h3>
          {ad.subHeadline && <p className="text-sm opacity-90">{ad.subHeadline}</p>}
          {ad.description && <p className="text-xs opacity-80">{ad.description}</p>}
          <CTAComponent
            {...ctaProps}
            onClick={handleClick}
            className="block w-full text-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors font-semibold text-sm mt-4"
            style={{ color: ad.textColor }}
          >
            {ad.ctaButtonText || "Learn More"}
          </CTAComponent>
        </div>
      </div>
    </div>
  );
};

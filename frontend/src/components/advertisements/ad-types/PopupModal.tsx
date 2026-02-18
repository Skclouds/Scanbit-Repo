import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";

interface PopupModalProps {
  ad: any;
  delay?: number;
  onClose: () => void;
  onShow: () => void;
}

export const PopupModal = ({ ad, delay = 0, onClose, onShow }: PopupModalProps) => {
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

  const bgStyle = ad.gradient?.enabled
    ? {
        background: `linear-gradient(${
          ad.gradient.direction === "diagonal" ? "135deg" : "to right"
        }, ${ad.gradient.colors.join(", ")})`,
      }
    : { backgroundColor: ad.backgroundColor };

  const CTAComponent = ad.ctaType === "whatsapp" ? "a" : Link;
  const ctaProps =
    ad.ctaType === "whatsapp"
      ? { href: ad.ctaButtonLink, target: "_blank", rel: "noopener noreferrer" }
      : { to: ad.ctaButtonLink };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="relative rounded-2xl shadow-2xl p-8 max-w-lg w-full animate-in fade-in zoom-in"
        style={{
          ...bgStyle,
          color: ad.textColor,
          width: ad.displaySettings?.width || "500px",
        }}
      >
        {ad.displaySettings?.closeable && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold">{ad.headline}</h3>
          {ad.subHeadline && <p className="text-lg opacity-90">{ad.subHeadline}</p>}
          {ad.description && <p className="text-sm opacity-80">{ad.description}</p>}
          <CTAComponent
            {...ctaProps}
            onClick={handleClick}
            className="inline-block px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-semibold mt-4"
            style={{ color: ad.textColor }}
          >
            {ad.ctaButtonText || "Learn More"}
          </CTAComponent>
        </div>
      </div>
    </div>
  );
};

import { useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";

interface FullWidthBannerProps {
  ad: any;
  onClose: () => void;
  onShow: () => void;
}

export const FullWidthBanner = ({ ad, onShow }: FullWidthBannerProps) => {
  useEffect(() => {
    onShow();
  }, [onShow]);

  const handleClick = async () => {
    try {
      await api.logAdClick({
        advertisementId: ad._id || ad.id,
        sessionId: `session_${Date.now()}`,
      });
    } catch (error) {

    }
  };

  const bgStyle = ad.gradient?.enabled
    ? {
        background: `linear-gradient(to right, ${ad.gradient.colors.join(", ")})`,
      }
    : { backgroundColor: ad.backgroundColor };

  const CTAComponent = ad.ctaType === "whatsapp" ? "a" : Link;
  const ctaProps =
    ad.ctaType === "whatsapp"
      ? { href: ad.ctaButtonLink, target: "_blank", rel: "noopener noreferrer" }
      : { to: ad.ctaButtonLink };

  // Calculate navbar height (typically 64px for h-16)
  const navbarHeight = 64; // h-16 = 4rem = 64px

  return (
    <div
      className="w-full flex items-center justify-center px-6 py-12 text-center"
      style={{
        ...bgStyle,
        color: ad.textColor,
        minHeight: ad.displaySettings?.height || "200px",
        marginTop: `${navbarHeight}px`, // Add space at top to appear below navbar
      }}
    >
      <div className="max-w-4xl space-y-4">
        <h2 className="text-4xl font-bold">{ad.headline}</h2>
        {ad.subHeadline && <p className="text-xl opacity-90">{ad.subHeadline}</p>}
        {ad.description && <p className="text-lg opacity-80">{ad.description}</p>}
        <CTAComponent
          {...ctaProps}
          onClick={handleClick}
          className="inline-block px-8 py-4 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-semibold text-lg mt-6"
          style={{ color: ad.textColor }}
        >
          {ad.ctaButtonText || "Get Started"}
        </CTAComponent>
      </div>
    </div>
  );
};

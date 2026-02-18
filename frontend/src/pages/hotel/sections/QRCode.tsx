import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { safeImageSrc } from "@/lib/imageUtils";
import { FiDownload, FiEye, FiShare2, FiCopy, FiCheck, FiAlertCircle, FiInstagram, FiYoutube, FiFacebook, FiTwitter, FiGlobe } from "react-icons/fi";
import { MdQrCode, MdRestaurantMenu, MdShoppingBag, MdBrush, MdWork, MdPhone, MdEmail, MdLocationOn } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getBusinessConfig } from "./menu/index";
import { getPreviewText } from "../utils/previewText";
import api from "@/lib/api";

interface QRCustomization {
  size: number;
  level: "L" | "M" | "Q" | "H";
  includeMargin: boolean;
  marginSize: number;
  fgColor: string;
  bgColor: string;
  logoEnabled: boolean;
  logoSize: number;
}

interface QRCodeProps {
  restaurant: any;
  logo: string | null;
  menuUrl: string;
  onRefresh?: () => void;
}

// Professional QR Templates – background gradients for printable cards
type TemplateDef = {
  id: string;
  name: string;
  colors: { fg: string; bg: string };
  description: string;
  background: string; // CSS gradient or pattern
};

const QR_TEMPLATES: Record<string, TemplateDef[]> = {
  restaurant: [
    { id: 'classic', name: 'Classic Menu', colors: { fg: '#000000', bg: '#ffffff' }, description: 'Clean and professional', background: 'linear-gradient(160deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)' },
    { id: 'modern', name: 'Modern Dark', colors: { fg: '#ffffff', bg: '#1a1a2e' }, description: 'Sleek dark theme', background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)' },
    { id: 'warm', name: 'Warm Appetite', colors: { fg: '#c41e3a', bg: '#fff5e6' }, description: 'Inviting warm tones', background: 'linear-gradient(135deg, #fff8f0 0%, #ffecd2 50%, #fcb69f 100%)' },
    { id: 'nature', name: 'Organic Green', colors: { fg: '#2d5a27', bg: '#f0f9e8' }, description: 'Natural & fresh', background: 'linear-gradient(160deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)' },
    { id: 'elegant', name: 'Elegant Gold', colors: { fg: '#8b7355', bg: '#fffef7' }, description: 'Luxury dining', background: 'linear-gradient(145deg, #fffde7 0%, #fff9c4 50%, #ffecb3 100%)' },
    { id: 'playful', name: 'Playful Orange', colors: { fg: '#ff6b35', bg: '#fff8f5' }, description: 'Fun & energetic', background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 50%, #ffcc80 100%)' },
  ],
  retail: [
    { id: 'shop', name: 'Shop Classic', colors: { fg: '#2c3e50', bg: '#ffffff' }, description: 'Professional retail', background: 'linear-gradient(160deg, #f5f6fa 0%, #e4e7ec 50%, #dcdde1 100%)' },
    { id: 'sale', name: 'Sale Red', colors: { fg: '#e74c3c', bg: '#fff5f5' }, description: 'Attention grabbing', background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 50%, #ef9a9a 100%)' },
    { id: 'premium', name: 'Premium Black', colors: { fg: '#000000', bg: '#f8f8f8' }, description: 'High-end products', background: 'linear-gradient(180deg, #fafafa 0%, #eeeeee 50%, #e0e0e0 100%)' },
    { id: 'eco', name: 'Eco Friendly', colors: { fg: '#27ae60', bg: '#f0fff4' }, description: 'Sustainable brand', background: 'linear-gradient(160deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)' },
    { id: 'tech', name: 'Tech Blue', colors: { fg: '#3498db', bg: '#f0f8ff' }, description: 'Modern technology', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)' },
    { id: 'fashion', name: 'Fashion Pink', colors: { fg: '#e91e63', bg: '#fff5f8' }, description: 'Trendy & stylish', background: 'linear-gradient(145deg, #fce4ec 0%, #f8bbd9 50%, #f48fb1 100%)' },
  ],
  creative: [
    { id: 'portfolio', name: 'Portfolio Minimal', colors: { fg: '#333333', bg: '#ffffff' }, description: 'Clean showcase', background: 'linear-gradient(160deg, #fafafa 0%, #f5f5f5 50%, #eeeeee 100%)' },
    { id: 'artistic', name: 'Artistic Purple', colors: { fg: '#9b59b6', bg: '#f9f5ff' }, description: 'Creative expression', background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 50%, #ce93d8 100%)' },
    { id: 'bold', name: 'Bold Statement', colors: { fg: '#000000', bg: '#ffeb3b' }, description: 'Stand out design', background: 'linear-gradient(145deg, #fffde7 0%, #fff59d 50%, #ffee58 100%)' },
    { id: 'gradient', name: 'Ocean Blue', colors: { fg: '#0077b6', bg: '#e6f7ff' }, description: 'Calm & professional', background: 'linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 50%, #81d4fa 100%)' },
    { id: 'neon', name: 'Neon Creative', colors: { fg: '#00ff88', bg: '#1a1a2e' }, description: 'Modern & edgy', background: 'linear-gradient(180deg, #0d0d14 0%, #1a1a2e 50%, #16213e 100%)' },
    { id: 'pastel', name: 'Pastel Dreams', colors: { fg: '#6c5ce7', bg: '#f8f5ff' }, description: 'Soft & friendly', background: 'linear-gradient(145deg, #ede7f6 0%, #d1c4e9 50%, #b39ddb 100%)' },
  ],
  professional: [
    { id: 'corporate', name: 'Corporate Blue', colors: { fg: '#1e3a5f', bg: '#ffffff' }, description: 'Business professional', background: 'linear-gradient(160deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)' },
    { id: 'legal', name: 'Legal Navy', colors: { fg: '#0a1628', bg: '#f5f7fa' }, description: 'Trust & authority', background: 'linear-gradient(160deg, #eceff1 0%, #cfd8dc 50%, #b0bec5 100%)' },
    { id: 'medical', name: 'Medical Teal', colors: { fg: '#008080', bg: '#f0ffff' }, description: 'Healthcare trust', background: 'linear-gradient(160deg, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%)' },
    { id: 'finance', name: 'Finance Green', colors: { fg: '#006400', bg: '#f5fff5' }, description: 'Financial services', background: 'linear-gradient(160deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)' },
    { id: 'consulting', name: 'Consulting Gray', colors: { fg: '#4a4a4a', bg: '#fafafa' }, description: 'Advisory services', background: 'linear-gradient(160deg, #f5f5f5 0%, #eeeeee 50%, #e0e0e0 100%)' },
    { id: 'education', name: 'Education Maroon', colors: { fg: '#800000', bg: '#fff8f8' }, description: 'Learning & growth', background: 'linear-gradient(145deg, #ffebee 0%, #ffcdd2 50%, #ef9a9a 100%)' },
  ],
  wellness: [
    { id: 'zen', name: 'Zen Green', colors: { fg: '#2d5a27', bg: '#f0f9e8' }, description: 'Calm and natural', background: 'linear-gradient(160deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)' },
    { id: 'spa', name: 'Spa Teal', colors: { fg: '#008080', bg: '#f0ffff' }, description: 'Soothing and professional', background: 'linear-gradient(160deg, #e0f2f1 0%, #b2dfdb 50%, #80cbc4 100%)' },
    { id: 'yoga', name: 'Yoga Purple', colors: { fg: '#6c5ce7', bg: '#f8f5ff' }, description: 'Spiritual and modern', background: 'linear-gradient(145deg, #ede7f6 0%, #d1c4e9 50%, #b39ddb 100%)' },
    { id: 'lotus', name: 'Lotus Pink', colors: { fg: '#e91e63', bg: '#fff5f8' }, description: 'Elegant and healthy', background: 'linear-gradient(145deg, #fce4ec 0%, #f8bbd9 50%, #f48fb1 100%)' },
    { id: 'sun', name: 'Sunny Vitality', colors: { fg: '#ff6b35', bg: '#fff8f5' }, description: 'Energetic and warm', background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 50%, #ffcc80 100%)' },
    { id: 'mind', name: 'Mindful Blue', colors: { fg: '#0077b6', bg: '#e6f7ff' }, description: 'Stable and trusted', background: 'linear-gradient(160deg, #e1f5fe 0%, #b3e5fc 50%, #81d4fa 100%)' },
  ],
};

const defaultQrCustomization: QRCustomization = {
  size: 256,
  level: "H",
  includeMargin: true,
  marginSize: 4,
  fgColor: "#000000",
  bgColor: "#ffffff",
  logoEnabled: true,
  logoSize: 50,
};

export const QRCode = ({ restaurant, logo, menuUrl, onRefresh }: QRCodeProps) => {
  const [qrCustomization, setQrCustomization] = useState<QRCustomization>(defaultQrCustomization);
  const [activeTab, setActiveTab] = useState<'basic' | 'templates' | 'advanced'>('basic');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customSlugInput, setCustomSlugInput] = useState("");
  const [slugCheckStatus, setSlugCheckStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [savingSlug, setSavingSlug] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Sync custom slug input when restaurant data loads
  useEffect(() => {
    setCustomSlugInput(restaurant?.customSlug ?? "");
    if (!restaurant?.customSlug) setSlugCheckStatus("idle");
  }, [restaurant?.customSlug]);

  // Base path for URLs (menu / catalogue / portfolio)
  const basePath = (() => {
    const cat = (restaurant?.businessCategory || restaurant?.businessType || "").toLowerCase();
    const isCreative = cat.includes("creative") || cat.includes("design");
    const isPortfolio = cat.includes("portfolio") || cat.includes("professional");
    return isCreative ? "catalogue" : isPortfolio ? "portfolio" : "menu";
  })();

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const customShareUrl = restaurant?.customSlug ? `${origin}/${basePath}/${restaurant.customSlug}` : null;

  const slugRegex = /^[a-z0-9][a-z0-9-]{2,49}$/;
  const isValidSlug = (s: string) => slugRegex.test(s) && !/--/.test(s);

  const generateRandomSlug = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let slug = "";
    for (let i = 0; i < 8; i++) slug += chars[Math.floor(Math.random() * chars.length)];
    setCustomSlugInput(slug);
    setSlugCheckStatus("idle");
  };

  const handleCheckSlug = async () => {
    const slug = customSlugInput.trim().toLowerCase();
    if (!slug) {
      setSlugCheckStatus("invalid");
      toast.error("Enter a link name (3–50 characters, lowercase letters, numbers, hyphens)");
      return;
    }
    if (!isValidSlug(slug)) {
      setSlugCheckStatus("invalid");
      toast.error("Link must be 3–50 chars, lowercase, letters/numbers/hyphens only");
      return;
    }
    setSlugCheckStatus("checking");
    try {
      const res = await api.checkSlugAvailability(slug, restaurant?._id || restaurant?.id);
      setSlugCheckStatus(res.available ? "available" : "taken");
      if (!res.available) toast.error("This link is already taken");
    } catch {
      setSlugCheckStatus("idle");
      toast.error("Could not check availability");
    }
  };

  const handleSaveCustomSlug = async () => {
    const slug = customSlugInput.trim().toLowerCase() || null;
    const rid = restaurant?._id || restaurant?.id;
    if (!rid) return;
    if (slug && !isValidSlug(slug)) {
      toast.error("Invalid link format");
      return;
    }
    setSavingSlug(true);
    try {
      await api.updateCustomSlug(rid, slug);
      toast.success(slug ? "Custom link saved!" : "Custom link removed");
      onRefresh?.();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save custom link");
    } finally {
      setSavingSlug(false);
    }
  };

  // Determine business type for templates
  const getBusinessType = () => {
    const category = (restaurant?.businessCategory || '').toLowerCase();
    const type = (restaurant?.businessType || '').toLowerCase();
    const combined = `${category} ${type}`;

    if (combined.includes('agency') || combined.includes('marketing') || combined.includes('advert')) return 'agency';
    if (combined.includes('creative') || combined.includes('design')) return 'creative';
    if (combined.includes('retail') || combined.includes('e-commerce') || combined.includes('store') || combined.includes('shop') || combined.includes('boutique')) return 'retail';
    if (combined.includes('professional') || combined.includes('consult') || combined.includes('legal') || combined.includes('account') || combined.includes('service')) return 'professional';
    if (combined.includes('health') || combined.includes('wellness') || combined.includes('medical') || combined.includes('clinic') || combined.includes('spa') || combined.includes('yoga')) return 'wellness';
    return 'restaurant';
  };

  const businessType = getBusinessType();
  const templateKey = businessType === 'agency' ? 'creative' : businessType;
  const templates = QR_TEMPLATES[templateKey] || QR_TEMPLATES.restaurant;

  const applyTemplate = (template: TemplateDef) => {
    setSelectedTemplate(template.id);
    setQrCustomization(prev => ({
      ...prev,
      fgColor: template.colors.fg,
      bgColor: template.colors.bg,
    }));
    toast.success(`Applied "${template.name}" template`);
  };

  const handleDownloadQR = (format: 'png' | 'svg' | 'pdf' = 'png') => {
    const svgElement = document.getElementById("qr-code-svg");
    if (!svgElement) {
      toast.error("QR Code not found");
      return;
    }

    if (format === 'svg') {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement("a");
      link.download = `${restaurant?.name || "business"}-qr-code.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("SVG downloaded successfully!");
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const padding = qrCustomization.includeMargin ? qrCustomization.marginSize * 8 : 16;
      canvas.width = qrCustomization.size + padding;
      canvas.height = qrCustomization.size + padding;

      if (ctx) {
        ctx.fillStyle = qrCustomization.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const offsetX = padding / 2;
        const offsetY = padding / 2;
        ctx.drawImage(img, offsetX, offsetY, qrCustomization.size, qrCustomization.size);

        if (qrCustomization.logoEnabled && logo) {
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          logoImg.onload = () => {
            const logoX = (canvas.width - qrCustomization.logoSize) / 2;
            const logoY = (canvas.height - qrCustomization.logoSize) / 2;
            
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, (qrCustomization.logoSize + 16) / 2, 0, Math.PI * 2);
            ctx.fillStyle = qrCustomization.bgColor;
            ctx.fill();
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, qrCustomization.logoSize / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(logoImg, logoX, logoY, qrCustomization.logoSize, qrCustomization.logoSize);
            ctx.restore();

            downloadCanvas(canvas, format);
          };
          logoImg.onerror = () => downloadCanvas(canvas, format);
          logoImg.src = safeImageSrc(logo);
        } else {
          downloadCanvas(canvas, format);
        }
      }
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const downloadCanvas = (canvas: HTMLCanvasElement, format: string) => {
    const link = document.createElement("a");
    link.download = `${restaurant?.name || "business"}-qr-code.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
    toast.success(`${format.toUpperCase()} downloaded successfully!`);
  };

  const config = getBusinessConfig(restaurant?.businessCategory, restaurant?.businessType);

  const handleDownloadTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 600;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    // Background gradient (template background)
    ctx.fillStyle = template.colors.bg;
    ctx.fillRect(0, 0, width, height);

    // Header gradient
    const headerGrad = ctx.createLinearGradient(0, 0, width, 100);
    headerGrad.addColorStop(0, template.colors.fg);
    headerGrad.addColorStop(1, template.colors.fg + "99");
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, width, 100);

    // Business name
    ctx.fillStyle = template.colors.bg;
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(restaurant?.name || "Your Business", width / 2, 60);

    // QR area – white/light panel
    const qrSize = 280;
    const qrX = (width - qrSize) / 2;
    const qrY = 140;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

    const svgElement = document.getElementById("qr-code-svg");
    if (!svgElement) {
      toast.error("QR code not ready. Apply the template first, then download.");
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const qrImg = new Image();

    qrImg.onload = () => {
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = template.colors.fg;
      ctx.font = "bold 20px system-ui, sans-serif";
      ctx.fillText("SCAN TO VIEW", width / 2, qrY + qrSize + 50);

      const categoryText = config?.pageTitle || "Our Menu";
      ctx.font = "16px system-ui, sans-serif";
      ctx.fillText(categoryText, width / 2, qrY + qrSize + 80);

      const contactY = qrY + qrSize + 120;
      ctx.font = "14px system-ui, sans-serif";
      ctx.fillStyle = template.colors.fg + "cc";

      if (restaurant?.phone) ctx.fillText(`📞 ${restaurant.phone}`, width / 2, contactY);
      if (restaurant?.email) ctx.fillText(`✉️ ${restaurant.email}`, width / 2, contactY + 25);
      const addr = typeof restaurant?.address === "string" ? restaurant.address : (restaurant?.location?.address || "");
      if (addr) ctx.fillText(`📍 ${addr.substring(0, 40)}${addr.length > 40 ? "…" : ""}`, width / 2, contactY + 50);

      ctx.fillStyle = template.colors.fg;
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillText("Powered by ScanBit", width / 2, height - 30);

      const link = document.createElement("a");
      link.download = `${restaurant?.name || "business"}-${template.name.replace(/\s+/g, "-").toLowerCase()}-template.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success(`Template "${template.name}" downloaded!`);
      URL.revokeObjectURL(url);
    };
    qrImg.onerror = () => {
      toast.error("Failed to generate template image.");
      URL.revokeObjectURL(url);
    };
    qrImg.src = url;
  };

  const qrValue = menuUrl || (restaurant?._id || restaurant?.id 
    ? `${window.location.origin}/menu/${restaurant._id || restaurant.id}` 
    : '');
  const shareUrl = customShareUrl ?? qrValue;
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getBusinessIcon = () => {
    if (businessType === 'retail') return <MdShoppingBag className="w-5 h-5" />;
    if (businessType === 'agency') return <MdBrush className="w-5 h-5" />;
    if (businessType === 'creative') return <MdBrush className="w-5 h-5" />;
    if (businessType === 'professional') return <MdWork className="w-5 h-5" />;
    return <MdRestaurantMenu className="w-5 h-5" />;
  };

  return (
    <div className="space-y-4 sm:space-y-6 mt-2 sm:mt-6 md:mt-20 pb-4 min-w-0 overflow-x-hidden">
      {/* Header — mobile-optimized */}
      <div className="bg-card rounded-xl sm:rounded-2xl border border-border shadow-card p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
              <MdQrCode className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-lg sm:text-2xl font-bold">QR Code Manager</h1>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-0.5">
                Your unique professional QR code. Auto-updates with your content.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => setShowShareDialog(true)} className="w-full sm:w-auto justify-center touch-manipulation min-h-[44px]">
              <FiShare2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button asChild className="w-full sm:w-auto justify-center touch-manipulation min-h-[44px]">
              <Link
                to={
                  (() => {
                    const id = restaurant?._id || restaurant?.id || "";
                    const cat = (restaurant?.businessCategory || restaurant?.businessType || "").toLowerCase();
                    const isCreative = cat.includes("creative") || cat.includes("design");
                    const isPortfolio = cat.includes("portfolio") || cat.includes("professional");
                    return isCreative ? `/catalogue/${id}` : isPortfolio ? `/portfolio/${id}` : `/menu/${id}`;
                  })()
                }
                target="_blank"
                className="flex items-center justify-center w-full"
              >
                <FiEye className="w-4 h-4 mr-2" />
                {getPreviewText(restaurant?.businessCategory, restaurant?.businessType)}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        {/* QR Code Preview — mobile padding */}
        <div className="bg-card rounded-xl sm:rounded-2xl border border-border shadow-card p-4 sm:p-6 md:p-8 min-w-0">
          <h2 className="font-display text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-6 text-center">Your QR Code</h2>
          
          <div 
            ref={qrRef}
            className="relative mx-auto rounded-xl sm:rounded-2xl p-3 sm:p-6 flex items-center justify-center mb-3 sm:mb-6 shadow-lg transition-all max-w-full"
            style={{ 
              width: Math.min(qrCustomization.size + 48, 304),
              height: Math.min(qrCustomization.size + 48, 304),
              backgroundColor: qrCustomization.bgColor,
            }}
          >
            <QRCodeSVG
              id="qr-code-svg"
              value={qrValue}
              size={Math.min(qrCustomization.size, 256)}
              level={qrCustomization.level}
              includeMargin={qrCustomization.includeMargin}
              marginSize={qrCustomization.marginSize}
              fgColor={qrCustomization.fgColor}
              bgColor={qrCustomization.bgColor}
            />
            {qrCustomization.logoEnabled && logo && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    width: `${qrCustomization.logoSize + 16}px`,
                    height: `${qrCustomization.logoSize + 16}px`,
                    backgroundColor: qrCustomization.bgColor,
                  }}
                >
                  <img
                    src={safeImageSrc(logo)}
                    alt="Logo"
                    className="rounded-full object-cover"
                    style={{
                      width: `${qrCustomization.logoSize}px`,
                      height: `${qrCustomization.logoSize}px`,
                    }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* URL Display — QR always uses this (never changes) */}
          <div className="p-3 sm:p-4 bg-secondary rounded-xl mb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  QR Code URL (never changes)
                </p>
                <p className="text-xs sm:text-sm text-foreground break-all font-mono line-clamp-2">{qrValue || 'Loading...'}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={copyToClipboard} className="flex-shrink-0 min-w-[44px] min-h-[44px] touch-manipulation">
                {copied ? <FiCheck className="w-4 h-4 text-green-500" /> : <FiCopy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Custom Link — optional vanity URL for sharing (transform for iOS Safari render fix) */}
          <div className="p-3 sm:p-4 bg-secondary rounded-xl mb-4 space-y-3" style={{ transform: 'translateZ(0)' }}>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Custom Link (optional)</p>
              <p className="text-xs text-muted-foreground mb-2">
                Create a memorable link for sharing. QR code stays the same.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="e.g. my-restaurant"
                value={customSlugInput}
                onChange={(e) => {
                  setCustomSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  setSlugCheckStatus("idle");
                }}
                className="flex-1 min-w-[120px] font-mono text-sm"
              />
              <Button variant="outline" size="sm" onClick={generateRandomSlug} className="shrink-0">
                Random
              </Button>
              <Button variant="outline" size="sm" onClick={handleCheckSlug} disabled={slugCheckStatus === "checking"}>
                {slugCheckStatus === "checking" ? "Checking..." : "Check"}
              </Button>
              <Button
                size="sm"
                onClick={handleSaveCustomSlug}
                disabled={savingSlug || (customSlugInput.trim() && (slugCheckStatus === "taken" || slugCheckStatus === "invalid"))}
              >
                {savingSlug ? "Saving..." : "Save"}
              </Button>
            </div>
            {slugCheckStatus === "available" && (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <FiCheck className="w-3.5 h-3.5" /> Available
              </p>
            )}
            {slugCheckStatus === "taken" && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <FiAlertCircle className="w-3.5 h-3.5" /> Link already taken
              </p>
            )}
            {slugCheckStatus === "invalid" && (
              <p className="text-xs text-destructive">3–50 chars, lowercase, letters/numbers/hyphens only</p>
            )}
            {customShareUrl && (
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                <p className="text-xs sm:text-sm text-foreground break-all font-mono flex-1 min-w-0">{customShareUrl}</p>
                <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(customShareUrl); toast.success("Custom link copied!"); }} className="flex-shrink-0">
                  <FiCopy className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Download Options — stack on mobile, full-width touch targets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button onClick={() => handleDownloadQR('png')} className="gap-2 w-full sm:w-auto justify-center min-h-[44px] touch-manipulation">
              <FiDownload className="w-4 h-4" />
              PNG
            </Button>
            <Button variant="outline" onClick={() => handleDownloadQR('svg')} className="w-full sm:w-auto justify-center min-h-[44px] touch-manipulation">
              <FiDownload className="w-4 h-4 mr-1" />
              SVG
            </Button>
            <Button variant="outline" onClick={() => handleDownloadQR('png')} className="w-full sm:w-auto justify-center min-h-[44px] touch-manipulation">
              <FiDownload className="w-4 h-4 mr-1" />
              Print
            </Button>
          </div>

          {/* Smart QR Info */}
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground text-center">
              ⚡ <strong>Smart QR:</strong> Auto-updates when you modify your content. No regeneration needed!
            </p>
          </div>
        </div>

        {/* Customization Panel — mobile padding */}
        <div className="bg-card rounded-xl sm:rounded-2xl border border-border shadow-card p-4 sm:p-6 min-w-0">
          {/* Tabs — scrollable on mobile */}
          <div className="flex gap-1 mb-4 sm:mb-6 p-1 bg-secondary rounded-lg overflow-x-auto scrollbar-hide -mx-1">
            {['basic', 'templates', 'advanced'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 min-w-[80px] sm:min-w-0 px-3 sm:px-4 py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-[0.98] ${
                  activeTab === tab 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-x-hidden">
                <div>
                  <Label>QR Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={qrCustomization.fgColor}
                      onChange={(e) => setQrCustomization({ ...qrCustomization, fgColor: e.target.value })}
                      className="h-10 w-16"
                    />
                    <Input
                      type="text"
                      value={qrCustomization.fgColor}
                      onChange={(e) => setQrCustomization({ ...qrCustomization, fgColor: e.target.value })}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label>Background</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={qrCustomization.bgColor}
                      onChange={(e) => setQrCustomization({ ...qrCustomization, bgColor: e.target.value })}
                      className="h-10 w-16"
                    />
                    <Input
                      type="text"
                      value={qrCustomization.bgColor}
                      onChange={(e) => setQrCustomization({ ...qrCustomization, bgColor: e.target.value })}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Size: {qrCustomization.size}px</Label>
                <Input
                  type="range"
                  min="150"
                  max="400"
                  value={qrCustomization.size}
                  onChange={(e) => setQrCustomization({ ...qrCustomization, size: parseInt(e.target.value) })}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <Label>Show Logo</Label>
                  <p className="text-xs text-muted-foreground">Display your logo in the center</p>
                </div>
                <Switch
                  checked={qrCustomization.logoEnabled}
                  onCheckedChange={(checked) => setQrCustomization({ ...qrCustomization, logoEnabled: checked })}
                />
              </div>

              {qrCustomization.logoEnabled && (
                <div>
                  <Label>Logo Size: {qrCustomization.logoSize}px</Label>
                  <Input
                    type="range"
                    min="30"
                    max="80"
                    value={qrCustomization.logoSize}
                    onChange={(e) => setQrCustomization({ ...qrCustomization, logoSize: parseInt(e.target.value) })}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4 sm:space-y-5">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Professional QR templates</p>
                <p className="text-xs text-muted-foreground">
                  Apply a template to style your QR, or download a printable card.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-[60vh] overflow-y-auto overflow-x-hidden pb-2 pr-1">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={cn(
                      "rounded-2xl border-2 overflow-hidden transition-all",
                      selectedTemplate === template.id
                        ? "border-primary shadow-lg ring-2 ring-primary/20"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    {/* Template preview – background + QR */}
                    <button
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className="w-full text-left block touch-manipulation active:scale-[0.99]"
                    >
                      <div
                        className="relative h-36 sm:h-40 flex items-center justify-center p-3 sm:p-4"
                        style={{ background: template.background }}
                      >
                        <div
                          className="rounded-2xl p-3 shadow-lg flex items-center justify-center"
                          style={{ backgroundColor: template.colors.bg }}
                        >
                          <QRCodeSVG
                            value={qrValue}
                            size={96}
                            level="M"
                            includeMargin={false}
                            fgColor={template.colors.fg}
                            bgColor={template.colors.bg}
                          />
                        </div>
                        {selectedTemplate === template.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <FiCheck className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </button>
                    <div className="p-4 bg-card border-t border-border">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{template.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={selectedTemplate === template.id ? "default" : "outline"}
                          size="sm"
                          className="flex-1 text-xs min-h-[40px] touch-manipulation"
                          onClick={() => applyTemplate(template)}
                        >
                          {selectedTemplate === template.id ? "Applied" : "Use"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1 min-h-[40px] touch-manipulation"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadTemplate(template.id);
                          }}
                        >
                          <FiDownload className="w-3 h-3" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Apply a template first so your main QR uses its colors, then download for a matching printable card.
              </p>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div>
                <Label>Error Correction Level</Label>
                <select
                  value={qrCustomization.level}
                  onChange={(e) => setQrCustomization({ ...qrCustomization, level: e.target.value as any })}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                >
                  <option value="L">Low (~7%) - Smaller QR</option>
                  <option value="M">Medium (~15%) - Balanced</option>
                  <option value="Q">Quartile (~25%) - Better reliability</option>
                  <option value="H">High (~30%) - Best for logos</option>
                </select>
              </div>

              <div>
                <Label>Margin Size: {qrCustomization.marginSize}</Label>
                <Input
                  type="range"
                  min="0"
                  max="10"
                  value={qrCustomization.marginSize}
                  onChange={(e) => setQrCustomization({ ...qrCustomization, marginSize: parseInt(e.target.value) })}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <Label>Include Margin</Label>
                  <p className="text-xs text-muted-foreground">Add white border around QR</p>
                </div>
                <Switch
                  checked={qrCustomization.includeMargin}
                  onCheckedChange={(checked) => setQrCustomization({ ...qrCustomization, includeMargin: checked })}
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  💡 <strong>Tip:</strong> Use "High" error correction when adding a logo for best scan reliability.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md w-[calc(100vw-2rem)] max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share Your QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm font-medium mb-2">{customShareUrl ? "Your Custom Link" : "Your Menu URL"}</p>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="font-mono text-sm" />
                <Button variant="outline" onClick={copyToClipboard}>
                  {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <p className="text-sm font-medium">Share on Social Media</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button variant="outline" className="flex-col h-auto py-3" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank')}>
                <FiGlobe className="w-5 h-5 mb-1 text-green-500" />
                <span className="text-xs">WhatsApp</span>
              </Button>
              <Button variant="outline" className="flex-col h-auto py-3" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}>
                <FiFacebook className="w-5 h-5 mb-1 text-blue-600" />
                <span className="text-xs">Facebook</span>
              </Button>
              <Button variant="outline" className="flex-col h-auto py-3" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank')}>
                <FiTwitter className="w-5 h-5 mb-1 text-sky-500" />
                <span className="text-xs">Twitter</span>
              </Button>
              <Button variant="outline" className="flex-col h-auto py-3" onClick={copyToClipboard}>
                <FiCopy className="w-5 h-5 mb-1" />
                <span className="text-xs">Copy</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QRCode;

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Globe,
  Download,
  FileText,
  Navigation,
  Quote,
  Menu,
  X,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { toast } from "sonner";

function downloadVisitingCard(url: string | null | undefined, name: string) {
  if (!url || !url.trim() || !url.startsWith("http")) {
    toast.error("No visiting card uploaded.");
    return;
  }
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(name || "visiting-card").replace(/[^a-z0-9-_]/gi, "-")}-card.jpg`;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast.success("Download started");
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  samplePortfolioBusinessInfo,
  samplePortfolioPracticeAreas,
  samplePortfolioExperience,
  samplePortfolioTestimonials,
  samplePortfolioProjects,
} from "./sampleData";

export interface PortfolioProject {
  id: string;
  title?: string;
  client?: string;
  year?: string;
  role?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  technologies?: string;
  deliverables?: string;
  outcome?: string;
}

export interface PortfolioDataProps {
  businessInfo?: typeof samplePortfolioBusinessInfo;
  practiceAreas?: typeof samplePortfolioPracticeAreas;
  experience?: typeof samplePortfolioExperience;
  projects?: PortfolioProject[];
  testimonials?: typeof samplePortfolioTestimonials;
  /** Optional CV / resume download link (shown in professional/business mode) */
  resumeUrl?: string;
  /** Optional portfolio gallery images */
  galleryUrls?: string[];
  /** When true, hide \"Get your own profile\" / demo CTAs (used for real-business previews) */
  hideCTAs?: boolean;
  /** Show quick action floating buttons (Call, Email, WhatsApp) */
  showQuickActions?: boolean;
  /** Show social media links in footer */
  showSocialLinks?: boolean;
  /** Visual theme (accent colors) */
  theme?: "orange" | "blue" | "emerald" | "slate";
  /** When set, show "Write a review" in footer and collect name/email/mobile/message/rating */
  portfolioRestaurantId?: string;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी" },
];

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#expertise", label: "Expertise" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
];

const THEMES: Record<
  NonNullable<PortfolioDataProps["theme"]>,
  {
    accentText: string;
    accentTextHover: string;
    groupHoverAccentText: string;
    underlineBg: string;
    heroFrom: string;
    avatarFromTo: string;
    iconSoft: string;
    badgeFromTo: string;
    primaryFromTo: string;
    primaryHoverFromTo: string;
    shadowPrimary30: string;
    shadowPrimary20: string;
    shadowPrimary40: string;
    shadowPrimary50Hover: string;
    borderHover: string;
    borderHoverStrong: string;
    softBg: string;
    softHover: string;
    softActive: string;
  }
> = {
  orange: {
    accentText: "text-orange-600",
    accentTextHover: "hover:text-orange-600",
    groupHoverAccentText: "group-hover:text-orange-600",
    underlineBg: "bg-orange-600",
    heroFrom: "from-orange-50",
    avatarFromTo: "from-orange-100 to-orange-50",
    iconSoft: "text-orange-400/50",
    badgeFromTo: "from-orange-500 to-orange-600",
    primaryFromTo: "from-orange-500 to-orange-600",
    primaryHoverFromTo: "hover:from-orange-600 hover:to-orange-700",
    shadowPrimary30: "shadow-orange-500/30",
    shadowPrimary20: "shadow-orange-500/20",
    shadowPrimary40: "shadow-orange-500/40",
    shadowPrimary50Hover: "hover:shadow-orange-500/50",
    borderHover: "hover:border-orange-300",
    borderHoverStrong: "hover:border-orange-400",
    softBg: "bg-orange-50",
    softHover: "hover:bg-orange-50",
    softActive: "active:bg-orange-100",
  },
  blue: {
    accentText: "text-blue-600",
    accentTextHover: "hover:text-blue-600",
    groupHoverAccentText: "group-hover:text-blue-600",
    underlineBg: "bg-blue-600",
    heroFrom: "from-blue-50",
    avatarFromTo: "from-blue-100 to-blue-50",
    iconSoft: "text-blue-400/50",
    badgeFromTo: "from-blue-500 to-blue-600",
    primaryFromTo: "from-blue-500 to-blue-600",
    primaryHoverFromTo: "hover:from-blue-600 hover:to-blue-700",
    shadowPrimary30: "shadow-blue-500/30",
    shadowPrimary20: "shadow-blue-500/20",
    shadowPrimary40: "shadow-blue-500/40",
    shadowPrimary50Hover: "hover:shadow-blue-500/50",
    borderHover: "hover:border-blue-300",
    borderHoverStrong: "hover:border-blue-400",
    softBg: "bg-blue-50",
    softHover: "hover:bg-blue-50",
    softActive: "active:bg-blue-100",
  },
  emerald: {
    accentText: "text-emerald-600",
    accentTextHover: "hover:text-emerald-600",
    groupHoverAccentText: "group-hover:text-emerald-600",
    underlineBg: "bg-emerald-600",
    heroFrom: "from-emerald-50",
    avatarFromTo: "from-emerald-100 to-emerald-50",
    iconSoft: "text-emerald-400/50",
    badgeFromTo: "from-emerald-500 to-emerald-600",
    primaryFromTo: "from-emerald-500 to-emerald-600",
    primaryHoverFromTo: "hover:from-emerald-600 hover:to-emerald-700",
    shadowPrimary30: "shadow-emerald-500/30",
    shadowPrimary20: "shadow-emerald-500/20",
    shadowPrimary40: "shadow-emerald-500/40",
    shadowPrimary50Hover: "hover:shadow-emerald-500/50",
    borderHover: "hover:border-emerald-300",
    borderHoverStrong: "hover:border-emerald-400",
    softBg: "bg-emerald-50",
    softHover: "hover:bg-emerald-50",
    softActive: "active:bg-emerald-100",
  },
  slate: {
    accentText: "text-slate-700",
    accentTextHover: "hover:text-slate-900",
    groupHoverAccentText: "group-hover:text-slate-900",
    underlineBg: "bg-slate-700",
    heroFrom: "from-slate-50",
    avatarFromTo: "from-slate-200 to-slate-100",
    iconSoft: "text-slate-400/70",
    badgeFromTo: "from-slate-700 to-slate-900",
    primaryFromTo: "from-slate-700 to-slate-900",
    primaryHoverFromTo: "hover:from-slate-800 hover:to-slate-950",
    shadowPrimary30: "shadow-slate-500/30",
    shadowPrimary20: "shadow-slate-500/20",
    shadowPrimary40: "shadow-slate-500/40",
    shadowPrimary50Hover: "hover:shadow-slate-500/50",
    borderHover: "hover:border-slate-300",
    borderHoverStrong: "hover:border-slate-400",
    softBg: "bg-slate-50",
    softHover: "hover:bg-slate-50",
    softActive: "active:bg-slate-100",
  },
};

function whatsAppUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export function DemoPortfolioPreview(props: PortfolioDataProps = {}) {
  const {
    businessInfo: propBusinessInfo,
    practiceAreas: propPracticeAreas,
    experience: propExperience,
    projects: propProjects,
    testimonials: propTestimonials,
    resumeUrl,
    galleryUrls,
    hideCTAs = false,
    showQuickActions = true,
    showSocialLinks = true,
    theme = "orange",
    portfolioRestaurantId,
  } = props;
  const themeKey = theme && THEMES[theme as keyof typeof THEMES] ? theme : "orange";
  const t = THEMES[themeKey];
  const businessInfo = propBusinessInfo ?? samplePortfolioBusinessInfo;
  const practiceAreas = propPracticeAreas ?? samplePortfolioPracticeAreas;
  const experience = propExperience ?? samplePortfolioExperience;
  const projects = propProjects ?? samplePortfolioProjects;
  const testimonials = propTestimonials ?? samplePortfolioTestimonials;

  const [language, setLanguage] = useState("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<number | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    email: "",
    mobile: "",
    message: "",
    rating: 0,
  });

  const handleSubmitReview = async () => {
    if (!portfolioRestaurantId) return;
    const { name, email, mobile, message, rating } = reviewForm;
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a rating (1–5 stars)");
      return;
    }
    setReviewSubmitting(true);
    try {
      await api.submitReview(portfolioRestaurantId, {
        reviewerName: name.trim(),
        reviewerEmail: email.trim().toLowerCase(),
        reviewerMobile: mobile.trim() || undefined,
        comment: message.trim() || "—",
        rating,
      });
      toast.success("Thank you! Your review has been submitted.");
      setShowReviewModal(false);
      setReviewForm({ name: "", email: "", mobile: "", message: "", rating: 0 });
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessInfo.mapQuery || "")}`;
  const { phone, email, whatsapp } = businessInfo;
  const initialLetters = initials(businessInfo.name);
  const avatarImage = businessInfo.profileImageUrl;
  const isBusinessMode = hideCTAs || !!resumeUrl;
  const gallery = galleryUrls || [];
  
  const openGalleryImage = (index: number) => setSelectedGalleryImage(index);
  const closeGalleryImage = () => setSelectedGalleryImage(null);
  const nextGalleryImage = () => {
    if (selectedGalleryImage !== null && gallery.length > 0) {
      setSelectedGalleryImage((selectedGalleryImage + 1) % gallery.length);
    }
  };
  const prevGalleryImage = () => {
    if (selectedGalleryImage !== null && gallery.length > 0) {
      setSelectedGalleryImage((selectedGalleryImage - 1 + gallery.length) % gallery.length);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col w-full pb-20 md:pb-0">
      {/* Header — modern glassmorphism */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 sm:gap-8 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden ring-2 ring-slate-200">
              {avatarImage ? (
                <img
                  src={avatarImage}
                  alt={businessInfo.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className={`${t.accentText} font-bold text-sm sm:text-base`}>
                  {initialLetters}
                </span>
              )}
            </div>
            <nav className="hidden sm:flex items-center gap-6">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className={`text-sm font-semibold text-slate-600 ${t.accentTextHover} transition-colors relative group`}
                >
                  {label}
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${t.underlineBg} group-hover:w-full transition-all duration-300`} />
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {!isBusinessMode && (
              <>
                <Globe className="w-4 h-4 text-muted-foreground hidden sm:block" aria-hidden />
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[90px] sm:w-[120px] h-9 text-xs sm:text-sm border-border bg-muted/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            {isBusinessMode && resumeUrl && (
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs sm:text-sm border-border"
                asChild
              >
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CV</span>
                </a>
              </Button>
            )}
            <button
              type="button"
              className="sm:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center -mr-1"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        {menuOpen && (
          <nav className="sm:hidden border-t border-border bg-card/98 backdrop-blur px-4 py-4 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="py-3 px-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* Hero / About — modern gradient background */}
      <section id="about" className={`relative bg-gradient-to-br ${t.heroFrom} via-white to-slate-50 border-b border-slate-200/50 px-4 sm:px-6 py-12 sm:py-16 md:py-20 overflow-hidden`}>
        <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            <div className={`w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-4 border-white bg-gradient-to-br ${t.avatarFromTo} flex-shrink-0 shadow-2xl ${t.shadowPrimary20} ring-1 ring-slate-200`}>
              {businessInfo.profileImageUrl ? (
                <img
                  src={businessInfo.profileImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Award className={`w-20 h-20 ${t.iconSoft}`} />
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left min-w-0">
              <div className="inline-block mb-4">
                <span className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${t.badgeFromTo} text-white text-xs font-bold uppercase tracking-wider shadow-lg`}>
                  Professional
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent tracking-tight leading-tight mb-2">
                {businessInfo.name || "Your name"}
              </h1>
              <p className={`${t.accentText} font-bold text-base sm:text-lg mt-2`}>
                {businessInfo.title || "Your title"}
              </p>
              <p className="text-slate-600 mt-4 text-sm sm:text-base max-w-2xl mx-auto md:mx-0 leading-relaxed font-medium">
                {businessInfo.tagline}
              </p>
              <p className="text-slate-500 mt-4 text-sm leading-relaxed max-w-2xl mx-auto md:mx-0">
                {businessInfo.bio}
              </p>
              {!hideCTAs && (
                <>
                  <p className="text-xs text-slate-400 mt-6 max-w-xl mx-auto md:mx-0">
                    Suits legal & law firms • Consultants • Coaches & advisors • B2B & professional services
                  </p>
                  <Button size="lg" className={`mt-6 bg-gradient-to-r ${t.primaryFromTo} ${t.primaryHoverFromTo} text-white font-bold shadow-xl ${t.shadowPrimary30} h-12 px-8 rounded-full`} asChild>
                    <Link to="/register">Get your own profile →</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Practice areas / Expertise — modern cards (only show if data exists) */}
      {practiceAreas.length > 0 && (
      <section id="expertise" className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight mb-3">
              Expertise & practice areas
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
              Core areas of practice — for legal, consulting, coaching, and B2B professionals.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {practiceAreas.map((area, idx) => (
              <Card key={area.id || `area-${idx}`} className={`group border border-slate-200 ${t.borderHover} hover:shadow-2xl transition-all duration-300 bg-white hover:-translate-y-1`}>
                <CardContent className="p-5 sm:p-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.primaryFromTo} flex items-center justify-center mb-4 shadow-lg ${t.shadowPrimary30} group-hover:scale-110 transition-transform duration-300`}>
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`font-bold text-slate-900 text-base sm:text-lg mb-2 ${t.groupHoverAccentText} transition-colors`}>{area.name || '—'}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {area.description || ''}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Selected work / Experience — modern timeline (only show if data exists) */}
      {experience.length > 0 && (
      <section id="experience" className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 bg-gradient-to-br from-slate-50 to-white border-t border-slate-200/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight mb-3">
              Selected work & experience
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
              Representative engagements and outcomes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {experience.map((item, idx) => (
              <Card key={item.id || `exp-${idx}`} className={`group border border-slate-200 ${t.borderHover} hover:shadow-xl transition-all duration-300 bg-white overflow-hidden`}>
                <CardContent className="p-5 sm:p-6 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.primaryFromTo} flex items-center justify-center flex-shrink-0 shadow-lg ${t.shadowPrimary20} group-hover:scale-110 transition-transform duration-300`}>
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold ${t.accentText} uppercase tracking-wider px-2 py-1 ${t.softBg} rounded-md`}>{item.category || '—'}</span>
                      <span className="text-[10px] text-slate-500 font-medium">• {item.year || '—'}</span>
                    </div>
                    <h3 className={`font-bold text-slate-900 text-base sm:text-lg mb-1.5 ${t.accentTextHover} transition-colors`}>{item.title || '—'}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.summary || ''}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Projects — optional professional projects */}
      {projects.length > 0 && (
      <section id="projects" className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 bg-white border-t border-slate-200/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight mb-3">
              Projects
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
              Selected projects and case studies.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {projects.map((proj, idx) => (
              <Card key={proj.id || `proj-${idx}`} className={`group border border-slate-200 ${t.borderHover} hover:shadow-xl transition-all duration-300 bg-white overflow-hidden`}>
                <CardContent className="p-5 sm:p-6">
                  {(proj.imageUrl || proj.url) && (
                    <div className="aspect-video rounded-xl bg-slate-100 mb-4 overflow-hidden">
                      {proj.imageUrl ? (
                        <img src={proj.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : proj.url ? (
                        <a href={proj.url.startsWith("http") ? proj.url : `https://${proj.url}`} target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 hover:bg-slate-300 transition-colors">
                          <ExternalLink className="w-10 h-10" />
                        </a>
                      ) : null}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    {proj.year && <span className="text-[10px] font-semibold text-slate-500">{proj.year}</span>}
                    {proj.client && <span className="text-[10px] text-slate-400">• {proj.client}</span>}
                  </div>
                  {proj.title && <h3 className={`font-bold text-slate-900 text-base sm:text-lg mb-1.5 ${t.accentTextHover} transition-colors`}>{proj.title}</h3>}
                  {proj.role && <p className="text-xs text-slate-500 mb-2">{proj.role}</p>}
                  {proj.description && <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{proj.description}</p>}
                  {proj.outcome && <p className="text-xs font-medium text-slate-700 mt-2 pt-2 border-t border-slate-100">Outcome: {proj.outcome}</p>}
                  {proj.url && (
                    <a href={proj.url.startsWith("http") ? proj.url : `https://${proj.url}`} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 mt-3 text-xs font-semibold ${t.accentText}`}>
                      View project <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Portfolio gallery — modern masonry-style layout with lightbox */}
      {gallery.length > 0 && (
        <section id="gallery" className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 bg-gradient-to-br from-slate-50 to-white border-t border-slate-200/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight mb-3">
                Portfolio gallery
              </h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
                Selected work and projects — click any image to view full size.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {gallery.map((url, index) => (
                <button
                  key={url + index}
                  type="button"
                  onClick={() => openGalleryImage(index)}
                  className={`group relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-white ${t.borderHoverStrong} hover:shadow-2xl ${t.shadowPrimary20} transition-all duration-300 cursor-pointer`}
                >
                  <div className="aspect-[4/3] w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={url}
                      alt={`Portfolio item ${index + 1}`}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl">
                    <svg className={`w-4 h-4 ${t.accentText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery lightbox modal */}
      <Dialog open={selectedGalleryImage !== null} onOpenChange={(open) => !open && closeGalleryImage()}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-black/95 border-0">
          <div className="relative flex items-center justify-center min-h-[50vh]">
            {selectedGalleryImage !== null && gallery[selectedGalleryImage] && (
              <>
                <img
                  src={gallery[selectedGalleryImage]}
                  alt={`Portfolio item ${selectedGalleryImage + 1}`}
                  className="max-w-full max-h-[90vh] object-contain"
                />
                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevGalleryImage}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-lg transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={nextGalleryImage}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-lg transition-all"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/90 text-black text-xs font-medium">
                      {selectedGalleryImage + 1} / {gallery.length}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Testimonials — modern quotes */}
      {testimonials.length > 0 && (
        <section className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 border-t border-slate-200/50 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight mb-3">
                What clients say
              </h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
                Testimonials from successful engagements.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className={`group border border-slate-200 ${t.borderHover} bg-gradient-to-br from-white to-slate-50/30 hover:shadow-xl transition-all duration-300`}>
                  <CardContent className="p-6 sm:p-7">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.primaryFromTo} flex items-center justify-center mb-4 shadow-lg ${t.shadowPrimary30}`}>
                      <Quote className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic mb-4">&ldquo;{testimonial.quote || ''}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-slate-700">{((testimonial.author || '?').split(' ').map(w => w[0]).join('').slice(0, 2)) || '?'}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{testimonial.author || 'Anonymous'}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{testimonial.role || ''}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer — modern dark gradient with contact details */}
      <footer id="contact" className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mt-auto md:pl-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.1))]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-2xl overflow-hidden ring-2 ring-white/20">
                  {avatarImage ? (
                    <img
                      src={avatarImage}
                      alt={businessInfo.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className={`${t.accentText} font-bold text-xl`}>
                      {initialLetters}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-xl">{businessInfo.name}</h3>
                  <p className="text-sm text-white/70 mt-1">{businessInfo.title}</p>
                </div>
              </div>
              <ul className="space-y-4 text-sm text-white/80">
                {businessInfo.address && (
                  <li className="flex items-start gap-3 group">
                    <MapPin className={`w-5 h-5 ${t.iconSoft} flex-shrink-0 mt-0.5`} />
                    <span className="break-words group-hover:text-white transition-colors">{businessInfo.address}</span>
                  </li>
                )}
                {businessInfo.phone && (
                  <li className="flex items-center gap-3 group">
                    <Phone className={`w-5 h-5 ${t.iconSoft} flex-shrink-0`} />
                    <a href={`tel:${businessInfo.phone}`} className="hover:text-white transition-colors break-all font-medium">
                      {businessInfo.phone}
                    </a>
                  </li>
                )}
                {businessInfo.email && (
                  <li className="flex items-center gap-3 group">
                    <Mail className={`w-5 h-5 ${t.iconSoft} flex-shrink-0`} />
                    <a href={`mailto:${businessInfo.email}`} className="hover:text-white transition-colors break-all font-medium">
                      {businessInfo.email}
                    </a>
                  </li>
                )}
                {businessInfo.website && (
                  <li className="flex items-center gap-3 group">
                    <Globe className={`w-5 h-5 ${t.iconSoft} flex-shrink-0`} />
                    <a
                      href={businessInfo.website.startsWith("http") ? businessInfo.website : `https://${businessInfo.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors break-all font-medium"
                    >
                      {businessInfo.website}
                    </a>
                  </li>
                )}
              </ul>
              {!hideCTAs && (
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button size="sm" className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-10 gap-2" asChild>
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                      <Navigation className="w-4 h-4" />
                      Get directions
                    </a>
                  </Button>
                  <Button size="sm" className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-10 gap-2" onClick={() => downloadVisitingCard((businessInfo as any).businessCardFront, businessInfo.name)}>
                    <Download className="w-4 h-4" />
                    Download visiting card
                  </Button>
                  <Button size="sm" className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-10 gap-2" asChild>
                    <Link to="/register" className="gap-2">
                      <FileText className="w-4 h-4" />
                      Download brochure
                    </Link>
                  </Button>
                </div>
              )}
              {hideCTAs && (businessInfo.mapQuery || (businessInfo as any).businessCardFront) && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {businessInfo.mapQuery && (
                    <Button size="sm" className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-10 gap-2" asChild>
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                        <Navigation className="w-4 h-4" />
                        Get directions
                      </a>
                    </Button>
                  )}
                  {(businessInfo as any).businessCardFront && (
                    <Button size="sm" className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-10 gap-2" onClick={() => downloadVisitingCard((businessInfo as any).businessCardFront, businessInfo.name)}>
                      <Download className="w-4 h-4" />
                      Download visiting card
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="lg:col-span-7">
              <div className="rounded-xl overflow-hidden border border-background/20 bg-background/5 h-64 sm:h-72 lg:h-80 relative">
                {businessInfo.mapEmbedUrl ? (
                  <iframe
                    title="Professional portfolio location map"
                    src={businessInfo.mapEmbedUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                    <MapPin className="w-12 h-12 text-background/50" />
                    <p className="text-background/60 text-sm text-center max-w-xs">Map unavailable</p>
                    <Button size="sm" variant="outline" className="border-background/30 text-background/90" asChild>
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                        <Navigation className="w-4 h-4" />
                        Open in Google Maps
                      </a>
                    </Button>
                  </div>
                )}
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1.5 rounded-md bg-background/90 px-2.5 py-1.5 text-xs font-medium text-background hover:bg-background hover:text-foreground transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-background/20 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-background/80 mb-1">
                  {businessInfo.name || "Portfolio"}
                </p>
                <p className="text-xs text-background/60">
                  © {new Date().getFullYear()} All rights reserved.
                </p>
              </div>
              {showSocialLinks && (businessInfo.website || businessInfo.socialMedia?.facebook || businessInfo.socialMedia?.instagram || businessInfo.socialMedia?.twitter || businessInfo.socialMedia?.linkedin) && (
              <div className="flex items-center gap-4">
                {businessInfo.website && (
                <a
                  href={businessInfo.website.startsWith("http") ? businessInfo.website : `https://${businessInfo.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/70 hover:text-background transition-colors"
                  aria-label="Website"
                >
                  <Globe className="w-5 h-5" />
                </a>
                )}
                {businessInfo.socialMedia?.facebook && (
                <a
                  href={businessInfo.socialMedia.facebook.startsWith("http") ? businessInfo.socialMedia.facebook : `https://facebook.com/${businessInfo.socialMedia.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/70 hover:text-background transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                )}
                {businessInfo.socialMedia?.instagram && (
                <a
                  href={businessInfo.socialMedia.instagram.startsWith("http") ? businessInfo.socialMedia.instagram : `https://instagram.com/${businessInfo.socialMedia.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/70 hover:text-background transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                )}
                {businessInfo.socialMedia?.linkedin && (
                <a
                  href={businessInfo.socialMedia.linkedin.startsWith("http") ? businessInfo.socialMedia.linkedin : `https://linkedin.com/in/${businessInfo.socialMedia.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/70 hover:text-background transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                )}
                {businessInfo.socialMedia?.twitter && (
                <a
                  href={businessInfo.socialMedia.twitter.startsWith("http") ? businessInfo.socialMedia.twitter : `https://twitter.com/${businessInfo.socialMedia.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/70 hover:text-background transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                )}
              </div>
              )}
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-white/40 flex items-center gap-1.5">
                Powered by <span className="font-bold text-white/60 bg-white/5 px-2 py-1 rounded">ScanBit</span>
              </span>
              {hideCTAs && portfolioRestaurantId && (
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to={`/menu/${portfolioRestaurantId}/reviews`}
                    className="text-sm font-medium text-white/80 hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <Star className="w-4 h-4" />
                    View reviews
                  </Link>
                  <Button
                    size="sm"
                    className={`bg-white/15 hover:bg-white/25 text-white border border-white/30 h-9 gap-2 rounded-full font-semibold`}
                    onClick={() => setShowReviewModal(true)}
                  >
                    <Star className="w-4 h-4" />
                    Write a review
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Review modal — name, email, mobile, message, rating */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className={`w-5 h-5 ${t.accentText}`} />
              Write a review
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Your feedback helps others and helps us improve. All fields except message are required.
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="review-name">Name *</Label>
              <Input
                id="review-name"
                value={reviewForm.name}
                onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                disabled={reviewSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-email">Email *</Label>
              <Input
                id="review-email"
                type="email"
                value={reviewForm.email}
                onChange={(e) => setReviewForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                disabled={reviewSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-mobile">Mobile (optional)</Label>
              <Input
                id="review-mobile"
                type="tel"
                value={reviewForm.mobile}
                onChange={(e) => setReviewForm((f) => ({ ...f, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                placeholder="10-digit number"
                maxLength={10}
                disabled={reviewSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                    disabled={reviewSubmitting}
                    className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary"
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        reviewForm.rating >= star ? "fill-amber-400 text-amber-400" : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-message">Message (optional)</Label>
              <Textarea
                id="review-message"
                value={reviewForm.message}
                onChange={(e) => setReviewForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Share your experience..."
                rows={3}
                className="resize-none"
                disabled={reviewSubmitting}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                className={`flex-1 ${t.primaryFromTo} text-white border-0`}
                onClick={handleSubmitReview}
                disabled={reviewSubmitting}
              >
                {reviewSubmitting ? "Submitting…" : "Submit review"}
              </Button>
              <Button variant="outline" onClick={() => setShowReviewModal(false)} disabled={reviewSubmitting}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Desktop: floating contact icons (left) — modern design */}
      {showQuickActions && (
      <div className="hidden md:flex fixed bottom-8 left-6 z-30 flex-col gap-3" aria-label="Quick contact">
        {phone && (
        <a
          href={`tel:${phone}`}
          className={`group flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${t.primaryFromTo} text-white shadow-xl ${t.shadowPrimary40} hover:shadow-2xl ${t.shadowPrimary50Hover} hover:scale-110 active:scale-95 transition-all duration-300`}
          aria-label="Call"
        >
          <Phone className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </a>
        )}
        {email && (
        <a
          href={`mailto:${email}`}
          className={`group flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${t.primaryFromTo} text-white shadow-xl ${t.shadowPrimary40} hover:shadow-2xl ${t.shadowPrimary50Hover} hover:scale-110 active:scale-95 transition-all duration-300`}
          aria-label="Email"
        >
          <Mail className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </a>
        )}
        {whatsapp && (
        <a
          href={whatsAppUrl(whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center w-14 h-14 rounded-2xl bg-[#25D366] text-white shadow-xl shadow-green-500/40 hover:shadow-2xl hover:shadow-green-500/50 hover:scale-110 active:scale-95 transition-all duration-300"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </a>
        )}
        {resumeUrl && (
        <a
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center w-14 h-14 rounded-2xl bg-white text-slate-900 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border border-slate-200"
          aria-label="Download CV"
        >
          <Download className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </a>
        )}
      </div>
      )}

      {/* Mobile: bottom bar — modern design with gradients */}
      {showQuickActions && (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-2xl border-t border-slate-200/50 shadow-2xl pt-2 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]" aria-label="Quick contact">
        <div className="max-w-lg mx-auto flex items-center justify-around gap-1">
          {phone && (
          <a
            href={`tel:${phone}`}
            className={`flex flex-col items-center justify-center gap-1.5 py-2 px-3 rounded-2xl min-w-[72px] min-h-[64px] touch-manipulation ${t.softHover} ${t.softActive} transition-all group`}
            aria-label="Call"
          >
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${t.primaryFromTo} flex items-center justify-center text-white shadow-lg ${t.shadowPrimary30} group-hover:scale-110 transition-transform`}>
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-700">Call</span>
          </a>
          )}
          {email && (
          <a
            href={`mailto:${email}`}
            className={`flex flex-col items-center justify-center gap-1.5 py-2 px-3 rounded-2xl min-w-[72px] min-h-[64px] touch-manipulation ${t.softHover} ${t.softActive} transition-all group`}
            aria-label="Email"
          >
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${t.primaryFromTo} flex items-center justify-center text-white shadow-lg ${t.shadowPrimary30} group-hover:scale-110 transition-transform`}>
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-700">Email</span>
          </a>
          )}
          {whatsapp && (
          <a
            href={whatsAppUrl(whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-3 rounded-2xl min-w-[72px] min-h-[64px] touch-manipulation hover:bg-green-50 active:bg-green-100 transition-all group"
            aria-label="WhatsApp"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-700">WhatsApp</span>
          </a>
          )}
          {resumeUrl && (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center justify-center gap-1.5 py-2 px-3 rounded-2xl min-w-[72px] min-h-[64px] touch-manipulation ${t.softHover} ${t.softActive} transition-all group`}
            aria-label="Download CV"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-500/30 group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-700">CV</span>
          </a>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

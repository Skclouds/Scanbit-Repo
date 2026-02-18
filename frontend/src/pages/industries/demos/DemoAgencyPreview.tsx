import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Palette,
  MapPin,
  Phone,
  Mail,
  Download,
  FileText,
  Navigation,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
  Star,
  Menu,
  Briefcase,
  ImageIcon,
  Layers,
  Contact,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { sampleAgencyProjects, sampleAgencyBusinessInfo, sampleAgencyGallery } from "./sampleData";
import { safeImageSrc } from "@/lib/imageUtils";
import { toast } from "sonner";

function downloadVisitingCard(url: string | null | undefined, businessName: string) {
  if (!url || !url.trim() || !url.startsWith("http")) {
    toast.error("No visiting card uploaded.");
    return;
  }
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(businessName || "visiting-card").replace(/[^a-z0-9-_]/gi, "-")}-card.jpg`;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast.success("Download started");
}

export type AgencyBusinessInfo = {
  name: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  whatsapp?: string;
  mapQuery?: string;
  heroImageUrl?: string | null;
  heroBackgroundUrl?: string | null;
  mapEmbedUrl?: string | null;
  logoUrl?: string | null;
  /** Uploaded visiting card image — download when user clicks "Download visiting card" */
  businessCardFront?: string | null;
  socialMedia?: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string };
};

export type AgencyProject = { id: string; title: string; tag: string; result: string; imageUrl?: string };
export type AgencyGalleryItem = { id: string; imageUrl: string; title: string; category: string };

export interface DemoAgencyPreviewProps {
  businessInfo?: AgencyBusinessInfo | null;
  projects?: AgencyProject[];
  gallery?: AgencyGalleryItem[];
  services?: string[];
  hideCTAs?: boolean;
  portfolioRestaurantId?: string;
}

export function DemoAgencyPreview(props: DemoAgencyPreviewProps = {}) {
  const { businessInfo: propBusinessInfo, projects: propProjects, gallery: propGallery, services: propServices, hideCTAs, portfolioRestaurantId } = props;
  const businessInfo = propBusinessInfo ?? sampleAgencyBusinessInfo;
  const projects = hideCTAs ? (Array.isArray(propProjects) ? propProjects : []) : (Array.isArray(propProjects) && propProjects.length > 0 ? propProjects : sampleAgencyProjects);
  const gallery = hideCTAs ? (Array.isArray(propGallery) ? propGallery : []) : (Array.isArray(propGallery) && propGallery.length > 0 ? propGallery : sampleAgencyGallery);
  const services = hideCTAs ? (Array.isArray(propServices) ? propServices : []) : (Array.isArray(propServices) && propServices.length > 0 ? propServices : ["Branding", "Digital", "Social", "Campaigns", "Content", "UI/UX"]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const logoUrl = businessInfo.logoUrl ?? undefined;
  const social = businessInfo.socialMedia ?? {};
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessInfo.mapQuery || businessInfo.name || "")}`;

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : i === 0 ? gallery.length - 1 : i - 1));
  }, [gallery.length]);
  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % gallery.length));
  }, [gallery.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, goPrev, goNext]);

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* Top bar: logo, business name (mobile), nav / menu */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-8 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-soft bg-primary/10 flex items-center justify-center border border-border">
              {logoUrl ? (
                <img src={safeImageSrc(logoUrl)} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-sm sm:text-base">{(businessInfo.name || "A").slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <span className="sm:hidden font-semibold text-foreground truncate text-sm">
              {businessInfo.name || "Portfolio"}
            </span>
            <nav className="hidden sm:flex items-center gap-6">
              <a href="#work" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Work
              </a>
              <a href="#gallery" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Gallery
              </a>
              <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Services
              </a>
              {portfolioRestaurantId && (
                <Link to={`/portfolio/${portfolioRestaurantId}/reviews`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Reviews
                </Link>
              )}
              <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </nav>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden flex-shrink-0 rounded-xl border border-border/80 hover:bg-muted/80"
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Mobile nav sheet */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="right" className="w-[280px] sm:max-w-[320px] flex flex-col">
          <SheetHeader className="text-left border-b border-border pb-4">
            <SheetTitle className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-primary/10 border border-border">
                {logoUrl ? (
                  <img src={safeImageSrc(logoUrl)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-primary font-bold text-xs">{(businessInfo.name || "A").slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <span className="truncate">{businessInfo.name || "Menu"}</span>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 pt-4">
            <a href="#work" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors" onClick={() => setMobileNavOpen(false)}>
              <Briefcase className="h-4 w-4 text-muted-foreground" /> Work
            </a>
            <a href="#gallery" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors" onClick={() => setMobileNavOpen(false)}>
              <ImageIcon className="h-4 w-4 text-muted-foreground" /> Gallery
            </a>
            <a href="#services" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors" onClick={() => setMobileNavOpen(false)}>
              <Layers className="h-4 w-4 text-muted-foreground" /> Services
            </a>
            {portfolioRestaurantId && (
              <Link to={`/portfolio/${portfolioRestaurantId}/reviews`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors" onClick={() => setMobileNavOpen(false)}>
                <Star className="h-4 w-4 text-muted-foreground" /> Reviews
              </Link>
            )}
            <a href="#contact" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors" onClick={() => setMobileNavOpen(false)}>
              <Contact className="h-4 w-4 text-muted-foreground" /> Contact
            </a>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Hero — background: uploaded image or default light orange */}
      <section className={`text-primary-foreground px-4 sm:px-6 py-16 sm:py-24 relative overflow-hidden ${businessInfo.heroBackgroundUrl ? "" : "bg-gradient-to-br from-orange-100 to-orange-200/90"}`}>
        {businessInfo.heroBackgroundUrl ? (
          <>
            <div className="absolute inset-0 bg-primary/80" />
            <img
              key={businessInfo.heroBackgroundUrl}
              src={safeImageSrc(businessInfo.heroBackgroundUrl)}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          </>
        ) : !hideCTAs ? (
          <div className="absolute inset-0 gradient-primary opacity-100" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-200/80 to-orange-300/60" />
        )}
        {!businessInfo.heroBackgroundUrl && businessInfo.heroImageUrl && (
          <div className="absolute inset-0 opacity-20">
            <img src={safeImageSrc(businessInfo.heroImageUrl)} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 shadow-lg overflow-hidden">
            {businessInfo.heroImageUrl ? (
              <img src={safeImageSrc(businessInfo.heroImageUrl)} alt="" className="w-full h-full object-cover" />
            ) : (
              <Palette className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground/95" />
            )}
          </div>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight drop-shadow-sm ${businessInfo.heroBackgroundUrl ? "text-white" : hideCTAs ? "text-slate-800" : "text-primary-foreground"}`}>
            {businessInfo.name}
          </h1>
          <p className={`mt-4 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed drop-shadow-sm ${businessInfo.heroBackgroundUrl ? "text-white/95" : hideCTAs ? "text-slate-700" : "text-primary-foreground/90"}`}>
            {businessInfo.tagline}
          </p>
          {!hideCTAs && (
            <p className="text-primary-foreground/70 mt-2 text-sm max-w-lg mx-auto">
              Branding • Digital • Social • Campaigns — for agencies, studios, and creative businesses.
            </p>
          )}
          {!hideCTAs && (
            <Button
              size="lg"
              className="mt-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold rounded-xl shadow-lg h-12 px-8"
              asChild
            >
              <Link to="/register">Get your own site →</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Featured work — theme: background, foreground, primary, accent */}
      <section id="work" className="px-4 sm:px-6 py-14 sm:py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Featured work</h2>
          <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-xl">
            A glimpse of how your agency or studio can showcase projects and results.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {projects.map((p) => (
              <Card
                key={p.id}
                className="border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all bg-card"
              >
                <CardContent className="p-0">
                  <div className="aspect-video bg-primary/10 flex items-center justify-center overflow-hidden relative">
                    {"imageUrl" in p && p.imageUrl ? (
                      <img src={safeImageSrc(p.imageUrl)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Palette className="w-12 h-12 text-primary/40" />
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                      {"tag" in p ? p.tag : (p as { role?: string }).role || "Work"}
                    </span>
                    <h3 className="font-semibold text-foreground mt-1 text-sm sm:text-base line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-accent font-medium mt-1">{"result" in p ? p.result : (p as { outcome?: string }).outcome || ""}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery — professional grid + lightbox */}
      <section id="gallery" className="px-4 sm:px-6 py-14 sm:py-20 bg-muted/30 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Gallery</h2>
          <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-xl">
            A selection of our creative work — branding, campaigns, digital, and print.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
            {gallery.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLightboxIndex(index)}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-primary/10 border border-border hover:border-primary/40 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <img
                  src={safeImageSrc(item.imageUrl)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-left opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-semibold text-primary-foreground uppercase tracking-wider">
                    {item.category}
                  </span>
                  <p className="text-xs font-medium text-primary-foreground line-clamp-2 mt-0.5">
                    {item.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services — What we do */}
      <section id="services" className="px-4 sm:px-6 py-14 sm:py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">What we do</h2>
          <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-xl">
            Services and expertise we offer.
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {services.map((s) => (
              <span
                key={s}
                className="px-5 py-2.5 rounded-full bg-card border-2 border-border text-sm font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery lightbox */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && setLightboxIndex(null)}>
        <DialogContent hideCloseButton className="max-w-4xl w-[95vw] p-0 gap-0 overflow-hidden border-0 bg-black/95">
          {lightboxIndex !== null && gallery[lightboxIndex] && (
            <>
              <div className="relative flex items-center justify-center min-h-[50vh] sm:min-h-[70vh] p-4 sm:p-8">
                <img
                  src={safeImageSrc(gallery[lightboxIndex].imageUrl).replace(/\/\d+\/\d+/, "/800/600")}
                  alt={gallery[lightboxIndex].title}
                  className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white h-10 w-10"
                  onClick={goPrev}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white h-10 w-10"
                  onClick={goNext}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 rounded-full bg-white/10 hover:bg-white/20 text-white h-9 w-9"
                  onClick={() => setLightboxIndex(null)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="px-4 sm:px-8 py-4 bg-black/80 border-t border-white/10">
                <p className="text-[10px] font-semibold text-primary uppercase tracking-wider text-primary-foreground">
                  {gallery[lightboxIndex].category}
                </p>
                <p className="text-sm font-medium text-white mt-0.5">
                  {gallery[lightboxIndex].title}
                </p>
                <p className="text-xs text-white/60 mt-1">
                  {lightboxIndex + 1} / {gallery.length}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer — theme: gradient-dark, background text */}
      <footer id="contact" className="gradient-dark text-background mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* Logo + business + contact */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-primary-foreground/20 shadow-soft bg-primary/20 flex items-center justify-center">
                  {logoUrl ? (
                    <img src={safeImageSrc(logoUrl)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary-foreground font-bold text-lg">{(businessInfo.name || "A").slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-background text-lg">{businessInfo.name}</h3>
                  <p className="text-sm text-background/70 mt-0.5">{businessInfo.tagline}</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-background/80">
                {businessInfo.address && (
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-background/60 flex-shrink-0 mt-0.5" />
                    <span className="break-words">{businessInfo.address}</span>
                  </li>
                )}
                {businessInfo.phone && (
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-background/60 flex-shrink-0" />
                    <a href={`tel:${businessInfo.phone}`} className="hover:text-background transition-colors break-all">
                      {businessInfo.phone}
                    </a>
                  </li>
                )}
                {businessInfo.email && (
                  <li className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-background/60 flex-shrink-0" />
                    <a href={`mailto:${businessInfo.email}`} className="hover:text-background transition-colors break-all">
                      {businessInfo.email}
                    </a>
                  </li>
                )}
                {businessInfo.website && (
                  <li className="flex items-center gap-3">
                    <ExternalLink className="w-4 h-4 text-background/60 flex-shrink-0" />
                    <a
                      href={`https://${businessInfo.website.replace(/^https?:\/\//i, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-background transition-colors break-all"
                    >
                      {businessInfo.website.replace(/^https?:\/\//i, "")}
                    </a>
                  </li>
                )}
              </ul>
              {(social.facebook || social.instagram || social.twitter || social.linkedin) && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {social.facebook && (
                    <a href={social.facebook.startsWith("http") ? social.facebook : `https://${social.facebook}`} target="_blank" rel="noopener noreferrer" className="text-background/80 hover:text-background text-sm font-medium transition-colors">
                      Facebook
                    </a>
                  )}
                  {social.instagram && (
                    <a href={social.instagram.startsWith("http") ? social.instagram : `https://${social.instagram}`} target="_blank" rel="noopener noreferrer" className="text-background/80 hover:text-background text-sm font-medium transition-colors">
                      Instagram
                    </a>
                  )}
                  {social.twitter && (
                    <a href={social.twitter.startsWith("http") ? social.twitter : `https://${social.twitter}`} target="_blank" rel="noopener noreferrer" className="text-background/80 hover:text-background text-sm font-medium transition-colors">
                      Twitter
                    </a>
                  )}
                  {social.linkedin && (
                    <a href={social.linkedin.startsWith("http") ? social.linkedin : `https://${social.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-background/80 hover:text-background text-sm font-medium transition-colors">
                      LinkedIn
                    </a>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  size="sm"
                  className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-10 gap-2"
                  asChild
                >
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <Navigation className="w-4 h-4" />
                    Get directions
                  </a>
                </Button>
                {hideCTAs && portfolioRestaurantId && (
                  <>
                    <Button
                      size="sm"
                      className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-10 gap-2"
                      onClick={() => downloadVisitingCard(businessInfo.businessCardFront, businessInfo.name)}
                    >
                      <Download className="w-4 h-4" />
                      Download visiting card
                    </Button>
                    <Button size="sm" className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-10 gap-2" onClick={() => window.dispatchEvent(new CustomEvent("agency-open-review-popup"))}>
                      <Star className="w-4 h-4" />
                      Give review
                    </Button>
                  </>
                )}
                {!hideCTAs && (
                  <>
                    <Button
                      size="sm"
                      className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-10 gap-2"
                      onClick={() => downloadVisitingCard(sampleAgencyBusinessInfo.businessCardFront ?? undefined, businessInfo.name)}
                    >
                      <Download className="w-4 h-4" />
                      Download visiting card
                    </Button>
                    <Button size="sm" className="bg-background/10 hover:bg-background/20 text-background border border-background/20 h-10 gap-2" asChild>
                      <Link to="/register" className="gap-2">
                        <FileText className="w-4 h-4" />
                        Download brochure
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Real map embed */}
            <div className="lg:col-span-7">
              <div className="rounded-xl overflow-hidden border border-background/20 bg-background/5 h-64 sm:h-72 lg:h-80 relative">
                {businessInfo.mapEmbedUrl ? (
                  <iframe
                    title={`${businessInfo.name} location map`}
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

          <div className="mt-12 pt-8 border-t border-background/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-background/60">
            <span>© {new Date().getFullYear()} {businessInfo.name}. All rights reserved.</span>
            <span className="flex items-center gap-1.5">
              Powered by <span className="font-medium text-background/80">ScanBit</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Floating actions: Call, WhatsApp, Email — left bottom desktop, bottom bar mobile */}
      {(businessInfo.phone || businessInfo.email || businessInfo.whatsapp) && (
        <div className="fixed z-30 md:left-4 md:bottom-24 md:right-auto bottom-0 left-0 right-0 flex md:flex-col md:gap-2 md:py-0 md:px-0 md:bg-transparent md:border-0 md:shadow-none md:rounded-none md:w-auto md:max-w-[3.5rem] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 px-3 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-2px 12px rgba(0,0,0,0.06)] md:border md:rounded-2xl md:shadow-lg md:overflow-hidden">
          <div className="flex flex-row gap-2 w-full md:w-12 md:flex-col md:gap-2 justify-center items-stretch md:items-center">
            {businessInfo.phone && (
              <a
                href={`tel:${businessInfo.phone.replace(/\s/g, "")}`}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 md:w-12 md:h-12 min-h-[44px] rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all font-medium text-sm md:text-base shadow-sm"
                aria-label="Call"
              >
                <Phone className="w-5 h-5 shrink-0" />
                <span className="md:hidden">Call</span>
              </a>
            )}
            {(businessInfo.whatsapp || businessInfo.phone) && (
              <a
                href={`https://wa.me/${(businessInfo.whatsapp || businessInfo.phone || "").replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none flex items-center justify-center gap-2 md:w-12 md:h-12 min-h-[44px] rounded-xl bg-[#25D366] text-white hover:bg-[#20BD5A] active:scale-[0.98] transition-all font-medium text-sm md:text-base shadow-sm"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span className="md:hidden">WhatsApp</span>
              </a>
            )}
            {businessInfo.email && (
              <a
                href={`mailto:${businessInfo.email}`}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 md:w-12 md:h-12 min-h-[44px] rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all font-medium text-sm md:text-base shadow-sm"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 shrink-0" />
                <span className="md:hidden">Email</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Public portfolio preview for a business.
 * URL: /portfolio/:restaurantId
 * - Agencies & Studios → Agency & Studio demo layout with user data (ScanBit Demo — Agency & Studio).
 * - Other categories → Professional portfolio layout with user data.
 */
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { DemoPortfolioPreview } from "@/pages/industries/demos/DemoPortfolioPreview";
import { DemoAgencyPreview } from "@/pages/industries/demos/DemoAgencyPreview";
import type { AgencyBusinessInfo, AgencyProject, AgencyGalleryItem } from "@/pages/industries/demos/DemoAgencyPreview";
import ProfessionalLoader from "@/components/ui/ProfessionalLoader";
import { AgencyReviewPopup } from "@/components/AgencyReviewPopup";

function formatAddress(addr: any, locationAddress?: string): string {
  if (locationAddress && locationAddress.trim()) return locationAddress.trim();
  if (!addr) return "";
  if (typeof addr === "string") return addr;
  if (typeof addr === "object") {
    const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean);
    return parts.join(", ");
  }
  return "";
}

function buildMapEmbedUrl(lat?: number | null, lng?: number | null): string | null {
  if (lat == null || lng == null) return null;
  const delta = 0.01;
  const south = lat - delta;
  const west = lng - delta;
  const north = lat + delta;
  const east = lng + delta;
  const bbox = `${west},${south},${east},${north}`;
  // OpenStreetMap embed, similar style to demo sample
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik&marker=${lat}%2C${lng}`;
}

function mapRestaurantToPortfolio(restaurant: any) {
  const addr = restaurant?.address;
  const loc = restaurant?.location || {};
  const social = restaurant?.socialMedia || {};
  const addressStr = formatAddress(addr, loc.address);
  const lat = typeof loc.lat === "number" ? loc.lat : null;
  const lng = typeof loc.lng === "number" ? loc.lng : null;
  const mapEmbedUrl = restaurant?.portfolioMapEmbedUrl || buildMapEmbedUrl(lat, lng);

  return {
    name: restaurant?.name || "Professional",
    title: restaurant?.portfolioTitle || restaurant?.businessType || restaurant?.businessCategory || "Services",
    tagline: restaurant?.tagline || "",
    bio: restaurant?.profile || "",
    profileImageUrl:
      restaurant?.logo || restaurant?.ownerImage || restaurant?.businessCardFront || undefined,
    address: addressStr,
    phone: restaurant?.phone || "",
    email: restaurant?.email || "",
    whatsapp: restaurant?.whatsapp || restaurant?.phone || "",
    website: social?.website || "",
    mapQuery: addressStr || restaurant?.name || "",
    mapEmbedUrl,
    socialMedia: {
      facebook: social?.facebook || "",
      instagram: social?.instagram || "",
      twitter: social?.twitter || "",
      linkedin: social?.linkedin || "",
      website: social?.website || "",
    },
  };
}

function mapRestaurantToAgency(restaurant: any): {
  businessInfo: AgencyBusinessInfo;
  projects: AgencyProject[];
  gallery: AgencyGalleryItem[];
  services: string[];
} {
  const addr = restaurant?.address;
  const loc = restaurant?.location || {};
  const social = restaurant?.socialMedia || {};
  const addressStr = formatAddress(addr, loc.address);
  const lat = typeof loc.lat === "number" ? loc.lat : null;
  const lng = typeof loc.lng === "number" ? loc.lng : null;
  const mapEmbedUrl = restaurant?.portfolioMapEmbedUrl || buildMapEmbedUrl(lat, lng);
  const website = social?.website || restaurant?.website || "";
  const businessInfo: AgencyBusinessInfo = {
    name: restaurant?.name || "Agency",
    tagline: restaurant?.tagline || "",
    address: addressStr || undefined,
    phone: restaurant?.phone || "",
    email: restaurant?.email || "",
    website: website ? website.replace(/^https?:\/\//i, "").trim() : undefined,
    whatsapp: restaurant?.whatsapp || restaurant?.phone || undefined,
    mapQuery: addressStr || restaurant?.name || "",
    heroImageUrl: restaurant?.agencyHeroImageUrl || restaurant?.logo || undefined,
    heroBackgroundUrl: restaurant?.agencyHeroBackgroundUrl || undefined,
    mapEmbedUrl: mapEmbedUrl || undefined,
    logoUrl: restaurant?.logo || undefined,
    businessCardFront: restaurant?.businessCardFront || restaurant?.businessCard || undefined,
    socialMedia: {
      facebook: social.facebook || undefined,
      instagram: social.instagram || undefined,
      twitter: social.twitter || undefined,
      linkedin: social.linkedin || undefined,
    },
  };
  const projects: AgencyProject[] = (Array.isArray(restaurant?.portfolioProjects) ? restaurant.portfolioProjects : []).map((p: any, i: number) => ({
    id: p.id || p._id || `p-${i}`,
    title: p.title || "Project",
    tag: p.role || p.tag || "Work",
    result: p.outcome || p.result || "",
    imageUrl: p.imageUrl || undefined,
  }));
  const gallery: AgencyGalleryItem[] = (Array.isArray(restaurant?.agencyGallery) ? restaurant.agencyGallery : []).map((g: any, i: number) => ({
    id: g.id || `g-${i}`,
    imageUrl: typeof g === "string" ? g : (g.imageUrl || ""),
    title: typeof g === "string" ? "" : (g.title || "Image"),
    category: typeof g === "string" ? "" : (g.category || "Work"),
  }));
  const services = Array.isArray(restaurant?.agencyServices) ? restaurant.agencyServices.filter(Boolean) : [];
  return { businessInfo, projects, gallery, services };
}

export default function PortfolioPreview() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [businessInfo, setBusinessInfo] = useState<ReturnType<typeof mapRestaurantToPortfolio> | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [portfolioSections, setPortfolioSections] = useState<{
    practiceAreas: any[];
    experience: any[];
    projects: any[];
    testimonials: any[];
    gallery: string[];
    resumeUrl: string | null;
    theme?: string | null;
    showQuickActions: boolean;
    showSocialLinks: boolean;
  }>({
    practiceAreas: [],
    experience: [],
    projects: [],
    testimonials: [],
    gallery: [],
    resumeUrl: null,
    theme: null,
    showQuickActions: true,
    showSocialLinks: true,
  });
  const [isAgencyStudio, setIsAgencyStudio] = useState(false);
  const [agencyData, setAgencyData] = useState<ReturnType<typeof mapRestaurantToAgency> | null>(null);

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const response = await api.getMenu(restaurantId, { cache: "no-store" });
        if (cancelled) return;
        if (!response?.success || !response?.restaurant) {
          setNotFound(true);
          return;
        }
        const r = response.restaurant;
        const category = (r?.businessCategory || "").toLowerCase();
        const isAgency = category === "agencies & studios" || category.includes("agency") || category.includes("studios");
        setBusinessInfo(mapRestaurantToPortfolio(r));
        setIsAgencyStudio(!!isAgency);
        if (isAgency) setAgencyData(mapRestaurantToAgency(r));
        setPortfolioSections({
          practiceAreas: Array.isArray(r.portfolioPracticeAreas) ? r.portfolioPracticeAreas : [],
          experience: Array.isArray(r.portfolioExperience) ? r.portfolioExperience : [],
          projects: Array.isArray(r.portfolioProjects) ? r.portfolioProjects : [],
          testimonials: Array.isArray(r.portfolioTestimonials) ? r.portfolioTestimonials : [],
          gallery: Array.isArray(r.portfolioGallery) ? r.portfolioGallery : [],
          resumeUrl: r.portfolioResumeUrl || null,
          theme: r.portfolioTheme || null,
          showQuickActions: r.showQuickActions !== false,
          showSocialLinks: r.showSocialLinks !== false,
        });
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [restaurantId]);

  if (loading) {
    return <ProfessionalLoader fullScreen size="xl" variant="branded" />;
  }

  if (notFound || !businessInfo) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md space-y-4">
          <h1 className="text-xl font-bold text-foreground">Portfolio not found</h1>
          <p className="text-muted-foreground text-sm">
            This business does not have a portfolio page or the link may be incorrect.
          </p>
          <button
            onClick={() => navigate("/our-services")}
            className="text-sm font-medium text-primary hover:underline"
          >
            Back to Our Services
          </button>
        </div>
      </div>
    );
  }

  if (isAgencyStudio && agencyData) {
    return (
      <div className="min-h-screen bg-background">
        <DemoAgencyPreview
          businessInfo={agencyData.businessInfo}
          projects={agencyData.projects}
          gallery={agencyData.gallery}
          services={agencyData.services}
          hideCTAs
          portfolioRestaurantId={restaurantId || undefined}
        />
        {restaurantId && <AgencyReviewPopup restaurantId={restaurantId} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DemoPortfolioPreview
        businessInfo={businessInfo}
        practiceAreas={portfolioSections.practiceAreas}
        experience={portfolioSections.experience}
        projects={portfolioSections.projects}
        testimonials={portfolioSections.testimonials}
        galleryUrls={portfolioSections.gallery}
        resumeUrl={portfolioSections.resumeUrl || undefined}
        showQuickActions={portfolioSections.showQuickActions}
        showSocialLinks={portfolioSections.showSocialLinks}
        theme={portfolioSections.theme || undefined}
        portfolioRestaurantId={restaurantId || undefined}
        hideCTAs
      />
    </div>
  );
}

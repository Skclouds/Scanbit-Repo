/**
 * Visiting card page for portfolio (Agency & Studio).
 * Displays business card. Download opens print dialog (Save as PDF or Print).
 */
import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import ProfessionalLoader from "@/components/ui/ProfessionalLoader";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { safeImageSrc } from "@/lib/imageUtils";
import { toast } from "sonner";

export default function PortfolioVisitingCard() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await api.getMenu(restaurantId);
        if (res?.success && res.restaurant) setRestaurant(res.restaurant);
      } finally {
        setLoading(false);
      }
    })();
  }, [restaurantId]);

  const handleDownload = () => {
    toast.info("Use Print dialog to save as PDF or print the card.");
    window.print();
  };

  if (loading) return <ProfessionalLoader fullScreen size="xl" variant="branded" />;
  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Business not found.</p>
          <Button asChild variant="outline">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const r = restaurant;
  const logo = r.logo || r.agencyHeroImageUrl;
  const name = r.businessName || r.name || "Business";
  const tagline = r.tagline || "";
  const phone = r.phone || "";
  const email = r.email || "";
  const website = r.socialMedia?.website || "";
  const address = r.location?.address || (typeof r.address === "string" ? r.address : "");

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 print:py-0 print:bg-white">
      <style>{`@media print { body * { visibility: hidden; } .print\\:show, .print\\:show * { visibility: visible; } .print\\:show { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
      <div className="max-w-md mx-auto space-y-6 print:max-w-none">
        <div className="flex items-center justify-between print:hidden">
          <Button asChild variant="ghost" size="sm">
            <Link to={`/portfolio/${restaurantId}`} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to portfolio
            </Link>
          </Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Download card
          </Button>
        </div>

        <div ref={cardRef} className="print:show bg-white rounded-2xl shadow-xl p-8 border border-border aspect-[3/4] max-h-[70vh] flex flex-col justify-center print:aspect-auto print:max-h-none print:shadow-none">
          <div className="flex flex-col items-center text-center">
            {logo && (
              <div className="w-20 h-20 rounded-xl overflow-hidden mb-4 border border-border">
                <img src={safeImageSrc(logo)} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-foreground">{name}</h1>
            {tagline && <p className="text-sm text-muted-foreground mt-1">{tagline}</p>}
          </div>
          <div className="mt-8 space-y-2 text-sm text-foreground">
            {phone && <p>{phone}</p>}
            {email && <p>{email}</p>}
            {website && <p>{website.replace(/^https?:\/\//i, "")}</p>}
            {address && <p className="text-muted-foreground">{address}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

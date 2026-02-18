import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import ProfessionalLoader from "@/components/ui/ProfessionalLoader";
import { DemoFoodMallPreview } from "@/pages/industries/demos/DemoFoodMallPreview";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface FoodMallMenuPreviewProps {
  restaurantId?: string;
  initialData?: {
    success: boolean;
    restaurant?: any;
    categories?: any[];
  };
}

function transformToFoodMallFormat(apiData: {
  restaurant: any;
  categories: Array<{ id: string; name: string; emoji?: string; items: any[] }>;
}) {
  const r = apiData.restaurant || {};
  const addr = r.location?.address || r.address || "";
  const mapQuery = addr || (r.name || "");

  const socialMedia = r.socialMedia || {};
  const businessInfo = {
    name: r.name || "Our Menu",
    tagline: r.tagline || "Fresh • Local • Delicious",
    logo: r.logo || null,
    foodImages: r.foodImages || [],
    showQuickActions: r.showQuickActions !== false,
    showSocialLinks: r.showSocialLinks !== false,
    showWhatsAppButton: r.showWhatsAppButton !== false,
    address: addr,
    phone: r.phone || "",
    email: r.email || "",
    whatsapp: r.whatsapp || r.phone || "",
    openingHours: r.openingHours || "Check with us for timings",
    website: r.website || socialMedia.website || "",
    socialMedia,
    mapQuery,
    businessType: r.businessType || null,
    mapEmbedUrl: r.location?.lat && r.location?.lng
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${(r.location.lng - 0.01)}%2C${(r.location.lat - 0.01)}%2C${(r.location.lng + 0.01)}%2C${(r.location.lat + 0.01)}&layer=mapnik&marker=${r.location.lat}%2C${r.location.lng}`
      : null,
  };

  const categories = [
    { id: "all", name: "All", emoji: "🍽️" },
    ...(apiData.categories || []).map((c) => ({
      id: String(c.id),
      name: c.name || "Category",
      emoji: c.emoji || "🍽️",
    })),
  ];

  const menuItems = (apiData.categories || []).flatMap((cat) =>
    (cat.items || []).map((item: any) => ({
      id: String(item.id),
      name: item.name || "",
      description: item.description || "",
      price: item.offerPrice ?? item.price ?? 0,
      categoryId: String(cat.id),
      isVeg: item.isVeg !== false,
      isPopular: item.isPopular === true,
      imageUrl: item.image || undefined,
    }))
  );

  return { businessInfo, categories, menuItems };
}

export default function FoodMallMenuPreview({ restaurantId: propId, initialData }: FoodMallMenuPreviewProps) {
  const { restaurantId: paramId } = useParams();
  const restaurantId = propId || paramId;

  const [data, setData] = useState<{
    businessInfo: any;
    categories: any[];
    menuItems: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", email: "", rating: 5, comment: "" });
  const [reviewGiven, setReviewGiven] = useState(false);
  const [reviewSkipped, setReviewSkipped] = useState(false);
  const reviewTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCloseReview = useCallback(() => {
    setShowReviewModal(false);
  }, []);

  const handleSkipReview = useCallback(() => {
    // Clear the timer if review is being skipped
    if (reviewTimerRef.current) {
      clearTimeout(reviewTimerRef.current);
      reviewTimerRef.current = null;
    }
    
    if (restaurantId) {
      localStorage.setItem(`review_skipped_${restaurantId}`, 'true');
      setReviewSkipped(true);
    }
    setShowReviewModal(false);
  }, [restaurantId]);

  // Show review popup after 20 seconds when preview opens
  useEffect(() => {
    // Wait until loading is complete and data is available
    if (!restaurantId || loading || !data) {
      return;
    }
    
    // Clear any existing timer
    if (reviewTimerRef.current) {
      clearTimeout(reviewTimerRef.current);
      reviewTimerRef.current = null;
    }
    
    // Check if review was already given or skipped
    const reviewKey = `review_given_${restaurantId}`;
    const skipKey = `review_skipped_${restaurantId}`;
    const wasGiven = localStorage.getItem(reviewKey) === 'true';
    const wasSkipped = localStorage.getItem(skipKey) === 'true';
    
    if (wasGiven || wasSkipped) {
      setReviewGiven(wasGiven);
      setReviewSkipped(wasSkipped);
      return; // Don't show popup if already handled
    }

    // Show popup after 20 seconds - start timer when page is ready
    reviewTimerRef.current = setTimeout(() => {
      // Double-check localStorage before showing
      const currentGiven = localStorage.getItem(reviewKey) === 'true';
      const currentSkipped = localStorage.getItem(skipKey) === 'true';
      
      if (!currentGiven && !currentSkipped) {
        setShowReviewModal(true);
      }
      reviewTimerRef.current = null;
    }, 20000); // 20 seconds

    return () => {
      if (reviewTimerRef.current) {
        clearTimeout(reviewTimerRef.current);
        reviewTimerRef.current = null;
      }
    };
  }, [restaurantId, loading, data]);

  const handleSubmitReview = async () => {
    if (!restaurantId || !reviewForm.name.trim() || !reviewForm.email.trim() || !reviewForm.comment.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Clear the timer if review is being submitted
    if (reviewTimerRef.current) {
      clearTimeout(reviewTimerRef.current);
      reviewTimerRef.current = null;
    }
    
    try {
      setReviewSubmitting(true);
      const res = await api.submitReview(restaurantId, {
        reviewerName: reviewForm.name.trim(),
        reviewerEmail: reviewForm.email.trim(),
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });
      if (res?.success) {
        if (restaurantId) {
          localStorage.setItem(`review_given_${restaurantId}`, 'true');
        }
        setReviewGiven(true);
        toast.success("Thank you for your review!");
        setShowReviewModal(false);
      } else {
        toast.error(res?.message || "Failed to submit review");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchMenu = async () => {
      if (!restaurantId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = initialData?.success
          ? initialData
          : await api.getMenu(restaurantId);

        if (response?.success && response.restaurant) {
          const transformed = transformToFoodMallFormat({
            restaurant: response.restaurant,
            categories: response.categories || [],
          });
          setData(transformed);
        } else {
          const category = (response?.restaurant?.businessCategory || '').trim();
          const type = (response?.restaurant?.businessType || '').toLowerCase();
          const combined = `${category} ${type}`.toLowerCase();
          const label = combined.includes('retail') || combined.includes('e-commerce') || combined.includes('store') || combined.includes('shop') ? 'Catalog' :
                       combined.includes('creative') || combined.includes('design') || combined.includes('portfolio') ? 'Portfolio' :
                       combined.includes('professional') || combined.includes('service') || combined.includes('consult') ? 'Services' :
                       combined.includes('health') || combined.includes('wellness') || combined.includes('medical') ? 'Services' :
                       combined.includes('agency') || combined.includes('marketing') ? 'Portfolio' : 'Menu';
          toast.error(response?.message || `${label} not found`);
        }
      } catch (err: any) {
        // Try to get label from response if available
        const category = (err?.response?.data?.restaurant?.businessCategory || '').trim();
        const type = (err?.response?.data?.restaurant?.businessType || '').toLowerCase();
        const combined = `${category} ${type}`.toLowerCase();
        const label = combined.includes('retail') || combined.includes('e-commerce') || combined.includes('store') || combined.includes('shop') ? 'catalog' :
                     combined.includes('creative') || combined.includes('design') || combined.includes('portfolio') ? 'portfolio' :
                     combined.includes('professional') || combined.includes('service') || combined.includes('consult') ? 'services' :
                     combined.includes('health') || combined.includes('wellness') || combined.includes('medical') ? 'services' :
                     combined.includes('agency') || combined.includes('marketing') ? 'portfolio' : 'menu';
        toast.error(err?.message || `Failed to load ${label}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [restaurantId, initialData?.success]);

  if (loading) {
    return <ProfessionalLoader fullScreen size="xl" variant="branded" />;
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-foreground">Menu Not Found</h2>
          <p className="text-muted-foreground">
            This menu is not available or hasn't been set up yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DemoFoodMallPreview
        restaurantId={restaurantId || undefined}
        businessInfo={data.businessInfo}
        categories={data.categories}
        menuItems={data.menuItems}
        isLiveMenu
        showWhatsAppButton={data.businessInfo.showWhatsAppButton !== false}
        onGiveFeedback={() => setShowReviewModal(true)}
      />

      <Dialog open={showReviewModal} onOpenChange={(open) => {
        if (!open) {
          handleCloseReview();
        }
      }}>
        <DialogContent className="max-w-md rounded-2xl gap-0 p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">How was your experience?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mt-2">
              Share your feedback before you go. It helps businesses improve!
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewForm((f) => ({ ...f, rating: s }))}
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${s <= reviewForm.rating ? "fill-amber-400 text-amber-500" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-name">Your name</Label>
              <Input
                id="review-name"
                value={reviewForm.name}
                onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-email">Email</Label>
              <Input
                id="review-email"
                type="email"
                value={reviewForm.email}
                onChange={(e) => setReviewForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-comment">Your review</Label>
              <Textarea
                id="review-comment"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Tell us about your experience..."
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleSubmitReview} disabled={reviewSubmitting} className="w-full">
                {reviewSubmitting ? "Submitting…" : "Submit review & leave"}
              </Button>
              <Button variant="ghost" onClick={handleSkipReview} disabled={reviewSubmitting}>
                Skip for now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

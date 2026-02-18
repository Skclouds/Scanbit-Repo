/**
 * Public reviews page for portfolio (Agency & Studio).
 * Shows only reviews with 3+ stars. Back link to portfolio.
 */
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import ProfessionalLoader from "@/components/ui/ProfessionalLoader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, MessageCircle } from "lucide-react";
import { safeImageSrc } from "@/lib/imageUtils";

const MIN_STARS = 3;

export default function PortfolioReviews() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [reviews, setReviews] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const restaurantRes = await api.getMenu(restaurantId);
        if (restaurantRes?.success && restaurantRes.restaurant) setRestaurant(restaurantRes.restaurant);
        const reviewsRes = await api.getReviews(restaurantId);
        if (reviewsRes?.success && Array.isArray(reviewsRes.data)) {
          const published = reviewsRes.data.filter((r: any) => (r.status === "published" || r.status === undefined) && (r.rating || 0) >= MIN_STARS);
          setReviews(published);
          if (published.length > 0) {
            const total = published.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
            setAverageRating(total / published.length);
          }
        }
      } catch {
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [restaurantId]);

  if (loading) return <ProfessionalLoader fullScreen size="xl" variant="branded" />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={`/portfolio/${restaurantId}`} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Back to portfolio">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center flex-shrink-0">
                  {restaurant?.logo ? <img src={safeImageSrc(restaurant.logo)} alt="" className="w-full h-full object-cover" /> : <MessageCircle className="w-6 h-6 text-primary" />}
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-foreground">{restaurant?.name || "Reviews"}</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">Reviews (3 stars & above)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {reviews.length > 0 && (
          <div className="mb-8">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-foreground">{averageRating.toFixed(1)}</div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-5 h-5 ${star <= Math.round(averageRating) ? "fill-amber-400 text-amber-500" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""} (3+ stars)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {reviews.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">No reviews yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Be the first to share your experience.</p>
              <Button asChild variant="outline">
                <Link to={`/portfolio/${restaurantId}`}>Back to Portfolio</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {reviews.map((review: any) => (
              <Card key={review._id || review.id} className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${star <= (review.rating || 5) ? "fill-amber-400 text-amber-500" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    {review.createdAt && <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
                  </div>
                  <p className="text-sm sm:text-base text-foreground mb-4 leading-relaxed line-clamp-4">{review.comment || "No comment provided."}</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{(review.reviewerName || "A")[0].toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{review.reviewerName || "Anonymous"}</p>
                      {review.reviewerEmail && <p className="text-xs text-muted-foreground truncate">{review.reviewerEmail}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 sm:mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to={`/portfolio/${restaurantId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portfolio
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

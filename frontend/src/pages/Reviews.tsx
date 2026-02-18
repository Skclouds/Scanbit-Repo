import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import ProfessionalLoader from "@/components/ui/ProfessionalLoader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, ChefHat, MessageCircle } from "lucide-react";
import { safeImageSrc } from "@/lib/imageUtils";

export default function Reviews() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [reviews, setReviews] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch restaurant info
        const restaurantRes = await api.getMenu(restaurantId);
        if (restaurantRes?.success && restaurantRes.restaurant) {
          setRestaurant(restaurantRes.restaurant);
        }

        // Fetch reviews (all published; backend returns only published)
        const reviewsRes = await api.getReviews(restaurantId);
        if (reviewsRes?.success && Array.isArray(reviewsRes.data)) {
          const published = reviewsRes.data.filter(
            (r: any) => r.status === 'published' || r.status === undefined
          );
          setReviews(published);

          if (published.length > 0) {
            const total = published.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
            setAverageRating(total / published.length);
            const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            published.forEach((r: any) => {
              const rating = Math.min(5, Math.max(1, Number(r.rating) || 0));
              distribution[rating as keyof typeof distribution]++;
            });
            setRatingDistribution(distribution);
          }
        }
      } catch (error: any) {
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  if (loading) {
    return <ProfessionalLoader fullScreen size="xl" variant="branded" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to={`/menu/${restaurantId}`}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Back to menu"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-border flex items-center justify-center flex-shrink-0 overflow-hidden p-0.5">
                  {restaurant?.logo ? (
                    <img src={safeImageSrc(restaurant.logo)} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <ChefHat className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-foreground">
                    {restaurant?.name || "Reviews"}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">Customer Reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Stats Section */}
        {reviews.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  {/* Average Rating */}
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <div className="text-4xl sm:text-5xl font-bold text-foreground">
                        {averageRating.toFixed(1)}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= Math.round(averageRating)
                                  ? "fill-amber-400 text-amber-500"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 min-w-[60px]">
                        <span className="text-sm font-semibold">5</span>
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      </div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                          style={{
                            width: `${reviews.length > 0 ? (ratingDistribution[5] / reviews.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground min-w-[40px] text-right">
                        {ratingDistribution[5] || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 min-w-[60px]">
                        <span className="text-sm font-semibold">4</span>
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      </div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                          style={{
                            width: `${reviews.length > 0 ? (ratingDistribution[4] / reviews.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground min-w-[40px] text-right">
                        {ratingDistribution[4] || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 sm:py-20 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">No reviews yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Be the first to share your experience! Reviews help other customers make informed decisions.
              </p>
              <Button asChild variant="outline">
                <Link to={`/menu/${restaurantId}`}>Back to Menu</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {reviews.map((review: any) => (
              <Card key={review._id || review.id} className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 sm:p-6">
                  {/* Rating & Date */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (review.rating || 5)
                              ? "fill-amber-400 text-amber-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    {review.createdAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  {/* Review Comment */}
                  <p className="text-sm sm:text-base text-foreground mb-4 leading-relaxed line-clamp-4">
                    {review.comment || "No comment provided."}
                  </p>

                  {/* Reviewer Info */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {(review.reviewerName || "Anonymous")[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {review.reviewerName || "Anonymous"}
                      </p>
                      {review.reviewerEmail && (
                        <p className="text-xs text-muted-foreground truncate">
                          {review.reviewerEmail}
                        </p>
                      )}
                      {review.reviewerMobile && (
                        <p className="text-xs text-muted-foreground truncate">
                          {review.reviewerMobile}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 sm:mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to={`/menu/${restaurantId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

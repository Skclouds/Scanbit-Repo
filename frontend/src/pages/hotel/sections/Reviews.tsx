import { useState, useEffect, useMemo } from "react";
import { FiStar, FiSearch, FiFilter, FiThumbsUp, FiMessageSquare, FiRefreshCw } from "react-icons/fi";
import { MdReviews, MdStar, MdStarBorder } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import api from "@/lib/api";

interface Review {
  _id: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: "published" | "pending" | "hidden";
  avatar?: string;
}

const Reviews = ({ restaurant }: any) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [restaurant]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const restaurantId = restaurant?._id || restaurant?.id;
      const response = await api.getReviews(restaurantId);
      if (response.success) {
        setReviews(response.data);
      }
    } catch (error: any) {

      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch =
        (review.reviewerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (review.comment || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating = selectedRating === "all" || review.rating.toString() === selectedRating;
      return matchesSearch && matchesRating;
    });
  }, [reviews, searchQuery, selectedRating]);

  const stats = useMemo(() => {
    return {
      total: reviews.length,
      average: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
      fiveStar: reviews.filter((r) => r.rating === 5).length,
      fourStar: reviews.filter((r) => r.rating === 4).length,
      threeStar: reviews.filter((r) => r.rating === 3).length,
      twoStar: reviews.filter((r) => r.rating === 2).length,
      oneStar: reviews.filter((r) => r.rating === 1).length,
    };
  }, [reviews]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i}>
        {i < rating ? (
          <MdStar className="w-5 h-5 text-yellow-400 inline" />
        ) : (
          <MdStarBorder className="w-5 h-5 text-gray-300 inline" />
        )}
      </span>
    ));
  };

  const handleUpdateStatus = async (reviewId: string, status: 'published' | 'hidden') => {
    try {
      const response = await api.updateReviewStatus(reviewId, status);
      if (response.success) {
        toast.success(`Review ${status === 'published' ? 'published' : 'hidden'} successfully`);
        fetchReviews();
      }
    } catch (error: any) {
      toast.error("Failed to update review status");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight break-words">Customer Intelligence</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">Real-time feedback and reputation management</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={fetchReviews} disabled={isLoading} className="rounded-xl border-slate-200 font-bold min-h-[44px] touch-manipulation w-full sm:w-auto">
            <FiRefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="rounded-xl sm:rounded-3xl border-slate-200 shadow-sm overflow-hidden group min-w-0">
          <CardContent className="p-5 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <MdReviews className="w-6 h-6" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-none font-black text-[10px] uppercase tracking-widest">Total</Badge>
            </div>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">{stats.total}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Reviews</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl sm:rounded-3xl border-slate-200 shadow-sm overflow-hidden group min-w-0">
          <CardContent className="p-5 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center border border-yellow-100 group-hover:bg-yellow-400 group-hover:text-white transition-all">
                <FiStar className="w-6 h-6" />
              </div>
              <Badge className="bg-yellow-100 text-yellow-700 border-none font-black text-[10px] uppercase tracking-widest">Rating</Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">{stats.average.toFixed(1)}</p>
              <div className="flex scale-75 origin-left">
                {renderStars(Math.round(stats.average))}
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Average Score</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl sm:rounded-3xl border-slate-200 shadow-sm overflow-hidden group min-w-0">
          <CardContent className="p-5 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center border border-green-100 group-hover:bg-green-600 group-hover:text-white transition-all">
                <MdStar className="w-6 h-6" />
              </div>
              <Badge className="bg-green-100 text-green-700 border-none font-black text-[10px] uppercase tracking-widest">Top Tier</Badge>
            </div>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">{stats.fiveStar}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">5-Star Feedback</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl sm:rounded-3xl border-slate-200 shadow-sm overflow-hidden group min-w-0">
          <CardContent className="p-5 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-all">
                <FiMessageSquare className="w-6 h-6" />
              </div>
              <Badge className="bg-orange-100 text-orange-700 border-none font-black text-[10px] uppercase tracking-widest">Pending</Badge>
            </div>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">
              {reviews.filter((r) => r.status === "pending").length}
            </p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Awaiting Review</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="rounded-xl sm:rounded-[2rem] border-slate-200 shadow-sm overflow-hidden min-w-0">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="flex-1 min-w-0 relative group">
              <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 sm:pl-12 h-11 sm:h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-orange-500 font-medium text-sm"
              />
            </div>
            <Tabs value={selectedRating} onValueChange={setSelectedRating} className="w-full lg:w-auto min-w-0">
              <TabsList className="bg-slate-100 p-1 rounded-xl h-11 sm:h-12 w-full lg:w-auto flex flex-wrap sm:flex-nowrap gap-1">
                <TabsTrigger value="all" className="rounded-lg font-bold uppercase tracking-widest text-[10px] px-3 sm:px-6 flex-1 sm:flex-none">All</TabsTrigger>
                <TabsTrigger value="5" className="rounded-lg font-bold uppercase tracking-widest text-[10px] px-3 sm:px-6 flex-1 sm:flex-none">5 ★</TabsTrigger>
                <TabsTrigger value="4" className="rounded-lg font-bold uppercase tracking-widest text-[10px] px-3 sm:px-6 flex-1 sm:flex-none">4 ★</TabsTrigger>
                <TabsTrigger value="3" className="rounded-lg font-bold uppercase tracking-widest text-[10px] px-3 sm:px-6 flex-1 sm:flex-none">3 ★</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Intelligence...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl sm:rounded-[3rem] border-2 border-dashed border-slate-200 py-12 sm:py-20 text-center px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm">
              <MdReviews className="w-8 h-8 sm:w-10 sm:h-10 text-slate-200" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">No Feedback Found</h3>
            <p className="text-slate-400 font-bold text-xs sm:text-sm mt-2 uppercase tracking-widest">Deploy your QR codes to start receiving reviews</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review._id} className="rounded-xl sm:rounded-[2rem] border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden min-w-0">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-4 sm:gap-6">
                  <Avatar className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border-2 border-slate-100 shadow-sm shrink-0">
                    <AvatarImage src={review.avatar} />
                    <AvatarFallback className="bg-orange-50 text-orange-700 font-black text-xl">
                      {(review.reviewerName || "U")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight break-words">{review.reviewerName}</p>
                          <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 font-bold text-[10px] uppercase tracking-widest truncate max-w-full">
                            {review.reviewerEmail}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg border-none ${
                            review.status === "published"
                              ? "bg-green-100 text-green-700"
                              : review.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {review.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed text-lg mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 italic">
                      "{review.comment}"
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-50">
                      {review.status !== 'published' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleUpdateStatus(review._id, 'published')}
                          className="rounded-xl border-slate-200 font-bold hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all"
                        >
                          Publish Feedback
                        </Button>
                      )}
                      {review.status !== 'hidden' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleUpdateStatus(review._id, 'hidden')}
                          className="rounded-xl border-slate-200 font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all"
                        >
                          Hide Review
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="rounded-xl font-bold text-slate-400 hover:text-slate-900 ml-auto">
                        <FiMessageSquare className="w-4 h-4 mr-2" />
                        Professional Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;

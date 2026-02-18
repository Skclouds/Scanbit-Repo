/**
 * Review popup for Agency/Studio portfolio visitors.
 * Shows every 20 seconds; once visitor submits a review, never show again (localStorage).
 * Can also be opened via "Give review" button (custom event agency-open-review-popup).
 */
import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const STORAGE_KEY = "portfolio_review_submitted";

export function AgencyReviewPopup({ restaurantId, open: controlledOpen, onOpenChange }: { restaurantId: string; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [open, setOpenState] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [reviewerMobile, setReviewerMobile] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setOpen = useCallback((v: boolean) => { setOpenState(v); onOpenChange?.(v); }, [onOpenChange]);

  const alreadySubmitted = typeof window !== "undefined" && localStorage.getItem(`${STORAGE_KEY}_${restaurantId}`) === "true";

  useEffect(() => {
    if (!restaurantId || alreadySubmitted) return;
    const t = setTimeout(() => setOpenState(true), 20000);
    return () => clearTimeout(t);
  }, [restaurantId, alreadySubmitted]);

  useEffect(() => {
    if (controlledOpen !== undefined) setOpenState(controlledOpen);
  }, [controlledOpen]);

  useEffect(() => {
    const handler = () => setOpenState(true);
    window.addEventListener("agency-open-review-popup", handler);
    return () => window.removeEventListener("agency-open-review-popup", handler);
  }, []);

  const handleSubmit = async () => {
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a rating");
      return;
    }
    const name = reviewerName.trim();
    const email = reviewerEmail.trim();
    if (!name) {
      toast.error("Please enter your name");
      return;
    }
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setSubmitting(true);
    try {
      await api.submitReview(restaurantId, {
        rating,
        comment: comment.trim(),
        reviewerName: name,
        reviewerEmail: email,
        reviewerMobile: reviewerMobile.trim() || undefined,
      });
      localStorage.setItem(`${STORAGE_KEY}_${restaurantId}`, "true");
      setSubmitted(true);
      toast.success("Thank you for your review!");
      setTimeout(() => setOpen(false), 1500);
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How was your experience?</DialogTitle>
        </DialogHeader>
        {submitted ? (
          <p className="text-muted-foreground text-center py-4">Thank you! Your review has been submitted.</p>
        ) : (
          <div className="space-y-4 pt-2">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(s)}
                    className="p-1 rounded hover:bg-muted transition-colors"
                  >
                    <Star className={`w-8 h-8 ${(hoverRating || rating) >= s ? "fill-amber-400 text-amber-500" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="review-name">Your name *</Label>
              <Input id="review-name" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="Name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="review-email">Email *</Label>
              <Input id="review-email" type="email" value={reviewerEmail} onChange={(e) => setReviewerEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="review-mobile">Phone (optional)</Label>
              <Input id="review-mobile" type="tel" value={reviewerMobile} onChange={(e) => setReviewerMobile(e.target.value)} placeholder="+91 ..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="review-comment">Your review (optional)</Label>
              <Textarea id="review-comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." rows={3} />
            </div>
            <Button onClick={handleSubmit} disabled={submitting} className="w-full">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit review"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

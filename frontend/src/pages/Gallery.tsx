import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ImageIcon, X, ChevronRight, ZoomIn, ChefHat } from "lucide-react";
import api from "@/lib/api";
import { safeImageSrc } from "@/lib/imageUtils";
import ProfessionalLoader from "@/components/ui/ProfessionalLoader";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export default function Gallery() {
  const { restaurantId } = useParams();
  const [images, setImages] = useState<string[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!restaurantId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.getMenu(restaurantId);
        if (res?.success && res?.restaurant) {
          setRestaurant(res.restaurant);
          setImages(res.restaurant.foodImages || []);
        }
      } catch {
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [restaurantId]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const goPrev = () => setLightboxIndex((i) => (i === null ? null : i > 0 ? i - 1 : images.length - 1));
  const goNext = () => setLightboxIndex((i) => (i === null ? null : i < images.length - 1 ? i + 1 : 0));

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex]);

  if (loading) {
    return <ProfessionalLoader fullScreen size="xl" variant="branded" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-background">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link
            to={`/menu/${restaurantId}`}
            className="p-2.5 -ml-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors touch-manipulation flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Back to Menu</span>
          </Link>
          {restaurant?.logo && (
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden p-0.5">
              <img src={safeImageSrc(restaurant.logo)} alt={restaurant?.name || "Logo"} className="w-full h-full object-contain" />
            </div>
          )}
          {!restaurant?.logo && (
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
              <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-slate-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{restaurant?.name || "Gallery"}</h1>
            <p className="text-xs text-slate-500">Photo gallery</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28">
        {images.length === 0 ? (
          <div className="text-center py-24 sm:py-32">
            <div className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border border-slate-200/60 shadow-inner">
              <ImageIcon className="w-14 h-14 text-slate-300" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">No gallery images yet</h2>
            <p className="text-slate-500 text-sm sm:text-base mb-8 max-w-sm mx-auto">
              The business hasn&apos;t added any gallery images. Check back later.
            </p>
            <Link
              to={`/menu/${restaurantId}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Return to menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Creative grid — first image featured larger */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => openLightbox(i)}
                  className={`group relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl ring-1 ring-slate-200/60 hover:ring-primary/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    i === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/15 transition-colors duration-300 z-10">
                    <ZoomIn className="w-8 h-8 sm:w-10 sm:h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                  <div className={`w-full flex items-center justify-center bg-slate-50 ${
                    i === 0 ? "aspect-square min-h-[200px] sm:min-h-[280px]" : "aspect-square min-h-[120px] sm:min-h-[160px]"
                  }`}>
                    <img
                      src={safeImageSrc(src)}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-full object-contain p-2 sm:p-3"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Full-screen lightbox — shows full image */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent
          hideCloseButton
          className="max-w-[95vw] max-h-[95dvh] w-auto h-auto p-0 border-0 bg-black/95 overflow-hidden"
        >
          {lightboxIndex !== null && images[lightboxIndex] && (
            <div className="relative flex items-center justify-center min-h-[60dvh] w-full">
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors touch-manipulation"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors touch-manipulation"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors touch-manipulation"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                  </button>
                </>
              )}
              <img
                src={safeImageSrc(images[lightboxIndex])}
                alt={`Gallery ${lightboxIndex + 1}`}
                className="max-w-full max-h-[85dvh] w-auto h-auto object-contain"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
                {lightboxIndex + 1} / {images.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

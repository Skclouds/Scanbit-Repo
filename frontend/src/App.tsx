import * as React from "react";
import { GlobalErrorOverlay } from "@/components/GlobalErrorOverlay";
import { SupportChatWidget } from "@/components/support/SupportChatWidget";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/ScrollToTop";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Toaster } from "@/components/ui/toaster";
import ScanBitLoader from "@/components/ui/ScanBitLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Website Customization Pages are lazy loaded in AdminContentRouter - no need to import here
import { SubscriptionGuard } from "./components/guards/SubscriptionGuard";
import { ProtectedRoute } from "./components/guards/ProtectedRoute";
import { PricingRoute } from "./components/guards/PricingRoute";
import { PublicRoute } from "./components/guards/PublicRoute";
import AdminDashboard from "./pages/admin/AdminDashboardNew";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import TermsOfService from "./pages/TermsOfService";
import CheckoutFailed from "./pages/CheckoutFailed";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import LegalDocument from "./pages/LegalDocument";
import DemoProducts from "./pages/DemoProducts";
import Dashboard from "./pages/hotel/Dashboard";
import OurServices from "./pages/OurServices";
import DemoCatalog from "./pages/DemoCatalog";
import HowItWorks from "./pages/HowItWorks";
import HelpCenter from "./pages/HelpCenter";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Features from "./pages/Features";
import DemoMenu from "./pages/DemoMenu";
import Checkout from "./pages/Checkout";
import Support from "./pages/Support";
import Pricing from "./pages/Pricing";
import Index from "./pages/Index.tsx";
import AboutUs from "./pages/AboutUs";

const isIOS = typeof navigator !== "undefined" && (
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
);
const LazyIndex = React.lazy(() => import("./pages/Index.tsx"));

const IndexLoadFailedFallback = () => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "-apple-system, sans-serif", textAlign: "center" }}>
    <p style={{ fontSize: 18, color: "#111", marginBottom: 8 }}>Home didn’t load</p>
    <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>Tap below to try again.</p>
    <button onClick={() => window.location.reload()} style={{ padding: "14px 28px", background: "#f97316", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>Try again</button>
  </div>
);

function IndexRoute() {
  if (isIOS) {
    return (
      <ErrorBoundary fallback={<IndexLoadFailedFallback />}>
        <React.Suspense fallback={<ScanBitLoader fullScreen size="lg" showDots />}>
          <LazyIndex />
        </React.Suspense>
      </ErrorBoundary>
    );
  }
  return <Index />;
}
import Blogs from "./pages/Blogs";
import Status from "./pages/Status";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Gallery from "./pages/Gallery";
import Reviews from "./pages/Reviews";
import { Restaurants, FoodMall, Retail, Creative, CreativeDesign, Wellness, ProfessionalServices } from "./pages/industries";
import PortfolioPreview from "./pages/PortfolioPreview";
import PortfolioReviews from "./pages/PortfolioReviews";
import PortfolioVisitingCard from "./pages/PortfolioVisitingCard";


const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <BrowserRouter>
      <GoogleAnalytics />
      <ScrollToTop />
      <SupportChatWidget position="bottom-right" />
      <Routes>
        <Route path="/" element={<IndexRoute />} />
        
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<PricingRoute><Pricing /></PricingRoute>} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/our-services" element={<OurServices />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/industries/restaurants" element={<Restaurants />} />
        <Route path="/industries/food-mall" element={<FoodMall />} />
        <Route path="/industries/retail" element={<Retail />} />
        <Route path="/industries/creative" element={<Creative />} />
        <Route path="/industries/creative-design" element={<CreativeDesign />} />
        <Route path="/industries/wellness" element={<Wellness />} />
        <Route path="/industries/professional-services" element={<ProfessionalServices />} />
        <Route path="/portfolio" element={<Navigate to="/our-services" replace />} />
        <Route path="/portfolio/:restaurantId" element={<PortfolioPreview />} />
        <Route path="/portfolio/:restaurantId/reviews" element={<PortfolioReviews />} />
        <Route path="/portfolio/:restaurantId/visiting-card" element={<PortfolioVisitingCard />} />
        <Route path="/support" element={<Support />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/legal/:slug" element={<LegalDocument />} />
        <Route path="/status" element={<Status />} />
        <Route path="/login" element={<PublicRoute showLogoutDialog={true}><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute showLogoutDialog={true}><Register /></PublicRoute>} />
        <Route path="/demo-menu" element={<DemoMenu />} />
        <Route path="/demo-catalog" element={<DemoCatalog />} />
        <Route path="/demo-products" element={<DemoProducts />} />
        <Route path="/menu/:restaurantId" element={<Menu />} />
        <Route path="/catalogue/:restaurantId" element={<Menu />} />
        <Route path="/menu/:restaurantId/gallery" element={<Gallery />} />
        <Route path="/menu/:restaurantId/reviews" element={<Reviews />} />
        <Route path="/checkout" element={<ProtectedRoute requireAuth={true}><Checkout /></ProtectedRoute>} />
        <Route path="/checkout/success" element={<ProtectedRoute requireAuth={true}><CheckoutSuccess /></ProtectedRoute>} />
        <Route path="/checkout/failed" element={<CheckoutFailed />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
        
        {/* Website Customization Routes - handled by AdminDashboard router */}
        
        <Route path="/dashboard" element={<ProtectedRoute requireAuth={true}><SubscriptionGuard><Dashboard /></SubscriptionGuard></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
        <GlobalErrorOverlay />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

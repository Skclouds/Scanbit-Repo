import { useState, useEffect } from "react";
import { AdvertisementLoader } from "@/components/advertisements/AdvertisementLoader";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import CTA from "@/components/landing/CTA";
import Home from "@/pages/Home";

const isIOS = typeof navigator !== "undefined" && (
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
);

const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  try {
    return !!(localStorage.getItem("token") || localStorage.getItem("adminAuth") || localStorage.getItem("hotelAuth"));
  } catch {
    return false;
  }
};

const Index = () => {
  const loggedIn = isLoggedIn();
  const [ready, setReady] = useState(!isIOS);
  useEffect(() => {
    if (!isIOS) return;
    const t = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(t);
  }, []);
  if (isIOS && !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "hsl(30, 15%, 98%)" }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(249,115,22,0.2)",
            borderTopColor: "#f97316",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }
  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(30, 15%, 98%)", color: "hsl(20, 20%, 10%)" }}>
      <Navbar />
      <AdvertisementLoader />
      <Home />
      <Features />
      <HowItWorks />
      {!loggedIn && <Pricing />}
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;

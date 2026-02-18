import ProfessionalLoader from "@/components/ui/ProfessionalLoader";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/api";


interface PricingRouteProps {
  children: React.ReactNode;
}

// Context to pass auth info to pricing page
export interface PricingAuthContext {
  isAuthenticated: boolean;
  userRole: string | null;
  userInfo: any;
}

export const PricingRoute = ({ children }: PricingRouteProps) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const adminAuth = localStorage.getItem("adminAuth");
        const hotelAuth = localStorage.getItem("hotelAuth");

        if (!token && !adminAuth && !hotelAuth) {
          setIsAuthenticated(false);
          setUserRole(null);
          setLoading(false);
          return;
        }

        // Try to get current user
        try {
          const response = await api.getCurrentUser();
          if (response.success && response.user) {
            setIsAuthenticated(true);
            setUserRole(response.user.role || null);
            setUserInfo(response.user);
          } else {
            setIsAuthenticated(false);
            setUserRole(null);
          }
        } catch (error) {
          // If API call fails, check localStorage
          if (adminAuth) {
            try {
              const admin = JSON.parse(adminAuth);
              setIsAuthenticated(true);
              setUserRole(admin.role || "admin");
              setUserInfo(admin);
            } catch {
              setIsAuthenticated(false);
              setUserRole(null);
            }
          } else if (hotelAuth) {
            try {
              const hotel = JSON.parse(hotelAuth);
              setIsAuthenticated(true);
              setUserRole(hotel.role || "user");
              setUserInfo(hotel);
            } catch {
              setIsAuthenticated(false);
              setUserRole(null);
            }
          } else {
            setIsAuthenticated(false);
            setUserRole(null);
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  if (loading) {
    return <ProfessionalLoader fullScreen size="lg" variant="minimal" />;
  }

  // NEW BEHAVIOR: All users (logged in or not) can see the pricing page
  // The pricing page will handle different CTAs based on auth state:
  // - Not logged in: "Get Started" -> Register
  // - Logged in: "Choose Plan" -> Open payment dialog
  return <>{children}</>;
};

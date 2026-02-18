import ScanBitLoader from "@/components/ui/ScanBitLoader";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/api";


interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireAuth = false,
  redirectTo,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const adminAuth = localStorage.getItem("adminAuth");
        const hotelAuth = localStorage.getItem("hotelAuth");
        const userRole = localStorage.getItem("userRole");

        if (!token && !adminAuth && !hotelAuth) {
          try {
            const response = await api.getCurrentUser();
            if (response.success && response.user) {
              setIsAuthenticated(true);
              setUserRole(response.user.role || null);
            } else {
              setIsAuthenticated(false);
              setUserRole(null);
            }
          } catch {
            setIsAuthenticated(false);
            setUserRole(null);
          }
          setLoading(false);
          return;
        }

        // Priority 1: Check localStorage for immediate auth (fastest)
        if (adminAuth) {
          try {
            const admin = JSON.parse(adminAuth);
            setIsAuthenticated(true);
            setUserRole(userRole || admin.role || "admin");
            setLoading(false);
            return;
          } catch (e) {
            // Invalid adminAuth format - silently continue
          }
        } 
        
        if (hotelAuth) {
          try {
            const hotel = JSON.parse(hotelAuth);
            setIsAuthenticated(true);
            setUserRole(userRole || hotel.role || "user");
            setLoading(false);
            return;
          } catch (e) {
            // Invalid hotelAuth format
          }
        }

        // Priority 2: If we have a token but no localStorage auth, try API
        if (token) {
          try {
            const response = await api.getCurrentUser();
            if (response.success && response.user) {
              setIsAuthenticated(true);
              setUserRole(response.user.role || null);
            } else {
              setIsAuthenticated(false);
              setUserRole(null);
            }
          } catch (error) {
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
  }, []); // Remove location.pathname dependency to prevent continuous re-checks

  if (loading) {
    return <ScanBitLoader fullScreen size="lg" showDots />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo || "/login"} state={{ from: location }} replace />;
  }

  if (requireAdmin && userRole !== "admin") {
    return <Navigate to={redirectTo || "/admin/login"} replace />;
  }

  return <>{children}</>;
};

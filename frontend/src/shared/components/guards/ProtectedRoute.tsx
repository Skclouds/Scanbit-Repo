import ProfessionalLoader from "@/components/ui/ProfessionalLoader";
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

        if (!token && !adminAuth && !hotelAuth) {
          setIsAuthenticated(false);
          setUserRole(null);
          setLoading(false);
          return;
        }

        if (adminAuth) {
          try {
            const admin = JSON.parse(adminAuth);
            setIsAuthenticated(true);
            setUserRole(admin.role || "admin");
            setLoading(false);
            
            api.getCurrentUser()
              .then(response => {
                if (response.success && response.user) {
                  setUserRole(response.user.role || admin.role);
                }
              })
              .catch(() => {});
            return;
          } catch {
            // invalid adminAuth
          }
        } 
        
        if (hotelAuth) {
          try {
            const hotel = JSON.parse(hotelAuth);
            setIsAuthenticated(true);
            setUserRole(hotel.role || "user");
            setLoading(false);
            
            api.getCurrentUser()
              .then(response => {
                if (response.success && response.user) {
                  setUserRole(response.user.role || hotel.role);
                }
              })
              .catch(() => {});
            return;
          } catch {
            // invalid hotelAuth
          }
        }

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
          } catch {
            setIsAuthenticated(false);
            setUserRole(null);
          }
        }
      } catch {
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

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo || "/login"} state={{ from: location }} replace />;
  }

  if (requireAdmin && userRole !== "admin") {
    return <Navigate to={redirectTo || "/"} replace />;
  }

  return <>{children}</>;
};

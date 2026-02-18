import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import ProfessionalLoader from "@/components/ui/ProfessionalLoader";
import { Navigate } from "react-router-dom";
import { LogOut, ArrowRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import api from "@/lib/api";


interface PricingRouteProps {
  children: React.ReactNode;
}

export const PricingRoute = ({ children }: PricingRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRedirectDialog, setShowRedirectDialog] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const hasShownDialogRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const adminAuth = localStorage.getItem("adminAuth");
        const hotelAuth = localStorage.getItem("hotelAuth");

        if (!token && !adminAuth && !hotelAuth) {
          if (!cancelled) {
            setIsAuthenticated(false);
            setUserRole(null);
            setLoading(false);
          }
          return;
        }

        let auth = false;
        let role: string | null = null;
        let info: any = null;

        try {
          const response = await api.getCurrentUser();
          if (response.success && response.user) {
            auth = true;
            role = response.user.role || null;
            info = response.user;
          }
        } catch {
          if (adminAuth) {
            try {
              const admin = JSON.parse(adminAuth);
              auth = true;
              role = admin.role || "admin";
              info = admin;
            } catch {
              /* ignore */
            }
          }
          if (!auth && hotelAuth) {
            try {
              const hotel = JSON.parse(hotelAuth);
              auth = true;
              role = hotel.role || "user";
              info = hotel;
            } catch {
              /* ignore */
            }
          }
        }

        if (cancelled) return;
        setIsAuthenticated(auth);
        setUserRole(role);
        setUserInfo(info);
        if (auth && role !== "admin") {
          hasShownDialogRef.current = true;
          setShowRedirectDialog(true);
        }
      } catch (error) {
        if (!cancelled) {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkAuth();
    return () => { cancelled = true; };
  }, []);

  const handleGoToDashboard = () => {
    setShowRedirectDialog(false);
    setTimeout(() => {
      if (userRole === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    }, 100);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("adminAuth");
      localStorage.removeItem("hotelAuth");
      toast.success("Logged out successfully");
      setShowRedirectDialog(false);
      setIsAuthenticated(false);
      setUserRole(null);
      // Force reload to clear all state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  if (loading) {
    return <ProfessionalLoader fullScreen size="lg" variant="minimal" />;
  }

  // Admin can always see pricing
  if (isAuthenticated && userRole === "admin") {
    return <>{children}</>;
  }

  // Non-admin logged-in user - show dialog and redirect
  if (isAuthenticated && userRole !== "admin") {
    return (
      <>
        {showRedirectDialog && (
          <AlertDialog open={showRedirectDialog} onOpenChange={(open) => {
            if (!open) {
              // If dialog is closed without action, redirect anyway
              handleGoToDashboard();
            }
          }}>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <AlertDialogTitle>Redirecting to Dashboard</AlertDialogTitle>
                    <AlertDialogDescription className="mt-1">
                      You are logged in as{" "}
                      <span className="font-medium">
                        {userInfo?.email || userInfo?.name || "User"}
                      </span>
                    </AlertDialogDescription>
                  </div>
                </div>
              </AlertDialogHeader>
              <AlertDialogDescription className="text-base">
                The pricing page is not available for logged-in users. You'll be redirected to your dashboard.
              </AlertDialogDescription>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel
                  onClick={handleLogout}
                  className="w-full sm:w-auto border-destructive text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out Instead
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleGoToDashboard}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {!showRedirectDialog && hasShownDialogRef.current && <Navigate to="/dashboard" replace />}
      </>
    );
  }

  // Not logged in - show pricing
  return <>{children}</>;
};

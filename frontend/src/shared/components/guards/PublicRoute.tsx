import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import ProfessionalLoader from "@/components/ui/ProfessionalLoader";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";


interface PublicRouteProps {
  children: React.ReactNode;
  showLogoutDialog?: boolean;
  redirectTo?: string;
}

export const PublicRoute = ({
  children,
  showLogoutDialog = false,
  redirectTo,
}: PublicRouteProps) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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

  useEffect(() => {
    if (!loading && isAuthenticated && showLogoutDialog) {
      setShowLogoutConfirm(true);
    }
  }, [loading, isAuthenticated, showLogoutDialog]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("adminAuth");
      localStorage.removeItem("hotelAuth");
      toast.success("Logged out successfully");
      setShowLogoutConfirm(false);
      setIsAuthenticated(false);
      setUserRole(null);
      // Force reload to clear all state
      window.location.reload();
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleCancel = () => {
    setShowLogoutConfirm(false);
    // Redirect to appropriate dashboard
    setTimeout(() => {
      if (userRole === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    }, 100);
  };

  if (loading) {
    return <ProfessionalLoader fullScreen size="lg" variant="minimal" />;
  }

  if (isAuthenticated && !showLogoutDialog && redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <>
      {showLogoutConfirm ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <AlertDialog open={showLogoutConfirm} onOpenChange={(open) => {
            if (!open) {
              handleCancel();
            }
          }}>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <LogOut className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <AlertDialogTitle>You're Already Logged In</AlertDialogTitle>
                    <AlertDialogDescription className="mt-1">
                      You are currently logged in as{" "}
                      <span className="font-medium">
                        {userInfo?.email || userInfo?.name || "User"}
                      </span>
                      {userRole === "admin" && (
                        <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                          Admin
                        </span>
                      )}
                    </AlertDialogDescription>
                  </div>
                </div>
              </AlertDialogHeader>
              <AlertDialogDescription className="text-base">
                To access this page, you need to log out of your current session first.
                Would you like to log out now?
              </AlertDialogDescription>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel onClick={handleCancel} className="w-full sm:w-auto">
                  <X className="w-4 h-4 mr-2" />
                  Stay Logged In
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        children
      )}
    </>
  );
};

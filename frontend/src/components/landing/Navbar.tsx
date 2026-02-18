import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { Button } from "@/components/ui/button";
import { FiMenu, FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import { MdQrCode } from "react-icons/md";
import { env } from "@/lib/api";
import api from "@/lib/api";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "user" | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const location = useLocation();
  const { settings } = useSiteSettings();

  // Helper function to check if link is active
  const isActive = (path: string) => {
    return location.pathname === path || (path === "/" && location.pathname === "/");
  };

  // Get active link class
  const getLinkClass = (path: string) => {
    const isLinkActive = isActive(path);
    return isLinkActive
      ? "text-primary font-semibold transition-colors"
      : "text-muted-foreground hover:text-foreground transition-colors";
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const adminAuth = localStorage.getItem("adminAuth");
    const hotelAuth = localStorage.getItem("hotelAuth");
    setIsLoggedIn(Boolean(token || adminAuth || hotelAuth));
    try {
      const parsed =
        (adminAuth && JSON.parse(adminAuth)) ||
        (hotelAuth && JSON.parse(hotelAuth)) ||
        null;
      setProfileName(parsed?.name || parsed?.email || null);
    } catch {
      setProfileName(null);
    }

    if (token) {
      (async () => {
        try {
          const res = await api.getCurrentUser();
          if (res.success && res.user) {
            setProfileImage(
              res.user.profileImage ||
              (res.user.restaurant?.ownerImage) ||
              (res.user.restaurant?.logo) ||
              null
            );
            setUserRole(res.user.role === "admin" ? "admin" : "user");
          } else {
            setProfileImage(null);
            setUserRole(null);
          }
        } catch {
          setProfileImage(null);
          setUserRole(null);
        }
      })();
    } else {
      setProfileImage(null);
      setUserRole(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("hotelAuth");
    setIsLoggedIn(false);
    setShowLogoutConfirm(false);
    navigate("/");
  };

  return (
    <>
    <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Log out of your account?</AlertDialogTitle>
          <AlertDialogDescription>
            You will need to sign in again to access your dashboard and business data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Log out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <nav className="fixed left-0 right-0 top-0 z-50 glass-card border-b supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            {settings?.branding?.logoUrl ? (
              <img 
                src={settings.branding.logoUrl} 
                alt={env.APP_NAME} 
                className="h-12 w-auto rounded object-contain" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="h-12 w-12 gradient-primary rounded flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                {(settings?.general?.siteName || env.APP_NAME || "SB").substring(0, 2).toUpperCase()}
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={getLinkClass("/")}>
              Home
            </Link>
            <Link to="/our-services" className={getLinkClass("/our-services")}>
              Our Services
            </Link>
            <Link to="/features" className={getLinkClass("/features")}>
              Features
            </Link>
            {/* Show pricing only if not logged in OR if user is admin */}
            {(!isLoggedIn || userRole === "admin") && (
              <Link to="/pricing" className={getLinkClass("/pricing")}>
                Pricing
              </Link>
            )}
            <Link to="/how-it-works" className={getLinkClass("/how-it-works")}>
              How It Works
            </Link>
            <Link to="/blogs" className={getLinkClass("/blogs")}>
              Blog
            </Link>
          </div>

          {/* Auth / Profile */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={profileImage || undefined} />
                      <AvatarFallback>
                        {(profileName || env.APP_NAME || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden lg:inline">
                      {profileName || "Account"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      navigate(userRole === "admin" ? "/admin/dashboard" : "/dashboard")
                    }
                  >
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      navigate(userRole === "admin" ? "/admin/dashboard" : "/dashboard?tab=profile")
                    }
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowLogoutConfirm(true)}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button - min 44px touch target for iOS/accessibility */}
          <button
            type="button"
            className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-1"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu - touch-friendly link height (44px min) for iOS/accessibility */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-0">
              <Link to="/" className={`${getLinkClass("/")} py-3 min-h-[44px] flex items-center`} onClick={() => setIsOpen(false)}>
                Home
              </Link>
              <Link to="/our-services" className={`${getLinkClass("/our-services")} py-3 min-h-[44px] flex items-center`} onClick={() => setIsOpen(false)}>
                Our Services
              </Link>
              <Link to="/features" className={`${getLinkClass("/features")} py-3 min-h-[44px] flex items-center`} onClick={() => setIsOpen(false)}>
                Features
              </Link>
              {/* Show pricing only if not logged in OR if user is admin */}
              {(!isLoggedIn || userRole === "admin") && (
                <Link to="/pricing" className={`${getLinkClass("/pricing")} py-3 min-h-[44px] flex items-center`} onClick={() => setIsOpen(false)}>
                  Pricing
                </Link>
              )}
              <Link to="/how-it-works" className={`${getLinkClass("/how-it-works")} py-3 min-h-[44px] flex items-center`} onClick={() => setIsOpen(false)}>
                How It Works
              </Link>
              <Link to="/blogs" className={`${getLinkClass("/blogs")} py-3 min-h-[44px] flex items-center`} onClick={() => setIsOpen(false)}>
                Blog
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {isLoggedIn ? (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/dashboard");
                      }}
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setIsOpen(false);
                        navigate(userRole === "admin" ? "/admin/dashboard" : "/dashboard?tab=profile");
                      }}
                    >
                      Profile
                    </Button>
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => {
                        setIsOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="w-full">
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button variant="default" asChild className="w-full">
                      <Link to="/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
};

export default Navbar;

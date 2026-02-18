import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaWhatsapp, FaPhone } from "react-icons/fa";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useEffect, useState } from "react";
import { MdQrCode, MdEmail, MdPhone } from "react-icons/md";
import { Link } from "react-router-dom";
import { env } from "@/lib/api";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";


const Footer = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { settings } = useSiteSettings();
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [brochureForm, setBrochureForm] = useState({
    name: '',
    email: '',
    mobile: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const adminAuth = localStorage.getItem("adminAuth");
        const hotelAuth = localStorage.getItem("hotelAuth");

        if (!token && !adminAuth && !hotelAuth) {
          setIsLoggedIn(false);
          setUserRole(null);
          return;
        }

        try {
          const response = await api.getCurrentUser();
          if (response.success && response.user) {
            setIsLoggedIn(true);
            setUserRole(response.user.role || null);
          } else {
            setIsLoggedIn(false);
            setUserRole(null);
          }
        } catch (error) {
          if (adminAuth) {
            try {
              const admin = JSON.parse(adminAuth);
              setIsLoggedIn(true);
              setUserRole(admin.role || "admin");
            } catch {
              setIsLoggedIn(false);
              setUserRole(null);
            }
          } else if (hotelAuth) {
            try {
              const hotel = JSON.parse(hotelAuth);
              setIsLoggedIn(true);
              setUserRole(hotel.role || "user");
            } catch {
              setIsLoggedIn(false);
              setUserRole(null);
            }
          } else {
            setIsLoggedIn(false);
            setUserRole(null);
          }
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    checkAuth();
  }, []);

  const handleDownloadBrochure = async () => {
    if (!brochureForm.name.trim() || !brochureForm.email.trim() || !brochureForm.mobile.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(brochureForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Basic mobile validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(brochureForm.mobile.replace(/\D/g, ''))) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.downloadBrochure({
        name: brochureForm.name.trim(),
        email: brochureForm.email.trim(),
        mobile: brochureForm.mobile.replace(/\D/g, '')
      });

      if (response?.success) {
        toast.success("Brochure sent successfully! Please check your email.");
        setShowBrochureModal(false);
        setBrochureForm({ name: '', email: '', mobile: '' });
      } else {
        toast.error(response?.message || "Failed to send brochure. Please try again.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to send brochure. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const linkClass = "text-muted-foreground hover:text-foreground transition-colors text-sm";

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              {settings?.branding?.footerLogoUrl || settings?.branding?.logoUrl ? (
                <img 
                  src={settings.branding.footerLogoUrl || settings.branding.logoUrl} 
                  alt={env.APP_NAME} 
                  className="h-12 object-contain" 
                />
              ) : (
                <>
                  <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                    <MdQrCode className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-display text-xl font-bold text-foreground">
                    {env.APP_NAME}
                  </span>
                </>
              )}
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              {env.APP_DESCRIPTION}
            </p>
            <div className="flex gap-4 flex-wrap">
              {env.SOCIAL_FACEBOOK && (
                <a href={env.SOCIAL_FACEBOOK} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors" aria-label="Facebook">
                  <FaFacebook className="w-5 h-5" />
                </a>
              )}
              {env.SOCIAL_TWITTER && (
                <a href={env.SOCIAL_TWITTER} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors" aria-label="Twitter">
                  <FaTwitter className="w-5 h-5" />
                </a>
              )}
              <a href="https://www.instagram.com/scan.bit?igsh=MWsyYXZlOG93cDlsNA==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors" aria-label="Instagram">
                <FaInstagram className="w-5 h-5" />
              </a>
              {env.SOCIAL_LINKEDIN && (
                <a href={env.SOCIAL_LINKEDIN} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors" aria-label="LinkedIn">
                  <FaLinkedin className="w-5 h-5" />
                </a>
              )}
              <a href="tel:+6390420225" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors" aria-label="Call">
                <FaPhone className="w-5 h-5" />
              </a>
              <a href="https://wa.me/6390420225" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors" aria-label="WhatsApp">
                <FaWhatsapp className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link to="/features" className={linkClass}>Features</Link></li>
              {(!isLoggedIn || userRole === "admin") && (
                <li><Link to="/pricing" className={linkClass}>Pricing</Link></li>
              )}
              <li><Link to="/how-it-works" className={linkClass}>How It Works</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about-us" className={linkClass}>About Us</Link></li>
              <li><Link to="/our-services" className={linkClass}>Our Services</Link></li>
              <li><Link to="/blogs" className={linkClass}>Blog</Link></li>
              <li>
                <button onClick={() => setShowBrochureModal(true)} className={linkClass + " text-left w-full"}>
                  Download Brochure
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link to="/support" className={linkClass}>Support</Link></li>
              <li><Link to="/help-center" className={linkClass}>Help Center</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:support@scanbit.in" className={`${linkClass} inline-flex items-center gap-2`}>
                  <MdEmail className="w-4 h-4 flex-shrink-0" />
                  support@scanbit.in
                </a>
              </li>
              <li>
                <a href="tel:+916390420225" className={`${linkClass} inline-flex items-center gap-2`}>
                  <MdPhone className="w-4 h-4 flex-shrink-0" />
                  +91 6390420225
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/privacy-policy" className={linkClass}>Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className={linkClass}>Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-sm text-muted-foreground order-2 sm:order-1">
            © {new Date().getFullYear()} {env.APP_NAME}. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground order-1 sm:order-2">
            Developed and maintained by <span className="font-semibold text-foreground">{env.COMPANY_NAME}</span>
          </p>
        </div>
      </div>

      {/* Brochure Download Modal */}
      <Dialog open={showBrochureModal} onOpenChange={setShowBrochureModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Download Brochure</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="brochure-name">Name *</Label>
              <Input
                id="brochure-name"
                value={brochureForm.name}
                onChange={(e) => setBrochureForm({ ...brochureForm, name: e.target.value })}
                placeholder="Enter your name"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brochure-email">Email *</Label>
              <Input
                id="brochure-email"
                type="email"
                value={brochureForm.email}
                onChange={(e) => setBrochureForm({ ...brochureForm, email: e.target.value })}
                placeholder="Enter your email"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brochure-mobile">Mobile Number *</Label>
              <Input
                id="brochure-mobile"
                type="tel"
                value={brochureForm.mobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setBrochureForm({ ...brochureForm, mobile: value });
                  }
                }}
                placeholder="Enter your mobile number"
                maxLength={10}
                disabled={submitting}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleDownloadBrochure}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? "Sending..." : "Download Brochure"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowBrochureModal(false);
                  setBrochureForm({ name: '', email: '', mobile: '' });
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
};

export default Footer;

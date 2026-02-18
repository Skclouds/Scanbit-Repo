import { MdQrCode, MdCheck, MdRestaurantMenu, MdShoppingBag, MdBrush, MdRestaurant, MdLocalCafe, MdHotel, MdFastfood, MdCake, MdLocalBar, MdStorefront, MdLocalDrink, MdStore, MdEvent, MdInventory, MdChair, MdDevices, MdToys, MdPrint, MdDesignServices, MdPalette, MdWork, MdCampaign, MdIcecream } from "react-icons/md";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { FiArrowLeft, FiEye, FiEyeOff, FiInfo, FiCheck, FiMail } from "react-icons/fi";
import { RegisterSuccessOverlay } from "@/components/register/RegisterSuccessOverlay";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { Country, State, City } from "country-state-city";
import { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import api, { env } from "@/lib/api";
import { toast } from "sonner";


// Icon mapping for dynamic icons
const iconMap: Record<string, any> = {
  MdRestaurantMenu,
  MdShoppingBag,
  MdBrush,
  MdRestaurant,
  MdLocalCafe,
  MdHotel,
  MdFastfood,
  MdCake,
  MdLocalBar,
  MdStorefront,
  MdIcecream,
  MdLocalDrink,
  MdStore,
  MdEvent,
  MdInventory,
  MdChair,
  MdDevices,
  MdToys,
  MdPrint,
  MdDesignServices,
  MdPalette,
  MdWork,
  MdCampaign,
};

// Country codes with flags for phone (default +91)
const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", label: "India" },
  { code: "+1", flag: "🇺🇸", label: "US" },
  { code: "+44", flag: "🇬🇧", label: "UK" },
  { code: "+971", flag: "🇦🇪", label: "UAE" },
  { code: "+966", flag: "🇸🇦", label: "Saudi Arabia" },
  { code: "+61", flag: "🇦🇺", label: "Australia" },
  { code: "+49", flag: "🇩🇪", label: "Germany" },
];


// Fallback data if API fails
const fallbackBusinessTypeCategories = {
  "Food Mall": {
    subcategories: [
      { name: "Restaurants", icon: MdRestaurant },
      { name: "Cafés", icon: MdLocalCafe },
      { name: "Hotels", icon: MdHotel },
      { name: "Cloud Kitchens", icon: MdStorefront },
      { name: "Food Courts / Fast Foods", icon: MdFastfood },
      { name: "Bakeries", icon: MdCake },
      { name: "Bars & Pubs", icon: MdLocalBar },
      { name: "Street Food Vendors", icon: MdStorefront },
      { name: "Coffee Shops", icon: MdLocalCafe },
      { name: "Ice Cream Shops", icon: MdFastfood },
      { name: "Juice Bars", icon: MdLocalDrink },
      { name: "Tea Houses", icon: MdStore },
      { name: "Catering Services", icon: MdEvent },
    ],
    layout: "Menu layout",
    icon: MdRestaurantMenu,
    iconColor: "text-primary",
    description: "Perfect for food businesses with menu management and QR code solutions.",
  },
  "Retail / E-Commerce Businesses": {
    subcategories: [
      { name: "Clothing Stores", icon: MdInventory },
      { name: "Furniture Stores", icon: MdChair },
      { name: "Electronic Shop", icon: MdDevices },
      { name: "Toy Shops", icon: MdToys },
    ],
    layout: "Product catalog layout",
    icon: MdShoppingBag,
    iconColor: "text-accent",
    description: "Ideal for retail stores and e-commerce businesses showcasing products.",
  },
  "Creative & Design": {
    subcategories: [
      { name: "Printed products", icon: MdPrint },
      { name: "Logo Designers", icon: MdDesignServices },
      { name: "Graphic Designers", icon: MdPalette },
      { name: "Freelancers", icon: MdWork },
      { name: "Digital Marketing Agencies", icon: MdCampaign },
    ],
    layout: "Portfolio layout",
    icon: MdBrush,
    iconColor: "text-primary",
    description: "Perfect for creative professionals and agencies showcasing their work.",
  },
};

const Register = () => {
  const { settings } = useSiteSettings();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [selectedMainType, setSelectedMainType] = useState<string>("");
  const [businessTypeCategories, setBusinessTypeCategories] = useState<any>(fallbackBusinessTypeCategories);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    businessCategory: "", // Main type (Food Mall, Retail, Creative)
    businessType: "", // Subcategory
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "IN", // ISO country code (IN for India)
  });
  const [phoneCountryCode, setPhoneCountryCode] = useState("+91");
  
  // Location data states
  const [availableStates, setAvailableStates] = useState<State[]>([]);
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  
  // OTP verification state
  const [otpState, setOtpState] = useState({
    otpSent: false,
    otpVerified: false,
    otp: "",
    sendingOTP: false,
    verifyingOTP: false,
    resendCooldown: 0, // Seconds until resend is allowed
  });
  const resendCooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Terms and Privacy acceptance state
  const [termsAndPrivacyAccepted, setTermsAndPrivacyAccepted] = useState(false);

  const normalizeEmail = (value: string) => value.trim().toLowerCase();

  // Load business categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await api.getBusinessCategories();
        if (response.success && response.data.length > 0) {
          // Transform API data to match the expected format
          const transformed: any = {};
          response.data
            .filter((category: any) => category.isActive)
            .sort((a: any, b: any) => a.order - b.order)
            .forEach((category: any) => {
              const CategoryIcon = iconMap[category.icon] || MdStore;
              transformed[category.name] = {
                subcategories: category.businessTypes
                  .filter((type: any) => type.isActive)
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((type: any) => ({
                    name: type.name,
                    icon: iconMap[type.icon] || MdStore,
                    description: type.description
                  })),
                layout: category.layout,
                icon: CategoryIcon,
                iconColor: category.iconColor,
                description: category.description
              };
            });
          if (Object.keys(transformed).length > 0) {
            setBusinessTypeCategories(transformed);
          }
        }
      } catch (error) {

        // Use fallback data
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (resendCooldownIntervalRef.current) {
        clearInterval(resendCooldownIntervalRef.current);
        resendCooldownIntervalRef.current = null;
      }
    };
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (formData.country) {
      setLoadingStates(true);
      try {
        const states = State.getStatesOfCountry(formData.country);
        setAvailableStates(states);
        // Reset state and city when country changes
        if (formData.state) {
          setFormData(prev => ({ ...prev, state: "", city: "" }));
        }
      } catch (error) {
        setAvailableStates([]);
      } finally {
        setLoadingStates(false);
      }
    } else {
      setAvailableStates([]);
    }
  }, [formData.country]);

  // Load cities when state changes
  useEffect(() => {
    if (formData.country && formData.state) {
      setLoadingCities(true);
      try {
        const cities = City.getCitiesOfState(formData.country, formData.state);
        setAvailableCities(cities);
        // Reset city when state changes
        if (formData.city) {
          setFormData(prev => ({ ...prev, city: "" }));
        }
      } catch (error) {
        setAvailableCities([]);
      } finally {
        setLoadingCities(false);
      }
    } else {
      setAvailableCities([]);
    }
  }, [formData.country, formData.state]);

  // Handle email change - reset OTP state and clear cooldown timer
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setFormData((prev) => ({ ...prev, email: newEmail }));
    if (newEmail !== formData.email) {
      if (resendCooldownIntervalRef.current) {
        clearInterval(resendCooldownIntervalRef.current);
        resendCooldownIntervalRef.current = null;
      }
      setOtpState({
        otpSent: false,
        otpVerified: false,
        otp: "",
        sendingOTP: false,
        verifyingOTP: false,
        resendCooldown: 0,
      });
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!formData.email || !formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (otpState.resendCooldown > 0) {
      toast.error(`Please wait ${otpState.resendCooldown} seconds before resending`);
      return;
    }

    setOtpState((prev) => ({ ...prev, sendingOTP: true }));
    try {
      const normalizedEmail = normalizeEmail(formData.email);
      const response = await api.sendOTP(normalizedEmail, "registration");
      if (response.success) {
        if (resendCooldownIntervalRef.current) {
          clearInterval(resendCooldownIntervalRef.current);
          resendCooldownIntervalRef.current = null;
        }
        setOtpState((prev) => ({
          ...prev,
          otpSent: true,
          sendingOTP: false,
          resendCooldown: 60,
        }));
        toast.success(response.message || "OTP sent successfully! Please check your email.");

        const interval = setInterval(() => {
          setOtpState((prev) => {
            if (prev.resendCooldown <= 1) {
              if (resendCooldownIntervalRef.current) {
                clearInterval(resendCooldownIntervalRef.current);
                resendCooldownIntervalRef.current = null;
              }
              return { ...prev, resendCooldown: 0 };
            }
            return { ...prev, resendCooldown: prev.resendCooldown - 1 };
          });
        }, 1000);
        resendCooldownIntervalRef.current = interval;
      }
    } catch (error: any) {
      setOtpState((prev) => ({ ...prev, sendingOTP: false }));
      toast.error(error.message || "Failed to send OTP. Please try again.");
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otpState.otp || otpState.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setOtpState((prev) => ({ ...prev, verifyingOTP: true }));
    try {
      const normalizedEmail = normalizeEmail(formData.email);
      const response = await api.verifyOTP(normalizedEmail, otpState.otp, "registration");
      if (response.success && response.verified) {
        setOtpState((prev) => ({ ...prev, otpVerified: true, verifyingOTP: false }));
        toast.success("✅ Email verified successfully!");
      } else {
        setOtpState((prev) => ({ ...prev, verifyingOTP: false }));
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error: any) {
      setOtpState((prev) => ({ ...prev, verifyingOTP: false }));
      toast.error(error.message || "Invalid OTP. Please try again.");
    }
  };

  const trim = (s: string) => (typeof s === "string" ? s.trim() : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpState.otpVerified) {
      toast.error("Please verify your email with OTP before registering");
      return;
    }

    if (!termsAndPrivacyAccepted) {
      toast.error("Please accept the Terms of Service and Privacy Policy to continue");
      return;
    }

    const raw = { ...formData };
    const name = trim(raw.fullName) || trim(raw.businessName);
    const businessName = trim(raw.businessName);
    const email = normalizeEmail(trim(raw.email));
    const password = trim(raw.password);
    const phone = trim(raw.phone);

    if (!name || name.length < 2) {
      toast.error("Please enter your full name (at least 2 characters)");
      return;
    }
    if (!businessName || businessName.length < 2) {
      toast.error("Please enter your business name (at least 2 characters)");
      return;
    }
    if (!trim(raw.businessCategory)) {
      toast.error("Please select a business category");
      return;
    }
    if (!trim(raw.businessType)) {
      toast.error("Please select a business type");
      return;
    }
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      toast.error("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.register({
        name,
        email,
        password,
        businessName,
        businessCategory: trim(raw.businessCategory) || undefined,
        businessType: trim(raw.businessType),
        phone: phone || undefined,
        address: {
          street: trim(raw.address) || "",
          city: trim(raw.city) || "",
          state: trim(raw.state) || "",
          zipCode: trim(raw.zipCode) || "",
          country: (() => {
            // Convert ISO code to country name if needed
            if (raw.country && raw.country.length === 2) {
              const countryData = Country.getCountryByCode(raw.country);
              return countryData?.name || raw.country;
            }
            return trim(raw.country) || "India";
          })(),
        },
      });

      if (response.success) {
        localStorage.setItem(
          "hotelAuth",
          JSON.stringify({
            email: response.user.email,
            role: response.user.role,
            userId: response.user.id,
            restaurantId: response.restaurant.id,
          })
        );
        sessionStorage.setItem("showSubscriptionAfterOnboarding", "true");
        const selectedPlan = sessionStorage.getItem("selectedPlan");
        if (selectedPlan) {
          sessionStorage.setItem("preSelectedPlan", selectedPlan);
          sessionStorage.removeItem("selectedPlan");
        }
        // Allow the success overlay to render even though PublicRoute detects auth.
        // PublicRoute will skip redirect briefly when this flag is present.
        sessionStorage.setItem("postRegisterOverlayUntil", String(Date.now() + 8000));
        setRegistrationSuccess(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "email") {
      handleEmailChange(e);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleMainTypeChange = (value: string) => {
    setSelectedMainType(value);
    setFormData({ 
      ...formData, 
      businessCategory: value,
      businessType: "" // Reset subcategory when main type changes
    });
  };

  const handleSubcategoryChange = (value: string) => {
    setFormData({ ...formData, businessType: value });
  };

  const selectedCategoryInfo = selectedMainType ? businessTypeCategories[selectedMainType as keyof typeof businessTypeCategories] : null;

  const fieldClass = "space-y-2";
  const inputClass = "h-11 sm:h-12";

  if (registrationSuccess) {
    return <RegisterSuccessOverlay delayMs={2800} redirectTo="/dashboard" />;
  }

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:py-10 overflow-y-auto">
      <Link
        to="/"
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-10 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm bg-background/80 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none px-3 py-2 rounded-lg sm:px-0 sm:py-0 sm:rounded-none"
      >
        <FiArrowLeft className="w-4 h-4 flex-shrink-0" />
        <span className="sm:hidden">Back</span>
        <span className="hidden sm:inline">Back to home</span>
      </Link>

      <div className="w-full max-w-2xl lg:max-w-3xl flex-1 flex flex-col pt-12 sm:pt-0 sm:justify-center">
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center justify-center">
            {settings?.branding?.logoUrl ? (
              <img
                src={settings.branding.logoUrl}
                alt={settings.general?.siteName || env.APP_NAME}
                className="h-16 sm:h-20 lg:h-24 w-auto object-contain"
              />
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <MdQrCode className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
                </div>
                <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                  {env.APP_NAME}
                </span>
              </div>
            )}
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 lg:p-10">
          <div className="mb-6 sm:mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Get Started
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
            {/* Personal & Business */}
            <div className="space-y-4 sm:space-y-5">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide border-b border-border pb-2">
                Personal & Business
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div className={fieldClass}>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Your name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div className={fieldClass}>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    type="text"
                    placeholder="Enter Your Business Name"
                    value={formData.businessName}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div className={fieldClass}>
                  <Label htmlFor="businessCategory">Business Category *</Label>
                  <Select
                    value={formData.businessCategory}
                    onValueChange={handleMainTypeChange}
                    required
                  >
                    <SelectTrigger className={`${inputClass} flex items-center gap-2`}>
                      {formData.businessCategory ? (() => {
                        const info = businessTypeCategories[formData.businessCategory as keyof typeof businessTypeCategories];
                        const Icon = info?.icon;
                        return (
                          <>
                            {Icon && <Icon className={`w-5 h-5 ${info.iconColor} flex-shrink-0`} />}
                            <SelectValue className="flex-1" />
                          </>
                        );
                      })() : (
                        <SelectValue placeholder="Select category" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(businessTypeCategories).map((category) => {
                        const info = businessTypeCategories[category as keyof typeof businessTypeCategories];
                        const Icon = info.icon;
                        return (
                          <SelectItem key={category} value={category}>
                            <div className="flex items-center gap-2">
                              <Icon className={`w-5 h-5 ${info.iconColor}`} />
                              <span>{category}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                {selectedMainType && (
                  <div className={`${fieldClass} animate-slide-up`}>
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={handleSubcategoryChange}
                      required
                    >
                      <SelectTrigger className={`${inputClass} flex items-center gap-2`}>
                        {formData.businessType ? (() => {
                          const info = businessTypeCategories[selectedMainType as keyof typeof businessTypeCategories];
                          const subcategory = info?.subcategories.find((sub) => sub.name === formData.businessType);
                          if (subcategory) {
                            const SubIcon = subcategory.icon;
                            return (
                              <>
                                <SubIcon className={`w-5 h-5 ${info.iconColor} flex-shrink-0`} />
                                <SelectValue className="flex-1" />
                              </>
                            );
                          }
                          return <SelectValue />;
                        })() : (
                          <SelectValue placeholder="Select type" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypeCategories[selectedMainType as keyof typeof businessTypeCategories]?.subcategories.map((subcategory) => {
                          const SubIcon = subcategory.icon;
                          const info = businessTypeCategories[selectedMainType as keyof typeof businessTypeCategories];
                          return (
                            <SelectItem key={subcategory.name} value={subcategory.name}>
                              <div className="flex items-center gap-2">
                                <SubIcon className={`w-5 h-5 ${info.iconColor}`} />
                                <span>{subcategory.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              {selectedCategoryInfo && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <FiInfo className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">{selectedCategoryInfo.description}</p>
                    <p className="text-xs text-primary font-medium mt-1">Layout: {selectedCategoryInfo.layout}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="space-y-4 sm:space-y-5">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide border-b border-border pb-2">
                Contact
              </h3>
              <div className={fieldClass}>
                <Label htmlFor="email">Email address *</Label>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <div className="flex-1 relative min-w-0">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10 pointer-events-none" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@business.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${inputClass} pl-10 pr-10 w-full`}
                        required
                        disabled={otpState.otpVerified || otpState.otpSent}
                      />
                      {otpState.otpVerified && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <FiCheck className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    {!otpState.otpVerified && (
                      <Button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={!formData.email || !formData.email.includes("@") || otpState.sendingOTP || otpState.otpSent}
                        className={`${inputClass} px-4 sm:px-5 whitespace-nowrap flex-shrink-0 w-full sm:w-auto`}
                      >
                        {otpState.sendingOTP ? "Sending..." : otpState.otpSent ? "Sent" : "Send OTP"}
                      </Button>
                    )}
                  </div>

                  {otpState.otpSent && !otpState.otpVerified && (
                    <div className="space-y-2 p-4 rounded-lg bg-secondary border border-border">
                      <Label htmlFor="otp" className="text-sm">Enter OTP *</Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          id="otp"
                          type="text"
                          placeholder="000000"
                          value={otpState.otp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                            setOtpState((prev) => ({ ...prev, otp: value }));
                          }}
                          className={`${inputClass} text-center text-lg tracking-widest font-mono`}
                          maxLength={6}
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyOTP}
                          disabled={otpState.otp.length !== 6 || otpState.verifyingOTP}
                          className={`${inputClass} px-4 whitespace-nowrap flex-shrink-0`}
                        >
                          {otpState.verifyingOTP ? "Verifying..." : "Verify OTP"}
                        </Button>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p className="text-xs text-muted-foreground">Enter the 6-digit OTP sent to your email</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleSendOTP}
                          disabled={otpState.sendingOTP || otpState.resendCooldown > 0}
                          className="h-8 px-3 text-xs self-start sm:self-auto"
                        >
                          {otpState.sendingOTP
                            ? "Sending..."
                            : otpState.resendCooldown > 0
                              ? `Resend (${otpState.resendCooldown}s)`
                              : "Resend OTP"}
                        </Button>
                      </div>
                    </div>
                  )}
                  {otpState.otpVerified && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">Email verified successfully!</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div className={fieldClass}>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="flex gap-2">
                    <Select
                      value={phoneCountryCode}
                      onValueChange={setPhoneCountryCode}
                    >
                      <SelectTrigger className={`${inputClass} w-[130px] sm:w-[140px] flex-shrink-0 gap-1.5`}>
                        {(() => {
                          const selected = COUNTRY_CODES.find((c) => c.code === phoneCountryCode);
                          return selected ? (
                            <span className="flex items-center gap-1.5">
                              <span className="text-lg">{selected.flag}</span>
                              <span>{selected.code}</span>
                            </span>
                          ) : (
                            <SelectValue />
                          );
                        })()}
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map((c) => (
                          <SelectItem key={c.code + c.label} value={c.code}>
                            <span className="flex items-center gap-2">
                              <span className="text-lg">{c.flag}</span>
                              <span>{c.code}</span>
                              <span className="text-muted-foreground hidden sm:inline">({c.label})</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="63904 20225"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`${inputClass} flex-1 min-w-0`}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4 sm:space-y-5">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide border-b border-border pb-2">
                Address <span className="font-normal normal-case text-muted-foreground">(optional)</span>
              </h3>
              
              {/* Street Address */}
              <div className={fieldClass}>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Street address, building name, floor"
                  value={formData.address}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Country */}
              <div className={fieldClass}>
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country || "IN"}
                  onValueChange={(value) => setFormData({ ...formData, country: value, state: "", city: "" })}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {Country.getAllCountries()
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((country) => (
                        <SelectItem key={country.isoCode} value={country.isoCode}>
                          {country.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* State and Zip Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className={fieldClass}>
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={formData.state || ""}
                    onValueChange={(value) => setFormData({ ...formData, state: value, city: "" })}
                    disabled={!formData.country || loadingStates || availableStates.length === 0}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder={loadingStates ? "Loading states..." : availableStates.length === 0 ? "No states available" : "Select state"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {availableStates.length > 0 && availableStates
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((state) => (
                          <SelectItem key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className={fieldClass}>
                  <Label htmlFor="zipCode">Zip Code / PIN Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    placeholder="123456"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className={inputClass}
                    maxLength={10}
                  />
                </div>
              </div>

              {/* City */}
              <div className={fieldClass}>
                <Label htmlFor="city">City</Label>
                <Select
                  value={formData.city || ""}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                  disabled={!formData.state || loadingCities || availableCities.length === 0}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={loadingCities ? "Loading cities..." : !formData.state ? "Select state first" : availableCities.length === 0 ? "No cities available" : "Select city"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {availableCities.length > 0 && availableCities
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((city) => (
                        <SelectItem key={`${city.name}-${city.stateCode}`} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-4 sm:space-y-5">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide border-b border-border pb-2">
                Security
              </h3>
              <div className={`${fieldClass} max-w-xl`}>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${inputClass} pr-12`}
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs mt-2">
                    <div className={`flex items-center gap-1 ${formData.password.length >= 8 ? "text-green-600" : "text-muted-foreground"}`}>
                      {formData.password.length >= 8 ? "✓" : "○"} 8+ characters
                    </div>
                    <div className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) ? "text-green-600" : "text-muted-foreground"}`}>
                      {/[a-z]/.test(formData.password) ? "✓" : "○"} Lowercase
                    </div>
                    <div className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? "text-green-600" : "text-muted-foreground"}`}>
                      {/[A-Z]/.test(formData.password) ? "✓" : "○"} Uppercase
                    </div>
                    <div className={`flex items-center gap-1 ${/\d/.test(formData.password) ? "text-green-600" : "text-muted-foreground"}`}>
                      {/\d/.test(formData.password) ? "✓" : "○"} Number
                    </div>
                    <div className={`flex items-center gap-1 col-span-1 sm:col-span-2 md:col-span-1 ${/[@$!%*?&]/.test(formData.password) ? "text-green-600" : "text-muted-foreground"}`}>
                      {/[@$!%*?&]/.test(formData.password) ? "✓" : "○"} Special (@$!%*?&)
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {/* Terms and Privacy Checkbox */}
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl border border-border">
                <Checkbox
                  id="terms-privacy"
                  checked={termsAndPrivacyAccepted}
                  onCheckedChange={(checked) => setTermsAndPrivacyAccepted(checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms-privacy" className="text-sm leading-relaxed cursor-pointer flex-1">
                  I agree to the{" "}
                  <Link 
                    to="/terms-of-service" 
                    className="text-primary hover:underline font-medium transition-colors" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms of Service
                  </Link>
                  {" "}and{" "}
                  <Link 
                    to="/privacy-policy" 
                    className="text-primary hover:underline font-medium transition-colors" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full h-12 sm:h-14 text-base font-semibold"
                disabled={isLoading || !formData.businessCategory || !formData.businessType || !otpState.otpVerified || !termsAndPrivacyAccepted}
              >
                {isLoading ? "Registering..." : "Create account"}
              </Button>
              {!otpState.otpVerified && (
                <p className="text-xs text-red-500 text-center">Please verify your email with OTP before registering.</p>
              )}
              {!termsAndPrivacyAccepted && otpState.otpVerified && (
                <p className="text-xs text-red-500 text-center">Please accept the Terms of Service and Privacy Policy to continue.</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

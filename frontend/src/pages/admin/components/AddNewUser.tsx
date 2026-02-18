import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Check, AlertCircle, User, Building, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface BusinessCategory {
  _id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  layout: string;
  businessTypes: BusinessType[];
  isActive: boolean;
  order: number;
}

interface BusinessType {
  _id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  order: number;
}

interface AddNewUserProps {
  onUserCreated?: () => void;
}

const AddNewUser: React.FC<AddNewUserProps> = ({ onUserCreated }) => {
  const [loading, setLoading] = useState(false);
  const [businessCategories, setBusinessCategories] = useState<BusinessCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    businessCategory: "",
    businessType: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India"
    }
  });

  // OTP state
  const [otpState, setOtpState] = useState({
    otpSent: false,
    otpVerified: false,
    otp: "",
    sendingOTP: false,
    verifyingOTP: false,
    resendCooldown: 0
  });

  // Load business categories
  useEffect(() => {
    const loadBusinessCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await api.getBusinessCategories();
        if (response.success && response.data) {
          const activeCategories = response.data
            .filter((cat: BusinessCategory) => cat.isActive)
            .sort((a: BusinessCategory, b: BusinessCategory) => a.order - b.order);
          setBusinessCategories(activeCategories);
        }
      } catch (error) {

        toast.error('Failed to load business categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadBusinessCategories();
  }, []);

  // Handle form field changes
  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Reset OTP state when email changes
    if (field === 'email') {
      setOtpState({
        otpSent: false,
        otpVerified: false,
        otp: "",
        sendingOTP: false,
        verifyingOTP: false,
        resendCooldown: 0
      });
    }

    // Reset business type when category changes
    if (field === 'businessCategory') {
      setFormData(prev => ({
        ...prev,
        businessType: ""
      }));
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

    setOtpState(prev => ({ ...prev, sendingOTP: true }));
    try {
      const response = await api.sendOTP(formData.email, 'registration');
      if (response.success) {
        setOtpState(prev => ({ 
          ...prev, 
          otpSent: true, 
          sendingOTP: false,
          resendCooldown: 60
        }));
        toast.success("OTP sent successfully! Please check the user's email.");
        
        // Start cooldown timer
        const interval = setInterval(() => {
          setOtpState(prev => {
            if (prev.resendCooldown <= 1) {
              clearInterval(interval);
              return { ...prev, resendCooldown: 0 };
            }
            return { ...prev, resendCooldown: prev.resendCooldown - 1 };
          });
        }, 1000);
      }
    } catch (error: any) {
      setOtpState(prev => ({ ...prev, sendingOTP: false }));
      toast.error(error.message || "Failed to send OTP");
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otpState.otp || otpState.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setOtpState(prev => ({ ...prev, verifyingOTP: true }));
    try {
      const response = await api.verifyOTP(formData.email, otpState.otp);
      if (response.success && response.verified) {
        setOtpState(prev => ({ ...prev, otpVerified: true, verifyingOTP: false }));
        toast.success("✅ Email verified successfully!");
      }
    } catch (error: any) {
      setOtpState(prev => ({ ...prev, verifyingOTP: false }));
      toast.error(error.message || "Invalid OTP");
    }
  };

  // Create user
  const handleCreateUser = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter the user's full name");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter the user's email");
      return;
    }
    if (!formData.password.trim()) {
      toast.error("Please set a temporary password");
      return;
    }
    if (!formData.businessName.trim()) {
      toast.error("Please enter the business name");
      return;
    }
    if (!formData.businessCategory) {
      toast.error("Please select a business category");
      return;
    }
    if (!formData.businessType) {
      toast.error("Please select a business type");
      return;
    }
    if (!otpState.otpVerified) {
      toast.error("Please verify the email with OTP first");
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        businessName: formData.businessName.trim(),
        businessCategory: formData.businessCategory,
        businessType: formData.businessType,
        phone: formData.phone.trim(),
        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          zipCode: formData.address.zipCode.trim(),
          country: formData.address.country.trim() || "India"
        }
      };

      const response = await api.adminCreateUser(userData);
      
      if (response.success) {
        toast.success("🎉 User created successfully!");
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          businessName: "",
          businessCategory: "",
          businessType: "",
          phone: "",
          address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "India"
          }
        });
        
        setOtpState({
          otpSent: false,
          otpVerified: false,
          otp: "",
          sendingOTP: false,
          verifyingOTP: false,
          resendCooldown: 0
        });

        // Notify parent component
        if (onUserCreated) {
          onUserCreated();
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  // Get selected category
  const selectedCategory = businessCategories.find(cat => cat.name === formData.businessCategory);
  const availableBusinessTypes = selectedCategory?.businessTypes.filter(type => type.isActive) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Add New User
          </CardTitle>
          <CardDescription>
            Create a new user account with business profile. Email verification is required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <User className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter user's full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Set a starter password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The user can change this password after their first login.
              </p>
            </div>
          </div>

          {/* Email Verification */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Mail className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Email Verification</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={otpState.otpVerified}
                  />
                </div>
                {!otpState.otpVerified && (
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={!formData.email || !formData.email.includes("@") || otpState.sendingOTP}
                      className="whitespace-nowrap"
                    >
                      {otpState.sendingOTP ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : otpState.otpSent ? (
                        "Sent"
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  </div>
                )}
              </div>
              
              {otpState.otpSent && !otpState.otpVerified && (
                <div className="space-y-3 p-4 rounded-lg bg-secondary border border-border">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="otp">Enter OTP *</Label>
                      <Input
                        id="otp"
                        placeholder="000000"
                        value={otpState.otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setOtpState(prev => ({ ...prev, otp: value }));
                        }}
                        className="text-center text-lg tracking-widest font-mono"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={otpState.otp.length !== 6 || otpState.verifyingOTP}
                        className="whitespace-nowrap"
                      >
                        {otpState.verifyingOTP ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Enter the 6-digit OTP sent to the user's email
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSendOTP}
                      disabled={otpState.sendingOTP || otpState.resendCooldown > 0}
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
                  <Check className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Email verified successfully!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Building className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Business Information</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="Business / Brand name"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Category *</Label>
                  {categoriesLoading ? (
                    <div className="flex items-center gap-2 p-3 border rounded-md">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading categories...</span>
                    </div>
                  ) : (
                    <Select
                      value={formData.businessCategory}
                      onValueChange={(value) => handleInputChange('businessCategory', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business category" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessCategories.map((category) => (
                          <SelectItem key={category._id} value={category.name}>
                            <div className="flex items-center gap-2">
                              <span>{category.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {category.businessTypes.filter(t => t.isActive).length} types
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Business Type *</Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => handleInputChange('businessType', value)}
                    disabled={!formData.businessCategory || availableBusinessTypes.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBusinessTypes.map((type) => (
                        <SelectItem key={type._id} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.businessCategory && availableBusinessTypes.length === 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      No business types available for this category
                    </p>
                  )}
                </div>
              </div>

              {selectedCategory && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong>Layout:</strong> {selectedCategory.layout}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedCategory.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Address Information</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  placeholder="Street address"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="Zip Code"
                    value={formData.address.zipCode}
                    onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="Country"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Reset form
                setFormData({
                  name: "",
                  email: "",
                  password: "",
                  businessName: "",
                  businessCategory: "",
                  businessType: "",
                  phone: "",
                  address: {
                    street: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "India"
                  }
                });
                setOtpState({
                  otpSent: false,
                  otpVerified: false,
                  otp: "",
                  sendingOTP: false,
                  verifyingOTP: false,
                  resendCooldown: 0
                });
              }}
              disabled={loading}
            >
              Reset Form
            </Button>
            
            <Button
              onClick={handleCreateUser}
              disabled={loading || !otpState.otpVerified}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </div>

          {!otpState.otpVerified && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Please verify the email address with OTP before creating the user.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddNewUser;
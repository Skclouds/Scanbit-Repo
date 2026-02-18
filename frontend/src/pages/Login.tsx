import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FiArrowLeft, FiEye, FiEyeOff, FiCheck, FiMail, FiLock, FiShield } from "react-icons/fi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MdQrCode } from "react-icons/md";
import api, { env } from "@/lib/api";
import { toast } from "sonner";


const Login = () => {
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // OTP state (for OTP login)
  const [otpState, setOtpState] = useState({
    otpSent: false,
    otpVerified: false,
    otp: "",
    sendingOTP: false,
    verifyingOTP: false,
    resendCooldown: 0,
  });
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Forgot password state
  const [forgotPasswordState, setForgotPasswordState] = useState({
    email: "",
    loading: false,
    emailSent: false,
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
    resetting: false,
  });

  const normalizeEmail = (value: string) => value.trim().toLowerCase();

  // Reset OTP state when switching login methods
  useEffect(() => {
    if (loginMethod === "password") {
      setOtpState({
        otpSent: false,
        otpVerified: false,
        otp: "",
        sendingOTP: false,
        verifyingOTP: false,
        resendCooldown: 0,
      });
    } else {
      setPassword("");
      setShowPassword(false);
    }
  }, [loginMethod]);

  // Send OTP for OTP login
  const handleSendOTP = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (otpState.resendCooldown > 0) {
      toast.error(`Please wait ${otpState.resendCooldown} seconds before resending`);
      return;
    }

    setOtpState(prev => ({ ...prev, sendingOTP: true }));
    try {
      const normalizedEmail = normalizeEmail(email);
      const response = await api.sendOTP(normalizedEmail, 'login');
      if (response.success) {
        setOtpState(prev => ({ 
          ...prev, 
          otpSent: true, 
          sendingOTP: false,
          resendCooldown: 60 // 60 seconds cooldown
        }));
        toast.success(response.message || "OTP sent successfully! Please check your email.");
        
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
      toast.error(error.message || "Failed to send OTP. Please try again.");
    }
  };

  // Verify OTP for OTP login
  const handleVerifyOTP = async () => {
    if (!otpState.otp || otpState.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setOtpState(prev => ({ ...prev, verifyingOTP: true }));
    try {
      const normalizedEmail = normalizeEmail(email);
      const response = await api.verifyOTP(normalizedEmail, otpState.otp, 'login');
      
      if (response.success && response.verified) {
        
        // Update state to mark OTP as verified
        setOtpState(prev => ({ ...prev, otpVerified: true, verifyingOTP: false }));
        
        // Call login immediately after verification
        // Don't wait for state update, just proceed with login
        handleOTPLogin();
      } else {
        setOtpState(prev => ({ ...prev, verifyingOTP: false }));
        toast.error(response.message || "OTP verification failed. Please try again.");
      }
    } catch (error: any) {
      setOtpState(prev => ({ ...prev, verifyingOTP: false }));
      toast.error(error.message || "Invalid OTP. Please try again.");
    }
  };

  // Handle OTP-based login (after OTP verification)
  const handleOTPLogin = async () => {
    if (!email) {
      toast.error("Email is missing");
      return;
    }

    setIsLoading(true);
    
    try {
      const normalizedEmail = normalizeEmail(email);
      const response = await api.login(normalizedEmail, "otp-verified", otpState.otp);
      
      if (!response) {
        throw new Error("No response from login endpoint");
      }
      
      if (response.success && response.token) {
        const userRole = response.user?.role;
        const dashboardPath = userRole === 'admin' ? "/admin/dashboard" : "/dashboard";

        api.setToken(response.token);
        api.clearUserCache();
        localStorage.setItem("token", response.token);
        if (userRole) localStorage.setItem("userRole", userRole);

        if (userRole === 'admin') {
          localStorage.setItem("adminAuth", JSON.stringify({
            email: response.user.email,
            role: response.user.role,
            userId: response.user.id
          }));
        } else {
          localStorage.setItem("hotelAuth", JSON.stringify({
            email: response.user.email,
            role: response.user.role,
            userId: response.user.id,
            restaurantId: response.restaurant?.id
          }));
        }

        setIsLoading(false);
        toast.success("Welcome back! Redirecting to your dashboard...");

        if (userRole !== "admin") {
          sessionStorage.setItem("showPlanChooserOnLogin", "true");
        }
        
        navigate(dashboardPath, { replace: true });
        
        setTimeout(() => {
          setOtpState({
            otpSent: false,
            otpVerified: false,
            otp: "",
            sendingOTP: false,
            verifyingOTP: false,
            resendCooldown: 0,
          });
        }, 0);
      } else {
        setIsLoading(false);
        const errorMessage = response?.message || "Login failed. Please try again.";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      setIsLoading(false);
      toast.error(error.message || "Login failed. Please try again.");
      
      // Reset OTP state on error
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

  // Handle password login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);

    try {
      const normalizedEmail = normalizeEmail(email);
      const response = await api.login(normalizedEmail, password);
      
      if (response.success) {
        // Always set token first so API client and localStorage are in sync before any navigation
        if (response.token) {
          api.setToken(response.token);
          api.clearUserCache();
          localStorage.setItem("token", response.token);
        }
        // Store auth based on role
        if (response.user.role === 'admin') {
          localStorage.setItem("adminAuth", JSON.stringify({ 
            email: response.user.email, 
            role: response.user.role,
            userId: response.user.id
          }));
          localStorage.setItem("userRole", "admin");
        } else {
          localStorage.setItem("hotelAuth", JSON.stringify({ 
            email: response.user.email, 
            role: response.user.role,
            userId: response.user.id,
            restaurantId: response.restaurant?.id 
          }));
          localStorage.setItem("userRole", response.user.role);
        }
        toast.success("Welcome back! Redirecting to dashboard...");

        if (response.user.role !== "admin") {
          sessionStorage.setItem("showPlanChooserOnLogin", "true");
        }
        // Navigate after auth is fully written so dashboard requests send the token
        if (response.user.role === 'admin') {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!forgotPasswordState.email || !forgotPasswordState.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setForgotPasswordState(prev => ({ ...prev, loading: true }));
    try {
      const normalizedEmail = normalizeEmail(forgotPasswordState.email);
      const response = await api.forgotPassword(normalizedEmail);

      if (response.success && response.emailSent) {
        setForgotPasswordState(prev => ({ ...prev, loading: false, emailSent: true }));
        toast.success("Password reset code sent! Please check your email.");
      } else if (response.success && !response.emailSent) {
        setForgotPasswordState(prev => ({ ...prev, loading: false }));
        toast.error("No account found with this email. Please register first.");
      } else {
        setForgotPasswordState(prev => ({ ...prev, loading: false }));
        toast.error(response.message || "Failed to send reset email. Please try again.");
      }
    } catch (error: any) {
      setForgotPasswordState(prev => ({ ...prev, loading: false }));
      toast.error(error.message || "Failed to send reset email. Please try again.");
    }
  };

  // Handle reset password
  const handleResetPassword = async () => {
    if (!forgotPasswordState.resetCode || forgotPasswordState.resetCode.length < 8) {
      toast.error("Please enter the full 8-character reset code");
      return;
    }

    if (!forgotPasswordState.newPassword || forgotPasswordState.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (forgotPasswordState.newPassword !== forgotPasswordState.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setForgotPasswordState(prev => ({ ...prev, resetting: true }));
    try {
      const response = await api.resetPassword(forgotPasswordState.resetCode.toUpperCase(), forgotPasswordState.newPassword);
      if (response.success) {
        toast.success("Password reset successfully! Please login with your new password.");
        setShowForgotPassword(false);
        setForgotPasswordState({
          email: "",
          loading: false,
          emailSent: false,
          resetCode: "",
          newPassword: "",
          confirmPassword: "",
          resetting: false,
        });
        // Switch to password login tab
        setLoginMethod("password");
      }
    } catch (error: any) {
      setForgotPasswordState(prev => ({ ...prev, resetting: false }));
      toast.error(error.message || "Failed to reset password. Please try again.");
    }
  };

  return (
    <>
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 sm:p-8">
      <Link to="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <FiArrowLeft className="w-4 h-4" />
        Back to home
      </Link>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-8">
            {settings?.branding?.logoUrl ? (
              <img 
                src={settings.branding.logoUrl} 
                alt={settings.general?.siteName || env.APP_NAME}
                className="h-24 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <MdQrCode className="w-8 h-8 text-primary-foreground" />
                </div>
                <span className="font-display text-4xl font-bold text-foreground">
                  {env.APP_NAME}
                </span>
              </div>
            )}
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Welcome Back
            </h2>
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Start free trial
              </Link>
            </p>
          </div>

          {/* Login Method Tabs */}
          <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as "password" | "otp")} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password" className="flex items-center gap-2">
                  <FiLock className="w-4 h-4" />
                  Password
                </TabsTrigger>
                <TabsTrigger value="otp" className="flex items-center gap-2">
                  <FiShield className="w-4 h-4" />
                  OTP Login
                </TabsTrigger>
              </TabsList>

              {/* Password Login Tab */}
              <TabsContent value="password" className="mt-6 space-y-6">
                <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div className="space-y-2">
                    <Label htmlFor="email-password">Email address</Label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
              <Input
                        id="email-password"
                type="email"
                placeholder="you@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                        className="h-12 pl-10"
                required
              />
                    </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-12"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true);
                  setForgotPasswordState(prev => ({ ...prev, email: email }));
                }}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
              </TabsContent>

              {/* OTP Login Tab */}
              <TabsContent value="otp" className="mt-6 space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email-otp">Email address</Label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                      <Input
                        id="email-otp"
                        type="email"
                        placeholder="you@restaurant.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 pl-10"
                        required
                        disabled={otpState.otpSent || otpState.otpVerified}
                      />
                      {otpState.otpVerified && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <FiCheck className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                    </div>
                  </div>

                  {!otpState.otpSent ? (
                    <Button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={!email || !email.includes("@") || otpState.sendingOTP || otpState.resendCooldown > 0}
                      size="lg"
                      className="w-full"
                      variant="outline"
                    >
                      <FiShield className="w-4 h-4 mr-2" />
                      {otpState.sendingOTP ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  ) : !otpState.otpVerified ? (
                    <div className="space-y-4 p-4 rounded-lg bg-secondary border border-border">
                      <div className="space-y-2">
                        <Label htmlFor="otp" className="text-sm font-medium">Enter OTP *</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="000000"
                          value={otpState.otp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                            setOtpState({ ...otpState, otp: value });
                          }}
                          className="h-12 text-center text-lg tracking-widest font-mono"
                          maxLength={6}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleVerifyOTP}
                          disabled={otpState.otp.length !== 6 || otpState.verifyingOTP}
                          className="flex-1"
                        >
                          {otpState.verifyingOTP ? "Verifying..." : "Verify OTP"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSendOTP}
                          disabled={otpState.sendingOTP || otpState.resendCooldown > 0}
                          className="px-4"
                        >
                          {otpState.resendCooldown > 0 ? `${otpState.resendCooldown}s` : "Resend"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Enter the 6-digit OTP sent to your email
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                          OTP verified successfully! Logging you in...
                        </p>
                      </div>
                      {isLoading && (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">Please wait...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {otpState.otpSent && !otpState.otpVerified && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setLoginMethod("password");
                        setOtpState({
                          otpSent: false,
                          otpVerified: false,
                          otp: "",
                          sendingOTP: false,
                          verifyingOTP: false,
                          resendCooldown: 0,
                        });
                      }}
                    >
                      Switch to Password Login
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

    {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FiLock className="w-5 h-5" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              {!forgotPasswordState.emailSent 
                ? "Enter your email address and we'll send you a password reset code."
                : "Please check your email for the reset code. Enter the code and your new password below."}
            </DialogDescription>
          </DialogHeader>

          {!forgotPasswordState.emailSent ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email address</Label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@restaurant.com"
                    value={forgotPasswordState.email}
                    onChange={(e) => setForgotPasswordState(prev => ({ ...prev, email: e.target.value }))}
                    className="h-12 pl-10"
                  />
                </div>
              </div>
              <Button 
                onClick={handleForgotPassword} 
                disabled={forgotPasswordState.loading}
                className="w-full"
              >
                {forgotPasswordState.loading ? "Sending..." : "Send Reset Code"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Code sent to <span className="font-medium text-foreground">{forgotPasswordState.email}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setForgotPasswordState(prev => ({ ...prev, emailSent: false, resetCode: "", newPassword: "", confirmPassword: "" }))}
                  className="text-sm text-primary hover:underline"
                >
                  Change email
                </button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-code">Reset Code</Label>
                <Input
                  id="reset-code"
                  type="text"
                  placeholder="Enter 8-character code from email"
                  value={forgotPasswordState.resetCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^A-Z0-9]/gi, "").slice(0, 8).toUpperCase();
                    setForgotPasswordState(prev => ({ ...prev, resetCode: value }));
                  }}
                  className="h-12 text-center text-lg tracking-widest font-mono"
                  maxLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 8-character code (letters and numbers) sent to your email
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={forgotPasswordState.newPassword}
                  onChange={(e) => setForgotPasswordState(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="h-12"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={forgotPasswordState.confirmPassword}
                  onChange={(e) => setForgotPasswordState(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="h-12"
                  autoComplete="new-password"
                />
              </div>
              <Button 
                onClick={handleResetPassword} 
                disabled={forgotPasswordState.resetting}
                className="w-full"
              >
                {forgotPasswordState.resetting ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Login;

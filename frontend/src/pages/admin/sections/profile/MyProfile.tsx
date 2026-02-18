import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Mail, Phone, MapPin, Building2, Calendar, Shield, 
  Camera, Edit, Save, X, Upload, CheckCircle2, Clock, 
  CreditCard, Activity, Settings, Lock, Bell, Globe,
  Facebook, Instagram, Twitter, Linkedin, ExternalLink, Loader2
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function MyProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch current user data using API
      const userResponse = await api.getCurrentUser();
      if (userResponse.success && userResponse.user) {
        setUserData(userResponse.user);
        setFormData({
          name: userResponse.user.name || "",
          email: userResponse.user.email || "",
          phone: userResponse.user.phone || "",
          address: userResponse.user.address || "",
          bio: userResponse.user.bio || "",
        });

        // Fetch restaurant data if user has one
        if (userResponse.user.restaurant) {
          const restaurantId = typeof userResponse.user.restaurant === 'string' 
            ? userResponse.user.restaurant 
            : userResponse.user.restaurant._id;
          
          try {
            const restResponse = await api.getMyRestaurant();
            if (restResponse.success && restResponse.data) {
              setRestaurantData(restResponse.data);
            }
          } catch (error) {
            // Silently handle restaurant fetch error - user might not have a restaurant
          }
        }
      }
    } catch (error) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name || formData.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters long");
      return;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setSaving(true);
      const response = await api.updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
      });

      if (response.success) {
        toast.success("Profile updated successfully");
        setEditMode(false);
        fetchProfileData();
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      setUploadStatus('uploading');
      
      // Upload image using API
      const imageUrl = await api.uploadImage(file, 'profiles');
      
      // Update user profile image using updateProfile
      await api.updateProfile({ profileImage: imageUrl });
      
      setUploadStatus('success');
      toast.success("Profile image updated successfully");
      
      // Refresh profile data
      await fetchProfileData();
      
      // Reset upload status after animation
      setTimeout(() => {
        setUploadStatus('idle');
      }, 2000);
    } catch (error: any) {
      setUploadStatus('error');
      toast.error(error.message || "Failed to upload image");
      
      // Reset upload status after animation
      setTimeout(() => {
        setUploadStatus('idle');
      }, 2000);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
            <p className="text-slate-600 mt-1">Manage your account and business information</p>
          </div>
        </div>
        {!editMode ? (
          <Button onClick={() => setEditMode(true)} className="bg-orange-600 hover:bg-orange-700">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => setEditMode(false)} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="business">Business Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {uploadStatus === 'uploading' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full z-10">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                    {uploadStatus === 'success' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-full z-10">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                    )}
                    {uploadStatus === 'error' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-full z-10">
                        <X className="w-8 h-8 text-red-600" />
                      </div>
                    )}
                    <img
                      src={userData?.profileImage || restaurantData?.logo || "/logo.svg"}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-orange-200"
                    />
                    <label className={`absolute bottom-0 right-0 bg-orange-600 text-white p-2 rounded-full cursor-pointer hover:bg-orange-700 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <h3 className="text-xl font-bold mt-4">{userData?.name}</h3>
                  <p className="text-sm text-slate-600">{userData?.email}</p>
                  <div className="flex gap-2 mt-3">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                    {userData?.isMasterAdmin && (
                      <Badge className="bg-purple-100 text-purple-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Master Admin
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Member Since</span>
                    <span className="font-medium">
                      {new Date(userData?.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Last Login</span>
                    <span className="font-medium">
                      {userData?.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Role</span>
                    <Badge variant="outline">{userData?.role}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        disabled={!editMode}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        disabled={!editMode}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        disabled={!editMode}
                        className="pl-10"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessCategory">Business Category</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="businessCategory"
                        value={userData?.businessCategory || 'N/A'}
                        disabled
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      disabled={!editMode}
                      className="pl-10"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    disabled={!editMode}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Business Info Tab */}
        <TabsContent value="business" className="space-y-6">
          {restaurantData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business Overview */}
              <Card>
                <CardHeader>
                    <CardTitle>Business Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={restaurantData.logo || "/logo.svg"}
                      alt="Business Logo"
                      className="w-20 h-20 rounded-lg object-cover border-2 border-orange-200"
                    />
                    <div>
                      <h3 className="text-xl font-bold">{restaurantData.name}</h3>
                      <p className="text-sm text-slate-600">{restaurantData.businessType}</p>
                      <Badge className="mt-1" variant={restaurantData.isVerified ? "default" : "secondary"}>
                        {restaurantData.isVerified ? "Verified" : "Pending Verification"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-slate-400 mt-1" />
                      <div>
                        <p className="text-sm text-slate-600">Email</p>
                        <p className="font-medium">{restaurantData.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-slate-400 mt-1" />
                      <div>
                        <p className="text-sm text-slate-600">Phone</p>
                        <p className="font-medium">{restaurantData.phone || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                      <div>
                        <p className="text-sm text-slate-600">Address</p>
                        <p className="font-medium">
                          {restaurantData.address?.street}, {restaurantData.address?.city}, {restaurantData.address?.state} {restaurantData.address?.zipCode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-slate-400 mt-1" />
                      <div>
                        <p className="text-sm text-slate-600">Category</p>
                        <p className="font-medium">{restaurantData.businessCategory}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Current Plan</span>
                      <Badge className="bg-orange-600">{restaurantData.subscription?.plan || 'Free'}</Badge>
                    </div>
                    <div className="text-3xl font-bold text-orange-900">
                      ₹{restaurantData.subscription?.planPrice || 0}
                      <span className="text-sm font-normal text-slate-600">/{restaurantData.subscription?.billingCycle || 'month'}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Status</span>
                      <Badge variant={restaurantData.subscription?.status === 'active' ? 'default' : 'secondary'}>
                        {restaurantData.subscription?.status || 'Inactive'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Start Date</span>
                      <span className="font-medium">
                        {restaurantData.subscription?.startDate 
                          ? new Date(restaurantData.subscription.startDate).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">End Date</span>
                      <span className="font-medium">
                        {restaurantData.subscription?.endDate 
                          ? new Date(restaurantData.subscription.endDate).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Days Remaining</span>
                      <span className="font-bold text-orange-600">
                        {restaurantData.subscription?.daysRemaining || 0} days
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Menu Items Limit</span>
                      <span className="font-medium">{restaurantData.menuItemsLimit || '10'}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-orange-600 hover:bg-orange-700 mt-4">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </CardContent>
              </Card>

              {/* Business Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Total QR Scans</p>
                      <p className="text-2xl font-bold text-blue-900">{restaurantData.qrScans || 0}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">This Month</p>
                      <p className="text-2xl font-bold text-green-900">{restaurantData.qrScansThisMonth || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Status</p>
                      <p className="text-lg font-bold text-purple-900">
                        {restaurantData.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Verified</p>
                      <p className="text-lg font-bold text-orange-900">
                        {restaurantData.isVerified ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {restaurantData.socialMedia?.facebook && (
                    <a href={restaurantData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <span className="flex-1">Facebook</span>
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </a>
                  )}
                  {restaurantData.socialMedia?.instagram && (
                    <a href={restaurantData.socialMedia.instagram} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <Instagram className="w-5 h-5 text-pink-600" />
                      <span className="flex-1">Instagram</span>
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </a>
                  )}
                  {restaurantData.socialMedia?.twitter && (
                    <a href={restaurantData.socialMedia.twitter} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <Twitter className="w-5 h-5 text-blue-400" />
                      <span className="flex-1">Twitter</span>
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </a>
                  )}
                  {restaurantData.socialMedia?.linkedin && (
                    <a href={restaurantData.socialMedia.linkedin} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <Linkedin className="w-5 h-5 text-blue-700" />
                      <span className="flex-1">LinkedIn</span>
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </a>
                  )}
                  {restaurantData.socialMedia?.website && (
                    <a href={restaurantData.socialMedia.website} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <Globe className="w-5 h-5 text-slate-600" />
                      <span className="flex-1">Website</span>
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </a>
                  )}
                  {!restaurantData.socialMedia?.facebook && !restaurantData.socialMedia?.instagram && 
                   !restaurantData.socialMedia?.twitter && !restaurantData.socialMedia?.linkedin && 
                   !restaurantData.socialMedia?.website && (
                    <p className="text-sm text-slate-500 text-center py-4">No social media links added</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Business Associated</h3>
                <p className="text-slate-600 mb-4">You don't have a business profile yet.</p>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Create Business Profile
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" placeholder="Enter current password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <Lock className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-600">Add extra security to your account</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Login Notifications</p>
                      <p className="text-sm text-slate-600">Get notified of new logins</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Session Management</p>
                      <p className="text-sm text-slate-600">Manage active sessions</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Security Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium">Successful Login</p>
                      <p className="text-sm text-slate-600">Chrome on MacOS • Today at 2:45 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium">Password Changed</p>
                      <p className="text-sm text-slate-600">Yesterday at 10:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium">Profile Updated</p>
                      <p className="text-sm text-slate-600">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Profile Updated</p>
                    <p className="text-sm text-slate-600">You updated your profile information</p>
                    <p className="text-xs text-slate-500 mt-1">Today at 2:45 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Login Successful</p>
                    <p className="text-sm text-slate-600">Logged in from Chrome on MacOS</p>
                    <p className="text-xs text-slate-500 mt-1">Today at 2:30 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Settings Changed</p>
                    <p className="text-sm text-slate-600">Updated notification preferences</p>
                    <p className="text-xs text-slate-500 mt-1">Yesterday at 4:15 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Subscription Renewed</p>
                    <p className="text-sm text-slate-600">Your subscription was automatically renewed</p>
                    <p className="text-xs text-slate-500 mt-1">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiUpload, FiX, FiGlobe, FiExternalLink } from "react-icons/fi";
import { MdLocationOn, MdEdit, MdBusiness, MdCategory, MdEmail, MdPhone } from "react-icons/md";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import MapPicker from "@/components/MapPicker";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";


const Profile = ({ restaurant, onUpdate }: { restaurant: any; onUpdate: () => void }) => {
  const [formData, setFormData] = useState({
    name: restaurant?.name || "",
    email: restaurant?.email || "",
    phone: restaurant?.phone || "",
    whatsapp: restaurant?.whatsapp || "",
    address: restaurant?.location?.address || "",
    location: restaurant?.location || null,
    logo: restaurant?.logo || null,
    ownerImage: restaurant?.ownerImage || null,
    businessCard: restaurant?.businessCard || null,
    socialMedia: restaurant?.socialMedia || {},
    foodImages: restaurant?.foodImages || [],
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [dialogMounted, setDialogMounted] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const fileInputRefs = {
    logo: useRef<HTMLInputElement>(null),
    ownerImage: useRef<HTMLInputElement>(null),
    businessCard: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || "",
        email: restaurant.email || "",
        phone: restaurant.phone || "",
        whatsapp: restaurant.whatsapp || "",
        address: restaurant.location?.address || "",
        location: restaurant.location || null,
        logo: restaurant.logo || null,
        ownerImage: restaurant.ownerImage || null,
        businessCard: restaurant.businessCard || null,
        socialMedia: restaurant.socialMedia || {},
        foodImages: Array.isArray(restaurant.foodImages) ? [...restaurant.foodImages] : [],
      });
    }
  }, [restaurant]);

  // Track map dialog mount state
  useEffect(() => {
    if (showMap) {
      const timer = setTimeout(() => {
        setDialogMounted(true);
      }, 1000);
      return () => {
        clearTimeout(timer);
        setDialogMounted(false);
      };
    }
  }, [showMap]);

  const uploadImage = async (file: File, type: 'logo' | 'ownerImage' | 'businessCard') => {
    setUploading(type);
    try {
      const folder = type === "logo" ? "restaurant-logos" : 
                    type === "ownerImage" ? "owner-images" : "business-cards";
      
      const url = await api.uploadImage(file, folder);
      
      setFormData(prev => ({
        ...prev,
        [type]: url
      }));

      // Save to backend
      await api.updateMyRestaurant({
        name: formData.name,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        location: formData.location,
        socialMedia: formData.socialMedia,
        [type]: url
      });

      toast.success(`${type === 'logo' ? 'Logo' : type === 'ownerImage' ? 'Owner image' : 'Business card'} uploaded successfully!`);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || `Failed to upload ${type}`);
    } finally {
      setUploading(null);
    }
  };

  const removeImage = async (type: 'logo' | 'ownerImage' | 'businessCard') => {
    try {
      setFormData(prev => ({
        ...prev,
        [type]: null
      }));

      await api.updateMyRestaurant({
        name: formData.name,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        location: formData.location,
        socialMedia: formData.socialMedia,
        [type]: null
      });

      toast.success(`${type === 'logo' ? 'Logo' : type === 'ownerImage' ? 'Owner image' : 'Business card'} removed successfully!`);
      onUpdate();
    } catch (error: any) {
      toast.error(`Failed to remove ${type}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedLocation = {
        ...(formData.location || {}),
        address: formData.address,
        lat: formData.location?.lat || 0,
        lng: formData.location?.lng || 0,
      };

      const result = await api.updateMyRestaurant({
        name: formData.name,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        location: updatedLocation,
        socialMedia: formData.socialMedia,
      });

      if (result.success) {
        toast.success("Profile updated successfully!");
        onUpdate();
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const saveSocialMedia = async () => {
    try {
      await api.updateMyRestaurant({
        name: formData.name,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        location: formData.location,
        socialMedia: formData.socialMedia
      });
      toast.success("Social media links updated!");
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to update social media links");
    }
  };

  const businessCategory = restaurant?.businessCategory || "Food Mall";
  const isRetail = businessCategory === "Retail / E-Commerce Businesses";
  const isCreative = businessCategory === "Creative & Design";

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-24 px-4 sm:px-6 lg:px-8 pb-12">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-orange-500 to-orange-600 opacity-90" />
        <div className="px-6 md:px-10 pb-8 -mt-12">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Logo/Profile Image */}
            <div className="relative group">
              {formData.logo ? (
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white bg-white shadow-xl flex items-center justify-center overflow-hidden">
                  <img src={formData.logo} alt="Logo" className="w-full h-full object-contain p-3" />
                  <button
                    onClick={() => removeImage('logo')}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-lg z-10"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white bg-slate-50 flex items-center justify-center shadow-xl">
                  <FiUser className="w-16 h-16 text-slate-300" />
                </div>
              )}
              <button
                onClick={() => fileInputRefs.logo.current?.click()}
                className="absolute bottom-2 right-2 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-700 transition-all border-4 border-white active:scale-95"
                title="Change Logo"
              >
                <MdEdit className="w-5 h-5" />
              </button>
              <Input
                ref={fileInputRefs.logo}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file, 'logo');
                }}
              />
            </div>

            {/* Business Info */}
            <div className="flex-1 space-y-3 pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  {formData.name || "Business Name"}
                </h2>
                {restaurant?.subscription?.plan && (
                  <span className="px-4 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-black uppercase tracking-wider border border-orange-200">
                    {restaurant.subscription.plan}
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                {restaurant?.businessCategory && (
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <div className="p-1.5 bg-slate-100 rounded-md">
                      <MdCategory className="w-4 h-4 text-slate-600" />
                    </div>
                    <span className="text-sm">{restaurant.businessCategory}</span>
                  </div>
                )}
                {restaurant?.businessType && (
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <div className="p-1.5 bg-slate-100 rounded-md">
                      <MdBusiness className="w-4 h-4 text-slate-600" />
                    </div>
                    <span className="text-sm">{restaurant.businessType}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <div className="p-1.5 bg-slate-100 rounded-md">
                    <MdEmail className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="text-sm">{formData.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
              <CardTitle className="text-xl font-black text-slate-900">Business Identity</CardTitle>
              <CardDescription className="font-medium text-slate-500">Update your core business information</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-bold text-slate-700">Business Name</Label>
                    <div className="relative group">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-12 h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-orange-500 focus:border-orange-500 font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-bold text-slate-700">Email Address</Label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="pl-12 h-12 bg-slate-100 border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-bold text-slate-700">Contact Number</Label>
                    <div className="relative group">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-12 h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-orange-500 focus:border-orange-500 font-medium"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="text-sm font-bold text-slate-700">Physical Address</Label>
                    <div className="relative group">
                      <FiMapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                      <textarea
                        id="address"
                        value={formData.address}
                        onChange={async (e) => {
                          const val = e.target.value;
                          const updatedFormData = { ...formData, address: val };
                          setFormData(updatedFormData);
                          
                          // Debounce save to backend
                          clearTimeout((window as any).addressProfileSaveTimeout);
                          (window as any).addressProfileSaveTimeout = setTimeout(async () => {
                            try {
                              await api.updateMyRestaurant({
                                name: updatedFormData.name,
                                phone: updatedFormData.phone,
                                whatsapp: updatedFormData.whatsapp,
                                location: {
                                  ...(updatedFormData.location || {}),
                                  address: updatedFormData.address,
                                  lat: updatedFormData.location?.lat || 0,
                                  lng: updatedFormData.location?.lng || 0,
                                },
                                socialMedia: updatedFormData.socialMedia,
                              });
                              onUpdate();
                            } catch (error) {

                            }
                          }, 1000);
                        }}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium min-h-[100px] resize-none"
                        placeholder="Enter your full business address (Street, City, State, ZIP)"
                      />
                    </div>
                  </div>
                </div>

                {/* Map Selection Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Map Location</h4>
                      <p className="text-xs text-slate-500 font-medium">Pin your exact location for directions</p>
                    </div>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowMap(!showMap)}
                      className="rounded-xl border-slate-200 font-bold"
                    >
                      {showMap ? "Hide Map" : "Show Map Picker"}
                    </Button>
                  </div>

                  {showMap && (
                    <div className="relative h-80 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner bg-slate-50">
                      <MapPicker
                        position={formData.location ? { lat: formData.location.lat, lng: formData.location.lng } : null}
                        onPositionChange={(newPos) => {
                          setFormData(prev => ({
                            ...prev,
                            location: {
                              ...prev.location,
                              lat: newPos.lat,
                              lng: newPos.lng,
                            }
                          }));
                        }}
                        height="320px"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={loading} className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-all active:scale-95">
                    <FiSave className="w-5 h-5 mr-2" />
                    {loading ? "Saving Changes..." : "Update Profile"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Location on Map */}
          {formData.location?.lat && formData.location?.lng && (
            <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-xl font-black text-slate-900">Business Location</CardTitle>
                <CardDescription className="font-medium text-slate-500">Your physical presence on the map</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-600 rounded-lg mt-0.5">
                        <FiMapPin className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{formData.location.address}</p>
                        <p className="text-xs font-medium text-orange-600 mt-1 uppercase tracking-wider">
                          {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 font-bold">
                      <a href={`https://www.google.com/maps?q=${formData.location.lat},${formData.location.lng}`} target="_blank" rel="noopener noreferrer">
                        <FiExternalLink className="w-4 h-4 mr-2" />
                        Directions
                      </a>
                    </Button>
                  </div>
                  
                  <div className="relative h-80 rounded-2xl overflow-hidden border-4 border-white shadow-inner bg-slate-100">
                    {showMap && dialogMounted ? (
                      <MapPicker
                        position={formData.location ? { lat: formData.location.lat, lng: formData.location.lng } : null}
                        onPositionChange={async (newPos) => {
                          const updatedLocation = {
                            ...formData.location!,
                            lat: newPos.lat,
                            lng: newPos.lng,
                            address: formData.location?.address || "",
                          };
                          const updatedFormData = {
                            ...formData,
                            location: updatedLocation,
                          };
                          setFormData(updatedFormData);
                          try {
                            await api.updateMyRestaurant({
                              location: updatedFormData.location
                            });
                            toast.success("Location updated!");
                            onUpdate();
                          } catch (error) {

                          }
                        }}
                        height="320px"
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center animate-pulse">
                          <MdLocationOn className="w-8 h-8 text-slate-400" />
                        </div>
                        <Button onClick={() => setShowMap(true)} variant="outline" className="rounded-xl border-slate-300 font-bold hover:bg-slate-50">
                          Activate Interactive Map
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Owner Image */}
          {formData.ownerImage && (
            <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-xl font-black text-slate-900">Lead Professional</CardTitle>
                <CardDescription className="font-medium text-slate-500">The face of your business</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-orange-100 bg-white shadow-md overflow-hidden flex items-center justify-center">
                      <img src={formData.ownerImage} alt="Owner" className="w-full h-full object-contain p-1" />
                    </div>
                    <button
                      onClick={() => removeImage('ownerImage')}
                      className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg border-2 border-white"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-4">
                    <div>
                      <p className="text-lg font-bold text-slate-900">Profile Image</p>
                      <p className="text-sm font-medium text-slate-500">This image represents you to your clients and customers.</p>
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl border-slate-200 font-bold hover:bg-slate-50"
                        onClick={() => fileInputRefs.ownerImage.current?.click()}
                        disabled={uploading === 'ownerImage'}
                      >
                        <FiUpload className="w-4 h-4 mr-2" />
                        {uploading === 'ownerImage' ? 'Uploading...' : 'Replace Image'}
                      </Button>
                    </div>
                  </div>
                  <Input
                    ref={fileInputRefs.ownerImage}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file, 'ownerImage');
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Card */}
          {formData.businessCard && (
            <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-xl font-black text-slate-900">Business Card</CardTitle>
                <CardDescription className="font-medium text-slate-500">Your professional digital business card</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="relative group max-w-md mx-auto">
                    <div className="rounded-2xl overflow-hidden border-2 border-slate-100 shadow-md bg-white">
                      <img src={formData.businessCard} alt="Business Card" className="w-full h-auto object-contain" />
                    </div>
                    <button
                      onClick={() => removeImage('businessCard')}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg border-2 border-white"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl border-slate-200 font-bold hover:bg-slate-50"
                      onClick={() => fileInputRefs.businessCard.current?.click()}
                      disabled={uploading === 'businessCard'}
                    >
                      <FiUpload className="w-4 h-4 mr-2" />
                      {uploading === 'businessCard' ? 'Uploading...' : 'Change Card'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl border-slate-200 font-bold hover:bg-slate-50"
                      asChild
                    >
                      <a href={formData.businessCard} target="_blank" rel="noopener noreferrer" download>
                        <FiExternalLink className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                  <Input
                    ref={fileInputRefs.businessCard}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file, 'businessCard');
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Images Gallery */}
          {formData.foodImages && formData.foodImages.length > 0 && (
            <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-xl font-black text-slate-900">
                  {isRetail ? "Product Showcase" : isCreative ? "Portfolio Highlights" : "Menu Showcase"}
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">
                  {isRetail 
                    ? "Your top inventory and new arrivals" 
                    : isCreative 
                    ? "Your best creative projects and work"
                    : "Your signature dishes and specialties"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {formData.foodImages.map((url: string, index: number) => (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 group shadow-sm">
                      <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white rounded-full hover:bg-white/90 transition-colors shadow-lg"
                        >
                          <FiExternalLink className="w-4 h-4 text-slate-900" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <CardTitle className="text-base font-black text-slate-900 uppercase tracking-wider">Business Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-sm font-bold text-slate-500">Type</span>
                <span className="text-sm font-black text-slate-900">{restaurant?.businessType || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-sm font-bold text-slate-500">Category</span>
                <span className="text-sm font-black text-slate-900">{restaurant?.businessCategory || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-sm font-bold text-slate-500">Plan</span>
                <span className="text-sm font-black text-orange-600 uppercase tracking-tighter bg-orange-50 px-2 py-0.5 rounded-md">{restaurant?.subscription?.plan || "Free"}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-bold text-slate-500">Status</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  restaurant?.subscription?.status === 'active' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {restaurant?.subscription?.status || "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Links */}
          <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <CardTitle className="text-base font-black text-slate-900 uppercase tracking-wider">Digital Presence</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="facebook" className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <FaFacebook className="w-4 h-4 text-[#1877F2]" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={formData.socialMedia.facebook || ""}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  onBlur={saveSocialMedia}
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-orange-500 font-medium text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <FaInstagram className="w-4 h-4 text-[#E4405F]" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={formData.socialMedia.instagram || ""}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  onBlur={saveSocialMedia}
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-orange-500 font-medium text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <FiGlobe className="w-4 h-4 text-orange-600" />
                  Official Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://..."
                  value={formData.socialMedia.website || ""}
                  onChange={(e) => handleSocialMediaChange('website', e.target.value)}
                  onBlur={saveSocialMedia}
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-orange-500 font-medium text-sm"
                />
              </div>

              {/* Social Media Preview */}
              {(formData.socialMedia.facebook || formData.socialMedia.instagram || formData.socialMedia.twitter || formData.socialMedia.linkedin || formData.socialMedia.website) && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap gap-3">
                    {formData.socialMedia.facebook && (
                      <a href={formData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-slate-50 text-[#1877F2] rounded-xl hover:bg-[#1877F2] hover:text-white transition-all border border-slate-100">
                        <FaFacebook className="w-5 h-5" />
                      </a>
                    )}
                    {formData.socialMedia.instagram && (
                      <a href={formData.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-slate-50 text-[#E4405F] rounded-xl hover:bg-[#E4405F] hover:text-white transition-all border border-slate-100">
                        <FaInstagram className="w-5 h-5" />
                      </a>
                    )}
                    {formData.socialMedia.website && (
                      <a href={formData.socialMedia.website} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-slate-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all border border-slate-100">
                        <FiGlobe className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Timeline */}
          <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <CardTitle className="text-base font-black text-slate-900 uppercase tracking-wider">Account Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
                {restaurant?.createdAt && (
                  <div className="relative">
                    <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-white border-2 border-orange-600" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Platform</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {new Date(restaurant.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                )}
                {restaurant?.subscription?.endDate && (
                  <div className="relative">
                    <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-white border-2 border-orange-600" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Renewal</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {new Date(restaurant.subscription.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-xs font-bold text-orange-600 mt-1 italic">{restaurant.subscription.daysRemaining} days remaining</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;

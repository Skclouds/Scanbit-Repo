import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from "@/components/ui/dialog";
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
import { MdLocationOn, MdRestaurantMenu, MdShoppingBag, MdBrush, MdPhotoLibrary, MdInventory, MdDevices, MdWork } from "react-icons/md";
import { FiMapPin, FiUpload, FiX, FiImage, FiLink, FiCheck } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";

import MapPicker from "./MapPicker";


interface OnboardingProps {
  restaurant: any;
  onComplete: () => void;
  open: boolean;
}

interface OnboardingData {
  logo: string | null;
  ownerImage: string | null;
  location: {
    lat: number | null;
    lng: number | null;
    address: string;
  } | null;
  whatsapp?: string;
  businessCardFront: string | null;
  businessCardBack: string | null;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  foodImages: string[];
}

const Onboarding = ({ restaurant, onComplete, open }: OnboardingProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogMounted, setDialogMounted] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState<any>(restaurant);
  
  // Upload state tracking for each upload type
  const [uploadingStates, setUploadingStates] = useState({
    logo: false,
    ownerImage: false,
    businessCardFront: false,
    businessCardBack: false,
    foodImages: false,
    location: false,
  });

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    type: 'logo' | 'ownerImage' | 'businessCardFront' | 'businessCardBack' | 'foodImage' | null;
    index?: number;
    label: string;
  }>({
    open: false,
    type: null,
    label: '',
  });

  // Business Category and Type Logic
  const businessCategory = currentRestaurant?.businessCategory || currentRestaurant?.businessType || "Food Mall";
  const businessType = currentRestaurant?.restaurantType || currentRestaurant?.businessType || "Business";

  // Professional Content Mapping based on Business Category
  const getContent = () => {
    // Normalize category for matching
    const category = businessCategory.toLowerCase();
    
    // 1. CREATIVE & DESIGN / AGENCIES
    if (category.includes('creative') || category.includes('design') || category.includes('agency') || category.includes('marketing')) {
      return {
        header: {
          title: "Complete Your Professional Profile",
          description: `Welcome to ScanBit! Let's set up your ${businessType.toLowerCase()} portfolio and professional presence.`,
        },
        steps: {
          logo: {
            title: "Brand Identity",
            description: "Upload your professional logo. This will represent your brand on all digital touchpoints.",
          },
          owner: {
            title: "Professional Profile",
            description: "Add a high-quality headshot of the lead professional or team to build trust with clients.",
          },
          location: {
            title: "Business Location",
            description: "Set your office or studio location to help clients find your physical presence.",
          },
          gallery: {
            title: "Portfolio Showcase",
            description: "Upload up to 4 images representing your best work, projects, or case studies.",
            helper: "Showcase your expertise and creative capabilities",
            icon: MdBrush,
            alt: "Portfolio",
          }
        },
        success: "🎉 Setup complete! Your professional portfolio is now live!",
        notifications: {
          validation: {
            logoRequired: "Please upload your brand logo to continue.",
            locationRequired: "Please set your office or studio location to continue.",
            businessCardRequired: "Please upload the front side of your digital business card.",
            socialRequired: "Please add at least one social or professional link.",
            invalidLinks: "Please enter valid URLs starting with http:// or https://",
            galleryMinRequired: "Please add at least one portfolio or project image.",
            galleryMaxExceeded: "You can add up to 4 portfolio images. Remove one to add another.",
          },
          uploadLabels: { logo: "logo", ownerImage: "profile photo", businessCardFront: "business card (front)", businessCardBack: "business card (back)", gallery: "portfolio image" },
          location: { getting: "Detecting your location...", captured: "Location saved successfully.", failed: "Could not get your location. Please select it on the map.", unsupported: "Location access is not supported in this browser. Please select your location on the map." },
          submitError: "We couldn't complete your setup. Please try again or contact support.",
        },
      };
    }
    
    // 2. RETAIL / E-COMMERCE
    if (category.includes('retail') || category.includes('store') || category.includes('shop') || category.includes('commerce')) {
      return {
        header: {
          title: "Complete Your Store Setup",
          description: `Welcome to ScanBit! Let's configure your ${businessType.toLowerCase()} for digital customers.`,
        },
        steps: {
          logo: {
            title: "Store Branding",
            description: "Upload your store logo. This will appear on your digital catalog and QR codes.",
          },
          owner: {
            title: "Manager Profile",
            description: "Add a photo of the store owner or manager to personalize your customer experience.",
          },
          location: {
            title: "Store Location",
            description: "Set your physical store location so customers can visit you in person.",
          },
          gallery: {
            title: "Product Highlights",
            description: "Upload up to 4 high-quality images of your best-selling products.",
            helper: "Display your top inventory and new arrivals",
            icon: MdShoppingBag,
            alt: "Product",
          }
        },
        success: "🎉 Setup complete! Your digital store is now ready for customers!",
        notifications: {
          validation: {
            logoRequired: "Please upload your store logo to continue.",
            locationRequired: "Please set your store location to continue.",
            businessCardRequired: "Please upload the front side of your business card.",
            socialRequired: "Please add at least one social or store link.",
            invalidLinks: "Please enter valid URLs starting with http:// or https://",
            galleryMinRequired: "Please add at least one product image.",
            galleryMaxExceeded: "You can add up to 4 product images. Remove one to add another.",
          },
          uploadLabels: { logo: "store logo", ownerImage: "manager photo", businessCardFront: "business card (front)", businessCardBack: "business card (back)", gallery: "product image" },
          location: { getting: "Detecting your store location...", captured: "Store location saved successfully.", failed: "Could not get your location. Please select it on the map.", unsupported: "Location access is not supported in this browser. Please select your location on the map." },
          submitError: "We couldn't complete your store setup. Please try again or contact support.",
        },
      };
    }

    // 3. HEALTH / WELLNESS / MEDICAL
    if (category.includes('health') || category.includes('wellness') || category.includes('medical') || category.includes('clinic')) {
      return {
        header: {
          title: "Complete Your Practice Setup",
          description: `Welcome to ScanBit! Let's set up your ${businessType.toLowerCase()} professional profile.`,
        },
        steps: {
          logo: {
            title: "Practice Identity",
            description: "Upload your clinic or studio logo for professional brand recognition.",
          },
          owner: {
            title: "Practitioner Profile",
            description: "Add a professional photo of the lead practitioner or specialist.",
          },
          location: {
            title: "Facility Location",
            description: "Set your clinic or studio location for patient and client visits.",
          },
          gallery: {
            title: "Facility Showcase",
            description: "Upload up to 4 images of your facility, equipment, or treatment areas.",
            helper: "Showcase your professional environment and expertise",
            icon: MdDevices,
            alt: "Facility",
          }
        },
        success: "🎉 Setup complete! Your professional practice profile is now live!",
        notifications: {
          validation: {
            logoRequired: "Please upload your practice or clinic logo to continue.",
            locationRequired: "Please set your facility location to continue.",
            businessCardRequired: "Please upload the front side of your professional business card.",
            socialRequired: "Please add at least one professional or practice link.",
            invalidLinks: "Please enter valid URLs starting with http:// or https://",
            galleryMinRequired: "Please add at least one facility or practice image.",
            galleryMaxExceeded: "You can add up to 4 facility images. Remove one to add another.",
          },
          uploadLabels: { logo: "practice logo", ownerImage: "practitioner photo", businessCardFront: "business card (front)", businessCardBack: "business card (back)", gallery: "facility image" },
          location: { getting: "Detecting your facility location...", captured: "Facility location saved successfully.", failed: "Could not get your location. Please select it on the map.", unsupported: "Location access is not supported in this browser. Please select your location on the map." },
          submitError: "We couldn't complete your practice setup. Please try again or contact support.",
        },
      };
    }

    // 4. PROFESSIONAL SERVICES (Law, Finance, etc.)
    if (category.includes('professional') || category.includes('service') || category.includes('consult') || category.includes('legal')) {
      return {
        header: {
          title: "Complete Your Firm Setup",
          description: `Welcome to ScanBit! Let's build your ${businessType.toLowerCase()} professional profile.`,
        },
        steps: {
          logo: {
            title: "Firm Identity",
            description: "Upload your company logo. This will be used on digital business cards and portals.",
          },
          owner: {
            title: "Lead Professional",
            description: "Add a professional headshot to personalize your firm's digital presence.",
          },
          location: {
            title: "Office Location",
            description: "Set your firm's office location for client meetings and consultations.",
          },
          gallery: {
            title: "Service Highlights",
            description: "Upload up to 4 images representing your key services, team, or certifications.",
            helper: "Showcase your professional credentials and service areas",
            icon: MdWork,
            alt: "Service",
          }
        },
        success: "🎉 Setup complete! Your professional firm profile is now live!",
        notifications: {
          validation: {
            logoRequired: "Please upload your firm logo to continue.",
            locationRequired: "Please set your office location to continue.",
            businessCardRequired: "Please upload the front side of your professional business card.",
            socialRequired: "Please add at least one professional or firm link.",
            invalidLinks: "Please enter valid URLs starting with http:// or https://",
            galleryMinRequired: "Please add at least one service or team image.",
            galleryMaxExceeded: "You can add up to 4 images. Remove one to add another.",
          },
          uploadLabels: { logo: "firm logo", ownerImage: "professional photo", businessCardFront: "business card (front)", businessCardBack: "business card (back)", gallery: "service image" },
          location: { getting: "Detecting your office location...", captured: "Office location saved successfully.", failed: "Could not get your location. Please select it on the map.", unsupported: "Location access is not supported in this browser. Please select your location on the map." },
          submitError: "We couldn't complete your firm setup. Please try again or contact support.",
        },
      };
    }

    // 5. FOOD & BEVERAGE / RESTAURANTS (Default)
    return {
      header: {
        title: "Complete Your Business Setup",
        description: `Welcome to ScanBit! Let's set up your ${businessType.toLowerCase()} profile for digital success.`,
      },
      steps: {
        logo: {
          title: "Business Logo",
          description: "Upload your official logo. This will appear on your digital menu and QR codes.",
        },
        owner: {
          title: "Owner / Manager Profile",
          description: "Add a photo of the owner or lead professional to build a personal connection with customers.",
        },
        location: {
          title: "Business Location",
          description: "Set your physical location so customers can easily find and visit you.",
        },
        gallery: {
          title: "Business Highlights",
          description: "Upload up to 4 high-quality images that showcase your best offerings.",
          helper: "Showcase your signature items and professional environment",
          icon: MdRestaurantMenu,
          alt: "Business",
        }
      },
      success: "🎉 Setup complete! Your digital profile is now ready to serve!",
      notifications: {
        validation: {
          logoRequired: "Please upload your business logo to continue.",
          locationRequired: "Please set your business location to continue.",
          businessCardRequired: "Please upload the front side of your business card.",
          socialRequired: "Please add at least one social or business link.",
          invalidLinks: "Please enter valid URLs starting with http:// or https://",
          galleryMinRequired: "Please add at least one menu or offering image.",
          galleryMaxExceeded: "You can add up to 4 images. Remove one to add another.",
        },
        uploadLabels: { logo: "logo", ownerImage: "profile photo", businessCardFront: "business card (front)", businessCardBack: "business card (back)", gallery: "image" },
        location: { getting: "Getting your location...", captured: "Location saved successfully.", failed: "Could not get your location. Please select it on the map.", unsupported: "Location access is not supported in this browser. Please select your location on the map." },
        submitError: "We couldn't complete your setup. Please try again or contact support.",
      },
    };
  };

  const content = getContent();

  const [formData, setFormData] = useState<OnboardingData>({
    logo: restaurant?.logo || null,
    ownerImage: restaurant?.ownerImage || null,
    location: restaurant?.location && restaurant.location.lat && restaurant.location.lng ? {
      lat: restaurant.location.lat,
      lng: restaurant.location.lng,
      address: restaurant.location.address || '',
    } : null,
    whatsapp: restaurant?.whatsapp || "",
    businessCardFront: restaurant?.businessCardFront || restaurant?.businessCard || null,
    businessCardBack: restaurant?.businessCardBack || null,
    socialMedia: restaurant?.socialMedia || {},
    foodImages: restaurant?.foodImages || [],
  });

  const fileInputRefs = {
    logo: useRef<HTMLInputElement>(null),
    ownerImage: useRef<HTMLInputElement>(null),
    businessCardFront: useRef<HTMLInputElement>(null),
    businessCardBack: useRef<HTMLInputElement>(null),
    foodImages: useRef<HTMLInputElement>(null),
  };

  const totalSteps = 6;

  // Update currentRestaurant when restaurant prop changes
  useEffect(() => {
    if (restaurant) {
      setCurrentRestaurant(restaurant);
    }
  }, [restaurant]);

  // Track dialog mount state for map rendering
  useEffect(() => {
    if (open) {
      // Delay much longer to ensure dialog portal is fully mounted and React context is stable
      // This prevents react-leaflet v4 context consumer errors with React 18
      const timer = setTimeout(() => {
        setDialogMounted(true);
      }, 4000); // Increased to 4 seconds to ensure portal is completely stable
      return () => {
        clearTimeout(timer);
        setDialogMounted(false);
      };
    } else {
      setDialogMounted(false);
    }
  }, [open]);

  // Load existing restaurant data when restaurant prop changes or dialog opens
  useEffect(() => {
    const loadRestaurantData = async () => {
      if (open) {
        try {
          // Refetch restaurant data to get latest updates
          const restaurantRes = await api.getMyRestaurant();
          if (restaurantRes.success && restaurantRes.data) {
            const latestData = restaurantRes.data;
            setCurrentRestaurant(latestData); // Store latest restaurant data including businessCategory
            setFormData({
              logo: latestData.logo || null,
              ownerImage: latestData.ownerImage || null,
              location: latestData.location && latestData.location.lat && latestData.location.lng ? {
                lat: latestData.location.lat,
                lng: latestData.location.lng,
                address: latestData.location.address || '',
              } : null,
              whatsapp: latestData.whatsapp || "",
              businessCardFront: latestData.businessCardFront || latestData.businessCard || null,
              businessCardBack: latestData.businessCardBack || null,
              socialMedia: latestData.socialMedia || {},
              foodImages: Array.isArray(latestData.foodImages) ? [...latestData.foodImages] : [],
            });
          }
        } catch (error) {

          // Fallback to prop data if API fails
          if (restaurant) {
            setCurrentRestaurant(restaurant);
            setFormData({
              logo: restaurant?.logo || null,
              ownerImage: restaurant?.ownerImage || null,
              location: restaurant?.location && restaurant.location.lat && restaurant.location.lng ? {
                lat: restaurant.location.lat,
                lng: restaurant.location.lng,
                address: restaurant.location.address || '',
              } : null,
              businessCardFront: restaurant?.businessCardFront || restaurant?.businessCard || null,
              businessCardBack: restaurant?.businessCardBack || null,
              socialMedia: restaurant?.socialMedia || {},
              foodImages: Array.isArray(restaurant?.foodImages) ? [...restaurant.foodImages] : [],
            });
          }
        }
      }
    };

    loadRestaurantData();
  }, [restaurant, open]);

  const n = content.notifications;

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1: // Logo
        if (!formData.logo) {
          toast.error(n.validation.logoRequired);
          return false;
        }
        return true;
      case 2: // Owner Image (optional)
        return true;
      case 3: // Location
        if (!formData.location || !formData.location.lat || !formData.location.lng) {
          toast.error(n.validation.locationRequired);
          return false;
        }
        return true;
      case 4: // Business Card (optional)
        if (!formData.businessCardFront) {
          toast.error(n.validation.businessCardRequired);
          return false;
        }
        return true;
      case 5: // Social Media
        const hasSocialMedia = Object.values(formData.socialMedia).some(v => v && v.trim() !== "");
        const isValidUrl = (value?: string) => {
          if (!value) return true;
          const trimmed = value.trim();
          if (!trimmed) return true;
          return /^https?:\/\/[^\s]+$/i.test(trimmed);
        };

        if (!hasSocialMedia) {
          toast.error(n.validation.socialRequired);
          return false;
        }

        const invalidLink = Object.entries(formData.socialMedia).find(([, value]) => value && !isValidUrl(value));
        if (invalidLink) {
          toast.error(n.validation.invalidLinks);
          return false;
        }
        return true;
      case 6: // Images (varies by business type)
        if (formData.foodImages.length === 0) {
          toast.error(n.validation.galleryMinRequired);
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size exceeds 10MB limit. Please upload a smaller image.");
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error("Invalid file type. Please upload an image file.");
    }

    // Upload via backend API
    try {
      const url = await api.uploadImage(file, folder);
      return url;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload image. Please try again.');
    }
  };

  const getUploadLabel = (type: keyof typeof fileInputRefs): string => {
    const key = type === "foodImages" ? "gallery" : type;
    return n.uploadLabels[key as keyof typeof n.uploadLabels] || type;
  };

  const handleFileUpload = async (file: File, type: keyof typeof fileInputRefs) => {
    const label = getUploadLabel(type);
    const uploadKey = type === "foodImages" ? "foodImages" : type;
    
    // Prevent multiple simultaneous uploads of the same type
    if (uploadingStates[uploadKey as keyof typeof uploadingStates]) {
      return;
    }
    
    // Set uploading state
    setUploadingStates(prev => ({ ...prev, [uploadKey]: true }));
    
    let loadingToastId: string | number | undefined;
    
    try {
      // Professional folder structure within Scanbit
      const folder = type === "logo" ? "restaurant-logos" : 
            type === "ownerImage" ? "owner-images" : 
            type === "businessCardFront" ? "business-cards/front" :
            type === "businessCardBack" ? "business-cards/back" : "food-images";
      
      // Show loading toast with ID for proper dismissal
      loadingToastId = toast.loading(`Uploading ${label}...`, {
        description: "Please wait while we process your file",
      });
      
      const url = await uploadToCloudinary(file, folder);
      
      let updatedFormData: OnboardingData;
      
      if (type === "foodImages") {
        if (formData.foodImages.length >= 4) {
          toast.dismiss(loadingToastId);
          toast.error(n.validation.galleryMaxExceeded);
          setUploadingStates(prev => ({ ...prev, [uploadKey]: false }));
          return;
        }
        updatedFormData = { ...formData, foodImages: [...formData.foodImages, url] };
      } else {
        updatedFormData = { ...formData, [type]: url };
      }
      
      // Update local state immediately
      setFormData(updatedFormData);
      
      // Save to backend immediately so it persists on refresh
      try {
        await api.updateMyRestaurant({
          logo: updatedFormData.logo,
          ownerImage: updatedFormData.ownerImage,
          location: updatedFormData.location,
          businessCardFront: updatedFormData.businessCardFront,
          businessCardBack: updatedFormData.businessCardBack,
          businessCard: updatedFormData.businessCardFront || null,
          socialMedia: updatedFormData.socialMedia,
          foodImages: updatedFormData.foodImages,
          // Don't mark as completed yet - user still needs to finish onboarding
        });
      } catch (saveError: any) {
        // Continue anyway - at least show success message
      }
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToastId);
      toast.success(`${label.charAt(0).toUpperCase() + label.slice(1)} uploaded successfully`, {
        description: "Your file has been saved and is ready to use",
        duration: 3000,
      });
    } catch (error: any) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToastId);
      toast.error(`Failed to upload ${label}`, {
        description: error.message || "Please check your connection and try again",
        duration: 4000,
      });
    } finally {
      // Reset uploading state
      setUploadingStates(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!deleteConfirm.type) return;

    try {
      let updatedFormData: OnboardingData;

      switch (deleteConfirm.type) {
        case 'logo':
          updatedFormData = { ...formData, logo: null };
          break;
        case 'ownerImage':
          updatedFormData = { ...formData, ownerImage: null };
          break;
        case 'businessCardFront':
          updatedFormData = { ...formData, businessCardFront: null };
          break;
        case 'businessCardBack':
          updatedFormData = { ...formData, businessCardBack: null };
          break;
        case 'foodImage':
          if (deleteConfirm.index !== undefined) {
            const updatedFoodImages = formData.foodImages.filter((_, i) => i !== deleteConfirm.index);
            updatedFormData = { ...formData, foodImages: updatedFoodImages };
          } else {
            return;
          }
          break;
        default:
          return;
      }

      setFormData(updatedFormData);

      // Save to backend immediately
      try {
        await api.updateMyRestaurant({
          logo: updatedFormData.logo,
          ownerImage: updatedFormData.ownerImage,
          location: updatedFormData.location,
          businessCardFront: updatedFormData.businessCardFront,
          businessCardBack: updatedFormData.businessCardBack,
          businessCard: updatedFormData.businessCardFront || null,
          socialMedia: updatedFormData.socialMedia,
          foodImages: updatedFormData.foodImages,
        });
        toast.success(`${deleteConfirm.label} removed successfully`, {
          description: "The image has been deleted from your profile",
          duration: 3000,
        });
      } catch (error) {
        toast.error("Failed to remove image", {
          description: "Please try again or contact support",
          duration: 4000,
        });
      }
    } catch (error) {
      toast.error("Failed to remove image", {
        description: "Please try again or contact support",
        duration: 4000,
      });
    } finally {
      setDeleteConfirm({ open: false, type: null, label: '' });
    }
  };

  // Show delete confirmation
  const showDeleteConfirm = (type: 'logo' | 'ownerImage' | 'businessCardFront' | 'businessCardBack' | 'foodImage', index?: number) => {
    const labels: Record<string, string> = {
      logo: getUploadLabel('logo'),
      ownerImage: getUploadLabel('ownerImage'),
      businessCardFront: getUploadLabel('businessCardFront'),
      businessCardBack: getUploadLabel('businessCardBack'),
      foodImage: getUploadLabel('foodImages'),
    };
    
    setDeleteConfirm({
      open: true,
      type,
      index,
      label: labels[type] || 'image',
    });
  };

  const getCurrentLocation = async () => {
    if (uploadingStates.location) {
      return;
    }
    
    if (!navigator.geolocation) {
      toast.error(n.location.unsupported, {
        description: "Please select your location manually on the map",
        duration: 4000,
      });
      return;
    }

    setUploadingStates(prev => ({ ...prev, location: true }));
    const loadingToastId = toast.loading(n.location.getting, {
      description: "Detecting your current location...",
    });
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const updatedLocation = {
            lat: latitude,
            lng: longitude,
            address: `${latitude}, ${longitude}`,
        };
        const updatedFormData = {
          ...formData,
          location: updatedLocation,
        };
        
        setFormData(updatedFormData);
        
        // Save to backend immediately
        try {
          await api.updateMyRestaurant({
            logo: updatedFormData.logo,
            ownerImage: updatedFormData.ownerImage,
            location: updatedFormData.location,
            whatsapp: updatedFormData.whatsapp,
            businessCardFront: updatedFormData.businessCardFront,
            businessCardBack: updatedFormData.businessCardBack,
            businessCard: updatedFormData.businessCardFront || null,
            socialMedia: updatedFormData.socialMedia,
            foodImages: updatedFormData.foodImages,
          });
        } catch (error) {
          // Continue - location is set locally
        }
        
        toast.dismiss(loadingToastId);
        toast.success(n.location.captured, {
          description: "Your location has been saved successfully",
          duration: 3000,
        });
        setUploadingStates(prev => ({ ...prev, location: false }));
      },
      (error) => {
        toast.dismiss(loadingToastId);
        toast.error(n.location.failed, {
          description: "Please select your location manually on the map below",
          duration: 4000,
        });
        setUploadingStates(prev => ({ ...prev, location: false }));
      }
    );
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    try {
      await api.updateMyRestaurant({
        logo: formData.logo,
        ownerImage: formData.ownerImage,
        location: formData.location,
        whatsapp: formData.whatsapp,
        businessCardFront: formData.businessCardFront,
        businessCardBack: formData.businessCardBack,
        businessCard: formData.businessCardFront || null,
        socialMedia: formData.socialMedia,
        foodImages: formData.foodImages,
        onboardingCompleted: true,
      });

      toast.success(content.success);
      onComplete();
    } catch (error: any) {
      toast.error(error.message || n.submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Logo
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{content.steps.logo.title}</h3>
              <p className="text-sm text-muted-foreground">{content.steps.logo.description}</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              {formData.logo ? (
                <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                  <div className="w-full h-full rounded-full border-4 border-primary bg-white flex items-center justify-center overflow-hidden">
                    <img src={formData.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showDeleteConfirm('logo');
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all shadow-lg z-20 border-2 border-white"
                    title="Remove Logo"
                  >
                    <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => !uploadingStates.logo && fileInputRefs.logo.current?.click()}
                  className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-dashed border-primary flex items-center justify-center transition-colors ${
                    uploadingStates.logo 
                      ? "cursor-not-allowed opacity-50 bg-muted" 
                      : "cursor-pointer hover:bg-primary/10"
                  }`}
                >
                  <FiUpload className={`w-6 h-6 sm:w-8 sm:h-8 ${uploadingStates.logo ? "text-muted-foreground" : "text-primary"}`} />
                </div>
              )}
              <Input
                ref={fileInputRefs.logo}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingStates.logo}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && !uploadingStates.logo) handleFileUpload(file, "logo");
                }}
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRefs.logo.current?.click()}
                disabled={uploadingStates.logo}
              >
                {uploadingStates.logo ? "Uploading..." : formData.logo ? "Change Logo" : "Upload Logo"}
              </Button>
            </div>
          </div>
        );

      case 2: // Owner Image
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{content.steps.owner.title}</h3>
              <p className="text-sm text-muted-foreground">{content.steps.owner.description}</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              {formData.ownerImage ? (
                <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                  <div className="w-full h-full rounded-full border-4 border-primary bg-white flex items-center justify-center overflow-hidden">
                    <img src={formData.ownerImage} alt="Owner" className="w-full h-full object-contain p-1" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showDeleteConfirm('ownerImage');
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all shadow-lg z-20 border-2 border-white"
                    title="Remove Profile Image"
                  >
                    <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRefs.ownerImage.current?.click()}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-dashed border-primary flex items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  <FiImage className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
              )}
              <Input
                ref={fileInputRefs.ownerImage}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingStates.ownerImage}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && !uploadingStates.ownerImage) handleFileUpload(file, "ownerImage");
                }}
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRefs.ownerImage.current?.click()}
                disabled={uploadingStates.ownerImage}
              >
                {uploadingStates.ownerImage ? "Uploading..." : formData.ownerImage ? "Change Image" : "Upload Profile Image"}
              </Button>
            </div>
          </div>
        );

      case 3: // Location
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{content.steps.location.title}</h3>
              <p className="text-sm text-muted-foreground">{content.steps.location.description}</p>
            </div>
            <div className="space-y-4">
              {formData.location?.lat && formData.location?.lng ? (
                <>
                  {step === 3 && dialogMounted && open && (
                  <MapPicker
                      key={`map-loaded-${formData.location.lat}-${formData.location.lng}-${step}`}
                    position={formData.location}
                      onPositionChange={async (newPos) => {
                        const updatedLocation = {
                          ...formData.location!,
                          lat: newPos.lat,
                          lng: newPos.lng,
                        };
                        const updatedFormData = {
                          ...formData,
                          location: updatedLocation,
                        };
                        setFormData(updatedFormData);
                        
                        // Save to backend immediately
                        try {
                          await api.updateMyRestaurant({
                            logo: updatedFormData.logo,
                            ownerImage: updatedFormData.ownerImage,
                            location: updatedFormData.location,
                            businessCardFront: updatedFormData.businessCardFront,
                            businessCardBack: updatedFormData.businessCardBack,
                            businessCard: updatedFormData.businessCardFront || null,
                            socialMedia: updatedFormData.socialMedia,
                            foodImages: updatedFormData.foodImages,
                          });
                        } catch (error) {

                        }
                      }}
                      height="300px"
                    />
                  )}
                  {step === 3 && !dialogMounted && (
                    <div className="h-[300px] w-full rounded-lg border border-border bg-secondary flex items-center justify-center">
                      <div className="text-muted-foreground text-sm">Loading map...</div>
                    </div>
                  )}
                  <div className="text-center space-y-2 p-3 bg-secondary rounded-lg">
                    <p className="text-sm font-medium text-foreground">Location Selected ✓</p>
                    <p className="text-xs text-muted-foreground">
                      {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {step === 3 && dialogMounted && open && (
                  <MapPicker
                      key={`map-empty-${step}-${dialogMounted}`}
                    position={null}
                      onPositionChange={async (newPos) => {
                        const updatedLocation = {
                          lat: newPos.lat,
                          lng: newPos.lng,
                          address: formData.location?.address || "",
                        };
                        const updatedFormData = {
                          ...formData,
                          location: updatedLocation,
                        };
                        setFormData(updatedFormData);
                        
                        // Save to backend immediately
                        try {
                          await api.updateMyRestaurant({
                            logo: updatedFormData.logo,
                            ownerImage: updatedFormData.ownerImage,
                            location: updatedFormData.location,
                            businessCardFront: updatedFormData.businessCardFront,
                            businessCardBack: updatedFormData.businessCardBack,
                            businessCard: updatedFormData.businessCardFront || null,
                            socialMedia: updatedFormData.socialMedia,
                            foodImages: updatedFormData.foodImages,
                          });
                        } catch (error) {

                        }
                      }}
                      height="300px"
                    />
                  )}
                  {step === 3 && !dialogMounted && (
                    <div className="h-[300px] w-full rounded-lg border border-border bg-secondary flex items-center justify-center">
                      <div className="text-muted-foreground text-sm">Loading map...</div>
                    </div>
                  )}
                  <p className="text-xs text-center text-muted-foreground">
                    Click on the map to set your location, or use "Current Location" button
                  </p>
                </>
              )}
              <Button 
                onClick={getCurrentLocation} 
                className="w-full" 
                variant="outline"
                disabled={uploadingStates.location}
              >
                <MdLocationOn className="w-4 h-4 mr-2" />
                {uploadingStates.location ? "Detecting Location..." : "Use Current Location"}
              </Button>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  placeholder="Enter your business address"
                  value={formData.location?.address || ""}
                  onChange={async (e) => {
                    const updatedLocation = {
                        ...formData.location!,
                        address: e.target.value,
                        lat: formData.location?.lat || 0,
                        lng: formData.location?.lng || 0,
                    };
                    const updatedFormData = {
                      ...formData,
                      location: updatedLocation,
                    };
                    setFormData(updatedFormData);
                    
                    // Debounce save to backend (wait 1 second after user stops typing)
                    clearTimeout((window as any).addressSaveTimeout);
                    (window as any).addressSaveTimeout = setTimeout(async () => {
                      try {
                        await api.updateMyRestaurant({
                          logo: updatedFormData.logo,
                          ownerImage: updatedFormData.ownerImage,
                          location: updatedFormData.location,
                          businessCardFront: updatedFormData.businessCardFront,
                          businessCardBack: updatedFormData.businessCardBack,
                          businessCard: updatedFormData.businessCardFront || null,
                          socialMedia: updatedFormData.socialMedia,
                          foodImages: updatedFormData.foodImages,
                        });
                      } catch (error) {

                      }
                    }, 1000);
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 4: // Business Card
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Business Card</h3>
              <p className="text-sm text-muted-foreground">Front is mandatory, back is optional.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 w-full">
              {/* Front (Required) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Front *</Label>
                  {!formData.businessCardFront && (
                    <span className="text-xs text-red-500">Required</span>
                  )}
                </div>
                {formData.businessCardFront ? (
                  <div className="relative w-full rounded-lg overflow-hidden border-4 border-primary">
                    <img src={formData.businessCardFront} alt="Business Card Front" className="w-full h-auto object-contain" />
                    <button
                      onClick={() => showDeleteConfirm('businessCardFront')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => !uploadingStates.businessCardFront && fileInputRefs.businessCardFront.current?.click()}
                    className={`w-full h-40 sm:h-48 border-4 border-dashed border-primary rounded-lg flex items-center justify-center transition-colors ${
                      uploadingStates.businessCardFront 
                        ? "cursor-not-allowed opacity-50 bg-muted" 
                        : "cursor-pointer hover:bg-primary/10"
                    }`}
                  >
                    <FiUpload className={`w-6 h-6 sm:w-8 sm:h-8 ${uploadingStates.businessCardFront ? "text-muted-foreground" : "text-primary"}`} />
                  </div>
                )}
                <Input
                  ref={fileInputRefs.businessCardFront}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingStates.businessCardFront}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && !uploadingStates.businessCardFront) handleFileUpload(file, "businessCardFront");
                  }}
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRefs.businessCardFront.current?.click()}
                  disabled={uploadingStates.businessCardFront}
                >
                  {uploadingStates.businessCardFront ? "Uploading..." : formData.businessCardFront ? "Change Front" : "Upload Front"}
                </Button>
              </div>

              {/* Back (Optional) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Back (Optional)</Label>
                </div>
                {formData.businessCardBack ? (
                  <div className="relative w-full rounded-lg overflow-hidden border-4 border-primary/60">
                    <img src={formData.businessCardBack} alt="Business Card Back" className="w-full h-auto object-contain" />
                    <button
                      onClick={() => showDeleteConfirm('businessCardBack')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => !uploadingStates.businessCardBack && fileInputRefs.businessCardBack.current?.click()}
                    className={`w-full h-40 sm:h-48 border-4 border-dashed border-primary/60 rounded-lg flex items-center justify-center transition-colors ${
                      uploadingStates.businessCardBack 
                        ? "cursor-not-allowed opacity-50 bg-muted" 
                        : "cursor-pointer hover:bg-primary/10"
                    }`}
                  >
                    <FiUpload className={`w-6 h-6 sm:w-8 sm:h-8 ${uploadingStates.businessCardBack ? "text-muted-foreground" : "text-primary"}`} />
                  </div>
                )}
                <Input
                  ref={fileInputRefs.businessCardBack}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingStates.businessCardBack}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && !uploadingStates.businessCardBack) handleFileUpload(file, "businessCardBack");
                  }}
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRefs.businessCardBack.current?.click()}
                  disabled={uploadingStates.businessCardBack}
                >
                  {uploadingStates.businessCardBack ? "Uploading..." : formData.businessCardBack ? "Change Back" : "Upload Back"}
                </Button>
              </div>
            </div>
          </div>
        );

      case 5: // Social Media
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Social Media Links</h3>
              <p className="text-sm text-muted-foreground">Add at least one social media link</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input
                  id="facebook"
                  type="url"
                  placeholder="https://facebook.com/yourpage"
                  value={formData.socialMedia.facebook || ""}
                  onChange={async (e) => {
                    const raw = e.target.value;
                    const trimmed = raw.trim();
                    if (trimmed && !/^https?:\/\/[^\s]+$/i.test(trimmed)) {
                      toast.error(n.validation.invalidLinks);
                      return;
                    }
                    const updatedSocialMedia = { ...formData.socialMedia, facebook: trimmed };
                    const updatedFormData = { ...formData, socialMedia: updatedSocialMedia };
                    setFormData(updatedFormData);
                    
                    // Debounce save to backend
                    clearTimeout((window as any).socialSaveTimeout);
                    (window as any).socialSaveTimeout = setTimeout(async () => {
                      try {
                        await api.updateMyRestaurant({
                          logo: updatedFormData.logo,
                          ownerImage: updatedFormData.ownerImage,
                          location: updatedFormData.location,
                          businessCardFront: updatedFormData.businessCardFront,
                          businessCardBack: updatedFormData.businessCardBack,
                          businessCard: updatedFormData.businessCardFront || null,
                          socialMedia: updatedFormData.socialMedia,
                          foodImages: updatedFormData.foodImages,
                        });
                      } catch (error) {

                      }
                    }, 1000);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  type="url"
                  placeholder="https://instagram.com/yourpage"
                  value={formData.socialMedia.instagram || ""}
                  onChange={async (e) => {
                    const raw = e.target.value;
                    const trimmed = raw.trim();
                    if (trimmed && !/^https?:\/\/[^\s]+$/i.test(trimmed)) {
                      toast.error(n.validation.invalidLinks);
                      return;
                    }
                    const updatedSocialMedia = { ...formData.socialMedia, instagram: trimmed };
                    const updatedFormData = { ...formData, socialMedia: updatedSocialMedia };
                    setFormData(updatedFormData);
                    
                    // Debounce save to backend
                    clearTimeout((window as any).socialSaveTimeout);
                    (window as any).socialSaveTimeout = setTimeout(async () => {
                      try {
                        await api.updateMyRestaurant({
                          logo: updatedFormData.logo,
                          ownerImage: updatedFormData.ownerImage,
                          location: updatedFormData.location,
                          businessCardFront: updatedFormData.businessCardFront,
                          businessCardBack: updatedFormData.businessCardBack,
                          businessCard: updatedFormData.businessCardFront || null,
                          socialMedia: updatedFormData.socialMedia,
                          foodImages: updatedFormData.foodImages,
                        });
                      } catch (error) {

                      }
                    }, 1000);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter/X URL</Label>
                <Input
                  id="twitter"
                  type="url"
                  placeholder="https://twitter.com/yourpage"
                  value={formData.socialMedia.twitter || ""}
                  onChange={async (e) => {
                    const raw = e.target.value;
                    const trimmed = raw.trim();
                    if (trimmed && !/^https?:\/\/[^\s]+$/i.test(trimmed)) {
                      toast.error(n.validation.invalidLinks);
                      return;
                    }
                    const updatedSocialMedia = { ...formData.socialMedia, twitter: trimmed };
                    const updatedFormData = { ...formData, socialMedia: updatedSocialMedia };
                    setFormData(updatedFormData);
                    
                    // Debounce save to backend
                    clearTimeout((window as any).socialSaveTimeout);
                    (window as any).socialSaveTimeout = setTimeout(async () => {
                      try {
                        await api.updateMyRestaurant({
                          logo: updatedFormData.logo,
                          ownerImage: updatedFormData.ownerImage,
                          location: updatedFormData.location,
                          businessCardFront: updatedFormData.businessCardFront,
                          businessCardBack: updatedFormData.businessCardBack,
                          businessCard: updatedFormData.businessCardFront || null,
                          socialMedia: updatedFormData.socialMedia,
                          foodImages: updatedFormData.foodImages,
                        });
                      } catch (error) {

                      }
                    }, 1000);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={formData.socialMedia.website || ""}
                  onChange={async (e) => {
                    const raw = e.target.value;
                    const trimmed = raw.trim();
                    if (trimmed && !/^https?:\/\/[^\s]+$/i.test(trimmed)) {
                      toast.error(n.validation.invalidLinks);
                      return;
                    }
                    const updatedSocialMedia = { ...formData.socialMedia, website: trimmed };
                    const updatedFormData = { ...formData, socialMedia: updatedSocialMedia };
                    setFormData(updatedFormData);
                    
                    // Debounce save to backend
                    clearTimeout((window as any).socialSaveTimeout);
                    (window as any).socialSaveTimeout = setTimeout(async () => {
                      try {
                        await api.updateMyRestaurant({
                          logo: updatedFormData.logo,
                          ownerImage: updatedFormData.ownerImage,
                          location: updatedFormData.location,
                          whatsapp: updatedFormData.whatsapp,
                          businessCardFront: updatedFormData.businessCardFront,
                          businessCardBack: updatedFormData.businessCardBack,
                          businessCard: updatedFormData.businessCardFront || null,
                          socialMedia: updatedFormData.socialMedia,
                          foodImages: updatedFormData.foodImages,
                        });
                      } catch (error) {

                      }
                    }, 1000);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp Number (Optional)</Label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+91</span>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="9876543210"
                    className="pl-12"
                    value={formData.whatsapp || ""}
                    onChange={async (e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      const updatedFormData = { ...formData, whatsapp: val };
                      setFormData(updatedFormData);
                      
                      // Debounce save to backend
                      clearTimeout((window as any).whatsappSaveTimeout);
                      (window as any).whatsappSaveTimeout = setTimeout(async () => {
                        try {
                          await api.updateMyRestaurant({
                            logo: updatedFormData.logo,
                            ownerImage: updatedFormData.ownerImage,
                            location: updatedFormData.location,
                            whatsapp: updatedFormData.whatsapp,
                            businessCardFront: updatedFormData.businessCardFront,
                            businessCardBack: updatedFormData.businessCardBack,
                            businessCard: updatedFormData.businessCardFront || null,
                            socialMedia: updatedFormData.socialMedia,
                            foodImages: updatedFormData.foodImages,
                          });
                        } catch (error) {

                        }
                      }, 1000);
                    }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Used for direct customer inquiries via WhatsApp.</p>
              </div>
            </div>
          </div>
        );

      case 6: // Images (varies by business type)
        const currentContent = content.steps.gallery;
        const IconComponent = currentContent.icon;

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">{currentContent.title}</h3>
              <p className="text-sm text-muted-foreground">{currentContent.description}</p>
              <p className="text-xs text-muted-foreground mt-2">{currentContent.helper}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
              {formData.foodImages.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary">
                  <img src={url} alt={`${currentContent.alt} ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => showDeleteConfirm('foodImage', index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {formData.foodImages.length < 4 && (
                <div
                  onClick={() => !uploadingStates.foodImages && fileInputRefs.foodImages.current?.click()}
                  className={`aspect-square border-4 border-dashed border-primary rounded-lg flex items-center justify-center transition-colors ${
                    uploadingStates.foodImages 
                      ? "cursor-not-allowed opacity-50 bg-muted" 
                      : "cursor-pointer hover:bg-primary/10"
                  }`}
                >
                  <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${uploadingStates.foodImages ? "text-muted-foreground" : "text-primary"}`} />
                </div>
              )}
            </div>
            <Input
              ref={fileInputRefs.foodImages}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingStates.foodImages}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && !uploadingStates.foodImages) handleFileUpload(file, "foodImages");
                // Reset input
                if (fileInputRefs.foodImages.current) {
                  fileInputRefs.foodImages.current.value = "";
                }
              }}
            />
            {uploadingStates.foodImages && (
              <div className="text-center text-sm text-muted-foreground">
                Uploading product image... Please wait
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Get business category for header customization
  const currentHeaderContent = content.header;

  return (
    <>
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full" hideCloseButton>
        <DialogHeader>
          <DialogTitle>{currentHeaderContent.title}</DialogTitle>
          <DialogDescription>
            {currentHeaderContent.description}
          </DialogDescription>
          <div className="flex gap-1 sm:gap-2 mt-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 sm:h-2 rounded-full ${
                  i + 1 <= step ? "bg-primary" : "bg-secondary"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Step {step} of {totalSteps}
          </p>
        </DialogHeader>

        <div className="py-4 sm:py-6 min-h-[300px] sm:min-h-[400px]">{renderStep()}</div>

        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={step === 1} className="w-full sm:w-auto">
            Previous
          </Button>
          <Button onClick={handleNext} disabled={isSubmitting} className="w-full sm:w-auto">
            {step === totalSteps ? (isSubmitting ? "Completing..." : "Complete Setup") : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => {
      if (!open) {
        setDeleteConfirm({ open: false, type: null, label: '' });
      }
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {deleteConfirm.label}?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove this {deleteConfirm.label}? This action cannot be undone and you'll need to upload it again if you want to use it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default Onboarding;

/**
 * Create your portfolio — professional form matching /industries/professional-services#about
 * Preview shows data in the same format as DemoPortfolioPreview.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MdPalette } from "react-icons/md";
import { FiPlus, FiTrash2, FiEye, FiEdit3 } from "react-icons/fi";
import { DemoPortfolioPreview } from "@/pages/industries/demos/DemoPortfolioPreview";
import api from "@/lib/api";
import { compressImageToMaxSize } from "@/lib/compressImage";
import { toast } from "sonner";

export interface PortfolioBusinessInfo {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  profileImageUrl?: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  website: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  mapQuery: string;
  mapEmbedUrl: string | null;
}

export interface PortfolioPracticeArea {
  id: string;
  name: string;
  description: string;
}

export interface PortfolioExperience {
  id: string;
  title: string;
  category: string;
  year: string;
  summary: string;
}

export interface PortfolioTestimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  client: string;
  year: string;
  role: string;
  description: string;
  url: string;
  imageUrl: string;
  technologies: string;
  deliverables: string;
  outcome: string;
}

const defaultBusinessInfo: PortfolioBusinessInfo = {
  name: "",
  title: "",
  tagline: "",
  bio: "",
  profileImageUrl: "",
  address: "",
  phone: "",
  email: "",
  whatsapp: "",
  website: "",
  socialMedia: { facebook: "", instagram: "", twitter: "", linkedin: "" },
  mapQuery: "",
  mapEmbedUrl: null,
};

function mapRestaurantToBusinessInfo(restaurant: any): PortfolioBusinessInfo {
  const loc = restaurant?.location || {};
  const social = restaurant?.socialMedia || {};
  const address =
    typeof restaurant?.address === "string"
      ? restaurant.address
      : loc.address || "";
  const name = restaurant?.name || "";
  return {
    name,
    title: restaurant?.portfolioTitle || restaurant?.businessType || restaurant?.businessCategory || "",
    tagline: restaurant?.tagline || "",
    bio: restaurant?.profile || "",
    profileImageUrl:
      restaurant?.logo || restaurant?.ownerImage || restaurant?.businessCardFront || "",
    address,
    phone: restaurant?.phone || "",
    email: restaurant?.email || "",
    whatsapp: restaurant?.whatsapp || restaurant?.phone || "",
    website: social?.website || "",
    socialMedia: {
      facebook: social?.facebook || "",
      instagram: social?.instagram || "",
      twitter: social?.twitter || "",
      linkedin: social?.linkedin || "",
    },
    mapQuery: address || name,
    mapEmbedUrl: restaurant?.portfolioMapEmbedUrl || null,
  };
}

function generateId() {
  return String(Date.now()) + Math.random().toString(36).slice(2, 6);
}

export default function PortfolioForm({ restaurant }: { restaurant?: any }) {
  const [showPreview, setShowPreview] = useState(false);
  const [theme, setTheme] = useState<"orange" | "blue" | "emerald" | "slate">(
    (restaurant?.portfolioTheme as any) || "orange"
  );
  const [showQuickActions, setShowQuickActions] = useState<boolean>(restaurant?.showQuickActions !== false);
  const [showSocialLinks, setShowSocialLinks] = useState<boolean>(restaurant?.showSocialLinks !== false);
  const steps = [
    { id: "about", label: "About" },
    { id: "expertise", label: "Expertise" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "testimonials", label: "Testimonials" },
    { id: "contact", label: "Contact" },
    { id: "gallery", label: "Gallery" },
    { id: "resume", label: "Resume" },
    { id: "theme", label: "Theme" },
  ] as const;
  const [stepIndex, setStepIndex] = useState(0);
  const activeStep = steps[Math.min(stepIndex, steps.length - 1)];
  const [businessInfo, setBusinessInfo] = useState<PortfolioBusinessInfo>(
    restaurant ? mapRestaurantToBusinessInfo(restaurant) : defaultBusinessInfo
  );
  const [practiceAreas, setPracticeAreas] = useState<PortfolioPracticeArea[]>(
    Array.isArray(restaurant?.portfolioPracticeAreas) && restaurant.portfolioPracticeAreas.length > 0
      ? restaurant.portfolioPracticeAreas
      : [{ id: generateId(), name: "", description: "" }]
  );
  const [experience, setExperience] = useState<PortfolioExperience[]>(
    Array.isArray(restaurant?.portfolioExperience) && restaurant.portfolioExperience.length > 0
      ? restaurant.portfolioExperience
      : [{ id: generateId(), title: "", category: "", year: "", summary: "" }]
  );
  const [projects, setProjects] = useState<PortfolioProject[]>(
    Array.isArray(restaurant?.portfolioProjects) && restaurant.portfolioProjects.length > 0
      ? restaurant.portfolioProjects
      : [{ id: generateId(), title: "", client: "", year: "", role: "", description: "", url: "", imageUrl: "", technologies: "", deliverables: "", outcome: "" }]
  );
  const [testimonials, setTestimonials] = useState<PortfolioTestimonial[]>(
    Array.isArray(restaurant?.portfolioTestimonials) && restaurant.portfolioTestimonials.length > 0
      ? restaurant.portfolioTestimonials
      : [{ id: generateId(), quote: "", author: "", role: "" }]
  );
  const [resumeUrl, setResumeUrl] = useState<string>(restaurant?.portfolioResumeUrl || "");
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>(
    Array.isArray(restaurant?.portfolioGallery) ? [...restaurant.portfolioGallery] : []
  );
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateBusinessInfo = (field: keyof PortfolioBusinessInfo, value: string | null) => {
    setBusinessInfo((prev) => ({ ...prev, [field]: value ?? "" }));
  };

  const updateSocial = (field: keyof NonNullable<PortfolioBusinessInfo["socialMedia"]>, value: string) => {
    setBusinessInfo((prev) => ({
      ...prev,
      socialMedia: { ...(prev.socialMedia || {}), [field]: value },
    }));
  };

  const addPracticeArea = () => setPracticeAreas((prev) => [...prev, { id: generateId(), name: "", description: "" }]);
  const removePracticeArea = (id: string) => setPracticeAreas((prev) => prev.filter((p) => p.id !== id));
  const updatePracticeArea = (id: string, field: "name" | "description", value: string) => {
    setPracticeAreas((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const addExperience = () =>
    setExperience((prev) => [...prev, { id: generateId(), title: "", category: "", year: "", summary: "" }]);
  const removeExperience = (id: string) => setExperience((prev) => prev.filter((e) => e.id !== id));
  const updateExperience = (id: string, field: keyof PortfolioExperience, value: string) => {
    setExperience((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };
  const addProject = () =>
    setProjects((prev) => [...prev, { id: generateId(), title: "", client: "", year: "", role: "", description: "", url: "", imageUrl: "", technologies: "", deliverables: "", outcome: "" }]);
  const removeProject = (id: string) => setProjects((prev) => prev.filter((p) => p.id !== id));
  const updateProject = (id: string, field: keyof PortfolioProject, value: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const addTestimonial = () =>
    setTestimonials((prev) => [...prev, { id: generateId(), quote: "", author: "", role: "" }]);
  const removeTestimonial = (id: string) => setTestimonials((prev) => prev.filter((t) => t.id !== id));
  const updateTestimonial = (id: string, field: keyof PortfolioTestimonial, value: string) => {
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleProfileImageUpload = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    setUploadingProfile(true);
    try {
      const url = await api.uploadImage(file, "portfolio-profiles");
      setBusinessInfo((prev) => ({ ...prev, profileImageUrl: url || "" }));
      toast.success("Profile image uploaded.");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed.");
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleResumeUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingResume(true);
    try {
      const url = await api.uploadFile(file, "portfolio-resumes");
      setResumeUrl(url || "");
      toast.success("CV / Resume uploaded.");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleGalleryUpload = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    const GALLERY_MAX = 10;
    const remaining = GALLERY_MAX - galleryImages.length;
    if (remaining <= 0) {
      toast.error(`Gallery is full. Maximum ${GALLERY_MAX} images allowed.`);
      return;
    }
    const toAdd = Math.min(remaining, filesList.length);
    try {
      setUploadingGallery(true);
      const urls: string[] = [];
      for (let i = 0; i < toAdd; i++) {
        const file = filesList[i];
        if (!file.type.startsWith("image/")) continue;
        const compressed = await compressImageToMaxSize(file, 500 * 1024);
        const url = await api.uploadImage(compressed, "portfolio-gallery");
        urls.push(url);
      }
      setGalleryImages((prev) => [...prev, ...urls].slice(0, GALLERY_MAX));
      toast.success(`${urls.length} image(s) added to portfolio gallery (compressed to max 500KB).`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to upload gallery images.");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!restaurant?._id && !restaurant?.id) {
      toast.error("Restaurant not found. Please refresh and try again.");
      return;
    }
    try {
      setSaving(true);
      const id = restaurant._id || restaurant.id;
      const payload: any = {
        // Portfolio display fields
        name: businessInfo.name,
        tagline: businessInfo.tagline || null,
        profile: businessInfo.bio || null,
        phone: businessInfo.phone || null,
        whatsapp: businessInfo.whatsapp || null,
        showQuickActions,
        showSocialLinks,
        location: { address: businessInfo.address || null },
        socialMedia: {
          website: businessInfo.website || null,
          facebook: businessInfo.socialMedia?.facebook || null,
          instagram: businessInfo.socialMedia?.instagram || null,
          twitter: businessInfo.socialMedia?.twitter || null,
          linkedin: businessInfo.socialMedia?.linkedin || null,
        },
        portfolioTitle: businessInfo.title || null,
        portfolioMapEmbedUrl: businessInfo.mapEmbedUrl || null,
        portfolioTheme: theme,
        // Portfolio gallery & CV
        portfolioGallery: galleryImages,
        portfolioResumeUrl: resumeUrl || null,
        // Structured portfolio sections
        portfolioPracticeAreas: practiceAreas.filter(
          (p) => p.name.trim() || p.description.trim()
        ),
        portfolioExperience: experience.filter(
          (e) => e.title.trim() || e.summary.trim()
        ),
        portfolioProjects: projects.filter(
          (p) => p.title.trim() || p.description.trim() || p.client.trim() || p.outcome.trim()
        ),
        portfolioTestimonials: testimonials.filter(
          (t) => t.quote.trim() || t.author.trim()
        ),
      };

      // If a profile image URL is set here, also update restaurant logo
      if (businessInfo.profileImageUrl) {
        payload.logo = businessInfo.profileImageUrl;
      }

      const response = await api.updateRestaurant(id, payload);
      if (response?.success) {
        toast.success("Portfolio saved! View your live portfolio via the Preview link in the top navbar.");
      } else {
        throw new Error(response?.message || "Save failed");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to save portfolio.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MdPalette className="w-8 h-8 text-orange-600" />
            Create your portfolio
          </h1>
          <p className="text-slate-600 mt-1">
            Build your professional portfolio. Save details here and preview using your public portfolio link.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setShowPreview(true)} className="gap-2">
            <FiEye className="w-4 h-4" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-orange-600 hover:bg-orange-700">
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] overflow-hidden p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <FiEdit3 className="w-4 h-4" />
              Live preview
            </DialogTitle>
          </DialogHeader>
          <div className="h-[calc(90vh-64px)] overflow-auto">
            <DemoPortfolioPreview
              businessInfo={{
                ...businessInfo,
                website: businessInfo.website,
                socialMedia: businessInfo.socialMedia || {},
              }}
              practiceAreas={practiceAreas}
              experience={experience}
              projects={projects}
              testimonials={testimonials}
              resumeUrl={resumeUrl || undefined}
              galleryUrls={galleryImages}
              hideCTAs
              showQuickActions={showQuickActions}
              showSocialLinks={showSocialLinks}
              theme={theme}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Stepper */}
      <Card className="border-slate-200">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm font-semibold text-slate-900">
              Step {stepIndex + 1} of {steps.length}: {activeStep.label}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
                disabled={stepIndex === 0}
              >
                Back
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setStepIndex((s) => Math.min(steps.length - 1, s + 1))}
                disabled={stepIndex === steps.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStepIndex(idx)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  idx === stepIndex
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* About / #about */}
      {activeStep.id === "about" && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>Name, title, tagline and bio (shown in #about section)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input
                  value={businessInfo.name}
                  onChange={(e) => updateBusinessInfo("name", e.target.value)}
                  placeholder="e.g. Alex Morgan"
                />
              </div>
              <div className="space-y-2">
                <Label>Title / designation</Label>
                <Input
                  value={businessInfo.title}
                  onChange={(e) => updateBusinessInfo("title", e.target.value)}
                  placeholder="e.g. Partner, Legal & Advisory"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input
                value={businessInfo.tagline}
                onChange={(e) => updateBusinessInfo("tagline", e.target.value)}
                placeholder="Short professional tagline"
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={businessInfo.bio}
                onChange={(e) => updateBusinessInfo("bio", e.target.value)}
                placeholder="Professional summary and experience"
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Profile image URL</Label>
              <Input
                value={businessInfo.profileImageUrl || ""}
                onChange={(e) => updateBusinessInfo("profileImageUrl", e.target.value)}
                placeholder="https://..."
              />
              <div className="flex items-center gap-3 pt-1">
                <Label className="text-xs text-slate-500">Or upload image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  className="text-xs"
                  onChange={(e) => handleProfileImageUpload(e.target.files?.[0] || null)}
                  disabled={uploadingProfile}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Practice areas / Expertise */}
      {activeStep.id === "expertise" && (
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expertise & practice areas</CardTitle>
              <CardDescription>Areas of practice or expertise</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addPracticeArea} className="gap-1">
              <FiPlus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {practiceAreas.map((area) => (
            <div key={area.id} className="flex gap-2 items-start p-3 rounded-lg border border-slate-100">
              <div className="flex-1 grid sm:grid-cols-2 gap-2">
                <Input
                  value={area.name}
                  onChange={(e) => updatePracticeArea(area.id, "name", e.target.value)}
                  placeholder="Name"
                />
                <Input
                  value={area.description}
                  onChange={(e) => updatePracticeArea(area.id, "description", e.target.value)}
                  placeholder="Description"
                />
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removePracticeArea(area.id)}>
                <FiTrash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      )}

      {/* Experience */}
      {activeStep.id === "experience" && (
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Selected work & experience</CardTitle>
              <CardDescription>Representative engagements</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addExperience} className="gap-1">
              <FiPlus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {experience.map((exp) => (
            <div key={exp.id} className="flex gap-2 items-start p-3 rounded-lg border border-slate-100">
              <div className="flex-1 grid gap-2 sm:grid-cols-2">
                <Input
                  value={exp.title}
                  onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                  placeholder="Title"
                />
                <div className="flex gap-2">
                  <Input
                    value={exp.category}
                    onChange={(e) => updateExperience(exp.id, "category", e.target.value)}
                    placeholder="Category"
                  />
                  <Input
                    value={exp.year}
                    onChange={(e) => updateExperience(exp.id, "year", e.target.value)}
                    placeholder="Year"
                  />
                </div>
                <Input
                  value={exp.summary}
                  onChange={(e) => updateExperience(exp.id, "summary", e.target.value)}
                  placeholder="Summary"
                  className="sm:col-span-2"
                />
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeExperience(exp.id)}>
                <FiTrash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      )}

      {/* Projects — optional professional projects */}
      {activeStep.id === "projects" && (
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Case studies and projects (all fields optional)</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addProject} className="gap-1">
              <FiPlus className="w-4 h-4" />
              Add project
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.map((proj) => (
            <div key={proj.id} className="flex gap-2 items-start p-4 rounded-lg border border-slate-200 space-y-3">
              <div className="flex-1 grid gap-3 sm:grid-cols-2">
                <Input value={proj.title} onChange={(e) => updateProject(proj.id, "title", e.target.value)} placeholder="Project title" />
                <Input value={proj.client} onChange={(e) => updateProject(proj.id, "client", e.target.value)} placeholder="Client (optional)" />
                <Input value={proj.year} onChange={(e) => updateProject(proj.id, "year", e.target.value)} placeholder="Year" />
                <Input value={proj.role} onChange={(e) => updateProject(proj.id, "role", e.target.value)} placeholder="Your role" />
                <Input value={proj.url} onChange={(e) => updateProject(proj.id, "url", e.target.value)} placeholder="Project URL (optional)" className="sm:col-span-2" />
                <Input value={proj.imageUrl} onChange={(e) => updateProject(proj.id, "imageUrl", e.target.value)} placeholder="Image URL (optional)" className="sm:col-span-2" />
                <Textarea value={proj.description} onChange={(e) => updateProject(proj.id, "description", e.target.value)} placeholder="Description (optional)" rows={2} className="sm:col-span-2 resize-none" />
                <Input value={proj.technologies} onChange={(e) => updateProject(proj.id, "technologies", e.target.value)} placeholder="Technologies / stack (optional)" />
                <Input value={proj.deliverables} onChange={(e) => updateProject(proj.id, "deliverables", e.target.value)} placeholder="Deliverables (optional)" />
                <Input value={proj.outcome} onChange={(e) => updateProject(proj.id, "outcome", e.target.value)} placeholder="Outcome (optional)" className="sm:col-span-2" />
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeProject(proj.id)}>
                <FiTrash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      )}

      {/* Testimonials */}
      {activeStep.id === "testimonials" && (
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Testimonials</CardTitle>
              <CardDescription>What clients say</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addTestimonial} className="gap-1">
              <FiPlus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {testimonials.map((t) => (
            <div key={t.id} className="flex gap-2 items-start p-3 rounded-lg border border-slate-100">
              <div className="flex-1 space-y-2">
                <Textarea
                  value={t.quote}
                  onChange={(e) => updateTestimonial(t.id, "quote", e.target.value)}
                  placeholder="Quote"
                  rows={2}
                  className="resize-none"
                />
                <div className="grid sm:grid-cols-2 gap-2">
                  <Input
                    value={t.author}
                    onChange={(e) => updateTestimonial(t.id, "author", e.target.value)}
                    placeholder="Author"
                  />
                  <Input
                    value={t.role}
                    onChange={(e) => updateTestimonial(t.id, "role", e.target.value)}
                    placeholder="Role"
                  />
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeTestimonial(t.id)}>
                <FiTrash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      )}

      {/* Contact */}
      {activeStep.id === "contact" && (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>Address, phone, email, WhatsApp, website and map</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={businessInfo.address}
              onChange={(e) => updateBusinessInfo("address", e.target.value)}
              placeholder="Full address"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={businessInfo.phone}
                onChange={(e) => updateBusinessInfo("phone", e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input
                value={businessInfo.whatsapp}
                onChange={(e) => updateBusinessInfo("whatsapp", e.target.value)}
                placeholder="+919876543210"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={businessInfo.email}
                disabled
              />
              <p className="text-xs text-slate-500">Email is linked to your account and can’t be changed here.</p>
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={businessInfo.website}
                onChange={(e) => updateBusinessInfo("website", e.target.value)}
                placeholder="www.example.com"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Instagram (optional)</Label>
              <Input
                value={businessInfo.socialMedia?.instagram || ""}
                onChange={(e) => updateSocial("instagram", e.target.value)}
                placeholder="https://instagram.com/yourhandle"
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn (optional)</Label>
              <Input
                value={businessInfo.socialMedia?.linkedin || ""}
                onChange={(e) => updateSocial("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Facebook (optional)</Label>
              <Input
                value={businessInfo.socialMedia?.facebook || ""}
                onChange={(e) => updateSocial("facebook", e.target.value)}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div className="space-y-2">
              <Label>Twitter / X (optional)</Label>
              <Input
                value={businessInfo.socialMedia?.twitter || ""}
                onChange={(e) => updateSocial("twitter", e.target.value)}
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Map search query</Label>
            <Input
              value={businessInfo.mapQuery}
              onChange={(e) => updateBusinessInfo("mapQuery", e.target.value)}
              placeholder="Address or place name for Google Maps"
            />
          </div>
          <div className="space-y-2">
            <Label>Map embed URL (optional)</Label>
            <Input
              value={businessInfo.mapEmbedUrl || ""}
              onChange={(e) => updateBusinessInfo("mapEmbedUrl", e.target.value || null)}
              placeholder="OpenStreetMap or Google Maps embed URL"
            />
          </div>
        </CardContent>
      </Card>
      )}

      {/* Portfolio Gallery */}
      {activeStep.id === "gallery" && (
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Portfolio gallery ({galleryImages.length} / 10)</CardTitle>
              <CardDescription>Upload up to 10 images (auto-compressed to max 500KB each)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select images to upload</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              disabled={uploadingGallery || galleryImages.length >= 10}
              onChange={(e) => handleGalleryUpload(e.target.files)}
            />
            {uploadingGallery && (
              <p className="text-xs text-orange-600">Uploading and compressing images...</p>
            )}
          </div>
          {galleryImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {galleryImages.map((url, index) => (
                <div key={url + index} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                  <img src={url} alt="" className="w-full h-24 object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(index)}
                    className="absolute top-1 right-1 bg-white/80 rounded-full p-1 shadow-sm hover:bg-white transition-colors"
                  >
                    <FiTrash2 className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {galleryImages.length === 0 && (
            <p className="text-sm text-slate-500">No images uploaded yet. Add portfolio images to showcase your work.</p>
          )}
        </CardContent>
      </Card>
      )}

      {/* CV / Resume */}
      {activeStep.id === "resume" && (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>CV / Resume (optional)</CardTitle>
          <CardDescription>
            Upload or link your CV / resume. A "Download CV" button will appear in the portfolio header.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-2">
            <Label>Upload CV / Resume (PDF or Word)</Label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="text-xs"
              disabled={uploadingResume}
              onChange={(e) => handleResumeUpload(e.target.files?.[0] || null)}
            />
            {uploadingResume && (
              <p className="text-xs text-orange-600">Uploading CV / Resume...</p>
            )}
          </div>
          <div className="space-y-1 pt-1">
            <Label className="text-xs text-slate-500">Or paste CV / Resume URL</Label>
            <Input
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://.../your-resume.pdf"
            />
          </div>
          {resumeUrl && (
            <p className="text-xs text-green-600 mt-1">✓ CV / Resume set: {resumeUrl.slice(0, 60)}...</p>
          )}
        </CardContent>
      </Card>
      )}

      {/* Theme */}
      {activeStep.id === "theme" && (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Select an accent theme for your portfolio page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
            { id: "orange", label: "Orange", cls: "from-orange-500 to-orange-600" },
            { id: "blue", label: "Blue", cls: "from-blue-500 to-blue-600" },
            { id: "emerald", label: "Emerald", cls: "from-emerald-500 to-emerald-600" },
            { id: "slate", label: "Slate", cls: "from-slate-700 to-slate-900" },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`relative rounded-xl border p-3 text-left transition-all ${
                theme === opt.id ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className={`h-10 rounded-lg bg-gradient-to-r ${opt.cls}`} />
              <div className="mt-2 text-sm font-semibold text-slate-900">{opt.label}</div>
              {theme === opt.id && (
                <div className="absolute top-2 right-2 text-xs font-bold text-slate-900">Selected</div>
              )}
            </button>
          ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Quick action buttons</p>
                <p className="text-xs text-slate-500">Show floating Call / Email / WhatsApp buttons</p>
              </div>
              <Switch checked={showQuickActions} onCheckedChange={setShowQuickActions} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Social links</p>
                <p className="text-xs text-slate-500">Show website/social icons in footer</p>
              </div>
              <Switch checked={showSocialLinks} onCheckedChange={setShowSocialLinks} />
            </div>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}

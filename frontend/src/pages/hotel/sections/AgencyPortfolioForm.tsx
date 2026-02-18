/**
 * Professional step-by-step form for Agencies & Studios.
 * Collects data as per ScanBit Demo — Agency & Studio: business info, social links, what we do, featured projects, gallery.
 */
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MdBusiness, MdWork, MdPhotoLibrary, MdAdd, MdDelete, MdArrowBack, MdArrowForward, MdUpload, MdImage } from "react-icons/md";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { safeImageSrc } from "@/lib/imageUtils";
import { compressImageToMaxSize } from "@/lib/compressImage";
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

const MAX_IMAGE_BYTES = 500 * 1024; // 500KB for hero, project & gallery
const MAX_GALLERY_ITEMS = 10;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_INPUT_FILE_SIZE = 25 * 1024 * 1024; // 25MB - warn above this

const STEPS = [
  { id: 1, title: "Studio & contact", description: "Name, tagline, contact, logo, map, social links", icon: MdBusiness },
  { id: 2, title: "Featured projects", description: "Showcase your best work", icon: MdWork },
  { id: 3, title: "Gallery", description: "Portfolio images with titles", icon: MdPhotoLibrary },
] as const;

type AgencyProjectForm = { id: string; title: string; tag: string; result: string; imageUrl: string };
type AgencyGalleryItemForm = { id: string; imageUrl: string; title: string; category: string };

interface AgencyPortfolioFormProps {
  restaurant?: any;
  onRefresh?: () => void;
}

export default function AgencyPortfolioForm({ restaurant, onRefresh }: AgencyPortfolioFormProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [studio, setStudio] = useState({
    name: "",
    tagline: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    heroImageUrl: "",
    heroBackgroundUrl: "",
    logoUrl: "",
    mapEmbedUrl: "",
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
  });
  const [whatWeDo, setWhatWeDo] = useState<string[]>([]);
  const [whatWeDoInput, setWhatWeDoInput] = useState("");
  const [projects, setProjects] = useState<AgencyProjectForm[]>([]);
  const [gallery, setGallery] = useState<AgencyGalleryItemForm[]>([]);
  const projectFileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const galleryFileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const heroBgInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingProjectId, setUploadingProjectId] = useState<string | null>(null);
  const [deleteImageProjectId, setDeleteImageProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurant) {
      setLoading(false);
      return;
    }
    const soc = restaurant?.socialMedia && typeof restaurant.socialMedia === "object" ? restaurant.socialMedia : {};
    const loc = restaurant?.location && typeof restaurant.location === "object" ? restaurant.location : {};
    const addr = loc?.address || (typeof restaurant?.address === "string" ? restaurant.address : "") || "";
    setStudio({
      name: restaurant?.businessName ?? restaurant?.name ?? "",
      tagline: restaurant?.tagline ?? "",
      address: addr,
      phone: restaurant?.phone ?? "",
      email: restaurant?.email ?? "",
      website: soc?.website ?? "",
      heroImageUrl: restaurant?.agencyHeroImageUrl ?? restaurant?.logo ?? "",
      heroBackgroundUrl: restaurant?.agencyHeroBackgroundUrl ?? "",
      logoUrl: restaurant?.logo ?? "",
      mapEmbedUrl: restaurant?.portfolioMapEmbedUrl ?? "",
      facebook: soc?.facebook ?? "",
      instagram: soc?.instagram ?? "",
      twitter: soc?.twitter ?? "",
      linkedin: soc?.linkedin ?? "",
    });
    setWhatWeDo(Array.isArray(restaurant?.agencyServices) ? restaurant.agencyServices.filter(Boolean) : []);
    const proj = Array.isArray(restaurant?.portfolioProjects) ? restaurant.portfolioProjects : [];
    setProjects(
      proj.map((p: any, i: number) => ({
        id: p.id || p._id || `p-${i}`,
        title: p.title ?? "",
        tag: p.role ?? p.tag ?? "",
        result: p.outcome ?? p.result ?? "",
        imageUrl: p.imageUrl ?? "",
      }))
    );
    const gal = Array.isArray(restaurant?.agencyGallery) ? restaurant.agencyGallery.slice(0, MAX_GALLERY_ITEMS) : [];
    setGallery(
      gal.map((g: any, i: number) => ({
        id: g.id || `g-${i}`,
        imageUrl: typeof g === "string" ? g : (g.imageUrl ?? ""),
        title: typeof g === "string" ? "" : (g.title ?? ""),
        category: typeof g === "string" ? "" : (g.category ?? ""),
      }))
    );
    setLoading(false);
  }, [restaurant]);

  const saveStep = async () => {
    const id = restaurant?._id || restaurant?.id;
    if (!id) {
      toast.error("Business not found");
      return;
    }
    setSaving(true);
    try {
      if (step === 1) {
        await api.updateRestaurant(id, {
          businessName: studio.name,
          name: studio.name,
          tagline: studio.tagline,
          email: studio.email,
          phone: studio.phone,
          logo: studio.logoUrl || restaurant?.logo || null,
          agencyHeroImageUrl: studio.heroImageUrl || null,
          agencyHeroBackgroundUrl: studio.heroBackgroundUrl || null,
          portfolioMapEmbedUrl: studio.mapEmbedUrl || null,
          socialMedia: {
            ...(restaurant?.socialMedia || {}),
            website: studio.website,
            facebook: studio.facebook || undefined,
            instagram: studio.instagram || undefined,
            twitter: studio.twitter || undefined,
            linkedin: studio.linkedin || undefined,
          },
          location: { ...(restaurant?.location || {}), address: studio.address },
          agencyServices: whatWeDo.filter(Boolean),
        });
        toast.success("Studio info saved");
      } else if (step === 2) {
        const payload = projects.map((p) => ({
          id: p.id,
          title: p.title,
          role: p.tag,
          outcome: p.result,
          imageUrl: p.imageUrl || undefined,
        }));
        await api.updateRestaurant(id, { portfolioProjects: payload });
        toast.success("Featured projects saved");
      } else if (step === 3) {
        const payload = gallery.map((g) => ({
          id: g.id,
          imageUrl: g.imageUrl,
          title: g.title,
          category: g.category,
        }));
        await api.updateRestaurant(id, { agencyGallery: payload });
        toast.success("Gallery saved");
      }
      onRefresh?.();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addProject = () => {
    setProjects((prev) => [...prev, { id: `p-${Date.now()}`, title: "", tag: "", result: "", imageUrl: "" }]);
  };
  const removeProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };
  const updateProject = (id: string, field: keyof AgencyProjectForm, value: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const addGalleryItem = () => {
    if (gallery.length >= MAX_GALLERY_ITEMS) {
      toast.error(`Maximum ${MAX_GALLERY_ITEMS} gallery images allowed.`);
      return;
    }
    setGallery((prev) => [...prev, { id: `g-${Date.now()}`, imageUrl: "", title: "", category: "" }]);
  };
  const removeGalleryItem = (id: string) => {
    setGallery((prev) => prev.filter((g) => g.id !== id));
  };
  const updateGalleryItem = (id: string, field: keyof AgencyGalleryItemForm, value: string) => {
    setGallery((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  const addWhatWeDo = () => {
    const v = whatWeDoInput.trim();
    if (v && !whatWeDo.includes(v)) {
      setWhatWeDo((prev) => [...prev, v]);
      setWhatWeDoInput("");
    }
  };
  const removeWhatWeDo = (item: string) => {
    setWhatWeDo((prev) => prev.filter((x) => x !== item));
  };

  const handleHeroBackgroundUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, WebP).");
      return;
    }
    try {
      const compressed = file.size > MAX_IMAGE_BYTES ? await compressImageToMaxSize(file, MAX_IMAGE_BYTES) : file;
      const url = await api.uploadImage(compressed, "scanbit-agency-hero");
      setStudio((s) => ({ ...s, heroBackgroundUrl: url }));
      toast.success("Background image uploaded");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    }
  };

  const handleProjectImageSelect = async (projectId: string, file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please select a valid image: JPG, PNG, or WebP only.");
      return;
    }
    if (file.size > MAX_INPUT_FILE_SIZE) {
      toast.error("File is too large. Please choose an image under 25MB (it will be compressed to 500KB).");
      return;
    }
    setUploadingProjectId(projectId);
    try {
      const compressed = file.size > MAX_IMAGE_BYTES ? await compressImageToMaxSize(file, MAX_IMAGE_BYTES) : file;
      const url = await api.uploadImage(compressed, "scanbit-agency");
      updateProject(projectId, "imageUrl", url);
      toast.success("Image uploaded (auto-compressed to max 500KB)");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setUploadingProjectId(null);
    }
  };

  const confirmRemoveProjectImage = (projectId: string) => setDeleteImageProjectId(projectId);
  const handleRemoveProjectImage = () => {
    if (deleteImageProjectId) {
      updateProject(deleteImageProjectId, "imageUrl", "");
      setDeleteImageProjectId(null);
      toast.success("Image removed");
    }
  };

  const handleGalleryImageSelect = async (galleryId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, WebP).");
      return;
    }
    try {
      const compressed = file.size > MAX_IMAGE_BYTES ? await compressImageToMaxSize(file, MAX_IMAGE_BYTES) : file;
      const url = await api.uploadImage(compressed, "scanbit-agency-gallery");
      updateGalleryItem(galleryId, "imageUrl", url);
      toast.success("Image uploaded (auto-compressed to max 500KB)");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-b border-slate-200 pb-4">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-left transition-colors ${
              step === s.id ? "bg-orange-100 text-orange-800 font-semibold" : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            <s.icon className="w-5 h-5 shrink-0" />
            <div>
              <span className="block text-sm font-medium">{s.title}</span>
              <span className="block text-xs opacity-80">{s.description}</span>
            </div>
          </button>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Studio & contact</CardTitle>
            <CardDescription>This appears on your public portfolio. Add a hero image and map link for a professional look.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Studio / Agency name</Label>
              <Input value={studio.name} onChange={(e) => setStudio((s) => ({ ...s, name: e.target.value }))} placeholder="e.g. Studio Nova" />
            </div>
            <div className="grid gap-2">
              <Label>Tagline</Label>
              <Input value={studio.tagline} onChange={(e) => setStudio((s) => ({ ...s, tagline: e.target.value }))} placeholder="e.g. Brand, digital & campaign studio" />
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Textarea value={studio.address} onChange={(e) => setStudio((s) => ({ ...s, address: e.target.value }))} placeholder="Full address" rows={2} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input type="tel" value={studio.phone} onChange={(e) => setStudio((s) => ({ ...s, phone: e.target.value }))} placeholder="+91 98765 43210" />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" value={studio.email} onChange={(e) => setStudio((s) => ({ ...s, email: e.target.value }))} placeholder="hello@studio.in" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Website</Label>
              <Input value={studio.website} onChange={(e) => setStudio((s) => ({ ...s, website: e.target.value }))} placeholder="www.studionova.in" />
            </div>
            <div className="grid gap-2">
              <Label>Logo URL (navbar & footer)</Label>
              <Input value={studio.logoUrl} onChange={(e) => setStudio((s) => ({ ...s, logoUrl: e.target.value }))} placeholder="https://... or upload in Profile" />
              {studio.logoUrl && (
                <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                  <img src={safeImageSrc(studio.logoUrl)} alt="Logo" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Hero image (logo / avatar in section)</Label>
              <Input value={studio.heroImageUrl} onChange={(e) => setStudio((s) => ({ ...s, heroImageUrl: e.target.value }))} placeholder="URL or leave blank to use logo" />
              {studio.heroImageUrl && (
                <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-slate-200">
                  <img src={safeImageSrc(studio.heroImageUrl)} alt="Hero" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Hero background image (first section)</Label>
              <div className="flex flex-wrap gap-2 items-center">
                <Input value={studio.heroBackgroundUrl} onChange={(e) => setStudio((s) => ({ ...s, heroBackgroundUrl: e.target.value }))} placeholder="URL or leave blank for default light orange" className="flex-1 min-w-[200px]" />
                <input
                  ref={heroBgInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleHeroBackgroundUpload(f);
                    e.target.value = "";
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => heroBgInputRef.current?.click()}>
                  <MdUpload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Any size; auto-compressed to max 500KB. Leave blank for default light orange.</p>
              {studio.heroBackgroundUrl && (
                <div className="mt-2 w-full max-w-xs h-24 rounded-lg overflow-hidden border border-slate-200">
                  <img src={safeImageSrc(studio.heroBackgroundUrl)} alt="Background" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Map embed URL</Label>
              <Input value={studio.mapEmbedUrl} onChange={(e) => setStudio((s) => ({ ...s, mapEmbedUrl: e.target.value }))} placeholder="Paste OpenStreetMap or Google Maps iframe embed URL" />
              <p className="text-xs text-muted-foreground">e.g. from Google Maps: Share → Embed map → copy src URL</p>
            </div>
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <Label>Social media links (shown in footer)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input value={studio.facebook} onChange={(e) => setStudio((s) => ({ ...s, facebook: e.target.value }))} placeholder="Facebook URL" />
                <Input value={studio.instagram} onChange={(e) => setStudio((s) => ({ ...s, instagram: e.target.value }))} placeholder="Instagram URL" />
                <Input value={studio.twitter} onChange={(e) => setStudio((s) => ({ ...s, twitter: e.target.value }))} placeholder="Twitter / X URL" />
                <Input value={studio.linkedin} onChange={(e) => setStudio((s) => ({ ...s, linkedin: e.target.value }))} placeholder="LinkedIn URL" />
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <Label>What we do (services / tags)</Label>
              <p className="text-xs text-muted-foreground">These appear as tags in the &quot;What we do&quot; section. Add one at a time.</p>
              <div className="flex flex-wrap gap-2">
                {whatWeDo.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    {item}
                    <button type="button" onClick={() => removeWhatWeDo(item)} className="hover:bg-primary/20 rounded-full p-0.5" aria-label="Remove">
                      <MdDelete className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={whatWeDoInput} onChange={(e) => setWhatWeDoInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addWhatWeDo())} placeholder="e.g. Branding, Digital" />
                <Button type="button" variant="outline" onClick={addWhatWeDo}>Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Featured projects</CardTitle>
            <CardDescription>Add projects with title, category tag, and result. These appear in the &quot;Featured work&quot; section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map((p) => (
              <Card key={p.id} className="p-4 border border-slate-200">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="text-sm font-medium text-slate-500">Project</span>
                  <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => removeProject(p.id)}>
                    <MdDelete className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid gap-3">
                  <Input placeholder="Title (e.g. Brand Refresh — TechCorp)" value={p.title} onChange={(e) => updateProject(p.id, "title", e.target.value)} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input placeholder="Tag (e.g. Branding)" value={p.tag} onChange={(e) => updateProject(p.id, "tag", e.target.value)} />
                    <Input placeholder="Result (e.g. +40% engagement)" value={p.result} onChange={(e) => updateProject(p.id, "result", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Project image (any size; auto-compressed to max 500KB)</Label>
                    <input
                      ref={(el) => { projectFileRefs.current[p.id] = el; }}
                      type="file"
                      accept={ALLOWED_IMAGE_TYPES.join(",")}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleProjectImageSelect(p.id, f);
                        e.target.value = "";
                      }}
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingProjectId === p.id}
                        onClick={() => projectFileRefs.current[p.id]?.click()}
                      >
                        {uploadingProjectId === p.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading…
                          </>
                        ) : (
                          <>
                            <MdImage className="w-4 h-4 mr-2" />
                            Upload image
                          </>
                        )}
                      </Button>
                      <span className="text-xs text-muted-foreground">or paste URL below</span>
                    </div>
                    <Input placeholder="Or image URL" value={p.imageUrl} onChange={(e) => updateProject(p.id, "imageUrl", e.target.value)} disabled={!!uploadingProjectId} />
                    {p.imageUrl && (
                      <div className="space-y-2">
                        <div className="w-full max-w-md rounded-lg border border-slate-200 overflow-hidden bg-muted/30 flex items-center justify-center min-h-[120px] max-h-[280px]">
                          <img src={safeImageSrc(p.imageUrl)} alt="" className="max-w-full max-h-[260px] w-auto h-auto object-contain" />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => confirmRemoveProjectImage(p.id)}
                        >
                          <MdDelete className="w-4 h-4 mr-2" />
                          Remove image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={addProject} className="w-full border-dashed">
              <MdAdd className="w-4 h-4 mr-2" />
              Add project
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteImageProjectId} onOpenChange={(open) => !open && setDeleteImageProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove project image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the image from this project. You can upload a new image or add a URL anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveProjectImage} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove image
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Gallery</CardTitle>
            <CardDescription>Add up to {MAX_GALLERY_ITEMS} portfolio images. Any size; auto-compressed to max 500KB each.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {gallery.map((g) => (
              <Card key={g.id} className="p-4 border border-slate-200">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="text-sm font-medium text-slate-500">Image</span>
                  <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => removeGalleryItem(g.id)}>
                    <MdDelete className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid gap-3">
                  <input
                    ref={(el) => { galleryFileRefs.current[g.id] = el; }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleGalleryImageSelect(g.id, f);
                      e.target.value = "";
                    }}
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button type="button" variant="outline" size="sm" onClick={() => galleryFileRefs.current[g.id]?.click()}>
                      <MdImage className="w-4 h-4 mr-2" />
                      Upload image
                    </Button>
                    <span className="text-xs text-muted-foreground">or paste URL below</span>
                  </div>
                  <Input placeholder="Or image URL" value={g.imageUrl} onChange={(e) => updateGalleryItem(g.id, "imageUrl", e.target.value)} />
                  {g.imageUrl && (
                    <div className="w-full max-w-[200px] aspect-[4/3] rounded-lg overflow-hidden border border-slate-200">
                      <img src={safeImageSrc(g.imageUrl)} alt={g.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <Input placeholder="Title" value={g.title} onChange={(e) => updateGalleryItem(g.id, "title", e.target.value)} />
                  <Input placeholder="Category (e.g. Branding, Digital)" value={g.category} onChange={(e) => updateGalleryItem(g.id, "category", e.target.value)} />
                </div>
              </Card>
            ))}
            {gallery.length < MAX_GALLERY_ITEMS && (
              <Button type="button" variant="outline" onClick={addGalleryItem} className="w-full border-dashed">
                <MdAdd className="w-4 h-4 mr-2" />
                Add gallery item ({gallery.length}/{MAX_GALLERY_ITEMS})
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 justify-between">
        <div>
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              <MdArrowBack className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button onClick={saveStep} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MdUpload className="w-4 h-4 mr-2" />}
            Save {STEPS.find((s) => s.id === step)?.title}
          </Button>
          {step < 3 && (
            <Button onClick={() => setStep((s) => s + 1)}>
              Next: {STEPS.find((s) => s.id === step + 1)?.title}
              <MdArrowForward className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

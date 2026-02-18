import { useState, useEffect, useRef } from "react";
import {
  MdBusiness,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdSchedule,
  MdImage,
  MdCreditCard,
  MdMap,
  MdMyLocation,
  MdSave,
  MdUpload,
  MdPhoneInTalk,
  MdShare,
} from "react-icons/md";
import { FiMapPin, FiGlobe, FiMessageCircle, FiMessageSquare } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { safeImageSrc } from "@/lib/imageUtils";
import LeafletMap from "@/components/LeafletMap";
import { getBusinessConfig } from "./menu";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS: Record<(typeof DAYS)[number], string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

type DayKey = (typeof DAYS)[number];
type DaySchedule = { open: string; close: string; closed: boolean };

const DEFAULT_DAY: DaySchedule = { open: "09:00", close: "18:00", closed: false };

function buildTimeOptions(): { value: string; label: string }[] {
  const opts: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 15, 30, 45]) {
      const v = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const hour12 = h % 12 || 12;
      const ampm = h < 12 ? "AM" : "PM";
      const label = `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
      opts.push({ value: v, label });
    }
  }
  return opts;
}

function formatTime24to12(v: string): string {
  if (!v) return "—";
  const [h, m] = v.split(":").map(Number);
  const hour12 = h % 12 || 12;
  const ampm = h < 12 ? "AM" : "PM";
  return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function scheduleToOpeningHoursString(schedule: Record<DayKey, DaySchedule>): string {
  const parts: string[] = [];
  let i = 0;
  while (i < DAYS.length) {
    const d = DAYS[i];
    const s = schedule[d];
    if (!s || s.closed) {
      i++;
      continue;
    }
    const open = formatTime24to12(s.open);
    const close = formatTime24to12(s.close);
    let j = i + 1;
    while (j < DAYS.length) {
      const n = DAYS[j];
      const t = schedule[n];
      if (!t || t.closed || t.open !== s.open || t.close !== s.close) break;
      j++;
    }
    const dayRange =
      j - i === 1 ? DAY_LABELS[DAYS[i]] : `${DAY_LABELS[DAYS[i]].slice(0, 3)}–${DAY_LABELS[DAYS[j - 1]].slice(0, 3)}`;
    parts.push(`${dayRange} ${open} – ${close}`);
    i = j;
  }
  const closed: string[] = [];
  DAYS.forEach((d) => {
    const s = schedule[d];
    if (s?.closed) closed.push(DAY_LABELS[d].slice(0, 3));
  });
  if (closed.length) parts.push(`${closed.join(", ")} closed`);
  return parts.length ? parts.join("; ") : "";
}

interface BusinessInformationProps {
  restaurant?: any;
  onRefresh?: () => void;
}

const TIME_OPTIONS = buildTimeOptions();

function parseSchedule(raw: any): Record<DayKey, DaySchedule> {
  const out = {} as Record<DayKey, DaySchedule>;
  DAYS.forEach((d) => {
    const s = raw?.[d];
    if (s && typeof s === "object" && "closed" in s) {
      const closed = !!s.closed;
      out[d] = {
        open: closed ? "" : (s.open && typeof s.open === "string" ? s.open : DEFAULT_DAY.open),
        close: closed ? "" : (s.close && typeof s.close === "string" ? s.close : DEFAULT_DAY.close),
        closed,
      };
    } else {
      out[d] = { ...DEFAULT_DAY };
    }
  });
  return out;
}

export default function BusinessInformation({ restaurant, onRefresh }: BusinessInformationProps) {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<"logo" | "cardFront" | "cardBack" | null>(null);
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    profile: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    website: "",
    lat: "" as string | number,
    lng: "" as string | number,
  });
  const [schedule, setSchedule] = useState<Record<DayKey, DaySchedule>>(() => {
    const out = {} as Record<DayKey, DaySchedule>;
    DAYS.forEach((d) => (out[d] = { ...DEFAULT_DAY }));
    return out;
  });
  const [logo, setLogo] = useState<string | null>(null);
  const [businessCardFront, setBusinessCardFront] = useState<string | null>(null);
  const [businessCardBack, setBusinessCardBack] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showSocialLinks, setShowSocialLinks] = useState(true);
  const [showWhatsAppButton, setShowWhatsAppButton] = useState(true);

  // Determine business type for display options
  const categoryStr = (restaurant?.businessCategory || restaurant?.businessType || "").toLowerCase();
  const isPortfolioType =
    categoryStr.includes("portfolio") ||
    categoryStr.includes("professional") ||
    categoryStr.includes("creative") ||
    categoryStr.includes("design") ||
    categoryStr.includes("consult") ||
    categoryStr.includes("legal");
  const isCreativeDesign = categoryStr.includes("creative") || categoryStr.includes("design");
  const [savingDisplayOpts, setSavingDisplayOpts] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const cardFrontRef = useRef<HTMLInputElement>(null);
  const cardBackRef = useRef<HTMLInputElement>(null);
  const lastLoadedRef = useRef<any>(null);

  const applyDataToState = (r: any) => {
    lastLoadedRef.current = r;
    if (!r) return;
    const loc = r.location && typeof r.location === "object" ? r.location : {};
    const soc = r.socialMedia && typeof r.socialMedia === "object" ? r.socialMedia : {};
    const name = r.businessName ?? r.name ?? "";
    const addr =
      loc.address ||
      (typeof r.address === "string" ? r.address : null) ||
      (r.address && typeof r.address === "object"
        ? [r.address.street, r.address.city, r.address.state, r.address.zipCode].filter(Boolean).join(", ")
        : "") ||
      "";
    setForm({
      name,
      tagline: r.tagline || "",
      profile: r.profile || "",
      email: r.email || "",
      phone: r.phone || "",
      whatsapp: r.whatsapp || "",
      address: addr,
      website: soc.website || "",
      lat: loc.lat ?? "",
      lng: loc.lng ?? "",
    });
    setSchedule(parseSchedule(r.openingHoursSchedule));
    setLogo(r.logo || null);
    setBusinessCardFront(r.businessCardFront || r.businessCard || null);
    setBusinessCardBack(r.businessCardBack || null);
    if (typeof loc.lat === "number" && typeof loc.lng === "number") {
      setLocation({ lat: loc.lat, lng: loc.lng });
    } else {
      setLocation(null);
    }
    setShowQuickActions(r.showQuickActions !== false);
    setShowSocialLinks(r.showSocialLinks !== false);
    // Check showWhatsAppButton - explicitly handle true/false, default to true if undefined
    setShowWhatsAppButton(r.showWhatsAppButton !== undefined ? r.showWhatsAppButton : true);
  };

  const handleDisplayOptionChange = async (key: 'showQuickActions' | 'showSocialLinks' | 'showWhatsAppButton', value: boolean) => {
    // Optimistically update UI
    if (key === 'showQuickActions') setShowQuickActions(value);
    else if (key === 'showSocialLinks') setShowSocialLinks(value);
    else setShowWhatsAppButton(value);
    
    try {
      setSavingDisplayOpts(true);
      const restRes = await api.getMyRestaurant();
      if (restRes?.success && restRes?.data) {
        // Update with explicit boolean value
        const updatePayload = { [key]: value === true };
        const updateRes = await api.updateRestaurant(restRes.data._id || restRes.data.id, updatePayload);
        
        if (updateRes?.success) {
          // Refresh restaurant data to get updated value
          const refreshedRes = await api.getMyRestaurant();
          if (refreshedRes?.success && refreshedRes?.data) {
            // Update state with fresh data from server
            if (key === 'showQuickActions') setShowQuickActions(refreshedRes.data.showQuickActions !== false);
            else if (key === 'showSocialLinks') setShowSocialLinks(refreshedRes.data.showSocialLinks !== false);
            else setShowWhatsAppButton(refreshedRes.data.showWhatsAppButton !== undefined ? refreshedRes.data.showWhatsAppButton : true);
          }
          
          const config = getBusinessConfig(restRes.data.businessCategory, restRes.data.businessType);
          const displayLabel = config.pageTitle === 'Menu Management' ? 'Menu' : 
                             config.pageTitle === 'Product Catalog' ? 'Catalog' :
                             config.pageTitle === 'Portfolio' || config.pageTitle === 'Agency Portfolio' ? 'Portfolio' : 'Display';
          toast.success(`${displayLabel} display updated`);
          onRefresh?.();
        } else {
          throw new Error('Update failed');
        }
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update');
      // Revert optimistic update on error
      if (key === 'showQuickActions') setShowQuickActions(!value);
      else if (key === 'showSocialLinks') setShowSocialLinks(!value);
      else setShowWhatsAppButton(!value);
    } finally {
      setSavingDisplayOpts(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.getBusinessInformation();
        if (res?.success && res?.data) {
          applyDataToState(res.data);
        } else {
          if (restaurant) applyDataToState(restaurant);
        }
        if (restaurant) {
          setShowQuickActions(restaurant.showQuickActions !== false);
          setShowSocialLinks(restaurant.showSocialLinks !== false);
          setShowWhatsAppButton(restaurant.showWhatsAppButton !== undefined ? restaurant.showWhatsAppButton : true);
        }
      } catch {
        if (restaurant) {
          applyDataToState(restaurant);
          setShowQuickActions(restaurant.showQuickActions !== false);
          setShowSocialLinks(restaurant.showSocialLinks !== false);
          setShowWhatsAppButton(restaurant.showWhatsAppButton !== undefined ? restaurant.showWhatsAppButton : true);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [restaurant]);

  const updateDay = (day: DayKey, patch: Partial<DaySchedule>) => {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  };

  const applyToAllDays = () => {
    const first = schedule.mon;
    const template: DaySchedule = first.closed
      ? { open: "", close: "", closed: true }
      : { open: first.open, close: first.close, closed: false };
    const next = {} as Record<DayKey, DaySchedule>;
    DAYS.forEach((d) => (next[d] = { ...template }));
    setSchedule(next);
    toast.success("Applied Monday’s hours to all days.");
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    toast.loading("Getting your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setForm((f) => ({ ...f, lat: String(lat), lng: String(lng) }));
        setLocation({ lat, lng });
        toast.dismiss();
        toast.success("Location set.");
      },
      () => {
        toast.dismiss();
        toast.error("Could not get location. You can enter latitude and longitude manually.");
      }
    );
  };

  const handleUpload = async (file: File, type: "logo" | "cardFront" | "cardBack") => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    setUploading(type);
    try {
      const folder = type === "logo" ? "restaurant-logos" : "business-cards";
      const url = await api.uploadImage(file, folder);
      if (type === "logo") setLogo(url);
      else if (type === "cardFront") setBusinessCardFront(url);
      else setBusinessCardBack(url);
      toast.success("Image uploaded.");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed.");
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast.error("Business name is required.");
      return;
    }
    if (!form.email?.trim()) {
      toast.error("Email is required.");
      return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }
    const lat = typeof form.lat === "number" ? form.lat : parseFloat(String(form.lat).trim());
    const lng = typeof form.lng === "number" ? form.lng : parseFloat(String(form.lng).trim());
    const hasCoords = !Number.isNaN(lat) && !Number.isNaN(lng);

    const openingHoursSchedulePayload: Record<string, { open: string; close: string; closed: boolean }> = {};
    DAYS.forEach((d) => {
      const s = schedule[d];
      openingHoursSchedulePayload[d] = s.closed
        ? { open: "", close: "", closed: true }
        : { open: s.open || "09:00", close: s.close || "18:00", closed: false };
    });
    const openingHoursStr = scheduleToOpeningHoursString(schedule);

    const prev = lastLoadedRef.current;
    const prevSoc = (prev?.socialMedia && typeof prev?.socialMedia === "object") ? prev.socialMedia : {};
    const socialMediaBase = { ...prevSoc };
    (socialMediaBase as Record<string, string | null>).website = form.website.trim() || null;

    const locationPayload: Record<string, unknown> = {};
    if (hasCoords) {
      locationPayload.lat = lat;
      locationPayload.lng = lng;
    }
    locationPayload.address = form.address.trim() || null;

    const bizPayload = {
      businessName: form.name.trim(),
      tagline: form.tagline.trim() || null,
      profile: form.profile.trim() || null,
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      openingHours: openingHoursStr || null,
      openingHoursSchedule: openingHoursSchedulePayload,
      logo: logo || null,
      businessCardFront: businessCardFront || null,
      businessCardBack: businessCardBack || null,
      socialMedia: socialMediaBase,
      location: locationPayload,
    };

    const restaurantPayload = {
      name: form.name.trim(),
      tagline: form.tagline.trim() || null,
      profile: form.profile.trim() || null,
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      openingHours: openingHoursStr || null,
      openingHoursSchedule: openingHoursSchedulePayload,
      logo: logo || null,
      businessCardFront: businessCardFront || null,
      businessCardBack: businessCardBack || null,
      socialMedia: socialMediaBase,
      location: locationPayload,
    };

    setSaving(true);
    try {
      let res: { success?: boolean; data?: any } | null = null;
      try {
        res = (await api.updateBusinessInformation(bizPayload)) as { success?: boolean; data?: any };
      } catch {
        // 404: business-information API not deployed, fallback to Restaurant
        res = (await api.updateMyRestaurant(restaurantPayload)) as { success?: boolean; data?: any };
      }
      if (res?.success && res?.data) {
        applyDataToState(res.data);
        toast.success("Business information saved successfully.");
      } else {
        toast.error("Save completed but no data was returned. Please refresh to verify.");
      }
      onRefresh?.();
    } catch (e: any) {
      const msg = e?.message || e?.response?.data?.message || "Failed to save. Please check your connection and try again.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const parseCoord = (v: string | number) =>
    typeof v === "number" ? v : parseFloat(String(v).trim());
  const latNum = parseCoord(form.lat);
  const lngNum = parseCoord(form.lng);
  const hasMapCoords = !Number.isNaN(latNum) && !Number.isNaN(lngNum);
  const mapPosition = hasMapCoords
    ? { lat: latNum, lng: lngNum }
    : location;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading business information…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Business Information
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Manage your business profile, contact details, opening hours, and location.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <MdSave className="w-4 h-4" />}
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile & contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdBusiness className="w-5 h-5 text-primary" />
              Profile & contact
            </CardTitle>
            <CardDescription>Name, tagline, profile, and contact details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Business name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your business name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={form.tagline}
                  onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                  placeholder="e.g. Fresh • Local • Delicious"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile">Profile / description</Label>
              <Textarea
                id="profile"
                value={form.profile}
                onChange={(e) => setForm((f) => ({ ...f, profile: e.target.value }))}
                placeholder="Short description of your business"
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    readOnly
                    className="pl-10 bg-muted/50 cursor-not-allowed"
                    placeholder="hello@business.com"
                    disabled={true}
                    autoComplete="email"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed. Contact support if you need to update your email address.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 15) }))}
                    className="pl-10"
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp number</Label>
              <div className="relative">
                <FiMessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  value={form.whatsapp}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value.replace(/\D/g, "").slice(0, 15) }))}
                  className="pl-10"
                  placeholder="9876543210 (with country code if outside India)"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  className="pl-10"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opening hours & address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdSchedule className="w-5 h-5 text-primary" />
              Opening hours & address
            </CardTitle>
            <CardDescription>
              Set opening and closing times per day (shown on your menu/catalog). Your business address below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Label className="text-sm font-medium">Opening hours</Label>
                <Button type="button" variant="outline" size="sm" onClick={applyToAllDays} className="w-fit text-xs">
                  Apply Monday to all days
                </Button>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-medium text-muted-foreground border-b border-border bg-muted/50">
                  <div className="col-span-3 sm:col-span-2">Day</div>
                  <div className="col-span-2 text-center">Closed</div>
                  <div className="col-span-3 sm:col-span-4">Open</div>
                  <div className="col-span-3 sm:col-span-4">Close</div>
                </div>
                {DAYS.map((day) => {
                  const s = schedule[day];
                  return (
                    <div
                      key={day}
                      className="grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-border/60 last:border-b-0 even:bg-background/50"
                    >
                      <div className="col-span-3 sm:col-span-2 text-sm font-medium text-foreground">
                        {DAY_LABELS[day]}
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <Switch
                          checked={s.closed}
                          onCheckedChange={(checked) => updateDay(day, { closed: checked, open: "", close: "" })}
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-4">
                        <Select
                          value={s.closed ? "09:00" : (s.open || "09:00")}
                          onValueChange={(v) => updateDay(day, { open: v, closed: false })}
                          disabled={s.closed}
                        >
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Open" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3 sm:col-span-4">
                        <Select
                          value={s.closed ? "18:00" : (s.close || "18:00")}
                          onValueChange={(v) => updateDay(day, { close: v, closed: false })}
                          disabled={s.closed}
                        >
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Close" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                A summary of these hours is shown on your public menu. Times are stored in the database.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MdLocationOn className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="pl-10 resize-none"
                  rows={2}
                  placeholder="Street, city, state, ZIP"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  value={form.lat}
                  onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                  placeholder="e.g. 28.6139"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  value={form.lng}
                  onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                  placeholder="e.g. 77.2090"
                />
              </div>
            </div>
            <Button type="button" variant="outline" onClick={handleUseCurrentLocation} className="gap-2 w-full sm:w-auto">
              <MdMyLocation className="w-4 h-4" />
              Use current location
            </Button>
          </CardContent>
        </Card>

        {/* Logo & business card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdImage className="w-5 h-5 text-primary" />
              Logo & business card
            </CardTitle>
            <CardDescription>Upload logo and business card images (front/back).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {logo && (
                  <div className="w-24 h-24 rounded-xl border bg-muted flex-shrink-0 overflow-hidden">
                    <img src={safeImageSrc(logo)} alt="Logo" className="w-full h-full object-contain p-1" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Input
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f, "logo");
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoRef.current?.click()}
                    disabled={!!uploading}
                    className="gap-2"
                  >
                    {uploading === "logo" ? <Loader2 className="w-4 h-4 animate-spin" /> : <MdUpload className="w-4 h-4" />}
                    {logo ? "Change logo" : "Upload logo"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Business card (front)</Label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {businessCardFront && (
                  <div className="w-32 h-20 rounded-xl border bg-muted flex-shrink-0 overflow-hidden">
                    <img src={safeImageSrc(businessCardFront)} alt="Card front" className="w-full h-full object-contain p-1" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Input
                    ref={cardFrontRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f, "cardFront");
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => cardFrontRef.current?.click()}
                    disabled={!!uploading}
                    className="gap-2"
                  >
                    {uploading === "cardFront" ? <Loader2 className="w-4 h-4 animate-spin" /> : <MdCreditCard className="w-4 h-4" />}
                    {businessCardFront ? "Change front" : "Upload front"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Business card (back)</Label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {businessCardBack && (
                  <div className="w-32 h-20 rounded-xl border bg-muted flex-shrink-0 overflow-hidden">
                    <img src={safeImageSrc(businessCardBack)} alt="Card back" className="w-full h-full object-contain p-1" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Input
                    ref={cardBackRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f, "cardBack");
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => cardBackRef.current?.click()}
                    disabled={!!uploading}
                    className="gap-2"
                  >
                    {uploading === "cardBack" ? <Loader2 className="w-4 h-4 animate-spin" /> : <MdCreditCard className="w-4 h-4" />}
                    {businessCardBack ? "Change back" : "Upload back"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu display options — full width */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdShare className="w-5 h-5 text-primary" />
              {isCreativeDesign ? 'Catalog display options' : 'Menu display options'}
            </CardTitle>
            <CardDescription>
              {isCreativeDesign ? 'Control what visitors see on your public catalog page.' : 'Control what visitors see on your public menu page.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isCreativeDesign && (
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MdPhoneInTalk className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label className="text-base font-medium">Quick action buttons</Label>
                  <p className="text-sm text-muted-foreground">Show Call, Email, WhatsApp & Download on left (desktop) and bottom bar (mobile)</p>
                </div>
              </div>
              <Switch
                checked={showQuickActions}
                onCheckedChange={(v) => handleDisplayOptionChange('showQuickActions', v)}
                disabled={savingDisplayOpts}
              />
            </div>
            )}
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FiGlobe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label className="text-base font-medium">Social media links</Label>
                  <p className="text-sm text-muted-foreground">Show website and social links in the footer</p>
                </div>
              </div>
              <Switch
                checked={showSocialLinks}
                onCheckedChange={(v) => handleDisplayOptionChange('showSocialLinks', v)}
                disabled={savingDisplayOpts}
              />
            </div>
            {!isPortfolioType && (
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FiMessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label className="text-base font-medium">WhatsApp button in products</Label>
                  <p className="text-sm text-muted-foreground">Show WhatsApp inquiry button on product detail popups</p>
                </div>
              </div>
              <Switch
                checked={showWhatsAppButton}
                onCheckedChange={(v) => handleDisplayOptionChange('showWhatsAppButton', v)}
                disabled={savingDisplayOpts}
              />
            </div>
            )}
          </CardContent>
        </Card>

        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdMap className="w-5 h-5 text-primary" />
              Map location
            </CardTitle>
            <CardDescription>Business address on map. Set lat/lng or use “Use current location”.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 rounded-xl overflow-hidden border bg-muted">
              {mapPosition && !Number.isNaN(mapPosition.lat) && !Number.isNaN(mapPosition.lng) ? (
                <LeafletMap
                  position={mapPosition}
                  address={form.address}
                  businessName={form.name}
                  height="256px"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
                  <FiMapPin className="w-10 h-10" />
                  <p>Set latitude & longitude, or use “Use current location”.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

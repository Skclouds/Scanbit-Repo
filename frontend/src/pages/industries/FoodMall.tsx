import { useState, useEffect } from "react";
import { DemoPageLayout } from "./IndustryLayout";
import { DemoFoodMallPreview } from "./demos";
import api from "@/lib/api";
import ProfessionalLoader from "@/components/ui/ProfessionalLoader";

export default function FoodMall() {
  const [mode, setMode] = useState<"loading" | "demo" | "live">("loading");
  const [liveData, setLiveData] = useState<{
    businessInfo: any;
    categories: any[];
    menuItems: any[];
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getMyRestaurant();
        if (res?.success && res?.data) {
          const r = res.data;
          const cat = (r.businessCategory || r.businessType || "").toLowerCase();
          const isFood =
            cat.includes("food") ||
            cat.includes("mall") ||
            cat.includes("restaurant") ||
            cat.includes("cafe") ||
            cat.includes("dining") ||
            cat.includes("bakery") ||
            cat.includes("takeaway") ||
            cat.includes("cloud kitchen") ||
            cat.includes("food court");

          const restId = r._id || r.id;
          if (isFood && restId) {
            const menuRes = await api.getMenu(String(restId));
            if (menuRes?.success && menuRes?.restaurant && menuRes?.categories) {
              const restaurant = menuRes.restaurant;
              const loc = restaurant.location || {};
              const addr = loc.address || restaurant.address || "";
              setLiveData({
                businessInfo: {
                  name: restaurant.name || "Our Menu",
                  tagline: restaurant.tagline || "Fresh • Local • Delicious",
                  logo: restaurant.logo || null,
                  address: addr,
                  phone: restaurant.phone || "",
                  email: restaurant.email || "",
                  whatsapp: restaurant.whatsapp || restaurant.phone || "",
                  openingHours: restaurant.openingHours || "Check with us",
                  website: restaurant.website || "",
                  mapQuery: addr || restaurant.name || "",
                  mapEmbedUrl:
                    loc.lat && loc.lng
                      ? `https://www.openstreetmap.org/export/embed.html?bbox=${loc.lng - 0.01}%2C${loc.lat - 0.01}%2C${loc.lng + 0.01}%2C${loc.lat + 0.01}&layer=mapnik&marker=${loc.lat}%2C${loc.lng}`
                      : null,
                },
                categories: [
                  { id: "all", name: "All", emoji: "🍽️" },
                  ...(menuRes.categories || []).map((c: any) => ({
                    id: String(c.id),
                    name: c.name || "Category",
                    emoji: c.emoji || "🍽️",
                  })),
                ],
                menuItems: (menuRes.categories || []).flatMap((cat: any) =>
                  (cat.items || []).map((item: any) => ({
                    id: String(item.id),
                    name: item.name || "",
                    description: item.description || "",
                    price: item.offerPrice ?? item.price ?? 0,
                    categoryId: String(cat.id),
                    isVeg: item.isVeg !== false,
                    isPopular: item.isPopular === true,
                    imageUrl: item.image || undefined,
                  }))
                ),
              });
              setMode("live");
              return;
            }
          }
        }
      } catch {
        // Not logged in or not food business — show demo
      }
      setMode("demo");
    };
    load();
  }, []);

  if (mode === "loading") {
    return (
      <DemoPageLayout demoName="Food Mall" fullWidth>
        <div className="flex min-h-[60vh] items-center justify-center">
          <ProfessionalLoader size="xl" variant="branded" />
        </div>
      </DemoPageLayout>
    );
  }

  return (
    <DemoPageLayout demoName="Food Mall" fullWidth>
      {mode === "live" && liveData ? (
        <DemoFoodMallPreview
          businessInfo={liveData.businessInfo}
          categories={liveData.categories}
          menuItems={liveData.menuItems}
          isLiveMenu
        />
      ) : (
        <DemoFoodMallPreview />
      )}
    </DemoPageLayout>
  );
}

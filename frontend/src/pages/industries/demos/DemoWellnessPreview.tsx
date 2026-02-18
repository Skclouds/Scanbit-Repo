import { useState } from "react";
import { Heart, Star, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { sampleBusinessInfo } from "./sampleData";

const sampleTreatments = [
  { id: "1", name: "Deep Tissue Massage", duration: "60 min", price: 2499, category: "Massage" },
  { id: "2", name: "Yoga Session", duration: "45 min", price: 599, category: "Fitness" },
  { id: "3", name: "Skin Rejuvenation", duration: "90 min", price: 3999, category: "Skincare" },
  { id: "4", name: "Consultation", duration: "30 min", price: 499, category: "Consultation" },
];

export function DemoWellnessPreview() {
  const [category, setCategory] = useState("all");
  const categories = ["all", ...Array.from(new Set(sampleTreatments.map((t) => t.category)))];
  const items = category === "all" ? sampleTreatments : sampleTreatments.filter((t) => t.category === category);

  return (
    <div className="rounded-xl sm:rounded-2xl border-2 border-slate-200 bg-white shadow-xl overflow-hidden max-w-full">
      {/* Navbar */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">Serenity Wellness</h1>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Treatments & Services</p>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-2 sm:mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scroll-smooth touch-pan-x">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 touch-manipulation min-h-[40px] sm:min-h-0 ${
                category === c
                  ? "bg-teal-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      </header>

      {/* Treatments list */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 min-h-[240px] sm:min-h-[280px]">
        <div className="space-y-2 sm:space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="border-0 shadow-sm bg-slate-50/50 hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider">{item.category}</span>
                  <h3 className="font-semibold text-slate-900 mt-0.5 text-sm sm:text-base">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-500">{item.duration}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:text-right flex-shrink-0">
                  <p className="font-bold text-slate-900 text-sm sm:text-base">₹{item.price}</p>
                  <Button size="sm" variant="outline" className="h-9 sm:h-8 text-xs rounded-lg border-teal-200 text-teal-700 touch-manipulation min-w-[72px]">
                    Book
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500/80" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm sm:text-base">{sampleBusinessInfo.name}</h3>
              <p className="text-xs sm:text-sm text-slate-400">Health & Wellness</p>
            </div>
          </div>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            <li className="flex items-start gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <span className="break-words">{sampleBusinessInfo.address}</span>
            </li>
            <li className="flex items-center gap-2 min-w-0">
              <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="break-all">{sampleBusinessInfo.phone}</span>
            </li>
            <li className="flex items-center gap-2 min-w-0">
              <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="break-words">{sampleBusinessInfo.openingHours}</span>
            </li>
          </ul>
          <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-700 flex flex-col sm:flex-row justify-between gap-2 text-[10px] sm:text-xs text-slate-500">
            <span className="break-words">© {new Date().getFullYear()} {sampleBusinessInfo.name}</span>
            <span className="flex-shrink-0">Powered by ScanBit</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

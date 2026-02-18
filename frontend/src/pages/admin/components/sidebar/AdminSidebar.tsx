import { Link } from "react-router-dom";
import { X, LogOut, ChevronDown, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { navCategories } from "../../utils/constants";
import { env } from "@/lib/api";

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const AdminSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  onLogout,
}: AdminSidebarProps) => {
  return (
    <aside
      className={`fixed top-0 left-0 h-full w-72 gradient-dark z-50 transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <QrCode className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-background">
              {env.APP_NAME}
            </span>
          </Link>
          <button
            className="lg:hidden text-background/70"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-3 py-2 rounded-lg bg-primary/20 text-primary text-sm font-medium mb-6">
          Super Admin
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-6 pb-4 space-y-1">
        {navCategories.map((category) => {
          const hasActiveItem = category.items.some((item) => activeTab === item.id);

          return (
            <Collapsible key={category.id} defaultOpen={hasActiveItem}>
              <CollapsibleTrigger
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-background/50 hover:text-background/70 transition-colors mb-1 ${
                  hasActiveItem ? "text-background/90" : ""
                }`}
              >
                <span>{category.label}</span>
                <ChevronDown className="w-3 h-3 transition-transform duration-200 data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1 space-y-1 pl-2">
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-background/70 hover:bg-background/10 hover:text-background"
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </CollapsibleContent>
              {category.id !== navCategories[navCategories.length - 1].id && (
                <Separator className="my-2 bg-background/10" />
              )}
            </Collapsible>
          );
        })}
      </nav>

      <div className="p-6 flex-shrink-0 border-t border-background/10">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-background/70 hover:text-background hover:bg-background/10"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};

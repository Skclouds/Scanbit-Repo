import { CustomizationNav, CustomizationBreadcrumb, SHOW_CUSTOMIZATION_SIDEBAR } from '@/components/admin/CustomizationNav';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import React from 'react';


interface CustomizationLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export default function CustomizationLayout({ children, showNav = true }: CustomizationLayoutProps) {

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('activeTab', 'dashboard');
                window.history.pushState({}, '', url.toString());
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <CustomizationBreadcrumb />
        
        <div className="flex gap-6">
          {/* Sidebar Navigation - hidden when customization section list is removed */}
          {showNav && SHOW_CUSTOMIZATION_SIDEBAR && (
            <aside className="w-80 flex-shrink-0 sticky top-24 self-start">
              <CustomizationNav />
            </aside>
          )}

          {/* Page Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

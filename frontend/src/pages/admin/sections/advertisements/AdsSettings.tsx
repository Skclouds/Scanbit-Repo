import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, RefreshCw } from "lucide-react";

export default function AdsSettings() {
  return (
    <div className="space-y-6">
      {/* Header with Logo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Global Settings</h2>
            <p className="text-slate-600 mt-1">Configure global advertisement settings</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Coming Soon Card */}
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-6">
          <Settings className="w-12 h-12 text-orange-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Global Settings</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          Configure global ad settings, default configurations, approval workflows, and budget limits
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-orange-800">Coming Soon</span>
          </div>
          <p className="text-sm text-orange-700">
            This feature is currently under development and will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}

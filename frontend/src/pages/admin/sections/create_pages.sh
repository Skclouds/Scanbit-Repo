#!/bin/bash

# Create analytics directory if it doesn't exist
mkdir -p analytics support

# Revenue Analytics
cat > analytics/RevenueAnalytics.tsx << 'EOF'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, RefreshCw, DollarSign, TrendingUp } from "lucide-react";

export default function RevenueAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
            <LineChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Revenue Analytics</h2>
            <p className="text-slate-600 mt-1">Track revenue trends and financial metrics</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                <p className="text-3xl font-bold mt-2 text-green-900">₹1.2M</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Monthly Revenue</p>
                <p className="text-3xl font-bold mt-2 text-blue-900">₹125K</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Growth Rate</p>
                <p className="text-3xl font-bold mt-2 text-purple-900">+18%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <LineChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Revenue charts will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </Card>
    </div>
  );
}
EOF

# QR Scan Analytics
cat > analytics/QRScanAnalytics.tsx << 'EOF'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, RefreshCw, MousePointerClick, Eye } from "lucide-react";

export default function QRScanAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">QR Scan Analytics</h2>
            <p className="text-slate-600 mt-1">Track QR code scans and engagement</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Scans</p>
                <p className="text-3xl font-bold mt-2 text-purple-900">45.2K</p>
              </div>
              <QrCode className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Unique Scans</p>
                <p className="text-3xl font-bold mt-2 text-blue-900">32.1K</p>
              </div>
              <Eye className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Engagement Rate</p>
                <p className="text-3xl font-bold mt-2 text-green-900">71%</p>
              </div>
              <MousePointerClick className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>QR scan analytics will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </Card>
    </div>
  );
}
EOF

# Analytics index
cat > analytics/index.ts << 'EOF'
export { default as OverviewAnalytics } from './OverviewAnalytics';
export { default as BusinessAnalytics } from './BusinessAnalytics';
export { default as RevenueAnalytics } from './RevenueAnalytics';
export { default as QRScanAnalytics } from './QRScanAnalytics';
EOF

# Support pages
cat > support/HelpDesk.tsx << 'EOF'
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, RefreshCw } from "lucide-react";

export default function HelpDesk() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Help Desk</h2>
            <p className="text-slate-600 mt-1">Manage customer support and help requests</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6">
          <HelpCircle className="w-12 h-12 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Help Desk</h3>
        <p className="text-gray-600 max-w-md mx-auto">Manage customer support requests and help tickets</p>
      </div>
    </div>
  );
}
EOF

cat > support/SupportTickets.tsx << 'EOF'
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, RefreshCw } from "lucide-react";

export default function SupportTickets() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Support Tickets</h2>
            <p className="text-slate-600 mt-1">View and manage support tickets</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-6">
          <Ticket className="w-12 h-12 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Support Tickets</h3>
        <p className="text-gray-600 max-w-md mx-auto">Track and resolve customer support tickets</p>
      </div>
    </div>
  );
}
EOF

cat > support/KnowledgeBase.tsx << 'EOF'
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, RefreshCw } from "lucide-react";

export default function KnowledgeBase() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Knowledge Base</h2>
            <p className="text-slate-600 mt-1">Manage help articles and documentation</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Knowledge Base</h3>
        <p className="text-gray-600 max-w-md mx-auto">Create and manage help articles</p>
      </div>
    </div>
  );
}
EOF

cat > support/FAQs.tsx << 'EOF'
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircleQuestion, RefreshCw } from "lucide-react";

export default function FAQs() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
            <MessageCircleQuestion className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">FAQs</h2>
            <p className="text-slate-600 mt-1">Manage frequently asked questions</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-6">
          <MessageCircleQuestion className="w-12 h-12 text-orange-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">FAQs</h3>
        <p className="text-gray-600 max-w-md mx-auto">Create and manage FAQ content</p>
      </div>
    </div>
  );
}
EOF

cat > support/SupportAnalytics.tsx << 'EOF'
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, RefreshCw } from "lucide-react";

export default function SupportAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Support Analytics</h2>
            <p className="text-slate-600 mt-1">Track support performance metrics</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mb-6">
          <BarChart3 className="w-12 h-12 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Support Analytics</h3>
        <p className="text-gray-600 max-w-md mx-auto">View support performance metrics</p>
      </div>
    </div>
  );
}
EOF

cat > support/index.ts << 'EOF'
export { default as HelpDesk } from './HelpDesk';
export { default as SupportTickets } from './SupportTickets';
export { default as KnowledgeBase } from './KnowledgeBase';
export { default as FAQs } from './FAQs';
export { default as SupportAnalytics } from './SupportAnalytics';
EOF

echo "All pages created successfully!"

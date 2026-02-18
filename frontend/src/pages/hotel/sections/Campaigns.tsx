import { useState } from "react";
import { FiPlus, FiTrendingUp, FiUsers, FiTarget, FiCalendar, FiDollarSign } from "react-icons/fi";
import { MdCampaign, MdLocalOffer, MdEmail, MdShare } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Campaign {
  id: string;
  name: string;
  type: "email" | "social" | "promotion" | "advertising";
  status: "active" | "paused" | "completed" | "draft";
  startDate: string;
  endDate: string;
  budget: number;
  targetAudience: string;
  description: string;
}

const Campaigns = ({ restaurant, formatCurrency }: any) => {
  const [activeTab, setActiveTab] = useState("all");
  const [isCreating, setIsCreating] = useState(false);

  // Mock data - replace with real API calls
  const campaigns: Campaign[] = [
    {
      id: "1",
      name: "Summer Sale 2026",
      type: "promotion",
      status: "active",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      budget: 1000,
      targetAudience: "All Customers",
      description: "Summer promotion with 20% off on all items",
    },
    {
      id: "2",
      name: "New Year Newsletter",
      type: "email",
      status: "draft",
      startDate: "2026-02-01",
      endDate: "2026-02-28",
      budget: 500,
      targetAudience: "Subscribed Customers",
      description: "Monthly newsletter with updates and offers",
    },
    {
      id: "3",
      name: "Social Media Boost",
      type: "social",
      status: "paused",
      startDate: "2025-12-01",
      endDate: "2026-01-31",
      budget: 2000,
      targetAudience: "Social Media Followers",
      description: "Boost social media presence and engagement",
    },
  ];

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (activeTab === "all") return true;
    return campaign.status === activeTab;
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === "active").length,
    paused: campaigns.filter((c) => c.status === "paused").length,
    draft: campaigns.filter((c) => c.status === "draft").length,
    completed: campaigns.filter((c) => c.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-600 mt-1">Create and manage marketing campaigns</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
              <FiPlus className="w-4 h-4" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Campaign Name</Label>
                <Input placeholder="Enter campaign name" />
              </div>
              <div>
                <Label>Campaign Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="advertising">Advertising</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Enter campaign description" rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <div>
                <Label>Budget</Label>
                <Input type="number" placeholder="Enter budget" />
              </div>
              <div>
                <Label>Target Audience</Label>
                <Input placeholder="Enter target audience" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreating(false)}>Create Campaign</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <MdCampaign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Paused</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.paused}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <FiTarget className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Draft</p>
                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FiTarget className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Campaigns</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No campaigns found</div>
            ) : (
              filteredCampaigns.map((campaign) => {
                const getTypeIcon = () => {
                  const icons: Record<string, any> = {
                    email: MdEmail,
                    social: MdShare,
                    promotion: MdLocalOffer,
                    advertising: MdCampaign,
                  };
                  return icons[campaign.type] || MdCampaign;
                };
                const TypeIcon = getTypeIcon();

                return (
                  <div
                    key={campaign.id}
                    className="p-6 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                          <TypeIcon className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{campaign.name}</h3>
                          <p className="text-sm text-slate-600 mt-1">{campaign.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{campaign.type}</Badge>
                            <Badge
                              className={
                                campaign.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : campaign.status === "paused"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : campaign.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {campaign.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-600">Start Date</p>
                          <p className="text-sm font-medium">{campaign.startDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-600">End Date</p>
                          <p className="text-sm font-medium">{campaign.endDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-600">Budget</p>
                          <p className="text-sm font-medium">
                            {formatCurrency ? formatCurrency(campaign.budget) : `$${campaign.budget.toFixed(2)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiUsers className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-600">Target</p>
                          <p className="text-sm font-medium">{campaign.targetAudience}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Campaigns;

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MdIntegrationInstructions, MdCheck, MdClose, MdEdit, MdDelete, } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FiPlus } from "react-icons/fi";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";


interface Integration {
  _id?: string;
  id?: string;
  name: string;
  service: string;
  status: "active" | "inactive";
  icon: string;
  description: string;
  connected?: boolean;
  apiKey?: string;
  lastSynced?: string;
}

const availableServices = [
  {
    name: "Stripe",
    service: "stripe",
    icon: "💳",
    description: "Payment processing and transactions",
    category: "payments",
  },
  {
    name: "Google Analytics",
    service: "google_analytics",
    icon: "📊",
    description: "Website analytics and user tracking",
    category: "analytics",
  },
  {
    name: "Mailchimp",
    service: "mailchimp",
    icon: "📧",
    description: "Email marketing and campaigns",
    category: "marketing",
  },
  {
    name: "Slack",
    service: "slack",
    icon: "💬",
    description: "Team notifications and updates",
    category: "communication",
  },
  {
    name: "Twilio",
    service: "twilio",
    icon: "📱",
    description: "SMS and voice communication",
    category: "communication",
  },
  {
    name: "AWS",
    service: "aws",
    icon: "☁️",
    description: "Cloud storage and computing",
    category: "storage",
  },
];

export const Integrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "1",
      name: "Stripe",
      service: "stripe",
      status: "active",
      icon: "💳",
      description: "Payment processing",
      connected: true,
      lastSynced: "2 hours ago",
    },
    {
      id: "2",
      name: "Google Analytics",
      service: "google_analytics",
      status: "active",
      icon: "📊",
      description: "Website analytics",
      connected: true,
      lastSynced: "15 minutes ago",
    },
  ]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");

  const handleAddIntegration = async () => {
    if (!selectedService || !apiKey.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const service = availableServices.find((s) => s.service === selectedService);
    if (!service) return;

    try {
      await api.addIntegration?.({
        service: selectedService,
        apiKey,
      });

      const newIntegration: Integration = {
        id: Date.now().toString(),
        name: service.name,
        service: selectedService,
        status: "active",
        icon: service.icon,
        description: service.description,
        connected: true,
        apiKey,
        lastSynced: "Just now",
      };

      setIntegrations([...integrations, newIntegration]);
      setAddDialogOpen(false);
      setSelectedService(null);
      setApiKey("");

      toast.success(
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-sm font-bold">✓</span>
          </div>
          <div>
            <p className="font-semibold">Integration Connected</p>
            <p className="text-sm opacity-90">{service.name} is now connected</p>
          </div>
        </div>
      );
    } catch (error: Error | unknown) {
      const errorMsg = error instanceof Error ? error.message : "Failed to connect integration";
      toast.error(errorMsg);
    }
  };

  const handleToggleStatus = async (integration: Integration) => {
    try {
      const newStatus = integration.status === "active" ? "inactive" : "active";
      await api.updateIntegration?.({
        id: integration.id,
        status: newStatus,
      });

      setIntegrations(
        integrations.map((i) =>
          (i.id === integration.id || i._id === integration._id)
            ? { ...i, status: newStatus }
            : i
        )
      );

      toast.success(
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-sm font-bold">✓</span>
          </div>
          <div>
            <p className="font-semibold">Integration Updated</p>
            <p className="text-sm opacity-90">{integration.name} is now {newStatus}</p>
          </div>
        </div>
      );
    } catch (error: Error | unknown) {
      const errorMsg = error instanceof Error ? error.message : "Failed to update integration";
      toast.error(errorMsg);
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    try {
      await api.deleteIntegration?.({ id });
      const integration = integrations.find((i) => i.id === id || i._id === id);
      setIntegrations(integrations.filter((i) => (i.id !== id && i._id !== id)));
      setDeletingId(null);

      toast.success(
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-sm font-bold">✓</span>
          </div>
          <div>
            <p className="font-semibold">Integration Disconnected</p>
            <p className="text-sm opacity-90">{integration?.name} has been removed</p>
          </div>
        </div>
      );
    } catch (error: Error | unknown) {
      const errorMsg = error instanceof Error ? error.message : "Failed to delete integration";
      toast.error(errorMsg);
    }
  };

  const connectedServices = integrations.map((i) => i.service);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold mb-1">Integrations</h2>
          <p className="text-muted-foreground">
            Connect third-party services to extend functionality
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Connected Integrations */}
      {integrations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Connected Services</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <Card
                key={integration.id || integration._id}
                className="relative hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">{integration.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        integration.status === "active"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        integration.status === "active"
                          ? "bg-green-500/20 text-green-700 border-green-200"
                          : ""
                      }
                    >
                      {integration.status === "active" ? (
                        <>
                          <MdCheck className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <MdClose className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    {integration.lastSynced && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Last Synced:</span>
                        <span>{integration.lastSynced}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(integration)}
                      className="flex-1"
                    >
                      {integration.status === "active" ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingIntegration(integration)}
                    >
                      <MdEdit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-500/10"
                      onClick={() =>
                        setDeletingId(integration.id || integration._id || "")
                      }
                    >
                      <MdDelete className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Services */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Services</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {availableServices
            .filter((s) => !connectedServices.includes(s.service))
            .map((service) => (
              <Card key={service.service} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl">{service.icon}</div>
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="outline" className="capitalize">
                      {service.category}
                    </Badge>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedService(service.service);
                      setAddDialogOpen(true);
                    }}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>

        {availableServices.filter((s) => !connectedServices.includes(s.service))
          .length === 0 && (
          <div className="text-center py-12 bg-secondary/30 rounded-lg border border-border">
            <MdIntegrationInstructions className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">All available services are connected</p>
          </div>
        )}
      </div>

      {/* Add Integration Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Integration</DialogTitle>
            <DialogDescription>
              Connect a third-party service to your business
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Select Service</label>
              <div className="grid grid-cols-2 gap-2">
                {availableServices.map((service) => (
                  <button
                    key={service.service}
                    onClick={() => setSelectedService(service.service)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedService === service.service
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{service.icon}</div>
                    <p className="text-sm font-semibold">{service.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedService && (
              <>
                <div>
                  <label className="text-sm font-semibold mb-2 block">API Key</label>
                  <Input
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    type="password"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your API key is encrypted and secure
                  </p>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg text-sm">
                  <p className="font-semibold mb-2">Setup Instructions</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Log in to your {availableServices.find((s) => s.service === selectedService)?.name} account</li>
                    <li>Navigate to API settings</li>
                    <li>Generate a new API key</li>
                    <li>Copy and paste it above</li>
                  </ol>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setAddDialogOpen(false);
                  setSelectedService(null);
                  setApiKey("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddIntegration}
                disabled={!selectedService || !apiKey.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
              >
                Connect Service
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Disconnect Integration</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect this integration? You can reconnect it
              anytime.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && handleDeleteIntegration(deletingId)}
            >
              Disconnect
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingIntegration && (
        <Dialog open={!!editingIntegration} onOpenChange={() => setEditingIntegration(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingIntegration.name} Settings</DialogTitle>
              <DialogDescription>Manage integration configuration</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">API Key</label>
                <Input
                  placeholder="Enter your API key"
                  defaultValue={editingIntegration.apiKey || ""}
                  type="password"
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-1">
                  API keys cannot be edited. Disconnect and reconnect to use a different key.
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Status</label>
                <div className="flex gap-2">
                  <Button
                    variant={
                      editingIntegration.status === "active" ? "default" : "outline"
                    }
                    onClick={() =>
                      setEditingIntegration({
                        ...editingIntegration,
                        status: "active",
                      })
                    }
                  >
                    Active
                  </Button>
                  <Button
                    variant={
                      editingIntegration.status === "inactive"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setEditingIntegration({
                        ...editingIntegration,
                        status: "inactive",
                      })
                    }
                  >
                    Inactive
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEditingIntegration(null)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Integrations;

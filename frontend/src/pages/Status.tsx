import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Sparkles, CheckCircle, AlertCircle, Clock, Activity } from "lucide-react";
import { env } from "@/lib/api";

const services = [
  {
    name: "API",
    status: "operational",
    uptime: "99.9%",
    responseTime: "120ms",
  },
  {
    name: "Dashboard",
    status: "operational",
    uptime: "99.9%",
    responseTime: "150ms",
  },
  {
    name: "QR Code Generation",
    status: "operational",
    uptime: "99.8%",
    responseTime: "200ms",
  },
  {
    name: "Menu Display",
    status: "operational",
    uptime: "99.9%",
    responseTime: "100ms",
  },
  {
    name: "Payment Processing",
    status: "operational",
    uptime: "99.7%",
    responseTime: "300ms",
  },
  {
    name: "Analytics",
    status: "operational",
    uptime: "99.9%",
    responseTime: "180ms",
  },
];

const recentIncidents = [
  {
    date: "December 15, 2025",
    title: "Scheduled Maintenance",
    status: "resolved",
    description: "Completed scheduled maintenance window. All systems operational.",
  },
  {
    date: "November 20, 2025",
    title: "API Performance Improvement",
    status: "resolved",
    description: "Optimized API response times. Average response time reduced by 30%.",
  },
];

const Status = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="w-5 h-5 text-accent" />;
      case "degraded":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "down":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-accent/10 text-accent";
      case "degraded":
        return "bg-yellow-500/10 text-yellow-600";
      case "down":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>System Status</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6">
              Service Status
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Real-time status of all {env.APP_NAME} services and systems.
            </p>

            {/* Overall Status */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-accent/10 border border-accent/20">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span className="font-semibold text-foreground">All Systems Operational</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Status */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8">
              Service Status
            </h2>

            <div className="space-y-4">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="p-6 bg-card rounded-xl border border-border hover-lift animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <h3 className="font-display text-lg font-semibold text-foreground">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Uptime: {service.uptime}</span>
                          <span>•</span>
                          <span>Response: {service.responseTime}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8">
              Recent Incidents
            </h2>

            <div className="space-y-4">
              {recentIncidents.map((incident, index) => (
                <div
                  key={index}
                  className="p-6 bg-card rounded-xl border border-border animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                        {incident.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{incident.date}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                      {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{incident.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              No active incidents at this time.
            </div>
          </div>
        </div>
      </section>

      {/* Status History */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="p-6 bg-card rounded-xl border border-border text-center">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                System Performance
              </h3>
              <p className="text-muted-foreground mb-4">
                Average uptime over the past 90 days: <span className="font-semibold text-foreground">99.9%</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Status;

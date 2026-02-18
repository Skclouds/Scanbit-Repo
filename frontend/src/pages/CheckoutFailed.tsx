import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdErrorOutline } from "react-icons/md";
import { formatCurrency } from "@/lib/pricing";
import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";

const STORAGE_KEY = "checkout_failed";

interface FailedData {
  reason: string;
  plan?: string;
  amount?: number;
  billingCycle?: string;
}

export default function CheckoutFailed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<FailedData | null>(null);

  useEffect(() => {
    const qReason = searchParams.get("reason");
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FailedData;
        setData({
          ...parsed,
          reason: parsed.reason || qReason || "Payment could not be completed.",
        });
        sessionStorage.removeItem(STORAGE_KEY);
      } else if (qReason) {
        setData({ reason: decodeURIComponent(qReason) });
      } else {
        setData({ reason: "Payment could not be completed. Please try again." });
      }
    } catch {
      setData({
        reason: qReason ? decodeURIComponent(qReason) : "Something went wrong. Please try again.",
      });
    }
  }, [searchParams]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-lg">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                <MdErrorOutline className="w-10 h-10 text-destructive" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-display">
                Payment Failed
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                We couldn’t complete your payment.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl bg-background/80 dark:bg-background/40 p-4">
                <p className="text-sm text-muted-foreground mb-2">Reason</p>
                <p className="text-foreground">{data.reason}</p>
                {data.plan && data.amount != null && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {data.plan} • {formatCurrency(data.amount)}
                    {data.billingCycle && ` • ${data.billingCycle}`}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={() => navigate("/checkout", { replace: true })}
                >
                  Try Again
                </Button>
                <Button asChild variant="outline" className="flex-1" size="lg">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button asChild variant="ghost" className="flex-1" size="lg">
                  <Link to="/">Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

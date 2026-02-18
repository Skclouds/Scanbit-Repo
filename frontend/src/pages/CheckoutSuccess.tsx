import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdCheckCircle } from "react-icons/md";
import { formatCurrency } from "@/lib/pricing";
import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";

const STORAGE_KEY = "checkout_success";

interface SuccessData {
  plan: string;
  billingCycle: string;
  amount: number;
  orderId?: string;
  subscriptionEndDate?: string;
}

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [data, setData] = useState<SuccessData | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SuccessData;
        setData(parsed);
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

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
          <Card className="border-green-200 dark:border-green-900/50 bg-green-50/30 dark:bg-green-950/20">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <MdCheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-display">
                Payment Successful
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Your subscription is now active.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl bg-background/80 dark:bg-background/40 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{data.plan}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Billing</span>
                  <span className="font-medium capitalize">{data.billingCycle}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount paid</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(data.amount)}
                  </span>
                </div>
                {data.orderId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-mono text-xs truncate max-w-[180px]" title={data.orderId}>
                      {data.orderId}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1" size="lg">
                  <Link to="/dashboard?tab=subscription">Go to Dashboard</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1" size="lg">
                  <Link to="/">Back to Home</Link>
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

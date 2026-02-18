import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MdPayment, MdCreditCard, MdAccountBalance, MdVerifiedUser } from "react-icons/md";
import { FiDownload, FiFilter } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";


interface Payment {
  _id?: string;
  id?: string;
  orderId: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: "card" | "upi" | "bank" | "wallet";
  transactionId: string;
  date: string;
  customerName: string;
}

export const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await api.getPayments?.({ status: filterStatus === "all" ? undefined : filterStatus });
      if (response?.success) {
        setPayments(response.data);
        const revenue = response.data.reduce((sum: number, p: Payment) => {
          if (p.status === "completed") return sum + p.amount;
          return sum;
        }, 0);
        setTotalRevenue(revenue);
      }
    } catch (error) {
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "card":
        return <MdCreditCard className="w-4 h-4" />;
      case "upi":
        return <MdVerifiedUser className="w-4 h-4" />;
      case "bank":
        return <MdAccountBalance className="w-4 h-4" />;
      default:
        return <MdPayment className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-600";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600";
      case "failed":
        return "bg-red-500/10 text-red-600";
      case "refunded":
        return "bg-blue-500/10 text-blue-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  const stats = [
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: MdPayment,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Total Transactions",
      value: payments.length,
      icon: MdCreditCard,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Success Rate",
      value: `${payments.length > 0 ? Math.round((payments.filter((p) => p.status === "completed").length / payments.length) * 100) : 0}%`,
      icon: MdVerifiedUser,
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header — mobile stack */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1">Payments</h2>
          <p className="text-sm text-muted-foreground">Track all payment transactions and revenue</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto shrink-0">
          <FiDownload className="w-4 h-4" />
          Export Payments
        </Button>
      </div>

      {/* Stats — responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="font-display text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters — mobile wrap/scroll */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <FiFilter className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium sm:hidden">Filter by status</span>
            </div>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 -mx-1 scrollbar-hide">
              {["all", "completed", "pending", "failed", "refunded"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  onClick={() => setFilterStatus(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table — horizontal scroll on mobile */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Payment Transactions</CardTitle>
          <CardDescription className="text-sm">Complete list of all payment transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-0">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <MdPayment className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
              <table className="w-full min-w-[640px]">
                <thead className="border-b">
                  <tr className="text-sm font-semibold text-muted-foreground">
                    <th className="text-left py-3 px-4">Order ID</th>
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Method</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr key={payment._id || payment.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm">{payment.orderId}</span>
                      </td>
                      <td className="py-3 px-4 text-sm">{payment.customerName}</td>
                      <td className="py-3 px-4 font-semibold">₹{payment.amount}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <span className="text-sm capitalize">{payment.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{payment.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;

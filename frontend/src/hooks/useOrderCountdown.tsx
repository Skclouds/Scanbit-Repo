import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MdPayment } from "react-icons/md";
import { FiClock } from "react-icons/fi";

/** Razorpay order validity (minutes). Orders typically expire after this. */
const ORDER_VALID_MINUTES = 15;

/**
 * Returns countdown text and expired flag for a pending payment order.
 * Uses order createdAt + 15 min as expiry. Updates every second.
 */
export function useOrderCountdown(createdAt: string | Date | null | undefined): {
  countdownText: string;
  expired: boolean;
} {
  const [now, setNow] = useState(() => Date.now());

  const createdAtMs = createdAt ? new Date(createdAt).getTime() : 0;
  const expiresAtMs = createdAtMs + ORDER_VALID_MINUTES * 60 * 1000;
  const remainingMs = Math.max(0, expiresAtMs - now);
  const expired = remainingMs <= 0;

  useEffect(() => {
    if (!createdAt || expired) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [createdAt, expired]);

  if (!createdAt) {
    return { countdownText: "—", expired: false };
  }
  if (expired) {
    return { countdownText: "Order expired", expired: true };
  }
  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const countdownText = `Expires in ${minutes}:${seconds.toString().padStart(2, "0")}`;
  return { countdownText, expired: false };
}

interface OrderCountdownProps {
  createdAt: string | Date;
  className?: string;
}

/** Inline component to show countdown under Pay now for a pending order. */
export function OrderCountdown({ createdAt, className = "" }: OrderCountdownProps) {
  const { countdownText, expired } = useOrderCountdown(createdAt);
  return (
    <p
      className={`text-xs font-medium ${expired ? "text-amber-600 dark:text-amber-400" : "text-amber-600 dark:text-amber-400"} ${className}`.trim()}
    >
      {countdownText}
    </p>
  );
}

interface PendingOrderActionsProps {
  createdAt: string | Date;
  status: string;
  onPayNow: () => void;
  /** Optional class for the button container (e.g. flex flex-col items-end gap-1 for table) */
  className?: string;
  /** If true, use compact layout (e.g. for table cell) */
  compact?: boolean;
}

/**
 * For pending: shows "Pay now" + countdown only when order is NOT expired.
 * When expired: shows "Try again" + "Order expired" (no "Pay now").
 * For failed: shows "Try again" only.
 */
export function PendingOrderActions({ createdAt, status, onPayNow, className = "", compact }: PendingOrderActionsProps) {
  const { countdownText, expired } = useOrderCountdown(status?.toLowerCase() === "pending" ? createdAt : null);
  const isPending = status?.toLowerCase() === "pending";
  const isFailed = status?.toLowerCase() === "failed";

  const showPayNow = isPending && !expired;
  const showTryAgain = isFailed || (isPending && expired);

  const wrapperClass = compact ? "flex flex-col items-end gap-1" : "space-y-2";

  return (
    <div className={`${wrapperClass} ${className}`.trim()}>
      {showPayNow && (
        <>
          <Button size="sm" className="gap-1.5" onClick={onPayNow}>
            <MdPayment className="w-4 h-4" />
            Pay now
          </Button>
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <FiClock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs font-medium">{countdownText}</span>
          </div>
        </>
      )}
      {showTryAgain && (
        <>
          <Button size="sm" variant={isPending && expired ? "outline" : "default"} className="gap-1.5" onClick={onPayNow}>
            <MdPayment className="w-4 h-4" />
            Try again
          </Button>
          {isPending && expired && (
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Order expired</p>
          )}
        </>
      )}
    </div>
  );
}

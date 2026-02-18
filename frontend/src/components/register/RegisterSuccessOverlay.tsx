import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

interface RegisterSuccessOverlayProps {
  delayMs?: number;
  redirectTo?: string;
}

export function RegisterSuccessOverlay({
  delayMs = 2800,
  redirectTo = "/dashboard",
}: RegisterSuccessOverlayProps) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        sessionStorage.removeItem("postRegisterOverlayUntil");
      } catch {
        // ignore
      }
      navigate(redirectTo, { replace: true });
    }, delayMs);
    return () => clearTimeout(t);
  }, [navigate, delayMs, redirectTo]);

  // Progress bar: 0 → 100 over delayMs
  useEffect(() => {
    const start = Date.now();
    const frame = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / delayMs) * 100);
      setProgress(p);
      if (p < 100) requestAnimationFrame(frame);
    };
    const id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [delayMs]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-md"
      role="alert"
      aria-live="polite"
      aria-label="Account created successfully"
    >
      {/* Subtle radial glow behind card */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 45%, hsl(var(--primary) / 0.12), transparent 70%)",
        }}
      />

      <div
        className={`
          relative flex flex-col items-center justify-center gap-8 px-6 max-w-md
          transition-all duration-700 ease-out
          ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        `}
      >
        {/* Success icon: circle + checkmark with entrance animation */}
        <div className="relative flex-shrink-0">
          <div
            className="absolute inset-0 rounded-full bg-primary/10 success-ping"
            aria-hidden
          />
          <div
            className={`
              relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary to-primary/80
              flex items-center justify-center shadow-lg shadow-primary/25 ring-4 ring-primary/20
              transition-transform duration-500 ease-out
              ${mounted ? "success-scale-in" : "scale-0"}
            `}
          >
            <Check
              className={`
                w-12 h-12 sm:w-14 sm:h-14 text-primary-foreground stroke-[2.5]
                transition-all duration-500 ease-out
                ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"}
              `}
              style={{
                transitionDelay: "200ms",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
              aria-hidden
            />
          </div>
        </div>

        {/* Text block with staggered fade-in */}
        <div className="text-center space-y-3">
          <h2
            className={`
              font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight
              transition-all duration-600 ease-out
              ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
            `}
            style={{ transitionDelay: "350ms" }}
          >
            Account created
          </h2>
          <p
            className={`
              text-muted-foreground text-sm sm:text-base max-w-xs mx-auto
              transition-all duration-600 ease-out
              ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
            `}
            style={{ transitionDelay: "500ms" }}
          >
            Redirecting you to your dashboard…
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs sm:max-w-sm space-y-2">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Please wait a moment
          </p>
        </div>
      </div>

      <style>{`
        @keyframes success-ping {
          0% { transform: scale(1); opacity: 0.35; }
          70% { opacity: 0.15; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .success-ping {
          animation: success-ping 1.2s cubic-bezier(0, 0, 0.2, 1) forwards;
        }
        @keyframes success-scale-in {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .success-scale-in {
          animation: success-scale-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}

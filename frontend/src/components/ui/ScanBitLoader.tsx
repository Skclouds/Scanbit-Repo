import { useEffect, useState } from "react";
import { env } from "@/lib/api";

// iOS Safari can throw "Maximum call stack size exceeded" with complex CSS animations (calc in keyframes, many animated nodes).
const isIOS = typeof navigator !== "undefined" && (
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
);

interface ScanBitLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  fullScreen?: boolean;
  text?: string;
  showDots?: boolean;
}

/** Minimal full-screen loader for iOS to avoid stack overflow from letter animations. */
const IOSFullScreenLoader = ({ showDots = true }: { showDots?: boolean }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.98)",
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        border: "4px solid rgba(249,115,22,0.2)",
        borderTopColor: "#f97316",
        borderRadius: "50%",
        animation: "scanbit-spin 0.8s linear infinite",
      }}
    />
    {showDots && (
      <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#f97316",
              animation: "scanbit-bounce 1s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    )}
    <style>{`@keyframes scanbit-spin{to{transform:rotate(360deg)}}@keyframes scanbit-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
  </div>
);

const ScanBitLoader = ({ 
  size = "lg", 
  fullScreen = false,
  text = (typeof env !== "undefined" && env?.APP_NAME) ? env.APP_NAME : "ScanBit",
  showDots = true
}: ScanBitLoaderProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (fullScreen && isIOS) {
    return <IOSFullScreenLoader showDots={showDots} />;
  }

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl md:text-7xl",
    xl: "text-7xl md:text-9xl",
  };

  const letterSpacing = {
    sm: "tracking-[0.1em]",
    md: "tracking-[0.15em]",
    lg: "tracking-[0.2em]",
    xl: "tracking-[0.25em]",
  };

  const letters = text.split("");
  
  // Create staggered animation delays for each letter
  const getLetterDelay = (index: number) => {
    return `${index * 0.08}s`;
  };
  
  // Vary the flex intensity for different letters
  const getFlexIntensity = (index: number) => {
    const intensities = [1.12, 1.15, 1.1, 1.13, 1.11, 1.14, 1.12];
    return intensities[index % intensities.length];
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="relative">
          {/* Animated Background Glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>

          {/* Main Text */}
          <div className={`font-display font-black ${sizeClasses[size]} ${letterSpacing[size]} relative`}>
            {/* Scanning Line Animation */}
            <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none z-20">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-scan" />
            </div>
            
            <div className="flex items-center justify-center gap-1 md:gap-2 relative z-10">
              {letters.map((letter, index) => {
                const delay = getLetterDelay(index);
                const intensity = getFlexIntensity(index);
                
                return (
                  <span
                    key={index}
                    className={`inline-block relative ${
                      mounted ? "animate-flex-letter" : ""
                    }`}
                    style={{
                      animationDelay: delay,
                      animationDuration: "1.4s",
                      animationIterationCount: "infinite",
                      animationTimingFunction: "ease-in-out",
                      ["--flex-intensity" as any]: intensity,
                    }}
                  >
                    <span className="relative z-10 bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent">
                      {letter === " " ? "\u00A0" : letter}
                    </span>
                    {/* Single subtle glow effect */}
                    <span 
                      className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-accent/30 blur-lg opacity-50"
                      style={{
                        animationDelay: delay,
                      }}
                    />
                  </span>
                );
              })}
            </div>
          </div>

          {/* Loading Dots */}
          {showDots && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gradient-to-br from-primary to-accent animate-bounce shadow-lg"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: "1s",
                  }}
                />
              ))}
            </div>
          )}
        </div>

      {/* Inject styles */}
      <style>{`
        @keyframes flex-letter {
          0%, 100% {
            transform: scaleY(1) scaleX(1);
          }
          25% {
            transform: scaleY(calc(var(--flex-intensity, 1.12))) scaleX(0.96);
          }
          50% {
            transform: scaleY(0.92) scaleX(1.06);
          }
          75% {
            transform: scaleY(1.08) scaleX(0.98);
          }
        }

        @keyframes scan {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }

        .animate-flex-letter {
          animation: flex-letter 1.4s ease-in-out infinite;
          transform-origin: center center;
          will-change: transform;
        }

        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/15 rounded-full blur-2xl animate-pulse" />
        </div>

        {/* Main Text */}
        <div className={`font-display font-black ${sizeClasses[size]} ${letterSpacing[size]} relative`}>
          {/* Scanning Line Animation */}
          <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none z-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-scan" />
          </div>
          
          <div className="flex items-center justify-center gap-1 relative z-10">
            {letters.map((letter, index) => {
              const delay = getLetterDelay(index);
              const intensity = getFlexIntensity(index);
              
              return (
                <span
                  key={index}
                  className={`inline-block relative ${
                    mounted ? "animate-flex-letter" : ""
                  }`}
                    style={{
                      animationDelay: delay,
                      animationDuration: "1.4s",
                      animationIterationCount: "infinite",
                      animationTimingFunction: "ease-in-out",
                      ["--flex-intensity" as any]: intensity,
                    }}
                >
                  <span className="relative z-10 bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent">
                    {letter === " " ? "\u00A0" : letter}
                  </span>
                  {/* Single subtle glow effect */}
                  <span 
                    className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-accent/30 blur-lg opacity-50"
                    style={{
                      animationDelay: delay,
                    }}
                  />
                </span>
              );
            })}
          </div>
        </div>

        {/* Loading Dots */}
        {showDots && (
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-primary to-accent animate-bounce shadow-md"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Inject styles */}
      <style>{`
        @keyframes flex-letter {
          0%, 100% {
            transform: scaleY(1) scaleX(1);
          }
          25% {
            transform: scaleY(calc(var(--flex-intensity, 1.12))) scaleX(0.96);
          }
          50% {
            transform: scaleY(0.92) scaleX(1.06);
          }
          75% {
            transform: scaleY(1.08) scaleX(0.98);
          }
        }

        @keyframes scan {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }

        .animate-flex-letter {
          animation: flex-letter 1.4s ease-in-out infinite;
          transform-origin: center center;
          will-change: transform;
        }

        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ScanBitLoader;

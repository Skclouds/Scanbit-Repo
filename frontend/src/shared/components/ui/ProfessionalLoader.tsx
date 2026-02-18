import { useSiteSettings } from '@/context/SiteSettingsContext';
import { useEffect, useState, useMemo, useRef } from 'react';
import { env } from '@/lib/api';

// CSS spinner only (no Lottie) - avoids RangeError on iOS

interface ProfessionalLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  showLogo?: boolean;
  showText?: boolean;
  showAnimation?: boolean;
  message?: string;
  variant?: 'default' | 'minimal' | 'branded';
}

const ProfessionalLoader = ({
  size = 'lg',
  fullScreen = false,
  showLogo = true,
  showText = true,
  showAnimation = true,
  message,
  variant = 'default',
}: ProfessionalLoaderProps) => {
  const { settings } = useSiteSettings();
  const [mounted, setMounted] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoUrl = settings?.branding?.logoUrl;
  const siteName = settings?.general?.siteName || env.APP_NAME || 'ScanBit';

  const sizeConfig = useMemo(() => ({
    sm: { 
      logo: { base: 80, sm: 100, md: 140 },
      animation: { base: 140, sm: 160, md: 180 },
      text: 'text-base sm:text-xl md:text-2xl',
      gap: 'gap-3 sm:gap-4 md:gap-6',
      spinner: 'w-12 h-12 sm:w-14 h-14 md:w-20 h-20'
    },
    md: { 
      logo: { base: 100, sm: 140, md: 200 },
      animation: { base: 160, sm: 200, md: 280 },
      text: 'text-lg sm:text-2xl md:text-3xl',
      gap: 'gap-4 sm:gap-6 md:gap-8',
      spinner: 'w-14 h-14 sm:w-16 h-16 md:w-24 h-24'
    },
    lg: { 
      logo: { base: 120, sm: 160, md: 280 },
      animation: { base: 200, sm: 240, md: 380 },
      text: 'text-xl sm:text-2xl md:text-4xl',
      gap: 'gap-5 sm:gap-8 md:gap-10',
      spinner: 'w-16 h-16 sm:w-20 h-20 md:w-28 h-28'
    },
    xl: { 
      logo: { base: 140, sm: 200, md: 360 },
      animation: { base: 220, sm: 280, md: 480 },
      text: 'text-2xl sm:text-3xl md:text-5xl',
      gap: 'gap-6 sm:gap-10 md:gap-12',
      spinner: 'w-16 h-16 sm:w-24 h-24 md:w-32 h-32'
    },
  }), []);

  const config = sizeConfig[size];

  // Get responsive size based on screen width
  const getResponsiveSize = (sizeObj: { base: number; sm: number; md: number }) => {
    if (typeof window === 'undefined') return sizeObj.md;
    const width = window.innerWidth;
    if (width < 640) return sizeObj.base; // mobile
    if (width < 768) return sizeObj.sm; // tablet
    return sizeObj.md; // desktop
  };

  const [responsiveLogoSize, setResponsiveLogoSize] = useState(() => getResponsiveSize(config.logo));
  const [responsiveAnimationSize, setResponsiveAnimationSize] = useState(() => getResponsiveSize(config.animation));
  const logoSizeRef = useRef(config.logo);
  const animSizeRef = useRef(config.animation);
  logoSizeRef.current = config.logo;
  animSizeRef.current = config.animation;

  const [gridSize, setGridSize] = useState(() =>
    typeof window === 'undefined' ? '50px 50px' : (window.innerWidth < 640 ? '20px 20px' : window.innerWidth < 768 ? '35px 35px' : '50px 50px')
  );
  useEffect(() => {
    const handleResize = () => {
      setResponsiveLogoSize(getResponsiveSize(logoSizeRef.current));
      setResponsiveAnimationSize(getResponsiveSize(animSizeRef.current));
      setGridSize(window.innerWidth < 640 ? '20px 20px' : window.innerWidth < 768 ? '35px 35px' : '50px 50px');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fallback logo component with animated initials
  const FallbackLogo = () => {
    const initials = siteName.slice(0, 2).toUpperCase();
    return (
      <div 
        className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-accent shadow-xl max-w-full"
        style={{ width: responsiveLogoSize, height: responsiveLogoSize, maxWidth: '90vw', maxHeight: '90vw' }}
      >
        <span className="text-white font-bold" style={{ fontSize: Math.min(responsiveLogoSize * 0.4, 48) }}>
          {initials}
        </span>
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-2xl bg-primary/30 animate-ping" style={{ animationDuration: '1.5s' }} />
      </div>
    );
  };

  // Logo with animation
  const LogoElement = () => (
    <div className="relative max-w-full">
      {/* Glow effect behind logo */}
      <div 
        className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse"
        style={{ transform: 'scale(1.2)' }}
      />
      
      {/* Logo container */}
      <div 
        className={`relative ${mounted ? 'animate-float' : ''}`}
        style={{ width: responsiveLogoSize, height: responsiveLogoSize, maxWidth: '90vw', maxHeight: '90vw' }}
      >
        {logoUrl && !logoError ? (
          <img
            src={logoUrl}
            alt={siteName}
            className="w-full h-full object-contain"
            onError={() => setLogoError(true)}
          />
        ) : (
          <FallbackLogo />
        )}
      </div>
    </div>
  );

  // Animated text
  const AnimatedText = () => {
    const letters = siteName.split('');
    return (
      <div className={`font-display font-bold ${config.text} flex items-center justify-center`}>
        {letters.map((letter, index) => (
          <span
            key={index}
            className={`inline-block ${mounted ? 'animate-wave' : ''}`}
            style={{
              animationDelay: `${index * 0.05}s`,
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </div>
    );
  };

  // Loading message with typing effect
  const LoadingMessage = () => (
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      <span>{message || 'Loading'}</span>
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1 h-1 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
    </div>
  );

  // Progress bar
  const ProgressBar = () => (
    <div className="w-24 sm:w-32 md:w-48 h-1 bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-progress" />
    </div>
  );

  const content = (
    <div className={`flex flex-col items-center justify-center ${config.gap} px-4 sm:px-6`}>
      {/* QR Scanning Animation */}
      {showAnimation && (
        <div className="relative flex items-center justify-center w-full" style={{ maxWidth: `${responsiveAnimationSize}px` }}>
          <div className="relative w-full" style={{ aspectRatio: '1/1' }}>
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          
            {/* Logo in center of animation */}
            {showLogo && (
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%]"
              >
                {logoUrl && !logoError ? (
                  <img
                    src={logoUrl}
                    alt={siteName}
                    className="w-full h-full object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg"
                  >
                    <span className="text-white font-bold" style={{ fontSize: Math.min(responsiveLogoSize * 0.25, 24) }}>
                      {siteName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logo only (when no animation) */}
      {!showAnimation && showLogo && <LogoElement />}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/98 backdrop-blur-md overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient orbs - responsive sizes */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-28 h-28 sm:w-40 sm:h-40 md:w-80 md:h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          
          {/* Grid pattern - responsive sizing */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                               linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
              backgroundSize: gridSize
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-full flex items-center justify-center">
          {content}
        </div>

        {/* Inject animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-10px) scale(1.02); }
          }
          
          @keyframes wave {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          
          @keyframes progress {
            0% { width: 0%; transform: translateX(-100%); }
            50% { width: 100%; transform: translateX(0%); }
            100% { width: 100%; transform: translateX(100%); }
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .animate-wave {
            animation: wave 1s ease-in-out infinite;
          }
          
          .animate-progress {
            animation: progress 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // Inline loader
  return (
    <div className="flex items-center justify-center py-8 w-full overflow-hidden">
      {content}
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes progress {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 100%; transform: translateX(0%); }
          100% { width: 100%; transform: translateX(100%); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ProfessionalLoader;

// Export different variants for convenience
export const FullScreenLoader = (props: Omit<ProfessionalLoaderProps, 'fullScreen'>) => (
  <ProfessionalLoader {...props} fullScreen={true} />
);

export const MinimalLoader = (props: Omit<ProfessionalLoaderProps, 'variant'>) => (
  <ProfessionalLoader {...props} variant="minimal" showText={false} />
);

export const BrandedLoader = (props: Omit<ProfessionalLoaderProps, 'variant'>) => (
  <ProfessionalLoader {...props} variant="branded" />
);

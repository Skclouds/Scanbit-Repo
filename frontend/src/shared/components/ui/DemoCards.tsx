import { useEffect } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { 
  UtensilsCrossed, 
  BookOpen, 
  Package, 
  ArrowRight,
  X
} from "lucide-react";

// The data remains the same
const cards = [
  {
    title: "Menu",
    description: "Explore digital menu",
    path: "/demo-menu",
    icon: UtensilsCrossed,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-100",
  },
  {
    title: "Catalog",
    description: "Browse product catalog",
    path: "/demo-catalog",
    icon: BookOpen,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
  },
  {
    title: "Products / Portfolio",
    description: "View all demo products",
    path: "/demo-products",
    icon: Package,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100",
  },
];

const DemoCardsOverlay = ({ isOpen, onClose }) => {
  
  // 1. Lock Body Scroll
  // When modal is open, we stop the background website from scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // 2. Handle Escape Key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  // 3. The Portal Strategy
  // This renders the modal outside the parent div, directly at the body root
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      
      {/* Backdrop (Blur & Dim) */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Close Button (Fixed to screen corner) */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:rotate-90 hover:scale-110 transition-all duration-300"
        aria-label="Close modal"
      >
        <X size={32} strokeWidth={2} />
      </button>

      {/* Card Grid Container */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 px-4 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.path}
              onClick={onClose} // Close modal when a link is clicked
              className={`group relative flex flex-col p-8 rounded-[2rem] bg-white shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:-translate-y-2 transition-all duration-300 border-2 ${card.borderColor}`}
              // Staggered animation
              style={{ animationDelay: `${index * 75}ms` }}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${card.bgColor} ${card.color}`}>
                  <Icon size={32} strokeWidth={2} />
                </div>
                <div className="p-2 rounded-full bg-slate-50 group-hover:bg-slate-900 transition-colors duration-300">
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white -rotate-45 group-hover:rotate-0 transition-all duration-300" />
                </div>
              </div>

              {/* Content */}
              <div className="mt-auto">
                <h3 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                  {card.title}
                </h3>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                  {card.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>,
    document.body // Target container for the portal
  );
};

export default DemoCardsOverlay;
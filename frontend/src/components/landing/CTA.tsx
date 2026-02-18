import backgroundImage from "@/assets/background.jpeg";
import { Button } from "@/components/ui/button";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const CTA = () => {
  const isLoggedIn =
    typeof window !== "undefined" &&
    (localStorage.getItem("token") ||
      localStorage.getItem("adminAuth") ||
      localStorage.getItem("hotelAuth"));

  return (
    <section
      className="relative overflow-hidden flex items-end justify-end w-full min-h-[40vh] sm:min-h-[45vh] md:min-h-[50vh] lg:min-h-[55vh] xl:min-h-[500px] bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      {/* Subtle overlay for readability and consistent look across devices */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" aria-hidden />

      <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="flex flex-col sm:flex-row gap-4">
          {!isLoggedIn && (
            <Button variant="hero" size="xl" asChild>
              <Link to="/register" className="gap-3">
                Start Free Trial
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default CTA;

import React from "react";
import { HiSparkles } from "react-icons/hi";
import { Button } from "@/components/ui/button";

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: React.ElementType;
}

const ComingSoon = ({ title, description, icon: Icon = HiSparkles }: ComingSoonProps) => {
  return (
    <div className="relative min-h-[400px] w-full rounded-[2rem] overflow-hidden flex items-center justify-center p-8 sm:p-12">
      {/* Background with Blur */}
      <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-md z-0" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -ml-32 -mb-32" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-lg space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-white flex items-center justify-center shadow-xl border border-slate-100 animate-bounce">
          <Icon className="w-10 h-10 text-orange-600" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
            {title}
          </h2>
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest border border-orange-200">
            Coming Soon
          </div>
        </div>

        <p className="text-slate-500 text-lg font-medium leading-relaxed">
          {description}
        </p>

        <div className="pt-4">
          <Button 
            variant="outline" 
            className="rounded-xl border-slate-200 font-bold hover:bg-white hover:shadow-md transition-all"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;

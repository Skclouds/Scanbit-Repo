import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Sparkles, FileText } from "lucide-react";
import { env } from "@/lib/api";

const TermsOfService = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Terms of Service</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6">
              Terms of Service
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4">
              Last Updated: January 1, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
            <div className="bg-card rounded-2xl border border-border p-8 md:p-12 space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Agreement to Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using {env.APP_NAME}, you agree to be bound by these Terms of Service and all 
                  applicable laws and regulations. If you do not agree with any of these terms, you are 
                  prohibited from using or accessing this platform.
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Use License
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Permission is granted to temporarily use {env.APP_NAME} for personal and commercial purposes. 
                  This license does not include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Modifying or copying the materials</li>
                  <li>Using the materials for any commercial purpose without written consent</li>
                  <li>Removing any copyright or proprietary notations</li>
                  <li>Transferring the materials to another person</li>
                </ul>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Account Registration
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To use certain features of {env.APP_NAME}, you must register for an account. You agree to provide 
                  accurate, current, and complete information during registration and to update such 
                  information to keep it accurate, current, and complete.
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  User Content
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You retain ownership of any content you submit to {env.APP_NAME}. By submitting content, you grant 
                  us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute 
                  your content solely for the purpose of providing our services.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  You are responsible for ensuring that your content does not violate any laws or infringe 
                  on the rights of others.
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Payment Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Subscription fees are billed in advance on a monthly or annual basis. By subscribing, 
                  you agree to pay all charges associated with your subscription. We reserve the right to 
                  change our pricing with 30 days' notice.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Refunds are provided according to our refund policy, available upon request.
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Prohibited Uses
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may not use {env.APP_NAME}:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>In any way that violates applicable laws or regulations</li>
                  <li>To transmit any malicious code or harmful content</li>
                  <li>To impersonate any person or entity</li>
                  <li>To interfere with or disrupt the service</li>
                  <li>To collect or harvest information about other users</li>
                </ul>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Termination
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may terminate or suspend your account and access to the service immediately, 
                  without prior notice, for any reason, including breach of these Terms. Upon termination, 
                  your right to use the service will immediately cease.
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Disclaimer
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  The materials on {env.APP_NAME} are provided on an 'as is' basis. We make no warranties, expressed 
                  or implied, and hereby disclaim all warranties including, without limitation, implied warranties 
                  of merchantability, fitness for a particular purpose, or non-infringement.
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Limitation of Liability
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  In no event shall {env.APP_NAME} or its suppliers be liable for any damages (including, without 
                  limitation, damages for loss of data or profit, or due to business interruption) arising 
                  out of the use or inability to use the materials on {env.APP_NAME}.
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Changes to Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these Terms of Service at any time. We will notify users 
                  of any material changes by posting the new Terms on this page and updating the "Last Updated" date.
                </p>
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Contact Information
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <p className="text-muted-foreground mt-2">
                  Email: {env.SUPPORT_EMAIL}<br />
                  {env.COMPANY_NAME}<br />
                  {env.COMPANY_ADDRESS}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfService;

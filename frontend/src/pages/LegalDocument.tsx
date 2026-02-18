import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Calendar, FileText, Shield } from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";

export default function LegalDocument() {
  const { slug } = useParams<{ slug: string }>();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchDocument();
    }
  }, [slug]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await api.getLegalDocument(slug!);
      if (response.success && response.data) {
        setDocument(response.data);
      } else {
        toast.error("Document not found");
      }
    } catch (error) {

      toast.error("Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      "privacy-policy": "Privacy Policy",
      "terms-conditions": "Terms & Conditions",
      "cookie-policy": "Cookie Policy",
      "refund-policy": "Refund Policy",
      "shipping-policy": "Shipping Policy",
      "user-agreement": "User Agreement",
      "other": "Other",
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Document Not Found</h1>
              <p className="text-slate-600">The requested document could not be found.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">{document.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline">{getTypeLabel(document.type)}</Badge>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  Effective: {format(new Date(document.effectiveDate), "MMMM d, yyyy")}
                </div>
                {document.version && (
                  <div className="text-sm text-slate-500">
                    Version {document.version}
                  </div>
                )}
              </div>
            </div>
          </div>
          {document.shortDescription && (
            <p className="text-lg text-slate-600 mt-4">{document.shortDescription}</p>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            <div 
              className="prose prose-slate max-w-none legal-document-content"
              style={{
                lineHeight: '1.75',
              }}
              dangerouslySetInnerHTML={{ __html: document.content }}
            />
            
            <div className="mt-8 pt-6 border-t">
              <div className="text-sm text-slate-500 space-y-1">
                <p><strong>Last Updated:</strong> {format(new Date(document.lastUpdated), "MMMM d, yyyy")}</p>
                {document.effectiveDate && (
                  <p><strong>Effective Date:</strong> {format(new Date(document.effectiveDate), "MMMM d, yyyy")}</p>
                )}
                {document.version && (
                  <p><strong>Version:</strong> {document.version}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

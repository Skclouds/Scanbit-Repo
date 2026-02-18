import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";


interface PagePlaceholderProps {
  title: string;
  description: string;
}

export const PagePlaceholder = ({ title, description }: PagePlaceholderProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page is currently under development and will be available soon. 
            The data fetching infrastructure is ready and connected to the backend API.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

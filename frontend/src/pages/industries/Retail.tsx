import { DemoPageLayout } from "./IndustryLayout";
import { DemoCatalogPreview } from "./demos";

export default function Retail() {
  return (
    <DemoPageLayout demoName="Product Catalog" fullWidth>
      <DemoCatalogPreview />
    </DemoPageLayout>
  );
}

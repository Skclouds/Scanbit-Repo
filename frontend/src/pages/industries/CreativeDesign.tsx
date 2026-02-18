import { DemoPageLayout } from "./IndustryLayout";
import { DemoCreativeCatalogPreview } from "./demos";

export default function CreativeDesign() {
  return (
    <DemoPageLayout demoName="Creative & Design" fullWidth>
      <DemoCreativeCatalogPreview />
    </DemoPageLayout>
  );
}

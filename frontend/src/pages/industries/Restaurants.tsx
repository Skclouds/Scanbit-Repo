import { DemoPageLayout } from "./IndustryLayout";
import { DemoMenuPreview } from "./demos";

export default function Restaurants() {
  return (
    <DemoPageLayout demoName="Food Mall" fullWidth>
      <DemoMenuPreview />
    </DemoPageLayout>
  );
}

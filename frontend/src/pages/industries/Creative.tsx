import { DemoPageLayout } from "./IndustryLayout";
import { DemoAgencyPreview } from "./demos";

export default function Creative() {
  return (
    <DemoPageLayout demoName="Agency & Studio" fullWidth>
      <DemoAgencyPreview />
    </DemoPageLayout>
  );
}

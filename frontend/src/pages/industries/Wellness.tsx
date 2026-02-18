import { DemoPageLayout } from "./IndustryLayout";
import { DemoWellnessPreview } from "./demos";

export default function Wellness() {
  return (
    <DemoPageLayout demoName="Health & Wellness">
      <div className="w-full max-w-4xl mx-auto">
        <DemoWellnessPreview />
      </div>
    </DemoPageLayout>
  );
}

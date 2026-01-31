import { SurveyContainer } from "@/components/survey/survey-container";
import { getApprovedChannels } from "@/actions/channels";
import { checkExistingSubmission } from "@/actions/survey";

export const dynamic = "force-dynamic";

export default async function DesignYouTubeSurveyPage() {
  const [channels, hasExistingSubmission] = await Promise.all([
    getApprovedChannels(),
    checkExistingSubmission(),
  ]);

  return (
    <main className="min-h-screen">
      <SurveyContainer
        initialChannels={channels}
        hasExistingSubmission={hasExistingSubmission}
      />
    </main>
  );
}

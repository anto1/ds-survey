import { Metadata } from "next";
import { ResultsDashboard } from "@/components/results/results-dashboard";

export const metadata: Metadata = {
  title: "Survey Results - Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultsPage() {
  return <ResultsDashboard />;
}

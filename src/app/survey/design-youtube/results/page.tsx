import { Metadata } from "next";
import { ResultsDashboard } from "@/components/results/results-dashboard";

export const metadata: Metadata = {
  title: "Результаты опроса - Админ",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultsPage() {
  return <ResultsDashboard />;
}

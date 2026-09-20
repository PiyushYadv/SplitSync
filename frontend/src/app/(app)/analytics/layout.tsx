import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Analytics",
  description: "Analyze your spending",
};
export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

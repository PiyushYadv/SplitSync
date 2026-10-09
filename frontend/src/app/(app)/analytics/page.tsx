import { serverApi } from "@/src/lib/api/server";
import AnalyticsClient from "@/src/features/analytics/components/AnalyticsClient";
import type { Analytics, GroupSummary, ListResponse } from "@/src/types/domain";

export default async function AnalyticsPage() {
  const [analytics, groups] = await Promise.all([
    serverApi<Analytics>("/analytics/summary", "/analytics"),
    serverApi<ListResponse<GroupSummary>>("/groups", "/analytics"),
  ]);
  return <AnalyticsClient initialData={analytics} initialGroups={groups.data} />;
}

import { serverApi } from "@/src/lib/api/server";
import DashboardClient from "@/src/features/dashboard/components/DashboardClient";
import type { DashboardData } from "@/src/types/domain";

export default async function DashboardPage() {
  const dashboard = await serverApi<DashboardData>("/dashboard", "/dashboard");
  return <DashboardClient initialData={dashboard} />;
}

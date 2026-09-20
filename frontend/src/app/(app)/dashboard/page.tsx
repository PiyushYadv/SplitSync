import { getDashboardData } from "@/src/lib/data/queries";
import DashboardClient from "@/src/features/dashboard/components/DashboardClient";

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardClient {...data} />;
}

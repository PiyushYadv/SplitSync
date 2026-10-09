import { serverApi } from "@/src/lib/api/server";
import GroupDetailClient from "@/src/features/groups/components/GroupDetailClient";
import type { GroupDetail } from "@/src/types/domain";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const group = await serverApi<GroupDetail>(
    `/groups/${encodeURIComponent(id)}`,
    `/groups/${id}`,
  );
  return <GroupDetailClient initialGroup={group} />;
}

import { getGroupById } from "@/src/lib/data/queries";
import GroupDetailClient from "@/src/features/groups/components/GroupDetailClient";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const group = await getGroupById(id);
  return <GroupDetailClient group={group} />;
}

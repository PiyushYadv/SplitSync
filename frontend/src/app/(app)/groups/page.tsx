import { getGroupList } from "@/src/features/groups/queries";
import GroupsClient from "@/src/features/groups/components/GroupsClient";

export default async function GroupsPage() {
  const groups = await getGroupList();
  return <GroupsClient initialGroups={groups} />;
}

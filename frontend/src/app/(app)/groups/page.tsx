import { serverApi } from "@/src/lib/api/server";
import GroupsClient from "@/src/features/groups/components/GroupsClient";
import type { DashboardData, GroupSummary, Invitation, ListResponse } from "@/src/types/domain";

export default async function GroupsPage() {
  const [groups, invitations, dashboard] = await Promise.all([
    serverApi<ListResponse<GroupSummary>>("/groups", "/groups"),
    serverApi<ListResponse<Invitation>>("/invitations?status=pending", "/groups"),
    serverApi<DashboardData>("/dashboard", "/groups"),
  ]);
  return (
    <GroupsClient
      initialGroups={groups.data}
      initialInvitations={invitations.data}
      initialDashboard={dashboard}
    />
  );
}

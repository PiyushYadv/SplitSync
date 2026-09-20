import { GROUPS } from "@/src/data/groupData";
import { apiRequest } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import { mapGroupList } from "@/src/lib/api/mappers";
import type { GroupListItem } from "./types";

export async function getGroupList(): Promise<GroupListItem[]> {
  if (process.env.NEXT_PUBLIC_DATA_SOURCE === "api") {
    const response = await apiRequest<BackendGroupResponse[]>(
      API_ENDPOINTS.groups,
    );
    return mapGroupList(response);
  }
  return GROUPS.map((group) => ({
    id: group.id,
    name: group.name,
    emoji: group.emoji,
    color: group.color as GroupListItem["color"],
    memberCount: group.members.length,
    totalSpend: group.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    ),
    balance: 0,
    status: group.status,
    lastActivity: "Recently",
  }));
}

type BackendGroupResponse = Parameters<typeof mapGroupList>[0][number];

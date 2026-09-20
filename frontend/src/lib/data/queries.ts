import {
  ALL_EXPENSES,
  ALL_SETTLEMENTS,
  GROUPS,
  getGroupById as getMockGroupById,
} from "@/src/data/groupData";
import { apiRequest } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_DATA_SOURCE !== "api";

/**
 * Backend seam: route components and feature components should depend on
 * these functions, not on the mock dataset. Their implementations can later
 * be replaced with fetch/server-SDK calls without changing the UI contract.
 */
export async function getGroups() {
  if (!USE_MOCK_DATA) return apiRequest<typeof GROUPS>(API_ENDPOINTS.groups);
  return GROUPS;
}

export async function getGroupById(id: string) {
  if (!USE_MOCK_DATA)
    return apiRequest<Awaited<ReturnType<typeof getMockGroupById>>>(
      `${API_ENDPOINTS.groups}/${encodeURIComponent(id)}`,
    );
  return getMockGroupById(id);
}

export async function getExpenses() {
  if (!USE_MOCK_DATA)
    return apiRequest<typeof ALL_EXPENSES>(API_ENDPOINTS.expenses);
  return ALL_EXPENSES;
}

export async function getSettlements() {
  if (!USE_MOCK_DATA)
    return apiRequest<typeof ALL_SETTLEMENTS>(API_ENDPOINTS.settlements);
  return ALL_SETTLEMENTS;
}

export async function getDashboardData() {
  const [groups, expenses, settlements] = await Promise.all([
    getGroups(),
    getExpenses(),
    getSettlements(),
  ]);

  return { groups, expenses, settlements };
}

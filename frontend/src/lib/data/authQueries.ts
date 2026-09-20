import { apiRequest } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type { ApiUser } from "@/src/lib/api/contracts";

export async function getCurrentUser() {
  return apiRequest<ApiUser>(API_ENDPOINTS.auth.currentUser);
}

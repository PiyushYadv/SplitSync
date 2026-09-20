import { apiRequest } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export async function logout() {
  return apiRequest(API_ENDPOINTS.auth.logout, { method: "POST" });
}

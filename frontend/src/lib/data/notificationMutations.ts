import { apiRequest } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export async function markNotificationRead(id: string) {
  return apiRequest(API_ENDPOINTS.notificationRead(id), { method: "POST" });
}

export async function dismissNotification(id: string) {
  return apiRequest(API_ENDPOINTS.notificationDismiss(id), {
    method: "DELETE",
  });
}

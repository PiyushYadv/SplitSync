import { apiRequest } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export type SettingsPayload = {
  section: string;
  values: Record<string, unknown>;
};

export async function saveSettings(payload: SettingsPayload) {
  return apiRequest(API_ENDPOINTS.settings, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

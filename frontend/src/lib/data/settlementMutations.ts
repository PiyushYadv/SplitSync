import { apiRequest } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export async function markSettlementPaid(id: string) {
  return apiRequest(API_ENDPOINTS.settlementPay(id), { method: "POST" });
}

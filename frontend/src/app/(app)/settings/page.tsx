import { serverApi } from "@/src/lib/api/server";
import SettingsClient from "@/src/features/settings/components/SettingsClient";
import type { Settings } from "@/src/types/domain";

export default async function SettingsPage() {
  const settings = await serverApi<Settings>("/me/settings", "/settings");
  return <SettingsClient initialData={settings} />;
}

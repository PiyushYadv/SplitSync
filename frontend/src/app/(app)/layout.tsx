import { AppProvider } from "@/src/context/AppContext";
import AppShell from "@/src/components/layout/AppShell";
import { serverApi } from "@/src/lib/api/server";
import type { ClientConfig, CurrentUser } from "@/src/types/domain";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Seeding these here means server-rendered "You" labels and feature buttons match
  // the client on hydration, instead of depending on when the requests resolve.
  const [currentUser, config] = await Promise.all([
    serverApi<CurrentUser>("/auth/me"),
    serverApi<ClientConfig>("/config"),
  ]);
  return (
    <AppProvider>
      <AppShell initialUser={currentUser} initialConfig={config}>
        {children}
      </AppShell>
    </AppProvider>
  );
}

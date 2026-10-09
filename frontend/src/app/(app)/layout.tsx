import { AppProvider } from "@/src/context/AppContext";
import AppShell from "@/src/components/layout/AppShell";
import { serverApi } from "@/src/lib/api/server";
import type { CurrentUser } from "@/src/types/domain";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Seeding the current user here means server-rendered "You" labels match the
  // client on hydration, instead of depending on when /auth/me resolves.
  const currentUser = await serverApi<CurrentUser>("/auth/me");
  return (
    <AppProvider>
      <AppShell initialUser={currentUser}>{children}</AppShell>
    </AppProvider>
  );
}

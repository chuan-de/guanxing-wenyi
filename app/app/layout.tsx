import AppShell from "@/components/AppShell";
import { AppStateProvider } from "@/lib/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppStateProvider>
      <AppShell>{children}</AppShell>
    </AppStateProvider>
  );
}

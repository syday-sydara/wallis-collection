import { ClientProviders } from "@/components/ClientProviders";
import { SecurityCenterShell } from "@/components/security/SecurityCenterShell";

export default function SecurityCenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      <SecurityCenterShell>{children}</SecurityCenterShell>
    </ClientProviders>
  );
}

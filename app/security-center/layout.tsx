import { ClientProviders } from "@/components/ClientProviders";
import { SecurityCenterShell } from "@/components/security/SecurityCenterShell";
import { SecurityContextProvider } from "@/components/security/SecurityContext";

export default function SecurityCenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      <SecurityContextProvider>
        <SecurityCenterShell>{children}</SecurityCenterShell>
      </SecurityContextProvider>
    </ClientProviders>
  );
}


import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { SessionProvider } from "next-auth/react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return (
    <SessionProvider session={session}>
      <DashboardShell user={{ name: session.user.name || "Developer", email: session.user.email || "" }}>
        {children}
      </DashboardShell>
    </SessionProvider>
  );
}

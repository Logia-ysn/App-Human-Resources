import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
import type { Role } from "@prisma/client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userEmail = session.user.email!;
  const userRole = session.user.role as Role;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar userRole={userRole} />
        <div className="flex flex-1 flex-col">
          <Header userEmail={userEmail} userRole={userRole} />
          <main className="flex-1 overflow-auto bg-muted/30 p-6">{children}</main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

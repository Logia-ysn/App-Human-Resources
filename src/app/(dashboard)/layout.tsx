import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
import type { Role } from "@prisma/client";

// TODO: Remove DEMO_MODE when database is connected
const DEMO_MODE = process.env.DEMO_MODE !== "false";

const DEMO_USER = {
  email: "admin@company.co.id",
  role: "SUPER_ADMIN" as Role,
  employeeId: null,
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userEmail = DEMO_USER.email;
  let userRole: Role = DEMO_USER.role;

  if (!DEMO_MODE) {
    const session = await auth();
    if (!session?.user) {
      redirect("/login");
    }
    userEmail = session.user.email!;
    userRole = session.user.role as Role;
  }

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

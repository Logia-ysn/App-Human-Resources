import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { AuthProvider } from "@/components/providers/auth-context";
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
  const userEmployeeId = session.user.employeeId ?? null;

  return (
    <SidebarProvider>
      <AuthProvider email={userEmail} role={userRole} employeeId={userEmployeeId}>
        <a href="#main-content" className="skip-to-content">
          Lewati ke konten utama
        </a>
        <div className="flex min-h-screen w-full">
          <div data-print="hide" className="contents">
            <AppSidebar userRole={userRole} userEmail={userEmail} />
          </div>
          <div className="flex flex-1 flex-col">
            <div data-print="hide" className="contents">
              <Header userEmail={userEmail} userRole={userRole} />
            </div>
            <main
              id="main-content"
              tabIndex={-1}
              data-print="region"
              className="flex-1 overflow-auto bg-muted/40 p-4 md:p-6 lg:px-8"
            >
              {children}
            </main>
          </div>
        </div>
        <div data-print="hide">
          <Toaster />
        </div>
      </AuthProvider>
    </SidebarProvider>
  );
}

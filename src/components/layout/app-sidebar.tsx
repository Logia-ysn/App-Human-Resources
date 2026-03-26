"use client";

import {
  Building2,
  Users,
  Building,
  Briefcase,
  Clock,
  CalendarDays,
  Wallet,
  UserPlus,
  BarChart3,
  GraduationCap,
  Settings,
  LayoutDashboard,
  UserCircle,
  FileText,
  ClipboardList,
  Network,
  RefreshCw,
  UserCheck,
  TrendingUp,
  Banknote,
  Receipt,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import type { Role } from "@prisma/client";

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  minRole?: Role;
};

const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 4,
  HR_ADMIN: 3,
  MANAGER: 2,
  EMPLOYEE: 1,
};

const mainNav: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Karyawan", url: "/employees", icon: Users, minRole: "MANAGER" },
  { title: "Departemen", url: "/departments", icon: Building, minRole: "HR_ADMIN" },
  { title: "Jabatan", url: "/positions", icon: Briefcase, minRole: "HR_ADMIN" },
  { title: "Bagan Organisasi", url: "/org-chart", icon: Network, minRole: "MANAGER" },
];

const hrNav: NavItem[] = [
  { title: "Absensi", url: "/attendance", icon: Clock, minRole: "MANAGER" },
  { title: "Cuti", url: "/leave", icon: CalendarDays, minRole: "MANAGER" },
  { title: "Penggajian", url: "/payroll", icon: Wallet, minRole: "MANAGER" },
  { title: "Rekrutmen", url: "/recruitment", icon: UserPlus, minRole: "HR_ADMIN" },
  { title: "Penilaian Kinerja", url: "/performance", icon: BarChart3, minRole: "MANAGER" },
  { title: "Training", url: "/training", icon: GraduationCap, minRole: "MANAGER" },
  { title: "Shift", url: "/shifts", icon: RefreshCw, minRole: "MANAGER" },
];

const lifecycleNav: NavItem[] = [
  { title: "Onboarding", url: "/onboarding", icon: UserCheck, minRole: "HR_ADMIN" },
  { title: "Riwayat Karir", url: "/lifecycle", icon: TrendingUp, minRole: "HR_ADMIN" },
];

const financeNav: NavItem[] = [
  { title: "Kasbon", url: "/expenses/advances", icon: Banknote, minRole: "MANAGER" },
  { title: "Klaim Pengeluaran", url: "/expenses/claims", icon: Receipt, minRole: "MANAGER" },
];

const essNav: NavItem[] = [
  { title: "Profil Saya", url: "/ess/profile", icon: UserCircle },
  { title: "Slip Gaji", url: "/ess/payslips", icon: FileText },
  { title: "Cuti Saya", url: "/ess/leave", icon: CalendarDays },
  { title: "Absensi Saya", url: "/ess/attendance", icon: Clock },
  { title: "Kinerja Saya", url: "/ess/performance", icon: ClipboardList },
  { title: "Training Saya", url: "/ess/training", icon: GraduationCap },
  { title: "Kasbon Saya", url: "/ess/expenses", icon: Banknote },
  { title: "Shift Saya", url: "/ess/shifts", icon: RefreshCw },
];

const systemNav: NavItem[] = [
  { title: "Pengaturan", url: "/settings", icon: Settings, minRole: "SUPER_ADMIN" },
];

function filterByRole(items: ReadonlyArray<NavItem>, role: Role): NavItem[] {
  return items.filter((item) => {
    if (!item.minRole) return true;
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[item.minRole];
  });
}

const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  HR_ADMIN: "HR Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
};

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: ReadonlyArray<NavItem>;
  pathname: string;
}) {
  if (items.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname.startsWith(item.url);
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  render={<Link href={item.url} />}
                  isActive={isActive}
                  className={cn(
                    "transition-all duration-200 ease-in-out hover:bg-accent/80 hover:translate-x-0.5",
                    isActive && "bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 transition-colors duration-200", isActive && "text-blue-600")} />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function getFirstName(email: string): string {
  const local = email.split("@")[0] ?? email;
  const name = local.split(/[._-]/)[0] ?? local;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function AppSidebar({
  userRole,
  userEmail,
}: {
  userRole: Role;
  userEmail: string;
}) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-sidebar-foreground tracking-tight">
            HRIS
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavSection label="Menu Utama" items={filterByRole(mainNav, userRole)} pathname={pathname} />
        <NavSection label="HR Management" items={filterByRole(hrNav, userRole)} pathname={pathname} />
        <NavSection label="Employee Lifecycle" items={filterByRole(lifecycleNav, userRole)} pathname={pathname} />
        <NavSection label="Keuangan" items={filterByRole(financeNav, userRole)} pathname={pathname} />
        <NavSection label="Self Service" items={filterByRole(essNav, userRole)} pathname={pathname} />
        <NavSection label="Sistem" items={filterByRole(systemNav, userRole)} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 opacity-75" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
              {userEmail.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              <span className="sm:hidden">{getFirstName(userEmail)}</span>
              <span className="hidden sm:inline">{userEmail}</span>
            </span>
            <span className="text-[10px] font-medium text-blue-600">
              {ROLE_LABEL[userRole]}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

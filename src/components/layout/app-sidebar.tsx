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
  { title: "Karyawan", url: "/employees", icon: Users },
  { title: "Departemen", url: "/departments", icon: Building, minRole: "HR_ADMIN" },
  { title: "Jabatan", url: "/positions", icon: Briefcase, minRole: "HR_ADMIN" },
  { title: "Bagan Organisasi", url: "/org-chart", icon: Network },
];

const hrNav: NavItem[] = [
  { title: "Absensi", url: "/attendance", icon: Clock },
  { title: "Cuti", url: "/leave", icon: CalendarDays },
  { title: "Penggajian", url: "/payroll", icon: Wallet },
  { title: "Rekrutmen", url: "/recruitment", icon: UserPlus, minRole: "HR_ADMIN" },
  { title: "Penilaian Kinerja", url: "/performance", icon: BarChart3 },
  { title: "Training", url: "/training", icon: GraduationCap },
  { title: "Shift", url: "/shifts", icon: RefreshCw, minRole: "HR_ADMIN" },
];

const lifecycleNav: NavItem[] = [
  { title: "Onboarding", url: "/onboarding", icon: UserCheck, minRole: "HR_ADMIN" },
  { title: "Riwayat Karir", url: "/lifecycle", icon: TrendingUp, minRole: "HR_ADMIN" },
];

const financeNav: NavItem[] = [
  { title: "Kasbon", url: "/expenses/advances", icon: Banknote },
  { title: "Klaim Pengeluaran", url: "/expenses/claims", icon: Receipt },
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

function filterByRole(items: NavItem[], role: Role): NavItem[] {
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
  items: NavItem[];
  pathname: string;
}) {
  if (items.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                render={<Link href={item.url} />}
                isActive={pathname.startsWith(item.url)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
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
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-base font-bold text-sidebar-foreground">
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

      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {userEmail}
            </span>
            <span className="text-[11px] font-medium text-blue-600">
              {ROLE_LABEL[userRole]}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

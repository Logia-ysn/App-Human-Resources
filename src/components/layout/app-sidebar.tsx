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
];

const hrNav: NavItem[] = [
  { title: "Absensi", url: "/attendance", icon: Clock },
  { title: "Cuti", url: "/leave", icon: CalendarDays },
  { title: "Penggajian", url: "/payroll", icon: Wallet },
  { title: "Rekrutmen", url: "/recruitment", icon: UserPlus, minRole: "HR_ADMIN" },
  { title: "Penilaian Kinerja", url: "/performance", icon: BarChart3 },
  { title: "Training", url: "/training", icon: GraduationCap },
];

const essNav: NavItem[] = [
  { title: "Profil Saya", url: "/ess/profile", icon: UserCircle },
  { title: "Slip Gaji", url: "/ess/payslips", icon: FileText },
  { title: "Cuti Saya", url: "/ess/leave", icon: CalendarDays },
  { title: "Absensi Saya", url: "/ess/attendance", icon: Clock },
  { title: "Kinerja Saya", url: "/ess/performance", icon: ClipboardList },
  { title: "Training Saya", url: "/ess/training", icon: GraduationCap },
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

export function AppSidebar({ userRole }: { userRole: Role }) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-primary/60">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight text-sidebar-foreground">
              HRIS
            </span>
            <span className="text-[11px] leading-tight text-sidebar-foreground/50">
              Human Resources
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavSection label="Menu Utama" items={filterByRole(mainNav, userRole)} pathname={pathname} />
        <NavSection label="HR Management" items={filterByRole(hrNav, userRole)} pathname={pathname} />
        <NavSection label="Self Service" items={filterByRole(essNav, userRole)} pathname={pathname} />
        <NavSection label="Sistem" items={filterByRole(systemNav, userRole)} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        <p className="text-[11px] text-sidebar-foreground/40">
          HRIS v1.0 | 2026
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}

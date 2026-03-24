"use client";

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Bell, ChevronRight, LogOut, Search, User } from "lucide-react";
import Link from "next/link";

type HeaderProps = {
  userEmail: string;
  userRole: string;
};

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  HR_ADMIN: "HR Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Karyawan",
};

const SECTION_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/employees": "Karyawan",
  "/departments": "Departemen",
  "/positions": "Jabatan",
  "/attendance": "Absensi",
  "/leave": "Cuti",
  "/payroll": "Penggajian",
  "/recruitment": "Rekrutmen",
  "/performance": "Penilaian Kinerja",
  "/training": "Training",
  "/ess/profile": "Profil Saya",
  "/ess/payslips": "Slip Gaji",
  "/ess/leave": "Cuti Saya",
  "/ess/attendance": "Absensi Saya",
  "/ess/performance": "Kinerja Saya",
  "/ess/training": "Training Saya",
  "/settings": "Pengaturan",
  "/notifications": "Notifikasi",
  "/org-chart": "Bagan Organisasi",
  "/onboarding": "Onboarding",
  "/lifecycle": "Riwayat Karir",
  "/expenses/advances": "Kasbon Karyawan",
  "/expenses/claims": "Klaim Pengeluaran",
  "/shifts": "Manajemen Shift",
  "/ess/expenses": "Kasbon & Klaim Saya",
  "/ess/shifts": "Jadwal Shift Saya",
};

const SECTION_PARENTS: Record<string, { label: string; href: string }> = {
  "/employees": { label: "Menu Utama", href: "/dashboard" },
  "/departments": { label: "Menu Utama", href: "/dashboard" },
  "/positions": { label: "Menu Utama", href: "/dashboard" },
  "/org-chart": { label: "Menu Utama", href: "/dashboard" },
  "/attendance": { label: "HR Management", href: "/dashboard" },
  "/leave": { label: "HR Management", href: "/dashboard" },
  "/payroll": { label: "HR Management", href: "/dashboard" },
  "/recruitment": { label: "HR Management", href: "/dashboard" },
  "/performance": { label: "HR Management", href: "/dashboard" },
  "/training": { label: "HR Management", href: "/dashboard" },
  "/shifts": { label: "HR Management", href: "/dashboard" },
  "/onboarding": { label: "Employee Lifecycle", href: "/dashboard" },
  "/lifecycle": { label: "Employee Lifecycle", href: "/dashboard" },
  "/expenses/advances": { label: "Keuangan", href: "/dashboard" },
  "/expenses/claims": { label: "Keuangan", href: "/dashboard" },
  "/ess/profile": { label: "Self Service", href: "/dashboard" },
  "/ess/payslips": { label: "Self Service", href: "/dashboard" },
  "/ess/leave": { label: "Self Service", href: "/dashboard" },
  "/ess/attendance": { label: "Self Service", href: "/dashboard" },
  "/ess/performance": { label: "Self Service", href: "/dashboard" },
  "/ess/training": { label: "Self Service", href: "/dashboard" },
  "/ess/expenses": { label: "Self Service", href: "/dashboard" },
  "/ess/shifts": { label: "Self Service", href: "/dashboard" },
  "/settings": { label: "Sistem", href: "/dashboard" },
};

function getPageTitle(pathname: string): string {
  const exact = SECTION_TITLES[pathname];
  if (exact) return exact;

  const match = Object.entries(SECTION_TITLES).find(([path]) =>
    pathname.startsWith(path)
  );
  return match ? match[1] : "Dashboard";
}

function getParent(pathname: string): { label: string; href: string } | null {
  const exact = SECTION_PARENTS[pathname];
  if (exact) return exact;

  const match = Object.entries(SECTION_PARENTS).find(([path]) =>
    pathname.startsWith(path)
  );
  return match ? match[1] : null;
}

function handleSearchClick() {
  alert("Coming soon");
}

export function Header({ userEmail, userRole }: HeaderProps) {
  const pathname = usePathname();
  const initials = userEmail.slice(0, 2).toUpperCase();
  const pageTitle = getPageTitle(pathname);
  const parent = getParent(pathname);

  return (
    <header className="flex h-12 items-center gap-3 border-b bg-background px-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />

      {/* Page title: breadcrumb on desktop, plain title on mobile, hidden on very small screens */}
      <div className="flex-1 min-w-0">
        {/* Mobile: plain title, hidden below 400px */}
        <h1 className="truncate text-sm font-semibold text-foreground md:hidden max-[399px]:hidden">
          {pageTitle}
        </h1>
        {/* Desktop: breadcrumb style */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm">
          {parent ? (
            <>
              <Link
                href={parent.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                {parent.label}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              <span className="font-semibold text-foreground">{pageTitle}</span>
            </>
          ) : (
            <span className="font-semibold text-foreground">{pageTitle}</span>
          )}
        </nav>
      </div>

      {/* Search button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleSearchClick}
      >
        <Search className="h-4 w-4" />
      </Button>

      {/* Notification bell with badge */}
      <Link href="/notifications">
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>
      </Link>

      {/* User avatar with hover ring animation */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent transition-all duration-200 hover:ring-blue-400/50 hover:ring-offset-1">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1.5">
              <p className="text-sm font-medium">{userEmail}</p>
              <Badge variant="secondary" className="w-fit text-[10px]">
                {ROLE_LABEL[userRole] || userRole}
              </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/ess/profile" className="flex items-center w-full">
              <User className="mr-2 h-4 w-4" />
              Profil Saya
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

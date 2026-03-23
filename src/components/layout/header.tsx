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
import { Bell, LogOut, User } from "lucide-react";
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
};

function getPageTitle(pathname: string): string {
  const exact = SECTION_TITLES[pathname];
  if (exact) return exact;

  const match = Object.entries(SECTION_TITLES).find(([path]) =>
    pathname.startsWith(path)
  );
  return match ? match[1] : "Dashboard";
}

export function Header({ userEmail, userRole }: HeaderProps) {
  const pathname = usePathname();
  const initials = userEmail.slice(0, 2).toUpperCase();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />

      <div className="flex-1">
        <h1 className="text-sm font-semibold text-foreground">{pageTitle}</h1>
      </div>

      <Link href="/notifications">
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="h-8 w-8 cursor-pointer bg-primary">
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

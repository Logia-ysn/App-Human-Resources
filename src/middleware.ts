import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";

const PUBLIC_ROUTES = ["/login", "/forgot-password"];

const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 4,
  HR_ADMIN: 3,
  MANAGER: 2,
  EMPLOYEE: 1,
};

type RoutePermission = {
  pattern: RegExp;
  minRole: Role;
};

const ROUTE_PERMISSIONS: RoutePermission[] = [
  { pattern: /^\/settings/, minRole: "SUPER_ADMIN" },
  { pattern: /^\/employees\/new/, minRole: "HR_ADMIN" },
  { pattern: /^\/employees\/.*\/edit/, minRole: "HR_ADMIN" },
  { pattern: /^\/payroll\/run/, minRole: "HR_ADMIN" },
  { pattern: /^\/payroll\/components/, minRole: "HR_ADMIN" },
  { pattern: /^\/recruitment/, minRole: "HR_ADMIN" },
  { pattern: /^\/departments/, minRole: "HR_ADMIN" },
  { pattern: /^\/positions/, minRole: "HR_ADMIN" },
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Skip public routes and API auth routes
  if (
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/api/auth")
  ) {
    // Redirect to dashboard if already logged in
    if (req.auth && PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect root to dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Check role-based route permissions
  const userRole = req.auth.user.role as Role;
  for (const permission of ROUTE_PERMISSIONS) {
    if (permission.pattern.test(pathname)) {
      if (
        ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[permission.minRole]
      ) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      break;
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

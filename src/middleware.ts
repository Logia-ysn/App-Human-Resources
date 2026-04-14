import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

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
  // Super Admin only
  { pattern: /^\/settings/, minRole: "SUPER_ADMIN" },

  // HR Admin only — admin CRUD pages
  { pattern: /^\/employees\/new/, minRole: "HR_ADMIN" },
  { pattern: /^\/employees\/.*\/edit/, minRole: "HR_ADMIN" },
  { pattern: /^\/departments/, minRole: "HR_ADMIN" },
  { pattern: /^\/positions/, minRole: "HR_ADMIN" },
  { pattern: /^\/recruitment/, minRole: "HR_ADMIN" },
  { pattern: /^\/onboarding/, minRole: "HR_ADMIN" },
  { pattern: /^\/lifecycle/, minRole: "HR_ADMIN" },

  // Manager+ — employee list, org chart, admin operational pages
  { pattern: /^\/employees/, minRole: "MANAGER" },
  { pattern: /^\/org-chart/, minRole: "MANAGER" },
  { pattern: /^\/attendance/, minRole: "MANAGER" },
  { pattern: /^\/leave/, minRole: "MANAGER" },
  { pattern: /^\/payroll/, minRole: "MANAGER" },
  { pattern: /^\/performance/, minRole: "MANAGER" },
  { pattern: /^\/training/, minRole: "MANAGER" },
  { pattern: /^\/shifts/, minRole: "MANAGER" },
  { pattern: /^\/expenses\/advances$/, minRole: "MANAGER" },
  { pattern: /^\/expenses\/claims$/, minRole: "MANAGER" },
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Rate limit credentials login endpoint (5 attempts per minute per IP)
  if (
    pathname === "/api/auth/callback/credentials" &&
    req.method === "POST"
  ) {
    const ip = getClientIp(req.headers);
    const rl = rateLimit(`login:${ip}`, 5, 60_000);
    if (!rl.ok) {
      return new NextResponse(
        JSON.stringify({ success: false, data: null, error: "Terlalu banyak percobaan login. Coba lagi dalam 1 menit." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }
  }

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

  // Force password change before accessing any other page.
  // Skip API routes — they should return JSON, not a redirect.
  // The /api/auth/change-password route itself is the only API needed
  // while in this state.
  if (
    req.auth.user.mustChangePassword &&
    !pathname.startsWith("/api/") &&
    pathname !== "/change-password"
  ) {
    return NextResponse.redirect(new URL("/change-password", req.url));
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

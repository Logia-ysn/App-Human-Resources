import type { Role } from "@prisma/client";

const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 4,
  HR_ADMIN: 3,
  MANAGER: 2,
  EMPLOYEE: 1,
};

export function hasMinRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isAdmin(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "HR_ADMIN";
}

export function isSuperAdmin(role: Role): boolean {
  return role === "SUPER_ADMIN";
}

type RoutePermission = {
  pattern: RegExp;
  minRole: Role;
};

const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Super Admin only
  { pattern: /^\/settings/, minRole: "SUPER_ADMIN" },
  // HR Admin only
  { pattern: /^\/employees\/new/, minRole: "HR_ADMIN" },
  { pattern: /^\/employees\/.*\/edit/, minRole: "HR_ADMIN" },
  { pattern: /^\/departments/, minRole: "HR_ADMIN" },
  { pattern: /^\/positions/, minRole: "HR_ADMIN" },
  { pattern: /^\/recruitment/, minRole: "HR_ADMIN" },
  { pattern: /^\/onboarding/, minRole: "HR_ADMIN" },
  { pattern: /^\/lifecycle/, minRole: "HR_ADMIN" },
  { pattern: /^\/profile-requests/, minRole: "HR_ADMIN" },
  // Manager+
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
  // All authenticated
  { pattern: /^\/ess/, minRole: "EMPLOYEE" },
  { pattern: /^\/dashboard/, minRole: "EMPLOYEE" },
];

export function canAccessRoute(role: Role, pathname: string): boolean {
  for (const permission of ROUTE_PERMISSIONS) {
    if (permission.pattern.test(pathname)) {
      return hasMinRole(role, permission.minRole);
    }
  }
  return true;
}

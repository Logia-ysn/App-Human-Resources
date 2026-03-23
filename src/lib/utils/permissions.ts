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
  { pattern: /^\/settings/, minRole: "SUPER_ADMIN" },
  { pattern: /^\/employees\/new/, minRole: "HR_ADMIN" },
  { pattern: /^\/employees\/.*\/edit/, minRole: "HR_ADMIN" },
  { pattern: /^\/payroll\/run/, minRole: "HR_ADMIN" },
  { pattern: /^\/payroll\/components/, minRole: "HR_ADMIN" },
  { pattern: /^\/recruitment/, minRole: "HR_ADMIN" },
  { pattern: /^\/departments/, minRole: "HR_ADMIN" },
  { pattern: /^\/positions/, minRole: "HR_ADMIN" },
  { pattern: /^\/training\/new/, minRole: "HR_ADMIN" },
  { pattern: /^\/ess/, minRole: "EMPLOYEE" },
  { pattern: /^\/dashboard/, minRole: "EMPLOYEE" },
  { pattern: /^\/employees/, minRole: "EMPLOYEE" },
  { pattern: /^\/attendance/, minRole: "EMPLOYEE" },
  { pattern: /^\/leave/, minRole: "EMPLOYEE" },
  { pattern: /^\/payroll/, minRole: "EMPLOYEE" },
  { pattern: /^\/performance/, minRole: "EMPLOYEE" },
  { pattern: /^\/training/, minRole: "EMPLOYEE" },
];

export function canAccessRoute(role: Role, pathname: string): boolean {
  for (const permission of ROUTE_PERMISSIONS) {
    if (permission.pattern.test(pathname)) {
      return hasMinRole(role, permission.minRole);
    }
  }
  return true;
}

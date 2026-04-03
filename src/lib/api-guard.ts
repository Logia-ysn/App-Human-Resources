import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";
import { hasMinRole } from "@/lib/utils/permissions";
import { errorResponse } from "@/types/api";

export type AuthSession = {
  user: {
    id: string;
    email: string;
    role: Role;
    employeeId: string | null;
  };
};

type GuardOptions = {
  minRole?: Role;
};

/**
 * Protects API routes by checking authentication and optional role.
 * Returns the session on success, or a NextResponse error on failure.
 */
export async function apiGuard(
  options: GuardOptions = {}
): Promise<AuthSession | NextResponse> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const userRole = session.user.role as Role;

  if (options.minRole && !hasMinRole(userRole, options.minRole)) {
    return NextResponse.json(errorResponse("Forbidden"), { status: 403 });
  }

  return session as AuthSession;
}

/** Type guard to check if apiGuard returned an error response */
export function isGuardError(
  result: AuthSession | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}

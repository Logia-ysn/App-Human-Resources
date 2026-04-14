import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "PASSWORD_CHANGED"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "RESET_DATA"
  | "RESEED_DATA"
  | "CONFIG_UPDATE"
  | "COMPANY_UPDATE"
  | "COMPANY_CREATE"
  | "APPROVE_LEAVE"
  | "REJECT_LEAVE";

type AuditEntry = {
  userId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
  redactFields?: string[];
};

/**
 * Returns a shallow copy of `obj` with the specified fields replaced by "[REDACTED]".
 * Handles plain objects and arrays of plain objects.
 */
export function sanitizeForAudit(obj: unknown, fieldsToRedact: string[]): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForAudit(item, fieldsToRedact));
  }
  if (typeof obj === "object") {
    const result: Record<string, unknown> = { ...(obj as Record<string, unknown>) };
    for (const field of fieldsToRedact) {
      if (field in result) {
        result[field] = "[REDACTED]";
      }
    }
    return result;
  }
  return obj;
}

const MAX_VALUE_BYTES = 8_000;

function clamp(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  const serialized = JSON.stringify(value);
  if (serialized.length > MAX_VALUE_BYTES) {
    return { _truncated: true, preview: serialized.slice(0, MAX_VALUE_BYTES) };
  }
  return value as Prisma.InputJsonValue;
}

/**
 * Persist an audit trail entry. Intentionally swallows errors: audit logging
 * must never abort the primary mutation. Callers should await so entries land
 * in the expected order.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  const redact = entry.redactFields ?? [];
  const safeOld = redact.length > 0 ? sanitizeForAudit(entry.oldValues, redact) : entry.oldValues;
  const safeNew = redact.length > 0 ? sanitizeForAudit(entry.newValues, redact) : entry.newValues;

  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        oldValues: clamp(safeOld),
        newValues: clamp(safeNew),
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
      },
    });
  } catch (err) {
    console.error("[audit] failed to record entry", {
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      err: err instanceof Error ? err.message : err,
    });
  }
}

export function getRequestMeta(headers: Headers): { ipAddress: string | null; userAgent: string | null } {
  const forwarded = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const ipAddress = forwarded?.split(",")[0]?.trim() || realIp || null;
  const userAgent = headers.get("user-agent");
  return { ipAddress, userAgent };
}

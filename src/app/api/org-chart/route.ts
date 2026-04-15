import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse } from "@/types/api";

type OrgNode = {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  department: { id: string; name: string };
  position: { id: string; name: string };
  managerId: string | null;
  children: OrgNode[];
};

function buildTree(employees: Omit<OrgNode, "children">[]): OrgNode[] {
  const byId = new Map<string, OrgNode>();
  employees.forEach((e) => byId.set(e.id, { ...e, children: [] }));

  const roots: OrgNode[] = [];
  byId.forEach((node) => {
    if (node.managerId && byId.has(node.managerId)) {
      byId.get(node.managerId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export async function GET(_req: NextRequest) {
  const session = await apiGuard({ minRole: "EMPLOYEE" });
  if (isGuardError(session)) return session;

  const employees = await prisma.employee.findMany({
    where: { isDeleted: false, status: { in: ["ACTIVE", "PROBATION"] } },
    orderBy: [{ position: { level: "asc" } }, { firstName: "asc" }],
    select: {
      id: true,
      employeeNumber: true,
      firstName: true,
      lastName: true,
      email: true,
      managerId: true,
      department: { select: { id: true, name: true } },
      position: { select: { id: true, name: true } },
    },
  });

  const tree = buildTree(employees);
  return NextResponse.json(successResponse(tree));
}

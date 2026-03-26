"use client";

import { useState, useMemo, useCallback } from "react";
import { Network, ChevronDown, ChevronRight, Users } from "lucide-react";
import type { Employee } from "@/lib/dummy-data";
import { useAppStore } from "@/lib/store/app-store";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TreeNode = {
  readonly employee: Employee;
  readonly children: readonly TreeNode[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function buildTree(employees: readonly Employee[]): readonly TreeNode[] {
  const childrenMap = new Map<string | null, Employee[]>();

  for (const emp of employees) {
    const key = emp.managerId ?? null;
    const existing = childrenMap.get(key);
    if (existing) {
      existing.push(emp);
    } else {
      childrenMap.set(key, [emp]);
    }
  }

  function buildNodes(parentId: string | null): readonly TreeNode[] {
    const kids = childrenMap.get(parentId) ?? [];
    return kids.map((emp) => ({
      employee: emp,
      children: buildNodes(emp.id),
    }));
  }

  return buildNodes(null);
}

function collectIds(nodes: readonly TreeNode[]): ReadonlySet<string> {
  const ids = new Set<string>();
  function walk(list: readonly TreeNode[]) {
    for (const n of list) {
      ids.add(n.employee.id);
      walk(n.children);
    }
  }
  walk(nodes);
  return ids;
}

// ---------------------------------------------------------------------------
// Status colour mapping
// ---------------------------------------------------------------------------

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  PROBATION: "secondary",
  RESIGNED: "destructive",
  TERMINATED: "destructive",
  RETIRED: "outline",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Aktif",
  PROBATION: "Probation",
  RESIGNED: "Resign",
  TERMINATED: "Diberhentikan",
  RETIRED: "Pensiun",
};

// ---------------------------------------------------------------------------
// OrgNode component
// ---------------------------------------------------------------------------

function OrgNode({
  node,
  expandedIds,
  onToggle,
  isLast,
}: {
  readonly node: TreeNode;
  readonly expandedIds: ReadonlySet<string>;
  readonly onToggle: (id: string) => void;
  readonly isLast: boolean;
}) {
  const { employee, children } = node;
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(employee.id);

  return (
    <div className="flex flex-col">
      {/* Card for the employee */}
      <div className="flex items-start gap-2">
        {/* Connector dot */}
        <div className="flex flex-col items-center pt-4">
          <div className="size-2 rounded-full bg-primary/40" />
          {!isLast && <div className="w-px flex-1 bg-border" />}
        </div>

        <button
          type="button"
          className="group/node flex w-full cursor-default items-center gap-3 rounded-xl border bg-card p-3 text-left ring-1 ring-foreground/5 transition-shadow hover:shadow-md"
          onClick={hasChildren ? () => onToggle(employee.id) : undefined}
          aria-expanded={hasChildren ? isExpanded : undefined}
        >
          {/* Avatar */}
          <Avatar size="lg">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {getInitials(employee.firstName, employee.lastName)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium leading-tight">
              {employee.firstName} {employee.lastName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {employee.positionName}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] px-1.5 h-4">
                {employee.departmentName}
              </Badge>
              <Badge
                variant={STATUS_VARIANT[employee.status] ?? "secondary"}
                className="text-[10px] px-1.5 h-4"
              >
                {STATUS_LABEL[employee.status] ?? employee.status}
              </Badge>
            </div>
          </div>

          {/* Expand / collapse toggle */}
          {hasChildren && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="size-3.5" />
              <span>{children.length}</span>
              {isExpanded ? (
                <ChevronDown className="size-4 transition-transform" />
              ) : (
                <ChevronRight className="size-4 transition-transform" />
              )}
            </div>
          )}
        </button>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-6 border-l border-border pl-4 pt-1">
          {children.map((child, idx) => (
            <OrgNode
              key={child.employee.id}
              node={child}
              expandedIds={expandedIds}
              onToggle={onToggle}
              isLast={idx === children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function OrgChartPage() {
  const allEmployees = useAppStore((s) => s.employees);

  const activeEmployees = useMemo(
    () => allEmployees.filter((emp) => !emp.isDeleted),
    [allEmployees],
  );

  const tree = useMemo(() => buildTree(activeEmployees), [activeEmployees]);

  // Start with the first two levels expanded (roots + their direct reports)
  const initialExpanded = useMemo(() => {
    const ids = new Set<string>();
    for (const root of tree) {
      ids.add(root.employee.id);
    }
    return ids;
  }, [tree]);

  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(initialExpanded);

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    setExpandedIds(collectIds(tree));
  }, [tree]);

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const totalCount = activeEmployees.length;
  const rootCount = tree.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bagan Organisasi"
        subtitle={`${totalCount} karyawan aktif dalam ${rootCount} cabang utama`}
        icon={Network}
      />

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-md border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={handleExpandAll}
        >
          Expand Semua
        </button>
        <button
          type="button"
          className="rounded-md border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={handleCollapseAll}
        >
          Collapse Semua
        </button>
      </div>

      {/* Org chart tree */}
      <Card>
        <CardContent className="py-6">
          {tree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Network className="mb-3 size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Belum ada data struktur organisasi.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {tree.map((rootNode, idx) => (
                <OrgNode
                  key={rootNode.employee.id}
                  node={rootNode}
                  expandedIds={expandedIds}
                  onToggle={handleToggle}
                  isLast={idx === tree.length - 1}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

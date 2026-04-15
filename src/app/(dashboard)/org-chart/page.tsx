"use client";

import { Network, ChevronRight, Mail } from "lucide-react";
import { useOrgChart, type OrgNode } from "@/hooks/use-org-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/loading-state";

function getInitials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function NodeCard({ node, depth }: { node: OrgNode; depth: number }) {
  const hasChildren = node.children.length > 0;
  return (
    <div className="relative">
      <div
        className="flex items-center gap-3 rounded-sm border border-border bg-card p-3 transition-colors hover:bg-muted/40"
        style={{ marginLeft: depth * 8 }}
      >
        <Avatar className="size-10 border border-border">
          <AvatarFallback className="rounded-sm bg-muted/60 text-sm font-semibold text-muted-foreground">
            {getInitials(node.firstName, node.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-sm truncate">
              {node.firstName} {node.lastName}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {node.employeeNumber}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-[11px] h-5 px-1.5">
              {node.position.name}
            </Badge>
            <span className="text-xs text-muted-foreground">{node.department.name}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">{node.email}</span>
          </div>
        </div>
        {hasChildren && (
          <Badge variant="secondary" className="gap-1 shrink-0">
            <ChevronRight className="h-3 w-3" />
            {node.children.length}
          </Badge>
        )}
      </div>
      {hasChildren && (
        <div className="mt-2 ml-4 border-l-2 border-dashed border-muted pl-4 space-y-2">
          {node.children.map((child) => (
            <NodeCard key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  const { tree, isLoading } = useOrgChart();

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2.5 border-b border-border pb-4">
        <Network className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Struktur Organisasi</h1>
          <p className="text-xs text-muted-foreground">
            Hierarki karyawan berdasarkan atasan langsung
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bagan Organisasi</CardTitle>
        </CardHeader>
        <CardContent>
          {tree.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-10">
              Belum ada data hirarki karyawan.
            </p>
          ) : (
            <div className="space-y-3">
              {tree.map((root) => (
                <NodeCard key={root.id} node={root} depth={0} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

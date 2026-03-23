"use client";

import { leaveBalances, leaveRequests } from "@/lib/dummy-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { CalendarDays } from "lucide-react";

export default function EssLeavePage() {
  // Demo: emp-2 (Sari Dewi)
  const myBalances = leaveBalances.filter((b) => b.employeeId === "emp-2");
  const myRequests = leaveRequests.filter((r) => r.employeeId === "emp-2");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Cuti Saya</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {myBalances.map((b) => (
          <Card key={b.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{b.leaveTypeName}</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{b.entitlement + b.carried - b.used - b.pending}</div>
              <p className="text-xs text-muted-foreground">
                Sisa dari {b.entitlement + b.carried} hari (terpakai {b.used}, pending {b.pending})
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Riwayat Pengajuan Cuti</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipe Cuti</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jumlah Hari</TableHead>
                <TableHead>Alasan</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myRequests.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Belum ada pengajuan cuti.</TableCell></TableRow>
              ) : (
                myRequests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.leaveTypeName}</TableCell>
                    <TableCell>{r.startDate} — {r.endDate}</TableCell>
                    <TableCell>{r.totalDays} hari</TableCell>
                    <TableCell>{r.reason}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

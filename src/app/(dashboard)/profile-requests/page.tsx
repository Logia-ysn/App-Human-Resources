"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Loader2,
  UserCircle,
} from "lucide-react";

import {
  useProfileChangeRequests,
  useResolveProfileChangeRequest,
} from "@/hooks/use-profile-change-requests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingState } from "@/components/shared/loading-state";
import Link from "next/link";
import type { ProfileChangeRequestRecord } from "@/hooks/use-profile-change-requests";

type Outcome = "RESOLVED" | "REJECTED";

export default function ProfileRequestsPage() {
  const { requests, isLoading, mutate } = useProfileChangeRequests();

  const [target, setTarget] = useState<ProfileChangeRequestRecord | null>(null);
  const [outcome, setOutcome] = useState<Outcome>("RESOLVED");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const resolveHook = useResolveProfileChangeRequest(target?.id ?? "");

  const pending = requests.filter((r) => r.status === "PENDING");
  const history = requests.filter((r) => r.status !== "PENDING");

  function openDialog(req: ProfileChangeRequestRecord, initial: Outcome) {
    setTarget(req);
    setOutcome(initial);
    setNote("");
  }

  async function handleSubmit() {
    if (!target) return;
    setSaving(true);
    try {
      await resolveHook.trigger({
        status: outcome,
        handledNote: note.trim() || null,
      });
      toast.success(
        outcome === "RESOLVED"
          ? "Permintaan ditandai sudah diproses"
          : "Permintaan ditolak"
      );
      setTarget(null);
      await mutate();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memproses permintaan");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5 border-b border-border pb-4">
        <MessageSquare className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Permintaan Perubahan Profil</h1>
          <p className="text-xs text-muted-foreground">
            Daftar permintaan perubahan data profil dari karyawan
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Menunggu ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Riwayat ({history.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          {pending.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Tidak ada permintaan yang menunggu.
              </CardContent>
            </Card>
          ) : (
            pending.map((r) => (
              <Card key={r.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base">
                        {r.employee.firstName} {r.employee.lastName}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {r.employee.employeeNumber} · {r.employee.department.name} ·{" "}
                        {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true, locale: idLocale })}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      Menunggu
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="whitespace-pre-wrap break-words text-sm">
                    {r.message}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                    <Link
                      href={`/employees/${r.employee.id}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <UserCircle className="h-3.5 w-3.5" />
                      Buka data karyawan
                    </Link>
                    <div className="ml-auto flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(r, "RESOLVED")}
                      >
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Tandai Selesai
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDialog(r, "REJECTED")}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Tolak
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          {history.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Belum ada riwayat permintaan.
              </CardContent>
            </Card>
          ) : (
            history.map((r) => (
              <Card key={r.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base">
                        {r.employee.firstName} {r.employee.lastName}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {r.employee.employeeNumber} · {r.employee.department.name} ·{" "}
                        {r.handledAt
                          ? format(new Date(r.handledAt), "dd MMM yyyy HH:mm", { locale: idLocale })
                          : "—"}
                        {r.handler && ` · ${r.handler.firstName} ${r.handler.lastName}`}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        r.status === "RESOLVED"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "border-destructive/40 bg-destructive/10 text-destructive"
                      }
                    >
                      {r.status === "RESOLVED" ? "Selesai" : "Ditolak"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="whitespace-pre-wrap break-words text-sm">{r.message}</p>
                  {r.handledNote && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Catatan HR:</span> {r.handledNote}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={target !== null} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {outcome === "RESOLVED" ? "Tandai Sudah Diproses" : "Tolak Permintaan"}
            </DialogTitle>
            <DialogDescription>
              {outcome === "RESOLVED"
                ? "Konfirmasikan bahwa perubahan data sudah Anda lakukan di halaman Karyawan."
                : "Beri alasan singkat kenapa permintaan ini ditolak. Alasan akan dikirim ke karyawan."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="note">
              Catatan {outcome === "REJECTED" ? "(wajib)" : "(opsional)"}
            </Label>
            <Textarea
              id="note"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                outcome === "RESOLVED"
                  ? "Misal: Nomor HP dan alamat sudah diperbarui."
                  : "Misal: Data sudah sesuai KTP, mohon lampirkan bukti dokumen."
              }
              disabled={saving}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)} disabled={saving}>
              Batal
            </Button>
            <Button
              variant={outcome === "REJECTED" ? "destructive" : "default"}
              onClick={handleSubmit}
              disabled={saving || (outcome === "REJECTED" && note.trim().length < 3)}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {outcome === "RESOLVED" ? "Tandai Selesai" : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

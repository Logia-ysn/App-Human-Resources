"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/components/providers/auth-context";
import { useEmployee, useUpdateEmployeePhoto } from "@/hooks/use-employees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { UserCircle, Briefcase, MapPin, Phone, Mail, Shield, Camera, Trash2, Loader2, PencilLine, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { LoadingState } from "@/components/shared/loading-state";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useProfileChangeRequests,
  useCreateProfileChangeRequest,
} from "@/hooks/use-profile-change-requests";
import { formatDistanceToNow } from "date-fns";

const GENDER_LABEL: Record<string, string> = { MALE: "Laki-laki", FEMALE: "Perempuan" };
const RELIGION_LABEL: Record<string, string> = { ISLAM: "Islam", KRISTEN: "Kristen", KATOLIK: "Katolik", HINDU: "Hindu", BUDDHA: "Buddha", KONGHUCU: "Konghucu", LAINNYA: "Lainnya" };
const MARITAL_LABEL: Record<string, string> = { SINGLE: "Belum Menikah", MARRIED: "Menikah", DIVORCED: "Cerai Hidup", WIDOWED: "Cerai Mati" };

const MAX_PHOTO_MB = 2;

function InfoItem({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || "-"}</p>
    </div>
  );
}

export default function EssProfilePage() {
  const { employeeId } = useAuth();
  const { employee: emp, isLoading, mutate } = useEmployee(employeeId);
  const updatePhoto = useUpdateEmployeePhoto(employeeId ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const {
    requests: myChangeRequests,
    isLoading: changeLoading,
    mutate: mutateChangeRequests,
  } = useProfileChangeRequests();
  const createChange = useCreateProfileChangeRequest();

  const [changeDialogOpen, setChangeDialogOpen] = useState(false);
  const [changeMessage, setChangeMessage] = useState("");
  const [submittingChange, setSubmittingChange] = useState(false);

  async function handleSubmitChange() {
    const trimmed = changeMessage.trim();
    if (trimmed.length < 5) {
      toast.error("Pesan minimal 5 karakter");
      return;
    }
    setSubmittingChange(true);
    try {
      await createChange.trigger({ message: trimmed });
      toast.success("Permintaan dikirim ke HR");
      setChangeMessage("");
      setChangeDialogOpen(false);
      await mutateChangeRequests();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim permintaan");
    } finally {
      setSubmittingChange(false);
    }
  }

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  if (!emp) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-2">
          <UserCircle className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-lg font-medium">Data karyawan tidak ditemukan</p>
          <p className="text-sm text-muted-foreground">
            Akun Anda belum terhubung dengan data karyawan.
          </p>
        </div>
      </div>
    );
  }

  const initials = `${emp.firstName[0]}${emp.lastName[0]}`;
  const departmentName = emp.department.name;
  const positionName = emp.position.name;
  const managerName = emp.manager
    ? `${emp.manager.firstName} ${emp.manager.lastName}`
    : null;

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      toast.error(`Ukuran foto maksimal ${MAX_PHOTO_MB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      setUploading(true);
      try {
        await updatePhoto.trigger({ photoUrl: dataUrl });
        await mutate();
        toast.success("Foto profil berhasil diperbarui");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Gagal mengunggah foto");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleRemovePhoto() {
    setUploading(true);
    try {
      await updatePhoto.trigger({ photoUrl: null });
      await mutate();
      toast.success("Foto profil dihapus");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus foto");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <UserCircle className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Profil Saya</h1>
            <p className="text-xs text-muted-foreground">Informasi profil dan data kepegawaian Anda</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setChangeDialogOpen(true)}>
          <PencilLine className="mr-1.5 h-4 w-4" />
          Ajukan Perubahan Profil
        </Button>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 rounded-sm">
                {emp.photoUrl ? (
                  <AvatarImage src={emp.photoUrl} alt={`Foto ${emp.firstName}`} className="rounded-sm" />
                ) : null}
                <AvatarFallback className="rounded-sm bg-primary text-primary-foreground font-semibold text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                title="Ubah foto profil"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold tracking-tight">{emp.firstName} {emp.lastName}</h2>
              <p className="text-sm text-muted-foreground">{positionName} — {departmentName}</p>
              {emp.photoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploading}
                  onClick={handleRemovePhoto}
                  className="mt-1 h-auto px-2 py-1 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Hapus foto
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={emp.status} />
              <Badge variant="outline" className="font-medium">{emp.type === "PERMANENT" ? "Tetap (PKWTT)" : emp.type}</Badge>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" strokeWidth={1.75} />{emp.email}</span>
            <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" strokeWidth={1.75} />{emp.phone}</span>
            <span className="flex items-center gap-1.5 font-mono font-tabular"><Briefcase className="h-3.5 w-3.5" strokeWidth={1.75} />{emp.employeeNumber}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />{emp.city}, {emp.province}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Informasi Pribadi</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-5">
            <InfoItem label="NIK" value={emp.nik} />
            <InfoItem label="Tempat, Tgl Lahir" value={`${emp.placeOfBirth}, ${format(new Date(emp.dateOfBirth), "dd MMM yyyy", { locale: idLocale })}`} />
            <InfoItem label="Jenis Kelamin" value={GENDER_LABEL[emp.gender]} />
            <InfoItem label="Agama" value={RELIGION_LABEL[emp.religion ?? ""]} />
            <InfoItem label="Status Pernikahan" value={MARITAL_LABEL[emp.maritalStatus]} />
            <InfoItem label="Tanggungan" value={emp.dependents} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Data Kepegawaian</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-5">
            <InfoItem label="No. Karyawan" value={emp.employeeNumber} />
            <InfoItem label="Departemen" value={departmentName} />
            <InfoItem label="Jabatan" value={positionName} />
            <InfoItem label="Atasan" value={managerName} />
            <InfoItem label="Tgl Masuk" value={format(new Date(emp.joinDate), "dd MMM yyyy", { locale: idLocale })} />
            <InfoItem label="Status PTKP" value={emp.ptkpStatus} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Alamat</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-5">
            <InfoItem label="Alamat" value={emp.address} />
            <InfoItem label="Kota" value={emp.city} />
            <InfoItem label="Provinsi" value={emp.province} />
            <InfoItem label="Kode Pos" value={emp.postalCode} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Kontak Darurat</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-5">
            <InfoItem label="Nama" value={emp.emergencyName} />
            <InfoItem label="Telepon" value={emp.emergencyPhone} />
            <InfoItem label="Hubungan" value={emp.emergencyRelation} />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Riwayat Permintaan Perubahan Profil</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {changeLoading ? (
            <p className="text-sm text-muted-foreground">Memuat...</p>
          ) : myChangeRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada permintaan. Klik tombol <span className="font-medium">Ajukan Perubahan Profil</span> di atas untuk meminta HR mengubah data Anda.
            </p>
          ) : (
            <ul className="divide-y">
              {myChangeRequests.map((r) => (
                <li key={r.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm whitespace-pre-wrap break-words">{r.message}</p>
                      {r.handledNote && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="font-medium">Catatan HR:</span> {r.handledNote}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true, locale: idLocale })}
                        {r.handler && r.handledAt && (
                          <>
                            {" · "}
                            Diproses oleh {r.handler.firstName} {r.handler.lastName}
                          </>
                        )}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        r.status === "PENDING"
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          : r.status === "RESOLVED"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "border-destructive/40 bg-destructive/10 text-destructive"
                      }
                    >
                      {r.status === "PENDING"
                        ? "Menunggu"
                        : r.status === "RESOLVED"
                        ? "Disetujui"
                        : "Ditolak"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={changeDialogOpen}
        onOpenChange={(open) => {
          setChangeDialogOpen(open);
          if (!open) setChangeMessage("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajukan Perubahan Profil</DialogTitle>
            <DialogDescription>
              Tuliskan data apa yang ingin diperbarui. HR akan menindaklanjuti dan memperbarui data Anda.
              Anda tidak dapat mengedit profil secara langsung.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="change-message">Pesan untuk HR</Label>
            <Textarea
              id="change-message"
              rows={6}
              placeholder="Contoh: Tolong perbarui nomor HP saya menjadi 0812xxxx dan alamat menjadi Jl. ..."
              value={changeMessage}
              onChange={(e) => setChangeMessage(e.target.value)}
              disabled={submittingChange}
            />
            <p className="text-xs text-muted-foreground">
              Sertakan detail lengkap (nilai lama, nilai baru, alasan) supaya HR mudah memproses.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChangeDialogOpen(false)}
              disabled={submittingChange}
            >
              Batal
            </Button>
            <Button onClick={handleSubmitChange} disabled={submittingChange}>
              {submittingChange && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ShieldCheck,
  KeyRound,
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@prisma/client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertDialog } from "@/components/ui/alert-dialog";
import {
  useEmployeeAccount,
  useCreateAccount,
  useUpdateAccount,
  useResetPassword,
} from "@/hooks/use-employee-account";
import { apiClient } from "@/lib/api-client";

async function apiDeleteAccount(employeeId: string) {
  return apiClient<{ deleted: boolean }>(
    `/api/employees/${employeeId}/account`,
    { method: "DELETE" },
  );
}
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
  { value: "EMPLOYEE", label: "Karyawan", description: "Akses Employee Self-Service" },
  { value: "MANAGER", label: "Manager", description: "Kelola tim dan approval cuti" },
  { value: "HR_ADMIN", label: "HR Admin", description: "Kelola seluruh data HRIS" },
  { value: "SUPER_ADMIN", label: "Super Admin", description: "Akses penuh termasuk pengaturan sistem" },
];

const ROLE_LABELS: Record<Role, string> = {
  EMPLOYEE: "Karyawan",
  MANAGER: "Manager",
  HR_ADMIN: "HR Admin",
  SUPER_ADMIN: "Super Admin",
};

function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length];
  return out;
}

type Props = {
  employeeId: string;
  employeeEmail: string;
  viewerRole: Role;
};

export function AccountSection({ employeeId, employeeEmail, viewerRole }: Props) {
  const { account, isLoading, mutate } = useEmployeeAccount(employeeId);
  const [createOpen, setCreateOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canEdit = viewerRole === "SUPER_ADMIN" || viewerRole === "HR_ADMIN";
  const canDelete = viewerRole === "SUPER_ADMIN";

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm">Memuat akun...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                Akun Login
              </CardTitle>
              <CardDescription>
                Kelola akses login karyawan ke sistem HRIS.
              </CardDescription>
            </div>
            {!account && canEdit && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <UserPlus data-icon="inline-start" />
                Buat Akun
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!account ? (
            <div className="rounded-sm border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Karyawan ini belum memiliki akun login.
              </p>
            </div>
          ) : (
            <AccountView
              account={account}
              canEdit={canEdit}
              canDelete={canDelete}
              viewerRole={viewerRole}
              employeeId={employeeId}
              onMutate={mutate}
              onReset={() => setResetOpen(true)}
              onDelete={() => setDeleteOpen(true)}
            />
          )}
        </CardContent>
      </Card>

      {canEdit && (
        <CreateAccountDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          employeeId={employeeId}
          defaultEmail={employeeEmail}
          onCreated={mutate}
        />
      )}
      {canEdit && account && (
        <ResetPasswordDialog
          open={resetOpen}
          onOpenChange={setResetOpen}
          employeeId={employeeId}
        />
      )}
      {canDelete && account && (
        <AlertDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Hapus akun login?"
          description={`Akun ${account.email} akan dihapus permanen. Karyawan ini tidak akan bisa login lagi sampai akun dibuat ulang.`}
          confirmLabel="Hapus"
          onConfirm={async () => {
            try {
              await apiDeleteAccount(employeeId);
              toast.success("Akun berhasil dihapus");
              mutate();
            } catch (err: unknown) {
              toast.error(err instanceof Error ? err.message : "Gagal menghapus akun");
            }
          }}
        />
      )}
    </>
  );
}

function AccountView({
  account,
  canEdit,
  canDelete,
  viewerRole,
  employeeId,
  onMutate,
  onReset,
  onDelete,
}: {
  account: NonNullable<ReturnType<typeof useEmployeeAccount>["account"]>;
  canEdit: boolean;
  canDelete: boolean;
  viewerRole: Role;
  employeeId: string;
  onMutate: () => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const updateAccount = useUpdateAccount(employeeId);
  const [savingRole, setSavingRole] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);

  async function handleRoleChange(newRole: Role) {
    if (newRole === account.role) return;
    setSavingRole(true);
    try {
      await updateAccount.trigger({ role: newRole });
      toast.success("Role berhasil diubah");
      onMutate();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah role");
    } finally {
      setSavingRole(false);
    }
  }

  async function handleToggleActive(checked: boolean) {
    setTogglingActive(true);
    try {
      await updateAccount.trigger({ isActive: checked });
      toast.success(checked ? "Akun diaktifkan" : "Akun dinonaktifkan");
      onMutate();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah status");
    } finally {
      setTogglingActive(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoRow label="Email Login" value={account.email} mono />
        <InfoRow
          label="Status"
          value={
            <Badge variant={account.isActive ? "default" : "outline"} className="gap-1">
              {account.isActive ? (
                <>
                  <CheckCircle2 className="size-3" /> Aktif
                </>
              ) : (
                <>
                  <XCircle className="size-3" /> Nonaktif
                </>
              )}
            </Badge>
          }
        />
        <InfoRow
          label="Role"
          value={
            canEdit ? (
              <Select
                value={account.role}
                onValueChange={(v) => v && handleRoleChange(v as Role)}
                disabled={savingRole}
                items={ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.filter(
                    (o) => o.value !== "SUPER_ADMIN" || viewerRole === "SUPER_ADMIN",
                  ).map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      <span className="flex flex-col">
                        <span className="font-medium">{o.label}</span>
                        <span className="text-xs text-muted-foreground">{o.description}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="secondary">{ROLE_LABELS[account.role]}</Badge>
            )
          }
        />
        <InfoRow
          label="Login Terakhir"
          value={
            account.lastLoginAt
              ? format(new Date(account.lastLoginAt), "dd MMM yyyy HH:mm", { locale: idLocale })
              : "Belum pernah login"
          }
        />
      </div>

      {account.mustChangePassword && (
        <div className="flex items-center gap-2 rounded-sm border border-border bg-muted/60 p-3 text-sm text-muted-foreground">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warning)]" aria-hidden />
          Karyawan akan diminta mengganti password saat login pertama.
        </div>
      )}

      {canEdit && (
        <div className="flex flex-wrap items-center gap-3 border-t pt-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={account.isActive}
              onCheckedChange={handleToggleActive}
              disabled={togglingActive}
              id="account-active"
            />
            <Label htmlFor="account-active" className="cursor-pointer text-sm">
              Akun aktif
            </Label>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={onReset}>
              <KeyRound data-icon="inline-start" />
              Reset Password
            </Button>
            {canDelete && (
              <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
                <Trash2 data-icon="inline-start" />
                Hapus Akun
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className={cn("text-sm font-medium", mono && "font-mono")}>{value}</div>
    </div>
  );
}

function CreateAccountDialog({
  open,
  onOpenChange,
  employeeId,
  defaultEmail,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employeeId: string;
  defaultEmail: string;
  onCreated: () => void;
}) {
  const createAccount = useCreateAccount(employeeId);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(() => generatePassword());
  const [role, setRole] = useState<Role>("EMPLOYEE");
  const [mustChangePassword, setMustChangePassword] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createAccount.trigger({ email, password, role, mustChangePassword });
      toast.success("Akun login berhasil dibuat");
      onCreated();
      onOpenChange(false);
      // reset
      setPassword(generatePassword());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat akun");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Akun Login</DialogTitle>
          <DialogDescription>
            Karyawan akan dapat login dengan email dan password di bawah.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-email">Email Login</Label>
            <Input
              id="account-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-password">Password Awal</Label>
            <div className="relative">
              <Input
                id="account-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="pr-20"
              />
              <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Sembunyikan" : "Tampilkan"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPassword(generatePassword())}
                  tabIndex={-1}
                >
                  Acak
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Minimal 8 karakter. Simpan dan berikan kepada karyawan secara aman.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={role}
              onValueChange={(v) => v && setRole(v as Role)}
              items={ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    <span className="flex flex-col">
                      <span className="font-medium">{o.label}</span>
                      <span className="text-xs text-muted-foreground">{o.description}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-border p-3">
            <Switch
              id="must-change"
              checked={mustChangePassword}
              onCheckedChange={setMustChangePassword}
            />
            <Label htmlFor="must-change" className="cursor-pointer text-sm">
              Wajibkan ganti password saat login pertama
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" data-icon="inline-start" />}
              Buat Akun
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordDialog({
  open,
  onOpenChange,
  employeeId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employeeId: string;
}) {
  const resetPassword = useResetPassword(employeeId);
  const [password, setPassword] = useState(() => generatePassword());
  const [mustChangePassword, setMustChangePassword] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await resetPassword.trigger({ password, mustChangePassword });
      toast.success("Password berhasil di-reset");
      onOpenChange(false);
      setPassword(generatePassword());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal reset password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Ganti password akun ini. Berikan password baru ke karyawan secara aman.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-password">Password Baru</Label>
            <div className="relative">
              <Input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="pr-20"
              />
              <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPassword(generatePassword())}
                  tabIndex={-1}
                >
                  Acak
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-border p-3">
            <Switch
              id="reset-must-change"
              checked={mustChangePassword}
              onCheckedChange={setMustChangePassword}
            />
            <Label htmlFor="reset-must-change" className="cursor-pointer text-sm">
              Wajibkan ganti password saat login berikutnya
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" data-icon="inline-start" />}
              Reset Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

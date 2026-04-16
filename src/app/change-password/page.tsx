"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react";

type FieldError = Partial<Record<"current" | "new" | "confirm", string>>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});

  function validate(): FieldError {
    const next: FieldError = {};
    if (!currentPassword) next.current = "Password lama wajib diisi";
    if (!newPassword) {
      next.new = "Password baru wajib diisi";
    } else if (newPassword.length < 8) {
      next.new = "Password minimal 8 karakter";
    } else if (!/[A-Za-z]/.test(newPassword)) {
      next.new = "Password harus mengandung huruf";
    } else if (!/[0-9]/.test(newPassword)) {
      next.new = "Password harus mengandung angka";
    } else if (newPassword === currentPassword) {
      next.new = "Password baru harus berbeda dari password lama";
    }
    if (!confirmPassword) {
      next.confirm = "Konfirmasi password wajib diisi";
    } else if (newPassword !== confirmPassword) {
      next.confirm = "Konfirmasi password tidak cocok";
    }
    return next;
  }

  async function submit() {
    if (loading) return;
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      const first = Object.values(fieldErrors)[0];
      if (first) toast.error(first);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Gagal mengubah password");
      }
      toast.success("Password berhasil diubah. Silakan login ulang.");
      await signOut({ redirect: false });
      router.push("/login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void submit();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-muted/60">
            <KeyRound className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          </div>
          <div>
            <CardTitle>Ganti Password</CardTitle>
            <CardDescription>Anda harus mengganti password default sebelum melanjutkan.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="current">Password Lama</Label>
            <Input
              id="current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              aria-invalid={Boolean(errors.current)}
              disabled={loading}
            />
            {errors.current && (
              <p className="text-xs text-destructive">{errors.current}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">Password Baru</Label>
            <div className="relative">
              <Input
                id="new"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.new)}
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showNew ? "Sembunyikan password" : "Tampilkan password"}
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.new ? (
              <p className="text-xs text-destructive">{errors.new}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Minimal 8 karakter, mengandung huruf dan angka.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Konfirmasi Password Baru</Label>
            <Input
              id="confirm"
              type={showNew ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirm)}
              disabled={loading}
            />
            {errors.confirm && (
              <p className="text-xs text-destructive">{errors.confirm}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Menyimpan..." : "Simpan Password Baru"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

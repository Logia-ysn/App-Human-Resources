"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, LogIn } from "lucide-react";

const DEMO_ACCOUNTS = [
  { email: "admin@company.co.id", password: "admin123", role: "Super Admin" },
  { email: "hr@company.co.id", password: "hr123", role: "HR Admin" },
  { email: "manager@company.co.id", password: "manager123", role: "Manager" },
  { email: "karyawan@company.co.id", password: "karyawan123", role: "Karyawan" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email atau password salah");
      setIsLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  function fillCredentials(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <Card className="shadow-xl border-0 shadow-black/10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25">
            <Building2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">HRIS</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Human Resources Information System
          </p>
          <CardDescription className="mt-3">
            Masukkan email dan password untuk masuk
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@company.co.id"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              <LogIn className="mr-2 h-4 w-4" />
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Demo Credentials Card */}
      <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3 text-center uppercase tracking-wider">
            Demo Accounts — Klik untuk mengisi
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillCredentials(account.email, account.password)}
                className="flex flex-col items-start gap-1 rounded-lg border border-border/50 bg-background p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
              >
                <Badge variant="secondary" className="text-[10px] mb-0.5">
                  {account.role}
                </Badge>
                <span className="text-xs font-medium text-foreground truncate w-full">
                  {account.email}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {account.password}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50 px-4 py-8">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}

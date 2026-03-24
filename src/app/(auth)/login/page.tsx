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
  {
    email: "karyawan@company.co.id",
    password: "karyawan123",
    role: "Karyawan",
  },
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
    <div className="w-full max-w-md space-y-6">
      {/* Mobile branding - visible only when left panel is hidden */}
      <div className="flex flex-col items-center text-center lg:hidden">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-lg shadow-indigo-500/25 mb-4">
          <Building2 className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">HRIS</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Human Resources Information System
        </p>
      </div>

      {/* Login card */}
      <Card className="border-0 shadow-none lg:shadow-xl lg:border lg:shadow-black/5">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-bold">Selamat Datang</CardTitle>
          <CardDescription className="mt-1">
            Masukkan email dan password untuk masuk
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
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
                className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20"
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
                className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
              disabled={isLoading}
            >
              <LogIn className="mr-2 h-4 w-4" />
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-gray-50 px-3 text-muted-foreground">atau</span>
        </div>
      </div>

      {/* Demo accounts grid */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-3 text-center uppercase tracking-wider">
          Demo Accounts — Klik untuk mengisi
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => fillCredentials(account.email, account.password)}
              className="flex flex-col items-start gap-1 rounded-xl border border-gray-200 bg-white p-3.5 text-left transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-md hover:shadow-indigo-500/5"
            >
              <Badge
                variant="secondary"
                className="text-[10px] mb-0.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
              >
                {account.role}
              </Badge>
              <span className="text-xs font-medium text-gray-900 truncate w-full">
                {account.email}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {account.password}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

"use client";

import { createContext, useContext } from "react";
import type { Role } from "@prisma/client";

type AuthContextValue = {
  email: string;
  role: Role;
  employeeId: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  email,
  role,
  employeeId,
  children,
}: AuthContextValue & { children: React.ReactNode }) {
  return (
    <AuthContext value={{ email, role, employeeId }}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

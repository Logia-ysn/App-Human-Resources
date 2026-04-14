import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface User {
    role: Role;
    employeeId: string | null;
    mustChangePassword: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      employeeId: string | null;
      mustChangePassword: boolean;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email, isActive: true },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        // Update last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
        token.employeeId = (user as { employeeId: string | null }).employeeId;
        token.mustChangePassword = (user as { mustChangePassword: boolean }).mustChangePassword;
        token.iat = Math.floor(Date.now() / 1000);
        return token;
      }

      // Refresh isActive + profile from DB on every request so that
      // deactivated accounts are blocked immediately (not just at login).
      if (token.id) {
        try {
          const fresh = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { mustChangePassword: true, role: true, employeeId: true, isActive: true },
          });
          if (!fresh || !fresh.isActive) {
            // Return null-equivalent: signal invalid session
            return null as unknown as typeof token;
          }
          token.mustChangePassword = fresh.mustChangePassword;
          token.role = fresh.role;
          token.employeeId = fresh.employeeId;
        } catch {
          // swallow: stale token is better than broken auth
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.employeeId = token.employeeId as string | null;
      session.user.mustChangePassword = Boolean(token.mustChangePassword);
      return session;
    },
  },
});

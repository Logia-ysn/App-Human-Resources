import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    employeeId: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      employeeId: string | null;
    };
  }
}

// Demo users — replace with database lookup when PostgreSQL is connected
const DEMO_USERS = [
  {
    id: "usr-superadmin",
    email: "admin@company.co.id",
    password: "admin123",
    role: "SUPER_ADMIN" as Role,
    employeeId: null,
  },
  {
    id: "usr-hr",
    email: "hr@company.co.id",
    password: "hr123",
    role: "HR_ADMIN" as Role,
    employeeId: "emp-001",
  },
  {
    id: "usr-manager",
    email: "manager@company.co.id",
    password: "manager123",
    role: "MANAGER" as Role,
    employeeId: "emp-002",
  },
  {
    id: "usr-employee",
    email: "karyawan@company.co.id",
    password: "karyawan123",
    role: "EMPLOYEE" as Role,
    employeeId: "emp-003",
  },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
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

        // Demo mode: check against hardcoded users
        const user = DEMO_USERS.find(
          (u) => u.email === email && u.password === password
        );

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
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
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.employeeId = token.employeeId as string | null;
      return session;
    },
  },
});

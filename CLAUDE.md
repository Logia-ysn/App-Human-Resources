# HRIS — Human Resource Information System

## Project Overview

Aplikasi HRIS lengkap berbasis Next.js 16 untuk manajemen SDM: Employee, Attendance, Leave, Payroll, Performance, Recruitment, Training, Onboarding, Lifecycle, Expenses, Shifts, dan Employee Self-Service (ESS).

**Current mode**: Production (PostgreSQL + Prisma + SWR)

## Tech Stack

- **Framework**: Next.js 16.2.1 (App Router, Server Components)
- **UI**: React 19, Base-UI 1.3, Tailwind CSS 4, shadcn/ui
- **Data Fetching**: SWR 2 (client-side caching + revalidation)
- **Forms**: React Hook Form 7 + Zod 4
- **Auth**: Auth.js 5 (NextAuth beta 30) — Credentials provider, JWT
- **Database**: Prisma 6.19 + PostgreSQL
- **Tables**: TanStack React Table 8
- **Charts**: Recharts 3
- **Icons**: Lucide React

## Breaking Changes Warning

<!-- BEGIN:nextjs-agent-rules -->
Next.js 16 has breaking changes — APIs, conventions, and file structure may differ from training data. **Always read** `node_modules/next/dist/docs/` before writing any code.
<!-- END:nextjs-agent-rules -->

- Auth.js 5 is beta — check `node_modules/next-auth/` for current API
- Zod 4 has breaking changes from v3 — use `z.object()` not `z.ZodObject`
- React 19 — new hooks, no forwardRef needed, use `ref` prop directly

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/           # Protected routes (19 modules)
│   │   ├── dashboard/         # Main dashboard
│   │   ├── employees/         # Employee CRUD
│   │   ├── departments/       # Department management
│   │   ├── positions/         # Position management
│   │   ├── attendance/        # Attendance tracking
│   │   ├── leave/             # Leave management
│   │   ├── payroll/           # Payroll processing
│   │   ├── performance/       # Performance reviews
│   │   ├── recruitment/       # Job postings & applicants
│   │   ├── training/          # Training programs
│   │   ├── onboarding/        # Onboarding workflows
│   │   ├── lifecycle/         # Employee lifecycle
│   │   ├── expenses/          # Claims & advances
│   │   ├── shifts/            # Shift management
│   │   ├── org-chart/         # Organization structure
│   │   ├── notifications/     # Notification center
│   │   ├── settings/          # Settings & data management
│   │   └── ess/               # Employee Self-Service (8 sub-modules)
│   └── api/                   # REST API routes (auth, employees, leave, attendance, etc.)
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── layout/                # Sidebar, header
│   └── shared/                # Reusable: data-table, page-header, stat-card
├── lib/
│   ├── auth.ts                # Auth.js config
│   ├── db.ts                  # Prisma client
│   ├── api-client.ts          # SWR fetcher + API client
│   ├── api-guard.ts           # Role-based API route guard
│   ├── validators/            # Zod schemas for API validation
│   └── utils/                 # Constants, format, permissions
├── types/api.ts               # API type definitions
├── hooks/                     # Custom React hooks
└── middleware.ts              # Auth middleware
prisma/
├── schema.prisma              # 50+ models, 29 enums
└── seed.ts                    # Database seeding
```

## Conventions

### Code Style
- **Language**: Indonesian for UI labels/docs, English for code (variable names, comments)
- **Components**: Functional components with TypeScript
- **Data**: SWR hooks di `hooks/use-*.ts` — fetch dari API routes
- **Styling**: Tailwind CSS utility classes, cn() helper untuk merge
- **Forms**: React Hook Form + Zod schema validation
- **Tables**: TanStack React Table dengan shared `DataTable` component
- **Icons**: Lucide React — import individual icons

### File Naming
- Pages: `page.tsx` (Next.js App Router convention)
- Components: `kebab-case.tsx` (e.g., `data-table.tsx`, `stat-card.tsx`)
- Utilities: `kebab-case.ts` (e.g., `utils/permissions.ts`)

### Auth & Roles
4 roles: `SUPER_ADMIN`, `HR_ADMIN`, `MANAGER`, `EMPLOYEE`
- Credentials provider authenticates against PostgreSQL (User table)
- Middleware protects all `(dashboard)` routes
- Permission check via `lib/utils/permissions.ts`

### Data Pattern (Production)
- API routes di `app/api/` — Prisma + PostgreSQL
- SWR hooks di `hooks/use-*.ts` — fetcher + mutation
- API response envelope: `{ success, data, error, meta? }`
- Role-based access via `apiGuard()` middleware
- Zod validation pada semua API input

## Commands

```bash
npm run dev           # Dev server (localhost:3000)
npm run build         # Build (includes prisma generate)
npm run lint          # ESLint
npm run db:push       # Push schema to PostgreSQL
npm run db:seed       # Seed database
npm run db:studio     # Prisma Studio
```

## Recommended Plugins & Agents

### Plugins (installed)
- `typescript-lsp` — Type intelligence (CRITICAL)
- `code-review` — Code quality review (CRITICAL)
- `security-guidance` — Security checks for PII data (HIGH)
- `feature-dev` — Feature development workflow (HIGH)
- `frontend-design` — UI/UX patterns (HIGH)
- `playwright` — E2E testing (HIGH)
- `context7` — Docs lookup for Next.js 16, Prisma 6, Auth.js 5 (MEDIUM)
- `code-simplifier` — Refactor & simplify (MEDIUM)
- `commit-commands` — Git workflow (MEDIUM)

### Agents (use proactively)
- `typescript-reviewer` — After every code change
- `code-reviewer` — After completing a feature
- `security-reviewer` — Before commit (HRIS handles PII: KTP, BPJS, salary)
- `tdd-guide` — New features & bug fixes
- `planner` — Complex features
- `database-reviewer` — Schema changes (50+ models)
- `e2e-runner` — Critical flows (login, payroll, leave approval)
- `build-error-resolver` — Next.js 16 build issues

## Security Notes

HRIS menyimpan data sensitif karyawan:
- **PII**: Nama, KTP, alamat, nomor telepon
- **Finansial**: Gaji, BPJS, PPh21, rekening bank
- **Medis**: Data cuti sakit

Rules:
- NEVER hardcode secrets — use `.env`
- ALWAYS validate user input dengan Zod
- ALWAYS check role permissions sebelum akses data
- NEVER expose salary/KTP data ke role EMPLOYEE kecuali data sendiri
- Sanitize semua output untuk prevent XSS

# Rencana Audit Sistem HRIS

**Versi**: 1.0
**Tanggal**: 2026-04-07
**Auditor**: Solo dev (Yayang)
**Lingkungan**: Production-like di RPi5 (Docker: hris-app:3000, hris-db:5434)

---

## 1. Ringkasan Hasil Simulasi (Smoke Test)

Simulasi penuh dijalankan sebelum audit untuk memetakan baseline.

### 1.1 Infrastruktur — STATUS: HIJAU
| Komponen | Status |
|---|---|
| Container `hris-app` | Up (rebuild ke-3 hari ini) |
| Container `hris-db` | Up healthy |
| Reachability `http://localhost:3000/login` | HTTP 200 |
| Koneksi DB (52 tabel terdaftar) | OK |
| Data hasil seed | companies=1, users=4, employees=15, departments=9, positions=15, attendances=15, leave_requests=7, app_configs=1 |

### 1.2 Autentikasi — STATUS: HIJAU
- Login `admin@company.co.id / admin123` → HTTP 302 (redirect dashboard)
- Cookie `__Secure-authjs.session-token` ter-set
- `GET /api/auth/session` → 200 (session JWT terbaca)

### 1.3 Smoke Test API (sebagai SUPER_ADMIN)
| Endpoint | Status | Catatan |
|---|---|---|
| `GET /api/dashboard/stats` | 200 | OK |
| `GET /api/employees` | 200 (18 KB) | OK |
| `GET /api/departments` | 200 | OK |
| `GET /api/positions` | 200 | OK |
| `GET /api/attendance` | 200 | OK |
| `GET /api/leave/requests` | 200 | OK |
| `GET /api/leave/balances` | 200 | OK |
| `GET /api/leave/types` | 200 | OK |
| `GET /api/company` | 200 | OK |
| `GET /api/settings/app-config` | 200 | OK |
| `GET /api/holidays` | 200 | OK |
| `GET /api/payroll/periods` | 200 | OK |
| `GET /api/attendance/today` | **400** | Wajib query `employeeId` — perlu ditegaskan di kontrak API |
| `POST /api/settings/reset {action:reseed}` | **200** | Truncate + re-seed inline lewat `seedDatabase()` ✅ |

### 1.4 Cakupan Migrasi UI
- **29 halaman** dashboard total
- **13 halaman fully migrated** (UI ↔ API ↔ DB):
  `dashboard, employees (list/detail/edit/new), departments, positions, attendance, leave, ess/attendance, ess/leave, ess/profile, settings`
- **16 halaman placeholder** (stub "sedang dalam proses migrasi"):
  `notifications, shifts, payroll, performance, recruitment, training, lifecycle, onboarding, org-chart, expenses/advances, expenses/claims, ess/payslips, ess/expenses, ess/shifts, ess/training, ess/performance`

### 1.5 Temuan Awal dari Simulasi
| ID | Severity | Temuan |
|---|---|---|
| F-01 | HIGH | `POST /api/settings/reset` action `reset` menghapus tabel `users` & `sessions` — admin yang sedang login langsung kehilangan akses dan tidak ada user lain yang bisa login. Perlu (a) exclude `users`/`sessions` dari reset, atau (b) auto-recreate akun admin minimal, atau (c) UI memaksa reseed setelah reset. |
| F-02 | MEDIUM | `GET /api/attendance/today` mengembalikan 400 tanpa query `employeeId`. Kontrak harus didokumentasikan; idealnya untuk role karyawan default ke session.user.employeeId. |
| F-03 | MEDIUM | 16 dari 29 halaman dashboard masih stub. Risiko UX: user mengira fitur ada tapi tidak fungsional. |
| F-04 | LOW | Header standalone Next.js tidak otomatis menyertakan devDependencies (`tsx`, `bcryptjs`) — sudah teratasi via `src/lib/seed.ts` yang di-import dari API route. |
| F-05 | LOW | 9 halaman `metadata.themeColor` masih warning → harus dipindah ke `viewport export`. |

---

## 2. Tujuan & Lingkup Audit

**Tujuan utama**:
1. Memastikan sistem HRIS aman untuk dipakai produksi internal di rice mill.
2. Mengidentifikasi celah keamanan, korupsi data, dan bug regresi pasca migrasi Zustand → SWR + PostgreSQL.
3. Menyusun backlog perbaikan terprioritaskan sebelum rilis penuh.

**In-scope**:
- 13 halaman migrated (UI + API + DB layer)
- Auth & RBAC (4 role: SUPER_ADMIN, HR_ADMIN, MANAGER, EMPLOYEE)
- Schema Prisma + integritas referensial
- API contract & response envelope
- Reset/reseed flow (data lifecycle)
- Build & deployment pipeline (Dockerfile, standalone trace)

**Out-of-scope (audit terpisah saat sudah migrated)**:
- 16 halaman placeholder (akan diaudit setelah implementasi)
- Performance load test (RPi5) — jadwal terpisah
- Backup & restore strategi DB (ada di roadmap)

---

## 3. Metodologi

Audit dilakukan dalam **6 area**, masing-masing punya:
- **Checklist** (kriteria PASS/FAIL)
- **Severity gating** (CRITICAL → blok rilis, HIGH → fix sebelum rilis, MEDIUM → fix dalam 1 sprint, LOW → backlog)
- **Bukti** (perintah/file yang harus dilampirkan)

### 3.1 Severity Definitions
| Level | Definisi | SLA |
|---|---|---|
| CRITICAL | Data loss, RCE, auth bypass, kebocoran kredensial | Fix < 24 jam, blok deploy |
| HIGH | Privilege escalation, korupsi data, fitur inti rusak | Fix sebelum rilis |
| MEDIUM | Bug fungsional non-blocking, validasi lemah, UX rusak | Fix dalam 1 sprint |
| LOW | Cosmetic, warning build, doc gap | Backlog |

---

## 4. Area Audit & Checklist

### Area A — Keamanan & Autentikasi
- [ ] **A1** `apiGuard()` dipanggil di **semua** route handler (write & read sensitif). Bukti: `grep -L apiGuard src/app/api/**/route.ts`.
- [ ] **A2** Role check (`minRole`) sesuai matrix: SUPER_ADMIN-only untuk reset, HR_ADMIN-only untuk write employee/payroll, EMPLOYEE-only-self untuk ESS.
- [ ] **A3** JWT payload tidak mengandung field sensitif (passwordHash, npwp, dll).
- [ ] **A4** `AUTH_SECRET` di-set dari environment, bukan placeholder build-time.
- [ ] **A5** Cookie `__Secure-` hanya dipakai jika serve via HTTPS. Untuk RPi5 LAN: pertimbangkan reverse proxy + TLS atau switch cookie name.
- [ ] **A6** Rate limiting di `/api/auth/callback/credentials` (brute-force protection).
- [ ] **A7** Password hash menggunakan `bcryptjs` cost ≥ 10.
- [ ] **A8** Tidak ada secret hardcoded di source. Bukti: `gitleaks detect`.
- [ ] **A9** Default credentials (`admin123`, dll) hanya untuk seed; ada force-change-password pada login pertama.
- [ ] **A10** Session expiry & refresh policy didefinisikan eksplisit.

### Area B — Integritas Data & Schema
- [ ] **B1** Semua foreign key memiliki `onDelete` policy yang sesuai.
- [ ] **B2** TRUNCATE_ORDER di `api/settings/reset/route.ts` cocok dengan dependency graph schema (tidak ada FK violation).
- [ ] **B3** Tidak ada `String?` untuk field uang/numerik (gunakan `Decimal` atau `Int`).
- [ ] **B4** Field unik (NIK, NPWP, employeeNumber, email) punya `@unique` constraint.
- [ ] **B5** Migration history konsisten antara dev dan prod (`prisma migrate status`).
- [ ] **B6** Seed idempotent (jalankan 2x → tidak duplikat).
- [ ] **B7** AppConfig PATCH melakukan **merge**, bukan overwrite (sudah diperbaiki).
- [ ] **B8** Audit log table dipopulasi untuk operasi sensitif (delete, role change).

### Area C — API Contract & Validasi
- [ ] **C1** Setiap response menggunakan envelope `{success, data, error, meta?}`.
- [ ] **C2** Setiap POST/PATCH/PUT memvalidasi body dengan Zod (atau equivalent).
- [ ] **C3** Pagination konsisten (`?page=&limit=`) untuk endpoint list besar.
- [ ] **C4** Error message **tidak** membocorkan stack trace / DB error mentah ke client.
- [ ] **C5** `attendance/today` & semua endpoint per-employee menerima default dari session.
- [ ] **C6** OpenAPI / TypeScript types disinkronkan dengan implementasi.
- [ ] **C7** HTTP status code semantik benar (404 vs 400 vs 422).

### Area D — Frontend (13 halaman migrated)
Untuk **setiap** halaman jalankan:
- [ ] **D1** SWR `mutate()` dipanggil setelah create/update/delete.
- [ ] **D2** Loading state (skeleton/spinner) ditampilkan saat fetch awal.
- [ ] **D3** Error state ditampilkan jika fetch gagal (toast + retry button).
- [ ] **D4** Form punya client-side validation + disabled saat submitting.
- [ ] **D5** Tidak ada `console.log` / komentar TODO yang menggantung.
- [ ] **D6** Dark mode bekerja (Tailwind v4 `@custom-variant`).
- [ ] **D7** Bahasa UI Indonesia konsisten.
- [ ] **D8** Tidak ada hardcoded data (audit `grep -rn "const.*=.*\\[.*{.*name:" src/app/(dashboard)`).

### Area E — Build, Deploy & Operasional
- [ ] **E1** `npm run build` selesai tanpa error (warning OK).
- [ ] **E2** `npx tsc --noEmit` clean.
- [ ] **E3** Docker image size < 1 GB (RPi5 storage).
- [ ] **E4** Standalone trace menyertakan `bcryptjs`, `@prisma/client`, semua hooks.
- [ ] **E5** Healthcheck Docker untuk hris-app (saat ini hanya hris-db).
- [ ] **E6** `.env` tidak ter-commit (cek `.gitignore`).
- [ ] **E7** Restart policy container `unless-stopped`.
- [ ] **E8** Logs tidak overflow disk RPi5 (`max-size`, `max-file`).
- [ ] **E9** OOM handling — build di RPi5 sudah stabil setelah perbaikan sebelumnya.

### Area F — Reset/Reseed & Data Lifecycle (fokus baru)
- [ ] **F1** `action=reset` mempertahankan minimal 1 user SUPER_ADMIN (atau mewajibkan reseed otomatis).
- [ ] **F2** `action=reseed` idempotent dan tidak menambah duplikat baris.
- [ ] **F3** Reset & reseed memiliki audit log entry "performed by user X at time T".
- [ ] **F4** Konfirmasi UI 2 langkah untuk reset (sudah ada Dialog).
- [ ] **F5** Backup snapshot otomatis sebelum reset (tar.gz dump SQL ke `/data/backups/`).
- [ ] **F6** Endpoint dibatasi rate limit (1 panggilan / 60 detik).

---

## 5. Eksekusi Audit — Test Matrix

| Step | Aksi | Tools | Hasil yang diharapkan |
|---|---|---|---|
| 1 | List route tanpa apiGuard | `grep -L apiGuard` | 0 file (kecuali `/api/auth/*`) |
| 2 | Test login 4 role | curl + cookie jar | Setiap role redirect ke landing yang benar |
| 3 | RBAC negative test | curl sebagai EMPLOYEE → POST `/api/employees` | HTTP 403 |
| 4 | SQL injection probe | `' OR 1=1 --` di query param | Diproses sebagai literal, no error |
| 5 | XSS probe | `<script>alert(1)</script>` di nama employee | Ter-escape di render |
| 6 | Schema integrity | `prisma migrate status` | "Database schema is up to date" |
| 7 | Reset → login admin | Reset lalu login | EXPECTED FAIL (F-01) |
| 8 | Reseed → login admin | Reseed lalu login | PASS |
| 9 | Build clean | `npm run build` | Exit 0, no error |
| 10 | TypeScript clean | `npx tsc --noEmit` | Exit 0 |
| 11 | Image size | `docker images app-human-resources-app` | < 1 GB |
| 12 | E2E happy path | Login → create employee → record attendance → request leave → approve | All steps PASS |

---

## 6. Tooling Audit

| Tool | Pakai untuk |
|---|---|
| `npx tsc --noEmit` | Type safety |
| `npm run build` | Build verification |
| `npx prisma migrate status` | Schema drift |
| `gitleaks detect` | Secret scanning |
| `npm audit` | Dependency CVE |
| `curl + cookie jar` | API smoke + RBAC test |
| `docker stats` | Resource monitoring di RPi5 |
| Manual + browser DevTools | UI/UX audit per halaman |

---

## 7. Backlog Prioritas (Pasca-Audit)

### Wajib sebelum rilis (HIGH)
1. **F-01**: Perbaiki reset agar admin tidak terkunci. Opsi paling aman: action `reset` di-deprecate, ganti menjadi `reseed-only`.
2. Implementasi **audit log** untuk operasi destructive.
3. Force change password setelah login pertama dengan default credentials.
4. **Backup otomatis** sebelum reset/reseed.

### Sprint berikutnya (MEDIUM)
5. **F-02**: Default `employeeId` dari session di endpoint per-employee.
6. **F-03**: Migrasi 16 halaman placeholder (mulai dari yang paling sering dipakai: payroll, shifts, notifications).
7. Rate limiting di endpoint auth & reset.
8. Pagination untuk `/api/employees` dan `/api/attendance`.

### Backlog (LOW)
9. **F-04 (sudah selesai)**.
10. **F-05**: Pindahkan `themeColor` ke viewport export di 9 halaman.
11. OpenAPI doc generation.
12. Healthcheck Docker untuk hris-app.

---

## 8. Kriteria Selesai Audit (Definition of Done)

Audit dinyatakan selesai bila:
- Semua checklist Area A–F sudah dijawab PASS/FAIL/N/A dengan bukti.
- Semua temuan CRITICAL & HIGH sudah masuk backlog dengan PIC dan target.
- Laporan final ditulis di `AUDIT_REPORT_2026-04.md`.
- Backup DB dibuat sebelum perbaikan apa pun di-merge.

---

## 9. Jadwal Eksekusi (Saran)

| Hari | Aktivitas |
|---|---|
| H+0 | Area A (Security) + Area B (Schema) |
| H+1 | Area C (API) + Area D (UI 13 halaman) |
| H+2 | Area E (Build/Deploy) + Area F (Reset/Reseed) |
| H+3 | Penulisan laporan, prioritisasi backlog, presentasi ke stakeholder |

---

**Catatan**: Karena ini proyek solo dev, audit dilakukan satu putaran lalu langsung perbaikan. Tidak ada formal sign-off, tapi semua temuan harus tercatat di `AUDIT_REPORT_2026-04.md` agar bisa ditelusuri ulang.

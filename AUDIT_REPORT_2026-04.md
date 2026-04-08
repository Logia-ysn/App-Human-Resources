# Laporan Audit HRIS — Putaran 1

**Tanggal**: 2026-04-07
**Auditor**: Yayang (solo dev)
**Versi rencana**: AUDIT_PLAN.md v1.0
**Lingkup eksekusi**: Area A (Security), Area B (Schema), Area C (API)
**Status fix F-01**: ✅ SELESAI

---

## 0. Ringkasan Eksekutif

| Severity | Jumlah | Status |
|---|---|---|
| CRITICAL | 0 | — |
| HIGH | 3 | 1 fixed, 2 open |
| MEDIUM | 5 | open |
| LOW | 4 | open |

**Verdict**: Sistem **belum siap** untuk multi-user produksi. Harus selesaikan 2 HIGH terbuka dulu (NIK unique, default password). Untuk single-user trial OK.

---

## 1. Area A — Security & Auth

| ID | Item | Hasil | Bukti |
|---|---|---|---|
| A1 | Semua route handler punya auth guard | **PASS** | Hanya `/api/auth/[...nextauth]` tanpa apiGuard (memang harus) |
| A2 | RBAC matrix | **PASS** | 10 HR_ADMIN, 4 MANAGER, 3 SUPER_ADMIN. Negative test (EMPLOYEE → POST/employees → 403, GET/employees → 403, POST/reset → 403) ✅ |
| A3 | JWT tidak bocor field sensitif | **PASS** | Session payload hanya `{id, email, role, employeeId}`, no passwordHash/NIK/NPWP |
| A4 | AUTH_SECRET dari env | **PASS** | `.env` punya secret 44-char strong; Dockerfile pakai ARG |
| A5 | Cookie Secure & HTTPS | **MEDIUM (M-01)** | Cookie `__Secure-` dipakai di HTTP localhost — di RPi5 LAN tanpa HTTPS, browser akan menolak set cookie. Perlu reverse proxy TLS atau `useSecureCookies:false` saat HTTP |
| A6 | Rate limiting auth | **HIGH (H-02)** | 0 implementasi rate limit. Brute-force `/api/auth/callback/credentials` tidak dibatasi |
| A7 | bcrypt cost ≥ 10 | **PASS** | `bcrypt.hash(pw, 12)` di seed.ts |
| A8 | No hardcoded secrets | **PASS** | Tidak ada secret literal di src/. `.gitignore` sudah include `.env` |
| A9 | Force change default password | **HIGH (H-03)** | Default `admin123/hr123/manager123/karyawan123` dari seed bisa langsung dipakai tanpa force-change. Risiko bocor jika dideploy apa adanya |
| A10 | Session expiry policy | **LOW (L-01)** | Pakai default NextAuth (30 hari). Belum diset eksplisit; idealnya 7 hari + sliding refresh |
| Bonus | SQLi probe (`' OR 1=1--`) | **PASS** | HTTP 200, query Prisma parameterized — payload diperlakukan sebagai literal |
| Bonus | Path traversal | **PASS** | Next.js menangani routing, payload jadi 404 |

---

## 2. Area B — Schema & Data Integrity

| ID | Item | Hasil | Bukti |
|---|---|---|---|
| B1 | onDelete policy explicit | **MEDIUM (M-02)** | Hanya 4 dari 79 relasi punya `onDelete:` eksplisit. Sisanya RESTRICT default — aman tapi tidak terdokumentasi |
| B2 | TRUNCATE_ORDER cocok dengan dependency | **PASS (sudah fixed)** | 3 typo plural/singular sudah diperbaiki |
| B3 | Field uang pakai Decimal | **PASS** | Semua money pakai `Decimal(15,2)`. Lat/Lng pakai `Decimal(10,7)`. Rate pakai `Decimal(5,4)`. ✅ |
| B4 | Unique constraint pada field identitas | **HIGH (H-04)** | `email`, `employeeNumber`, `code` semua unique ✅ — TAPI **`nik` dan `npwp` TIDAK unique**. Risiko duplikat NIK karyawan, padahal NIK harus unique secara hukum |
| B5 | Migration status | **PASS** | `prisma migrate status` → "Database schema is up to date!" |
| B6 | Seed idempotent | **PASS** | Run 2x berturut-turut → employees count tetap 15 ✅ |
| B7 | AppConfig PATCH merge | **PASS (sudah fixed)** | Verified merging existing data sebelum upsert |
| B8 | Audit log dipopulasi | **MEDIUM (M-03)** | Table `audit_logs` ada, tapi tidak ada code yang menulis ke sana. Operasi destructive (reset, delete employee) tidak ter-log |

---

## 3. Area C — API Contract & Validasi

| ID | Item | Hasil | Bukti |
|---|---|---|---|
| C1 | Response envelope | **PASS** | 21/22 route pakai `successResponse`/`errorResponse`. Hanya `/api/auth/[...nextauth]` yang dikecualikan (NextAuth handler) |
| C2 | Zod validation di mutation | **MEDIUM (M-04)** | 13/16 mutation route pakai Zod. Yang belum: `/api/company`, `/api/settings/app-config`, `/api/settings/reset` (reset hanya cek string action — OK; sisanya harus divalidasi) |
| C3 | Pagination | **MEDIUM (M-05)** | Hanya 5 route punya skip/take. `/api/employees` dan `/api/attendance` mengembalikan SEMUA baris — akan jadi masalah saat data tumbuh (>1000 baris) |
| C4 | Error tidak bocor | **PASS** | Hanya 1 lokasi log error.message ke client (`/api/settings/reset` saat seed gagal — acceptable untuk SUPER_ADMIN-only) |
| C5 | Default employeeId dari session | **MEDIUM (M-06)** | `/api/attendance/today` butuh query `?employeeId=` (HTTP 400 tanpa). Untuk role EMPLOYEE harus default ke `session.user.employeeId` |
| C6 | TypeScript types sinkron | **PASS** | `npx tsc --noEmit` clean |
| C7 | HTTP status semantik | **PASS** | Distribusi: 201 (created) 7×, 400 (bad req) 23×, 403 (forbidden) 2×, 404 (not found) 12×, 409 (conflict) 8×, 500 (error) 1×. Konsisten ✅ |

---

## 4. Daftar Temuan (Konsolidasi)

### HIGH (harus fix sebelum rilis multi-user)

#### H-01 — Admin lockout pada reset (✅ FIXED dalam audit ini)
**Masalah**: `POST /api/settings/reset {action:"reset"}` menghapus tabel `users` & `sessions`, mengunci admin.
**Fix**:
- `src/app/api/settings/reset/route.ts` sekarang membedakan path `reset` (preserveAuth=true) vs `reseed` (full truncate).
- Path preserveAuth: clear `users.employeeId` → DELETE non-preserved tables → users/sessions/audit_logs tidak ikut dihapus.
**Verifikasi**: Reset → users=4 preserved, employees=0, login lama tetap valid, fresh re-login HTTP 302 + session valid.

#### H-02 — Tidak ada rate limit pada `/api/auth/callback/credentials`
**Risiko**: Brute-force password jarak jauh tanpa hambatan. RPi5 di LAN bisa di-attack via insider.
**Fix yang disarankan**: Pakai `next-rate-limit` atau implementasi token-bucket berbasis Redis/in-memory; max 5 percobaan/menit per IP.

#### H-03 — Default password dari seed tidak dipaksa diganti
**Risiko**: Jika user tidak ingat ganti password setelah deploy, akun admin pakai `admin123` di production.
**Fix yang disarankan**:
1. Tambah field `mustChangePassword` di User model
2. Set `true` di seed
3. Middleware login redirect ke `/change-password` jika true
4. Setelah ganti → set false

#### H-04 — `nik` dan `npwp` tidak unique
**Risiko**: Duplikasi data karyawan, masalah hukum untuk pelaporan pajak.
**Fix**: Tambah `@unique` di schema + migration. Sebelum migrate, jalankan SELECT untuk cek duplikat existing.

### MEDIUM

#### M-01 — `__Secure-` cookie di HTTP
NextAuth otomatis pakai prefix `__Secure-` di production mode. Browser akan menolak set cookie ini di HTTP. Untuk LAN deployment di RPi5: setup nginx/caddy reverse proxy dengan TLS self-signed atau mTLS.

#### M-02 — onDelete policy implisit
4 dari 79 relasi punya `onDelete` eksplisit. Tambahkan `onDelete: Restrict` atau `Cascade` di setiap relasi untuk dokumentasi & prediktabilitas.

#### M-03 — Audit log tidak ditulis
Tabel `audit_logs` kosong. Tambah helper `logAudit(userId, action, entityType, entityId, oldVal, newVal)` dan panggil di setiap mutation route.

#### M-04 — Zod absent di 3 route mutation
`/api/company`, `/api/settings/app-config`, `/api/settings/reset` belum pakai Zod. Tambahkan schema validation.

#### M-05 — Tidak ada pagination di list besar
`/api/employees` returns 18 KB untuk 15 karyawan; akan tumbuh linier. Tambah `?page=&limit=` (default limit 50).

#### M-06 — `/api/attendance/today` tidak default dari session
Untuk role EMPLOYEE: `employeeId = session.user.employeeId`; untuk MANAGER/HR: query param wajib.

### LOW

- **L-01** Session expiry tidak diset eksplisit (default 30 hari)
- **L-02** `metadata.themeColor` warning di 9 halaman (pindah ke viewport)
- **L-03** Prisma config deprecation warning (migrate ke `prisma.config.ts` sebelum Prisma 7)
- **L-04** No healthcheck Docker untuk `hris-app`

---

## 5. Tindak Lanjut

### Sudah dikerjakan dalam audit ini
- ✅ **H-01** Fix admin lockout
- ✅ Rebuild & verify container

### Roadmap perbaikan (urutan rekomendasi)
1. **H-04** NIK/NPWP unique (1 jam) — paling cepat, paling penting
2. **H-03** Force change password (2-3 jam)
3. **H-02** Rate limit auth (2 jam)
4. **M-03** Audit logging (3-4 jam)
5. **M-05** Pagination (2 jam)
6. **M-04** Zod validation 3 route (1 jam)
7. **M-01** TLS reverse proxy (4 jam, butuh testing di RPi5)
8. **M-02** onDelete eksplisit (2 jam)
9. **M-06** attendance/today default employeeId (30 menit)
10. LOW items batch (2 jam)

**Estimasi total**: ~22 jam kerja untuk siap rilis multi-user.

### Belum diaudit (jadwal H+1, H+2)
- Area D — Frontend (13 halaman migrated)
- Area E — Build, Deploy, Operasional
- Area F — Reset/Reseed lifecycle (sebagian sudah dicover oleh H-01 fix)

---

## 6. Lampiran

### Perintah verifikasi yang digunakan
```bash
# Login & API smoke
curl -sk -c jar -b jar /api/auth/csrf
curl -sk -b jar -X POST /api/auth/callback/credentials ...
curl -sk -b jar /api/employees -w "%{http_code}"

# RBAC negative
curl -sk -b emp-jar -X POST /api/employees → 403 ✓
curl -sk -b emp-jar -X POST /api/settings/reset → 403 ✓

# DB integrity
docker exec hris-db psql -U hris_user -d hris_db -c "SELECT count(*) FROM ..."
npx prisma migrate status

# Seed idempotency
npx tsx prisma/seed.ts (×2) → employees count stable

# Reset preserveAuth
POST /api/settings/reset {action:reset}
→ users=4 preserved, employees=0, re-login OK ✓
```

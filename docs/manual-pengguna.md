---
pdf_options:
  format: A4
  margin: 25mm 20mm 25mm 20mm
  displayHeaderFooter: true
  headerTemplate: |-
    <style>
      section { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 8px; color: #666; width: 100%; padding: 0 20mm; }
      .left { float: left; }
      .right { float: right; }
    </style>
    <section>
      <span class="left">HRIS — Manual Pengguna</span>
      <span class="right">v1.0 | Maret 2026</span>
    </section>
  footerTemplate: |-
    <section style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 8px; color: #999; text-align: center; width: 100%;">
      Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span>
    </section>
stylesheet: []
body_class: manual
---

<div style="text-align: center; padding: 80px 0 40px;">
  <h1 style="font-size: 36px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">HRIS</h1>
  <h2 style="font-size: 20px; font-weight: 400; color: #64748b; margin-bottom: 40px;">Human Resource Information System</h2>
  <hr style="border: 2px solid #3b82f6; width: 100px; margin: 0 auto 40px;" />
  <h2 style="font-size: 28px; font-weight: 600; color: #1e293b;">Manual Pengguna</h2>
  <p style="font-size: 14px; color: #94a3b8; margin-top: 16px;">Versi 1.0 — Maret 2026</p>
  <p style="font-size: 12px; color: #94a3b8; margin-top: 60px;">Dokumen ini berisi panduan lengkap penggunaan<br/>aplikasi HRIS untuk seluruh role pengguna.</p>
</div>

<div style="page-break-after: always;"></div>

# Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Memulai Aplikasi](#2-memulai-aplikasi)
3. [Login & Autentikasi](#3-login--autentikasi)
4. [Dashboard](#4-dashboard)
5. [Manajemen Karyawan](#5-manajemen-karyawan)
6. [Departemen & Jabatan](#6-departemen--jabatan)
7. [Absensi](#7-absensi)
8. [Manajemen Cuti](#8-manajemen-cuti)
9. [Penggajian](#9-penggajian)
10. [Rekrutmen](#10-rekrutmen)
11. [Penilaian Kinerja](#11-penilaian-kinerja)
12. [Training](#12-training)
13. [Employee Lifecycle](#13-employee-lifecycle)
14. [Keuangan (Kasbon & Klaim)](#14-keuangan-kasbon--klaim)
15. [Shift & Jadwal](#15-shift--jadwal)
16. [Employee Self-Service (ESS)](#16-employee-self-service-ess)
17. [Pengaturan Sistem](#17-pengaturan-sistem)
18. [Hak Akses & Role](#18-hak-akses--role)
19. [FAQ & Troubleshooting](#19-faq--troubleshooting)

<div style="page-break-after: always;"></div>

# 1. Pendahuluan

## 1.1 Tentang Aplikasi

HRIS (Human Resource Information System) adalah aplikasi manajemen sumber daya manusia yang dirancang untuk membantu perusahaan mengelola seluruh aspek HR secara digital dan terintegrasi.

## 1.2 Modul yang Tersedia

| No | Modul | Deskripsi |
|----|-------|-----------|
| 1 | Karyawan | Data master karyawan, CRUD lengkap |
| 2 | Departemen & Jabatan | Struktur organisasi |
| 3 | Absensi | Kehadiran, overtime, hari libur |
| 4 | Cuti | Pengajuan, saldo, approval |
| 5 | Penggajian | Payroll, slip gaji, BPJS, PPh 21 |
| 6 | Rekrutmen | Lowongan, pelamar, pipeline |
| 7 | Penilaian Kinerja | Review cycle, KPI, scoring |
| 8 | Training | Program, peserta, sertifikasi |
| 9 | Onboarding | Template, checklist |
| 10 | Riwayat Karir | Promosi, transfer, resign |
| 11 | Kasbon & Klaim | Advances, expense claims |
| 12 | Shift | Jadwal kerja, roster |
| 13 | Employee Self-Service | 8 sub-modul personal |

## 1.3 Persyaratan Sistem

- Browser modern (Chrome, Firefox, Safari, Edge)
- Koneksi internet (jika di-deploy online)
- Resolusi layar minimum 1024x768 (responsive untuk mobile)

<div style="page-break-after: always;"></div>

# 2. Memulai Aplikasi

## 2.1 Akses Aplikasi

Buka browser dan akses URL aplikasi:

- **Development**: `http://localhost:3000`
- **Production**: sesuai domain yang dikonfigurasi

## 2.2 Halaman Login

Halaman login menampilkan form email dan password. Tersedia juga tombol demo account untuk pengujian.

## 2.3 Demo Account

Untuk keperluan demo, tersedia 4 akun:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@company.co.id | admin123 |
| HR Admin | hr@company.co.id | hr123 |
| Manager | manager@company.co.id | manager123 |
| Karyawan | karyawan@company.co.id | karyawan123 |

> **Catatan**: Klik tombol demo account untuk mengisi email & password secara otomatis, lalu klik "Masuk".

<div style="page-break-after: always;"></div>

# 3. Login & Autentikasi

## 3.1 Cara Login

1. Buka halaman login
2. Masukkan **email** dan **password**
3. Klik tombol **"Masuk"**
4. Sistem akan memverifikasi kredensial dan mengarahkan ke Dashboard

## 3.2 Logout

1. Klik avatar/inisial di pojok kanan atas header
2. Atau akses `/api/auth/signout`
3. Klik **"Sign out"** untuk keluar

## 3.3 Session

- Session menggunakan JWT token
- Session otomatis aktif selama browser terbuka
- Jika session expired, sistem akan redirect ke halaman login

<div style="page-break-after: always;"></div>

# 4. Dashboard

## 4.1 Dashboard Admin (HR Admin / Manager / Super Admin)

Dashboard admin menampilkan ringkasan data seluruh perusahaan:

### Stat Cards
- **Total Karyawan**: Jumlah karyawan aktif
- **Departemen**: Jumlah departemen aktif + jabatan
- **Hadir Hari Ini**: Jumlah kehadiran hari ini
- **Pengajuan Cuti**: Cuti yang menunggu persetujuan

### Quick Actions
4 tombol aksi cepat: Tambah Karyawan, Proses Payroll, Ajukan Cuti, Lihat Absensi

### Charts
- **Tren Kehadiran (7 Hari)**: Grafik garis kehadiran mingguan
- **Distribusi Cuti**: Pie chart distribusi tipe cuti

### Informasi Lainnya
- Kontrak yang segera berakhir (3 bulan ke depan)
- Karyawan per departemen (bar chart)
- Karyawan baru (5 terakhir)
- Aktivitas terbaru (8 terakhir)

## 4.2 Dashboard Karyawan (Employee)

Dashboard personal menampilkan data diri sendiri:

- **Profil Card**: Nama, jabatan, departemen, nomor karyawan
- **Sisa Cuti**: Saldo cuti tahunan
- **Hari Hadir**: Total kehadiran bulan ini
- **Cuti Pending**: Pengajuan cuti yang menunggu
- **Gaji Terakhir**: Take home pay slip terakhir
- **Quick Links**: Profil, Slip Gaji, Ajukan Cuti, Absensi
- **Penilaian Kinerja**: Review terbaru + score
- **Training**: Daftar training yang diikuti

<div style="page-break-after: always;"></div>

# 5. Manajemen Karyawan

## 5.1 Melihat Daftar Karyawan

**Menu**: Menu Utama > Karyawan

Halaman menampilkan tabel karyawan dengan fitur:
- **Search**: Cari berdasarkan nama, nomor karyawan, email
- **Filter Departemen**: Filter by departemen
- **Filter Status**: Aktif, Probation, Resign, Diberhentikan, Pensiun
- **Filter Tipe**: Tetap, Kontrak, Probation, Magang
- **Pagination**: 10 data per halaman

## 5.2 Menambah Karyawan Baru

1. Klik tombol **"+ Tambah Karyawan"** (pojok kanan atas)
2. Isi form **Step 1 — Data Pribadi**:
   - Nama depan & belakang
   - Email, telepon, jenis kelamin, NIK
   - Tanggal & tempat lahir
   - Agama, status pernikahan, tanggungan
   - Alamat lengkap
   - Kontak darurat
3. Klik **"Selanjutnya"**
4. Isi form **Step 2 — Kepegawaian**:
   - Departemen & jabatan
   - Atasan langsung
   - Status kepegawaian (tetap/kontrak/probation/magang)
   - Tanggal bergabung & berakhir (jika kontrak)
   - Gaji pokok
5. Klik **"Selanjutnya"**
6. Isi form **Step 3 — Keuangan & Pajak**:
   - NPWP, status PTKP, metode pajak
   - BPJS Kesehatan & Ketenagakerjaan
   - Rekening bank (nama bank, nomor, atas nama)
7. Klik **"Simpan Karyawan"**

## 5.3 Mengedit Karyawan

1. Di daftar karyawan, klik ikon **pensil** (Edit) pada baris karyawan
2. Form edit akan terbuka dengan data terisi
3. Ubah field yang diperlukan
4. Klik **"Simpan Perubahan"**

## 5.4 Menghapus Karyawan

1. Klik ikon **tempat sampah** (Hapus) pada baris karyawan
2. Dialog konfirmasi muncul: _"Apakah Anda yakin ingin menghapus karyawan [nama]?"_
3. Klik **"Hapus"** untuk konfirmasi, atau **"Batal"** untuk membatalkan

> **Catatan**: Penghapusan bersifat soft-delete (data ditandai sebagai dihapus, tidak benar-benar hilang).

## 5.5 Melihat Detail Karyawan

1. Klik ikon **mata** (Lihat) pada baris karyawan
2. Halaman detail menampilkan 3 tab:
   - **Informasi Pribadi**: NIK, TTL, gender, agama, alamat, kontak darurat
   - **Kepegawaian**: Nomor karyawan, dept, jabatan, atasan, status, kontrak
   - **Keuangan & Pajak**: NPWP, BPJS, rekening bank

<div style="page-break-after: always;"></div>

# 6. Departemen & Jabatan

## 6.1 Manajemen Departemen

**Menu**: Menu Utama > Departemen

### Menambah Departemen
1. Klik **"Tambah Departemen"**
2. Isi: nama, kode, deskripsi, departemen induk (opsional), status aktif
3. Klik **"Tambah"**

### Mengedit Departemen
1. Klik ikon **pensil** pada baris departemen
2. Ubah data, klik **"Simpan Perubahan"**

### Menghapus Departemen
1. Klik ikon **tempat sampah**
2. Konfirmasi dialog muncul
3. Klik **"Hapus"** untuk konfirmasi

## 6.2 Manajemen Jabatan

**Menu**: Menu Utama > Jabatan

Sama seperti departemen, dengan tambahan filter by departemen. Setiap jabatan terhubung ke satu departemen.

## 6.3 Bagan Organisasi

**Menu**: Menu Utama > Bagan Organisasi

Menampilkan tree view interaktif struktur organisasi berdasarkan hierarki karyawan (atasan-bawahan). Bisa expand/collapse per level.

<div style="page-break-after: always;"></div>

# 7. Absensi

**Menu**: HR Management > Absensi

## 7.1 Tab Kehadiran Hari Ini

Menampilkan:
- **Stat Cards**: Hadir, Terlambat, Tidak Hadir, Cuti/Sakit/Dinas
- **Tabel**: Nama, check in/out, keterlambatan, jam kerja, lembur, status

Status kehadiran: Hadir, Terlambat, Tidak Hadir, Sakit, Cuti, Dinas

## 7.2 Tab Overtime

- Daftar pengajuan lembur karyawan
- Approve/reject pengajuan overtime
- Detail: tanggal, jam mulai/selesai, durasi, alasan

## 7.3 Tab Hari Libur

- Daftar hari libur nasional dan perusahaan
- Tambah hari libur baru

<div style="page-break-after: always;"></div>

# 8. Manajemen Cuti

**Menu**: HR Management > Cuti

## 8.1 Tab Pengajuan Cuti

Menampilkan semua pengajuan cuti dengan stat cards:
- Total Pengajuan, Menunggu, Disetujui, Ditolak

Fitur:
- **Filter status**: Semua, Menunggu, Disetujui, Ditolak
- **Approve**: Klik tombol hijau **"Setujui"**
- **Reject**: Klik tombol merah **"Tolak"**

## 8.2 Tab Saldo Cuti

Menampilkan saldo cuti per karyawan:
- Entitlement (jatah), Carried (bawa dari tahun lalu)
- Used (terpakai), Pending (menunggu)
- Sisa = Entitlement + Carried - Used - Pending

## 8.3 Tab Tipe Cuti

Kelola jenis-jenis cuti:
- Cuti Tahunan, Cuti Sakit, Cuti Melahirkan, Cuti Ayah
- Cuti Menikah, Cuti Duka, Cuti Tanpa Bayar
- Tambah/edit/hapus tipe cuti

<div style="page-break-after: always;"></div>

# 9. Penggajian

**Menu**: HR Management > Penggajian

## 9.1 Tab Periode Payroll

Menampilkan daftar periode payroll (bulanan):
- Stat cards: Total Periode, Sudah Dibayar, Menunggu Approval
- Tabel: periode, status, jumlah karyawan, total gross/potongan/net
- **Proses Payroll**: Klik tombol untuk memproses dari status "Dihitung" ke "Dibayar"

## 9.2 Tab Slip Gaji

Menampilkan slip gaji per karyawan per periode:
- Pilih periode dari dropdown
- Detail: gaji pokok, tunjangan, BPJS Kes, BPJS TK, PPh 21
- **Gaji Bersih (Take Home Pay)** = Total Pendapatan - Total Potongan

### Komponen Slip Gaji

| Komponen | Keterangan |
|----------|------------|
| Gaji Pokok | Sesuai data karyawan |
| Tunjangan | Tunjangan jabatan/transport/makan |
| BPJS Kesehatan | Potongan 4% (perusahaan) + 1% (karyawan) |
| BPJS Ketenagakerjaan | JHT, JKK, JKM, JP |
| PPh 21 | Pajak penghasilan sesuai PTKP |

<div style="page-break-after: always;"></div>

# 10. Rekrutmen

**Menu**: HR Management > Rekrutmen

## 10.1 Tab Lowongan Kerja

- Stat cards: Total Lowongan, Dipublikasi, Draft, Ditutup
- **Tambah Lowongan**: Klik "Tambah Lowongan" → isi judul, dept, tipe, lokasi, jumlah lowongan
- **Publish**: Klik "Publish" untuk mempublikasikan lowongan draft
- **Tutup**: Klik "Tutup" untuk menutup lowongan aktif
- **Lihat Pelamar**: Klik untuk melihat pelamar per lowongan

## 10.2 Tab Pelamar

- Daftar semua pelamar
- Status pipeline: Applied, HR Interview, Technical, User Interview, Final, Offered, Hired, Rejected
- Update status pelamar per tahap

<div style="page-break-after: always;"></div>

# 11. Penilaian Kinerja

**Menu**: HR Management > Penilaian Kinerja

## 11.1 Tab Review Cycle

- Daftar cycle review (Q1, Q2, Q3, Q4, Annual)
- **Tambah Cycle**: Klik "Tambah Cycle" → isi nama, tipe, periode, deadline

## 11.2 Tab Hasil Review

- Filter by cycle
- Tabel: karyawan, departemen, self score, manager score, final score, status
- Status: Draft, Self Review, Manager Review, Completed

### Cara Penilaian
1. HR membuat review cycle
2. Karyawan mengisi self assessment (via ESS Kinerja Saya)
3. Manager memberikan score
4. HR memfinalisasi score akhir

<div style="page-break-after: always;"></div>

# 12. Training

**Menu**: HR Management > Training

## 12.1 Tab Program Training

- Daftar training: judul, kategori, metode, trainer, lokasi, jadwal
- Kategori: Technical, Soft Skill, Compliance, Certification, Onboarding
- Metode: Online, Offline, Hybrid
- **Tambah Training**: Form create training baru

## 12.2 Tab Peserta

- Daftar peserta per training
- Status: Registered, Attended, Completed, Absent
- Filter by training program

<div style="page-break-after: always;"></div>

# 13. Employee Lifecycle

## 13.1 Onboarding

**Menu**: Employee Lifecycle > Onboarding

- Tab **Proses Onboarding**: Daftar karyawan yang sedang onboarding + checklist tasks
- Tab **Templates**: Template onboarding yang bisa di-reuse
- Toggle checklist per task (centang selesai)

## 13.2 Riwayat Karir

**Menu**: Employee Lifecycle > Riwayat Karir

- Timeline event: promosi, transfer, demosi, perpanjangan kontrak, resign, terminasi, pensiun
- Search dan filter by tipe event
- **Tambah Event**: Klik "Tambah Event" → pilih tipe, karyawan, tanggal efektif, deskripsi

<div style="page-break-after: always;"></div>

# 14. Keuangan (Kasbon & Klaim)

## 14.1 Kasbon (Cash Advance)

**Menu**: Keuangan > Kasbon

- Stat cards: total kasbon, disetujui, pending, ditolak
- **Tambah Kasbon**: Pilih karyawan, jumlah, alasan
- **Approve/Reject**: Klik tombol pada baris kasbon pending

## 14.2 Klaim Pengeluaran (Expense Claims)

**Menu**: Keuangan > Klaim Pengeluaran

- Stat cards: total klaim, disetujui, pending, ditolak
- Kategori: Transport, Makan, Akomodasi, Lainnya
- **Tambah Klaim**: Pilih karyawan, kategori, jumlah, tanggal, deskripsi
- **Approve/Reject**: Klik tombol pada baris klaim pending

<div style="page-break-after: always;"></div>

# 15. Shift & Jadwal

**Menu**: HR Management > Shift

## 15.1 Tab Tipe Shift

- Daftar tipe shift: nama, jam mulai, jam selesai
- Contoh: Pagi (06:00-14:00), Siang (14:00-22:00), Malam (22:00-06:00)
- Tambah tipe shift baru

## 15.2 Tab Assignment

- Assign karyawan ke tipe shift tertentu
- Periode: tanggal mulai & selesai

## 15.3 Tab Roster Mingguan

- Grid view jadwal shift per hari per karyawan
- Tampilan kalender mingguan

<div style="page-break-after: always;"></div>

# 16. Employee Self-Service (ESS)

ESS adalah modul khusus untuk karyawan mengakses data pribadi sendiri. Semua data difilter berdasarkan akun login.

## 16.1 Profil Saya

**Menu**: Self Service > Profil Saya

Menampilkan:
- Header: foto/inisial, nama, jabatan, departemen, status
- Informasi Pribadi: NIK, TTL, gender, agama, status pernikahan
- Data Kepegawaian: nomor karyawan, dept, jabatan, atasan, tanggal masuk
- Alamat: alamat lengkap, kota, provinsi, kode pos
- Kontak Darurat: nama, telepon, hubungan

## 16.2 Slip Gaji

**Menu**: Self Service > Slip Gaji

- Menampilkan slip gaji bulan terakhir
- Detail: gaji pokok, tunjangan, BPJS, PPh 21, gaji bersih
- Info kehadiran: hari kerja, hadir, lembur
- Tombol **Download PDF**

## 16.3 Cuti Saya

**Menu**: Self Service > Cuti Saya

- **Saldo Cuti**: Sisa cuti tahunan (entitlement - used - pending)
- **Riwayat Pengajuan**: Tabel pengajuan cuti dengan status
- **Ajukan Cuti**:
  1. Klik tombol **"Ajukan Cuti"**
  2. Pilih tipe cuti dari dropdown
  3. Isi tanggal mulai & selesai
  4. Tulis alasan
  5. Klik **"Ajukan"**
  6. Status awal: Menunggu (pending approval dari atasan)

## 16.4 Absensi Saya

**Menu**: Self Service > Absensi Saya

- Rekap kehadiran pribadi
- Detail: tanggal, check in/out, status

## 16.5 Kinerja Saya

**Menu**: Self Service > Kinerja Saya

- Review terbaru: cycle name, status
- Scores: Self Score, Manager Score, Final Score
- Reviewer name

## 16.6 Training Saya

**Menu**: Self Service > Training Saya

- Daftar training yang diikuti
- Status per training: Terdaftar, Hadir, Selesai

## 16.7 Kasbon Saya

**Menu**: Self Service > Kasbon Saya

- Daftar kasbon & klaim pengeluaran pribadi
- Bisa ajukan kasbon & klaim baru

## 16.8 Shift Saya

**Menu**: Self Service > Shift Saya

- Jadwal shift pribadi
- Tampilan mingguan & kalender bulanan

<div style="page-break-after: always;"></div>

# 17. Pengaturan Sistem

**Menu**: Sistem > Pengaturan (Super Admin only)

## 17.1 Informasi Perusahaan

Form edit data perusahaan:
- Nama perusahaan, nama legal, NPWP
- Alamat, kota, provinsi, kode pos
- Telepon, email, website

## 17.2 Konfigurasi Payroll

- UMR Amount & Region
- Cut-off date (tanggal potong payroll)
- Pay date (tanggal gajian)

## 17.3 Manajemen Data

- **Reset Data**: Hapus semua data dan mulai dari kosong
- **Restore Demo Data**: Kembalikan data demo awal

> **Peringatan**: Reset data bersifat permanent. Pastikan backup data sebelum reset.

<div style="page-break-after: always;"></div>

# 18. Hak Akses & Role

## 18.1 Jenis Role

| Role | Level | Deskripsi |
|------|-------|-----------|
| **Super Admin** | 4 (tertinggi) | Akses penuh termasuk pengaturan sistem |
| **HR Admin** | 3 | Akses penuh HR operations (CRUD karyawan, rekrutmen, dll) |
| **Manager** | 2 | Lihat data + approve/reject operations |
| **Employee** | 1 (terendah) | Hanya Dashboard personal + Self Service |

## 18.2 Matrix Akses

| Fitur | Employee | Manager | HR Admin | Super Admin |
|-------|:--------:|:-------:|:--------:|:-----------:|
| Dashboard Personal | Ya | - | - | - |
| Dashboard Admin | - | Ya | Ya | Ya |
| Employee Self-Service | Ya | Ya | Ya | Ya |
| Lihat Karyawan | - | Ya | Ya | Ya |
| CRUD Karyawan | - | - | Ya | Ya |
| Departemen & Jabatan | - | - | Ya | Ya |
| Bagan Organisasi | - | Ya | Ya | Ya |
| Absensi (admin) | - | Ya | Ya | Ya |
| Cuti (approve/reject) | - | Ya | Ya | Ya |
| Penggajian (admin) | - | Ya | Ya | Ya |
| Rekrutmen | - | - | Ya | Ya |
| Penilaian Kinerja | - | Ya | Ya | Ya |
| Training (admin) | - | Ya | Ya | Ya |
| Shift (admin) | - | Ya | Ya | Ya |
| Kasbon/Klaim (approve) | - | Ya | Ya | Ya |
| Onboarding | - | - | Ya | Ya |
| Riwayat Karir | - | - | Ya | Ya |
| Pengaturan Sistem | - | - | - | Ya |

## 18.3 Proteksi URL

Jika pengguna mencoba mengakses halaman yang tidak diizinkan melalui URL langsung, sistem akan otomatis **redirect ke Dashboard**.

<div style="page-break-after: always;"></div>

# 19. FAQ & Troubleshooting

## Q: Data saya hilang setelah membersihkan browser?
**A**: Dalam demo mode, data disimpan di localStorage browser. Membersihkan cache/data browser akan menghapus data. Untuk production, gunakan mode PostgreSQL.

## Q: Bagaimana cara mengembalikan data demo?
**A**: Login sebagai Super Admin > Pengaturan > Manajemen Data > klik **"Restore Demo Data"**.

## Q: Saya tidak bisa mengakses halaman tertentu?
**A**: Periksa role akun Anda. Setiap role memiliki hak akses berbeda (lihat Bab 18). Hubungi Super Admin jika perlu perubahan role.

## Q: Bagaimana cara mengganti password?
**A**: Dalam demo mode, password tidak bisa diubah. Untuk production mode dengan database, fitur ini perlu dikembangkan.

## Q: Profil ESS menampilkan "Data karyawan tidak ditemukan"?
**A**: Akun Anda belum terhubung dengan data karyawan. Hubungi HR Admin untuk menghubungkan akun user dengan data employee.

## Q: Slip gaji tidak muncul?
**A**: Pastikan HR Admin sudah memproses payroll untuk periode tersebut. Slip gaji baru tersedia setelah payroll diproses.

## Q: Bagaimana cara deploy ke production?
**A**: Lihat bagian Deployment di README.md repository. Secara umum: setup PostgreSQL, konfigurasi .env, jalankan `npm run db:push`, `npm run db:seed`, `npm run build`, `npm start`.

---

<div style="text-align: center; padding: 40px 0; color: #94a3b8; font-size: 12px;">
  <p><strong>HRIS v1.0</strong> — Human Resource Information System</p>
  <p>Manual Pengguna | Maret 2026</p>
  <p style="margin-top: 16px;">Dibangun dengan Next.js 16, React 19, TypeScript, Tailwind CSS 4</p>
</div>

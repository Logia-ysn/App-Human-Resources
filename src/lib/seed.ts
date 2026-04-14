import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seedDatabase(prisma: PrismaClient) {
  console.log("🌱 Seeding database...\n");

  // ==========================================
  // 1. COMPANY
  // ==========================================
  const company = await prisma.company.upsert({
    where: { id: "company-1" },
    update: {},
    create: {
      id: "company-1",
      name: "Nama Perusahaan Anda",
      legalName: "PT Nama Perusahaan Anda",
      npwp: "00.000.000.0-000.000",
      address: "Jl. Contoh No. 1",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      postalCode: "12345",
      phone: "021-0000000",
      email: "info@perusahaan.co.id",
      website: "https://perusahaan.co.id",
      umrAmount: 5067381,
      umrRegion: "DKI Jakarta",
      cutOffDate: 25,
      payDate: 28,
    },
  });
  console.log(`✅ Company: ${company.name}`);

  // ==========================================
  // 2. DEPARTMENTS (9)
  // ==========================================
  const deptData = [
    { id: "dept-1", name: "Board of Directors", code: "BOD", description: "Direksi perusahaan", parentId: null },
    { id: "dept-2", name: "Human Resources", code: "HR", description: "Sumber Daya Manusia", parentId: null },
    { id: "dept-3", name: "Finance & Accounting", code: "FIN", description: "Keuangan dan Akuntansi", parentId: null },
    { id: "dept-4", name: "Information Technology", code: "IT", description: "Teknologi Informasi", parentId: null },
    { id: "dept-5", name: "Marketing", code: "MKT", description: "Pemasaran dan Komunikasi", parentId: null },
    { id: "dept-6", name: "Operations", code: "OPS", description: "Operasional dan Produksi", parentId: null },
    { id: "dept-7", name: "Sales", code: "SALES", description: "Penjualan dan Business Development", parentId: null },
    { id: "dept-8", name: "Legal & Compliance", code: "LEGAL", description: "Hukum dan Kepatuhan", parentId: null },
    { id: "dept-9", name: "General Affairs", code: "GA", description: "Urusan Umum", parentId: "dept-2" },
  ];

  for (const d of deptData) {
    await prisma.department.upsert({
      where: { code: d.code },
      update: {},
      create: { id: d.id, name: d.name, code: d.code, description: d.description, parentId: d.parentId },
    });
  }
  console.log(`✅ Departments: ${deptData.length}`);

  // ==========================================
  // 3. POSITIONS (15)
  // ==========================================
  const posData = [
    { id: "pos-1", name: "Direktur Utama", code: "BOD-DIR", departmentId: "dept-1", level: "DIRECTOR" as const, minSalary: 50000000, maxSalary: 100000000, description: "Pimpinan tertinggi perusahaan" },
    { id: "pos-2", name: "HR Manager", code: "HR-MGR", departmentId: "dept-2", level: "MANAGER" as const, minSalary: 15000000, maxSalary: 25000000, description: "Manajer SDM" },
    { id: "pos-3", name: "HR Staff", code: "HR-STF", departmentId: "dept-2", level: "STAFF" as const, minSalary: 6000000, maxSalary: 10000000, description: "Staf SDM" },
    { id: "pos-4", name: "IT Manager", code: "IT-MGR", departmentId: "dept-4", level: "MANAGER" as const, minSalary: 18000000, maxSalary: 30000000, description: "Manajer TI" },
    { id: "pos-5", name: "Software Developer", code: "IT-DEV", departmentId: "dept-4", level: "STAFF" as const, minSalary: 8000000, maxSalary: 18000000, description: "Pengembang perangkat lunak" },
    { id: "pos-6", name: "UI/UX Designer", code: "IT-UX", departmentId: "dept-4", level: "STAFF" as const, minSalary: 7000000, maxSalary: 15000000, description: "Desainer antarmuka" },
    { id: "pos-7", name: "Finance Manager", code: "FIN-MGR", departmentId: "dept-3", level: "MANAGER" as const, minSalary: 15000000, maxSalary: 25000000, description: "Manajer Keuangan" },
    { id: "pos-8", name: "Accountant", code: "FIN-ACC", departmentId: "dept-3", level: "STAFF" as const, minSalary: 6000000, maxSalary: 12000000, description: "Staf Akuntan" },
    { id: "pos-9", name: "Marketing Manager", code: "MKT-MGR", departmentId: "dept-5", level: "MANAGER" as const, minSalary: 15000000, maxSalary: 25000000, description: "Manajer Pemasaran" },
    { id: "pos-10", name: "Marketing Staff", code: "MKT-STF", departmentId: "dept-5", level: "STAFF" as const, minSalary: 5500000, maxSalary: 10000000, description: "Staf Pemasaran" },
    { id: "pos-11", name: "Sales Manager", code: "SLS-MGR", departmentId: "dept-7", level: "MANAGER" as const, minSalary: 15000000, maxSalary: 25000000, description: "Manajer Penjualan" },
    { id: "pos-12", name: "Sales Executive", code: "SLS-EXE", departmentId: "dept-7", level: "STAFF" as const, minSalary: 5500000, maxSalary: 12000000, description: "Eksekutif Penjualan" },
    { id: "pos-13", name: "Operations Supervisor", code: "OPS-SPV", departmentId: "dept-6", level: "SUPERVISOR" as const, minSalary: 8000000, maxSalary: 14000000, description: "Supervisor Operasional" },
    { id: "pos-14", name: "Operations Staff", code: "OPS-STF", departmentId: "dept-6", level: "STAFF" as const, minSalary: 5000000, maxSalary: 8000000, description: "Staf Operasional" },
    { id: "pos-15", name: "GA Staff", code: "GA-STF", departmentId: "dept-9", level: "STAFF" as const, minSalary: 5000000, maxSalary: 8000000, description: "Staf Urusan Umum" },
  ];

  for (const p of posData) {
    await prisma.position.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }
  console.log(`✅ Positions: ${posData.length}`);

  // ==========================================
  // 4. WORK SCHEDULES
  // ==========================================
  const schedule = await prisma.workSchedule.upsert({
    where: { id: "schedule-regular" },
    update: {},
    create: {
      id: "schedule-regular",
      name: "Regular (08:00 - 17:00)",
      checkInTime: "08:00",
      checkOutTime: "17:00",
      breakMinutes: 60,
      isDefault: true,
    },
  });
  console.log(`✅ Work Schedule: ${schedule.name}`);

  // ==========================================
  // 5. LEAVE TYPES (7)
  // ==========================================
  const leaveTypeData = [
    { id: "lt-1", name: "Cuti Tahunan", code: "ANNUAL", defaultQuota: 12, isPaid: true, isCarryOver: true, maxCarryOver: 6, requiresDoc: false, allowHalfDay: true },
    { id: "lt-2", name: "Cuti Sakit", code: "SICK", defaultQuota: 14, isPaid: true, isCarryOver: false, requiresDoc: true },
    { id: "lt-3", name: "Cuti Melahirkan", code: "MATERNITY", defaultQuota: 90, isPaid: true, genderRestrict: "FEMALE" as const, maxConsecutive: 90, requiresDoc: true },
    { id: "lt-4", name: "Cuti Ayah", code: "PATERNITY", defaultQuota: 2, isPaid: true, genderRestrict: "MALE" as const, requiresDoc: true },
    { id: "lt-5", name: "Cuti Menikah", code: "MARRIAGE", defaultQuota: 3, isPaid: true, requiresDoc: true },
    { id: "lt-6", name: "Cuti Duka", code: "BEREAVEMENT", defaultQuota: 3, isPaid: true },
    { id: "lt-7", name: "Cuti Tanpa Bayar", code: "UNPAID", defaultQuota: 30, isPaid: false },
  ];

  for (const lt of leaveTypeData) {
    await prisma.leaveType.upsert({
      where: { code: lt.code },
      update: {},
      create: lt,
    });
  }
  console.log(`✅ Leave Types: ${leaveTypeData.length}`);

  // ==========================================
  // 6. TAX CONFIG 2026
  // ==========================================
  await prisma.taxConfig.upsert({
    where: { year: 2026 },
    update: {},
    create: {
      year: 2026,
      ptkpRates: {
        TK0: 54000000, TK1: 58500000, TK2: 63000000, TK3: 67500000,
        K0: 58500000, K1: 63000000, K2: 67500000, K3: 72000000,
        KI0: 112500000, KI1: 117000000, KI2: 121500000, KI3: 126000000,
      },
      taxBrackets: [
        { min: 0, max: 60000000, rate: 0.05 },
        { min: 60000000, max: 250000000, rate: 0.15 },
        { min: 250000000, max: 500000000, rate: 0.25 },
        { min: 500000000, max: 5000000000, rate: 0.3 },
        { min: 5000000000, max: null, rate: 0.35 },
      ],
      bpjsKesRate: 0.04,
      bpjsKesMaxSalary: 12000000,
      bpjsTkJhtEmpRate: 0.02,
      bpjsTkJhtErRate: 0.037,
      bpjsTkJpEmpRate: 0.01,
      bpjsTkJpErRate: 0.02,
      bpjsTkJpMaxSalary: 10042300,
      bpjsTkJkkRate: 0.0024,
      bpjsTkJkmRate: 0.003,
      overtimeMultiplier: 1.5,
    },
  });
  console.log("✅ Tax Config 2026");

  // ==========================================
  // 7. SALARY COMPONENTS
  // ==========================================
  const salCompData = [
    { id: "sc-basic", name: "Gaji Pokok", code: "BASIC", type: "EARNING" as const, isTaxable: true, isFixed: true, isMandatory: true, sortOrder: 1 },
    { id: "sc-transport", name: "Tunjangan Transport", code: "TRANSPORT", type: "EARNING" as const, isTaxable: true, isFixed: true, defaultAmount: 500000, sortOrder: 2 },
    { id: "sc-meal", name: "Tunjangan Makan", code: "MEAL", type: "EARNING" as const, isTaxable: true, isFixed: true, defaultAmount: 500000, sortOrder: 3 },
    { id: "sc-position", name: "Tunjangan Jabatan", code: "POSITION", type: "EARNING" as const, isTaxable: true, isFixed: true, sortOrder: 4 },
    { id: "sc-other", name: "Tunjangan Lain-lain", code: "OTHER", type: "EARNING" as const, isTaxable: true, isFixed: true, sortOrder: 5 },
    { id: "sc-overtime", name: "Lembur", code: "OVERTIME", type: "EARNING" as const, isTaxable: true, isFixed: false, sortOrder: 6 },
    { id: "sc-loan", name: "Pinjaman Karyawan", code: "LOAN", type: "DEDUCTION" as const, isTaxable: false, isFixed: false, sortOrder: 10 },
  ];

  for (const sc of salCompData) {
    await prisma.salaryComponent.upsert({
      where: { code: sc.code },
      update: {},
      create: sc,
    });
  }
  console.log(`✅ Salary Components: ${salCompData.length}`);

  // ==========================================
  // 8. EMPLOYEES (15) - created without managerId first
  // ==========================================
  const empData = [
    { id: "emp-1", employeeNumber: "EMP-0001", firstName: "Budi", lastName: "Santoso", email: "budi.santoso@company.co.id", phone: "081200000001", gender: "MALE" as const, dateOfBirth: "1975-03-15", placeOfBirth: "Surabaya", religion: "ISLAM" as const, maritalStatus: "MARRIED" as const, dependents: 2, nik: "3578010000000001", npwp: "01.000.000.0-000.001", bpjsKesNumber: "0001200001", bpjsTkNumber: "TK001", bankName: "BCA", bankAccountNo: "1234567001", bankAccountName: "Budi Santoso", address: "Jl. Sudirman No. 1", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12190", emergencyName: "Wati Santoso", emergencyPhone: "081200000099", emergencyRelation: "Istri", departmentId: "dept-1", positionId: "pos-1", status: "ACTIVE" as const, type: "PERMANENT" as const, joinDate: "2018-01-02", ptkpStatus: "K2" as const, taxMethod: "GROSS" as const, basicSalary: 75000000, allowanceTransport: 2000000, allowanceMeal: 1000000, allowancePosition: 5000000, allowanceOther: 1000000 },
    { id: "emp-2", employeeNumber: "EMP-0002", firstName: "Sari", lastName: "Dewi", email: "sari.dewi@company.co.id", phone: "081200000002", gender: "FEMALE" as const, dateOfBirth: "1990-05-15", placeOfBirth: "Jakarta", religion: "ISLAM" as const, maritalStatus: "MARRIED" as const, dependents: 1, nik: "3171234567890002", npwp: "12.345.678.9-012.002", bpjsKesNumber: "0001200002", bpjsTkNumber: "TK002", bankName: "Mandiri", bankAccountNo: "1234567002", bankAccountName: "Sari Dewi", address: "Jl. Gatot Subroto No. 5", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12930", emergencyName: "Hadi Dewi", emergencyPhone: "081200000098", emergencyRelation: "Suami", departmentId: "dept-2", positionId: "pos-2", status: "ACTIVE" as const, type: "PERMANENT" as const, joinDate: "2020-01-02", ptkpStatus: "K1" as const, taxMethod: "GROSS" as const, basicSalary: 18000000, allowanceTransport: 1500000, allowanceMeal: 750000, allowancePosition: 3000000, allowanceOther: 500000 },
    { id: "emp-3", employeeNumber: "EMP-0003", firstName: "Andi", lastName: "Wijaya", email: "andi.wijaya@company.co.id", phone: "081200000003", gender: "MALE" as const, dateOfBirth: "1988-11-20", placeOfBirth: "Bandung", religion: "KRISTEN" as const, maritalStatus: "MARRIED" as const, dependents: 2, nik: "3273010000000003", npwp: "01.000.000.0-000.003", bpjsKesNumber: "0001200003", bpjsTkNumber: "TK003", bankName: "BCA", bankAccountNo: "1234567003", bankAccountName: "Andi Wijaya", address: "Jl. Kuningan No. 10", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12950", emergencyName: "Linda Wijaya", emergencyPhone: "081200000097", emergencyRelation: "Istri", departmentId: "dept-4", positionId: "pos-4", status: "ACTIVE" as const, type: "PERMANENT" as const, joinDate: "2019-03-15", ptkpStatus: "K2" as const, taxMethod: "GROSS" as const, basicSalary: 22000000, allowanceTransport: 1500000, allowanceMeal: 750000, allowancePosition: 3500000, allowanceOther: 500000 },
    { id: "emp-4", employeeNumber: "EMP-0004", firstName: "Dewi", lastName: "Lestari", email: "dewi.lestari@company.co.id", phone: "081200000004", gender: "FEMALE" as const, dateOfBirth: "1995-08-22", placeOfBirth: "Yogyakarta", religion: "ISLAM" as const, maritalStatus: "SINGLE" as const, dependents: 0, nik: "3404010000000004", npwp: "01.000.000.0-000.004", bpjsKesNumber: "0001200004", bpjsTkNumber: "TK004", bankName: "BNI", bankAccountNo: "1234567004", bankAccountName: "Dewi Lestari", address: "Jl. Casablanca No. 8", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12870", emergencyName: "Sri Lestari", emergencyPhone: "081200000096", emergencyRelation: "Ibu", departmentId: "dept-4", positionId: "pos-5", status: "ACTIVE" as const, type: "PERMANENT" as const, joinDate: "2021-06-01", ptkpStatus: "TK0" as const, taxMethod: "GROSS" as const, basicSalary: 12000000, allowanceTransport: 750000, allowanceMeal: 500000, allowancePosition: 1500000, allowanceOther: 250000 },
    { id: "emp-5", employeeNumber: "EMP-0005", firstName: "Rizky", lastName: "Ramadhan", email: "rizky.ramadhan@company.co.id", phone: "081200000005", gender: "MALE" as const, dateOfBirth: "1997-01-10", placeOfBirth: "Semarang", religion: "ISLAM" as const, maritalStatus: "SINGLE" as const, dependents: 0, nik: "3374010000000005", npwp: "01.000.000.0-000.005", bpjsKesNumber: "0001200005", bpjsTkNumber: "TK005", bankName: "BCA", bankAccountNo: "1234567005", bankAccountName: "Rizky Ramadhan", address: "Jl. HR Rasuna Said No. 3", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12940", emergencyName: "Ahmad Ramadhan", emergencyPhone: "081200000095", emergencyRelation: "Ayah", departmentId: "dept-4", positionId: "pos-5", status: "RESIGNED" as const, type: "CONTRACT" as const, joinDate: "2023-02-01", endDate: "2026-01-31", resignDate: "2026-01-31", ptkpStatus: "TK0" as const, taxMethod: "GROSS" as const, basicSalary: 10000000, allowanceTransport: 750000, allowanceMeal: 500000, allowancePosition: 1000000, allowanceOther: 250000 },
    { id: "emp-6", employeeNumber: "EMP-0006", firstName: "Fitri", lastName: "Handayani", email: "fitri.handayani@company.co.id", phone: "081200000006", gender: "FEMALE" as const, dateOfBirth: "1993-12-05", placeOfBirth: "Medan", religion: "ISLAM" as const, maritalStatus: "MARRIED" as const, dependents: 1, nik: "1271010000000006", npwp: "01.000.000.0-000.006", bpjsKesNumber: "0001200006", bpjsTkNumber: "TK006", bankName: "Mandiri", bankAccountNo: "1234567006", bankAccountName: "Fitri Handayani", address: "Jl. Mampang No. 15", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12790", emergencyName: "Reza Handayani", emergencyPhone: "081200000094", emergencyRelation: "Suami", departmentId: "dept-2", positionId: "pos-3", status: "ACTIVE" as const, type: "PERMANENT" as const, joinDate: "2022-04-01", ptkpStatus: "K1" as const, taxMethod: "GROSS" as const, basicSalary: 8000000, allowanceTransport: 750000, allowanceMeal: 500000, allowancePosition: 1000000, allowanceOther: 250000 },
    { id: "emp-7", employeeNumber: "EMP-0007", firstName: "Agus", lastName: "Prabowo", email: "agus.prabowo@company.co.id", phone: "081200000007", gender: "MALE" as const, dateOfBirth: "1996-07-18", placeOfBirth: "Malang", religion: "ISLAM" as const, maritalStatus: "SINGLE" as const, dependents: 0, nik: "3573010000000007", bpjsKesNumber: "0001200007", bpjsTkNumber: "TK007", bankName: "BRI", bankAccountNo: "1234567007", bankAccountName: "Agus Prabowo", address: "Jl. Kemang No. 20", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12730", emergencyName: "Wahyu Prabowo", emergencyPhone: "081200000093", emergencyRelation: "Ayah", departmentId: "dept-4", positionId: "pos-6", status: "PROBATION" as const, type: "PROBATION" as const, joinDate: "2026-01-15", endDate: "2026-04-15", ptkpStatus: "TK0" as const, taxMethod: "GROSS" as const, basicSalary: 9000000, allowanceTransport: 500000, allowanceMeal: 300000, allowancePosition: 0, allowanceOther: 0 },
    { id: "emp-8", employeeNumber: "EMP-0008", firstName: "Rini", lastName: "Susanti", email: "rini.susanti@company.co.id", phone: "081200000008", gender: "FEMALE" as const, dateOfBirth: "1985-09-25", placeOfBirth: "Jakarta", religion: "KATOLIK" as const, maritalStatus: "MARRIED" as const, dependents: 3, nik: "3171010000000008", npwp: "01.000.000.0-000.008", bpjsKesNumber: "0001200008", bpjsTkNumber: "TK008", bankName: "BCA", bankAccountNo: "1234567008", bankAccountName: "Rini Susanti", address: "Jl. Senopati No. 12", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12110", emergencyName: "Tony Susanto", emergencyPhone: "081200000092", emergencyRelation: "Suami", departmentId: "dept-3", positionId: "pos-7", status: "ACTIVE" as const, type: "PERMANENT" as const, joinDate: "2019-07-01", ptkpStatus: "K3" as const, taxMethod: "GROSS" as const, basicSalary: 20000000, allowanceTransport: 1500000, allowanceMeal: 750000, allowancePosition: 3500000, allowanceOther: 500000 },
    { id: "emp-9", employeeNumber: "EMP-0009", firstName: "Maya", lastName: "Putri", email: "maya.putri@company.co.id", phone: "081200000009", gender: "FEMALE" as const, dateOfBirth: "1991-04-30", placeOfBirth: "Surabaya", religion: "HINDU" as const, maritalStatus: "SINGLE" as const, dependents: 0, nik: "3578010000000009", npwp: "01.000.000.0-000.009", bpjsKesNumber: "0001200009", bpjsTkNumber: "TK009", bankName: "Mandiri", bankAccountNo: "1234567009", bankAccountName: "Maya Putri", address: "Jl. Tendean No. 7", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12710", emergencyName: "Ketut Putri", emergencyPhone: "081200000091", emergencyRelation: "Ibu", departmentId: "dept-5", positionId: "pos-9", status: "ACTIVE" as const, type: "PERMANENT" as const, joinDate: "2020-08-15", ptkpStatus: "TK0" as const, taxMethod: "GROSS" as const, basicSalary: 17000000, allowanceTransport: 1500000, allowanceMeal: 750000, allowancePosition: 3000000, allowanceOther: 500000 },
    { id: "emp-10", employeeNumber: "EMP-0010", firstName: "Deni", lastName: "Pratama", email: "deni.pratama@company.co.id", phone: "081200000010", gender: "MALE" as const, dateOfBirth: "1989-02-14", placeOfBirth: "Bekasi", religion: "ISLAM" as const, maritalStatus: "MARRIED" as const, dependents: 2, nik: "3275010000000010", npwp: "01.000.000.0-000.010", bpjsKesNumber: "0001200010", bpjsTkNumber: "TK010", bankName: "BCA", bankAccountNo: "1234567010", bankAccountName: "Deni Pratama", address: "Jl. Satrio No. 22", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12940", emergencyName: "Siti Pratama", emergencyPhone: "081200000090", emergencyRelation: "Istri", departmentId: "dept-7", positionId: "pos-11", status: "ACTIVE" as const, type: "PERMANENT" as const, joinDate: "2019-11-01", ptkpStatus: "K2" as const, taxMethod: "GROSS" as const, basicSalary: 18000000, allowanceTransport: 1500000, allowanceMeal: 750000, allowancePosition: 3000000, allowanceOther: 500000 },
    { id: "emp-11", employeeNumber: "EMP-0011", firstName: "Fajar", lastName: "Nugroho", email: "fajar.nugroho@company.co.id", phone: "081200000011", gender: "MALE" as const, dateOfBirth: "1998-06-08", placeOfBirth: "Solo", religion: "ISLAM" as const, maritalStatus: "SINGLE" as const, dependents: 0, nik: "3372010000000011", bpjsKesNumber: "0001200011", bpjsTkNumber: "TK011", bankName: "BNI", bankAccountNo: "1234567011", bankAccountName: "Fajar Nugroho", address: "Jl. Tebet No. 30", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12810", emergencyName: "Heru Nugroho", emergencyPhone: "081200000089", emergencyRelation: "Ayah", departmentId: "dept-4", positionId: "pos-5", status: "ACTIVE" as const, type: "CONTRACT" as const, joinDate: "2024-06-01", endDate: "2026-05-31", ptkpStatus: "TK0" as const, taxMethod: "GROSS" as const, basicSalary: 9500000, allowanceTransport: 750000, allowanceMeal: 500000, allowancePosition: 1000000, allowanceOther: 250000 },
    { id: "emp-12", employeeNumber: "EMP-0012", firstName: "Nadia", lastName: "Kartika", email: "nadia.kartika@company.co.id", phone: "081200000012", gender: "FEMALE" as const, dateOfBirth: "1994-10-17", placeOfBirth: "Denpasar", religion: "HINDU" as const, maritalStatus: "MARRIED" as const, dependents: 0, nik: "5171010000000012", npwp: "01.000.000.0-000.012", bpjsKesNumber: "0001200012", bpjsTkNumber: "TK012", bankName: "Mandiri", bankAccountNo: "1234567012", bankAccountName: "Nadia Kartika", address: "Jl. Pancoran No. 9", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12780", emergencyName: "Made Kartika", emergencyPhone: "081200000088", emergencyRelation: "Suami", departmentId: "dept-3", positionId: "pos-8", status: "ACTIVE" as const, type: "PERMANENT" as const, joinDate: "2022-09-01", ptkpStatus: "K0" as const, taxMethod: "GROSS" as const, basicSalary: 8500000, allowanceTransport: 750000, allowanceMeal: 500000, allowancePosition: 1000000, allowanceOther: 250000 },
    { id: "emp-13", employeeNumber: "EMP-0013", firstName: "Hendra", lastName: "Saputra", email: "hendra.saputra@company.co.id", phone: "081200000013", gender: "MALE" as const, dateOfBirth: "1992-05-03", placeOfBirth: "Palembang", religion: "ISLAM" as const, maritalStatus: "MARRIED" as const, dependents: 1, nik: "1671010000000013", npwp: "01.000.000.0-000.013", bpjsKesNumber: "0001200013", bpjsTkNumber: "TK013", bankName: "BRI", bankAccountNo: "1234567013", bankAccountName: "Hendra Saputra", address: "Jl. Warung Buncit No. 14", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12740", emergencyName: "Ratna Saputra", emergencyPhone: "081200000087", emergencyRelation: "Istri", departmentId: "dept-7", positionId: "pos-12", status: "ACTIVE" as const, type: "PERMANENT" as const, joinDate: "2021-03-15", ptkpStatus: "K1" as const, taxMethod: "GROSS" as const, basicSalary: 8000000, allowanceTransport: 750000, allowanceMeal: 500000, allowancePosition: 1000000, allowanceOther: 250000 },
    { id: "emp-14", employeeNumber: "EMP-0014", firstName: "Putri", lastName: "Rahayu", email: "putri.rahayu@company.co.id", phone: "081200000014", gender: "FEMALE" as const, dateOfBirth: "2000-03-21", placeOfBirth: "Makassar", religion: "ISLAM" as const, maritalStatus: "SINGLE" as const, dependents: 0, nik: "7371010000000014", bpjsKesNumber: "0001200014", bpjsTkNumber: "TK014", bankName: "BCA", bankAccountNo: "1234567014", bankAccountName: "Putri Rahayu", address: "Jl. Bangka No. 6", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12720", emergencyName: "Aisyah Rahayu", emergencyPhone: "081200000086", emergencyRelation: "Ibu", departmentId: "dept-5", positionId: "pos-10", status: "ACTIVE" as const, type: "INTERNSHIP" as const, joinDate: "2025-12-01", endDate: "2026-05-31", ptkpStatus: "TK0" as const, taxMethod: "GROSS" as const, basicSalary: 4000000, allowanceTransport: 500000, allowanceMeal: 300000, allowancePosition: 0, allowanceOther: 0 },
    { id: "emp-15", employeeNumber: "EMP-0015", firstName: "Wahyu", lastName: "Hidayat", email: "wahyu.hidayat@company.co.id", phone: "081200000015", gender: "MALE" as const, dateOfBirth: "1987-12-01", placeOfBirth: "Tangerang", religion: "ISLAM" as const, maritalStatus: "DIVORCED" as const, dependents: 1, nik: "3603010000000015", npwp: "01.000.000.0-000.015", bpjsKesNumber: "0001200015", bpjsTkNumber: "TK015", bankName: "Mandiri", bankAccountNo: "1234567015", bankAccountName: "Wahyu Hidayat", address: "Jl. Cilandak No. 18", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12430", emergencyName: "Endah Hidayat", emergencyPhone: "081200000085", emergencyRelation: "Ibu", departmentId: "dept-6", positionId: "pos-13", status: "ACTIVE" as const, type: "PERMANENT" as const, joinDate: "2020-02-01", ptkpStatus: "TK1" as const, taxMethod: "GROSS" as const, basicSalary: 11000000, allowanceTransport: 1000000, allowanceMeal: 500000, allowancePosition: 2000000, allowanceOther: 250000 },
  ];

  // Manager mapping (set after all employees created)
  const managerMap: Record<string, string> = {
    "emp-2": "emp-1", "emp-3": "emp-1", "emp-8": "emp-1", "emp-9": "emp-1",
    "emp-10": "emp-1", "emp-15": "emp-1",
    "emp-4": "emp-3", "emp-5": "emp-3", "emp-7": "emp-3", "emp-11": "emp-3",
    "emp-6": "emp-2",
    "emp-12": "emp-8",
    "emp-13": "emp-10",
    "emp-14": "emp-9",
  };

  // Create employees without managerId first
  for (const e of empData) {
    const { basicSalary, allowanceTransport, allowanceMeal, allowancePosition, allowanceOther, ...empFields } = e;
    await prisma.employee.upsert({
      where: { employeeNumber: empFields.employeeNumber },
      update: {},
      create: {
        ...empFields,
        dateOfBirth: new Date(empFields.dateOfBirth),
        joinDate: new Date(empFields.joinDate),
        endDate: "endDate" in empFields && empFields.endDate ? new Date(empFields.endDate as string) : undefined,
        resignDate: "resignDate" in empFields && empFields.resignDate ? new Date(empFields.resignDate as string) : undefined,
      },
    });
  }

  // Set manager relationships
  for (const [empId, mgrId] of Object.entries(managerMap)) {
    await prisma.employee.update({
      where: { id: empId },
      data: { managerId: mgrId },
    });
  }

  // Set department heads
  const deptHeads: Record<string, string> = {
    "dept-1": "emp-1", "dept-2": "emp-2", "dept-3": "emp-8",
    "dept-4": "emp-3", "dept-5": "emp-9", "dept-7": "emp-10",
  };
  for (const [deptId, headId] of Object.entries(deptHeads)) {
    await prisma.department.update({
      where: { id: deptId },
      data: { headEmployeeId: headId },
    });
  }
  console.log(`✅ Employees: ${empData.length} (with managers & dept heads)`);

  // ==========================================
  // 9. EMPLOYEE SALARIES (map flat fields to EmployeeSalary)
  // ==========================================
  const salaryRecords: { employeeId: string; componentCode: string; amount: number }[] = [];
  for (const e of empData) {
    salaryRecords.push({ employeeId: e.id, componentCode: "BASIC", amount: e.basicSalary });
    if (e.allowanceTransport > 0) salaryRecords.push({ employeeId: e.id, componentCode: "TRANSPORT", amount: e.allowanceTransport });
    if (e.allowanceMeal > 0) salaryRecords.push({ employeeId: e.id, componentCode: "MEAL", amount: e.allowanceMeal });
    if (e.allowancePosition > 0) salaryRecords.push({ employeeId: e.id, componentCode: "POSITION", amount: e.allowancePosition });
    if (e.allowanceOther > 0) salaryRecords.push({ employeeId: e.id, componentCode: "OTHER", amount: e.allowanceOther });
  }

  // Fetch component ids by code
  const components = await prisma.salaryComponent.findMany();
  const compMap = Object.fromEntries(components.map((c) => [c.code, c.id]));

  for (const sr of salaryRecords) {
    const componentId = compMap[sr.componentCode];
    if (!componentId) continue;
    // Use upsert-like logic: delete existing then create
    await prisma.employeeSalary.deleteMany({
      where: { employeeId: sr.employeeId, componentId },
    });
    await prisma.employeeSalary.create({
      data: {
        employeeId: sr.employeeId,
        componentId,
        amount: sr.amount,
        effectiveDate: new Date("2026-01-01"),
        isCurrent: true,
      },
    });
  }
  console.log(`✅ Employee Salaries: ${salaryRecords.length} records`);

  // ==========================================
  // 10. USERS (4 login accounts)
  // ==========================================
  const usersData = [
    { email: "admin@company.co.id", password: "admin123", role: "SUPER_ADMIN" as const, employeeId: null },
    { email: "hr@company.co.id", password: "hr123", role: "HR_ADMIN" as const, employeeId: "emp-2" },
    { email: "manager@company.co.id", password: "manager123", role: "MANAGER" as const, employeeId: "emp-3" },
    { email: "karyawan@company.co.id", password: "karyawan123", role: "EMPLOYEE" as const, employeeId: "emp-4" },
  ];

  for (const u of usersData) {
    const hash = await bcrypt.hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash: hash,
        mustChangePassword: true,
        role: u.role,
        isActive: true,
        employeeId: u.employeeId,
      },
      create: {
        email: u.email,
        passwordHash: hash,
        mustChangePassword: true,
        role: u.role,
        isActive: true,
        employeeId: u.employeeId,
      },
    });
  }
  console.log("✅ Users: 4 (admin, hr, manager, karyawan)");

  // ==========================================
  // 11. HOLIDAYS 2026 (14 + 1 company)
  // ==========================================
  const holidays = [
    { name: "Tahun Baru 2026", date: "2026-01-01", type: "NATIONAL" as const },
    { name: "Isra Miraj", date: "2026-01-27", type: "NATIONAL" as const },
    { name: "Imlek", date: "2026-02-17", type: "NATIONAL" as const },
    { name: "Hari Raya Nyepi", date: "2026-03-19", type: "NATIONAL" as const },
    { name: "Wafat Isa Almasih", date: "2026-04-03", type: "NATIONAL" as const },
    { name: "Hari Buruh", date: "2026-05-01", type: "NATIONAL" as const },
    { name: "Kenaikan Isa Almasih", date: "2026-05-14", type: "NATIONAL" as const },
    { name: "Hari Lahir Pancasila", date: "2026-06-01", type: "NATIONAL" as const },
    { name: "Idul Adha", date: "2026-06-17", type: "NATIONAL" as const },
    { name: "Tahun Baru Islam", date: "2026-07-07", type: "NATIONAL" as const },
    { name: "Hari Kemerdekaan RI", date: "2026-08-17", type: "NATIONAL" as const },
    { name: "Maulid Nabi", date: "2026-09-16", type: "NATIONAL" as const },
    { name: "Hari Natal", date: "2026-12-25", type: "NATIONAL" as const },
    { name: "HUT Perusahaan", date: "2026-10-15", type: "COMPANY" as const },
  ];

  for (const h of holidays) {
    const hid = `hol-${h.name.toLowerCase().replace(/\s+/g, "-")}`;
    await prisma.holiday.upsert({
      where: { id: hid },
      update: {},
      create: { id: hid, name: h.name, date: new Date(h.date), type: h.type },
    });
  }
  console.log(`✅ Holidays: ${holidays.length}`);

  // ==========================================
  // 12. SHIFT TYPES (4)
  // ==========================================
  const shiftTypes = [
    { id: "shift-1", name: "Shift Pagi", startTime: "06:00", endTime: "14:00", breakDuration: 60, color: "#F59E0B" },
    { id: "shift-2", name: "Shift Siang", startTime: "14:00", endTime: "22:00", breakDuration: 60, color: "#3B82F6" },
    { id: "shift-3", name: "Shift Malam", startTime: "22:00", endTime: "06:00", breakDuration: 60, color: "#6366F1" },
    { id: "shift-4", name: "Regular", startTime: "08:00", endTime: "17:00", breakDuration: 60, color: "#10B981" },
  ];

  for (const s of shiftTypes) {
    await prisma.shiftType.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }
  console.log(`✅ Shift Types: ${shiftTypes.length}`);

  // ==========================================
  // 13. SHIFT ASSIGNMENTS (5)
  // ==========================================
  const shiftAssignments = [
    { id: "sa-1", employeeId: "emp-4", shiftId: "shift-4", startDate: "2026-01-01" },
    { id: "sa-2", employeeId: "emp-6", shiftId: "shift-4", startDate: "2026-03-01", endDate: "2026-03-31" },
    { id: "sa-3", employeeId: "emp-15", shiftId: "shift-1", startDate: "2026-03-01", endDate: "2026-03-31" },
    { id: "sa-4", employeeId: "emp-12", shiftId: "shift-4", startDate: "2026-03-01", endDate: "2026-03-31" },
    { id: "sa-5", employeeId: "emp-13", shiftId: "shift-4", startDate: "2026-03-01", endDate: "2026-03-31" },
  ];

  for (const sa of shiftAssignments) {
    await prisma.shiftAssignment.upsert({
      where: { id: sa.id },
      update: {},
      create: {
        id: sa.id,
        employeeId: sa.employeeId,
        shiftId: sa.shiftId,
        startDate: new Date(sa.startDate),
        endDate: "endDate" in sa && sa.endDate ? new Date(sa.endDate) : undefined,
      },
    });
  }
  console.log(`✅ Shift Assignments: ${shiftAssignments.length}`);

  // ==========================================
  // 14. ATTENDANCE RECORDS (15 for today)
  // ==========================================
  const today = "2026-03-23";
  const attData = [
    { id: "att-1", employeeId: "emp-1", date: today, checkIn: "07:55", checkOut: "17:05", lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 480, overtimeMinutes: 5, status: "PRESENT" as const },
    { id: "att-2", employeeId: "emp-2", date: today, checkIn: "08:00", checkOut: "17:00", lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 480, overtimeMinutes: 0, status: "PRESENT" as const },
    { id: "att-3", employeeId: "emp-3", date: today, checkIn: "08:15", checkOut: "17:30", lateMinutes: 15, earlyLeaveMin: 0, workMinutes: 480, overtimeMinutes: 30, status: "LATE" as const },
    { id: "att-4", employeeId: "emp-4", date: today, checkIn: "08:02", checkOut: null, lateMinutes: 2, earlyLeaveMin: 0, workMinutes: 0, overtimeMinutes: 0, status: "PRESENT" as const },
    { id: "att-5", employeeId: "emp-5", date: today, checkIn: null, checkOut: null, lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 0, overtimeMinutes: 0, status: "ABSENT" as const },
    { id: "att-6", employeeId: "emp-6", date: today, checkIn: null, checkOut: null, lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 0, overtimeMinutes: 0, status: "SICK" as const },
    { id: "att-7", employeeId: "emp-7", date: today, checkIn: "07:50", checkOut: "17:00", lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 480, overtimeMinutes: 0, status: "PRESENT" as const },
    { id: "att-8", employeeId: "emp-8", date: today, checkIn: "08:00", checkOut: "17:10", lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 480, overtimeMinutes: 10, status: "PRESENT" as const },
    { id: "att-9", employeeId: "emp-9", date: today, checkIn: null, checkOut: null, lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 0, overtimeMinutes: 0, status: "LEAVE" as const },
    { id: "att-10", employeeId: "emp-10", date: today, checkIn: "08:30", checkOut: "17:00", lateMinutes: 30, earlyLeaveMin: 0, workMinutes: 450, overtimeMinutes: 0, status: "LATE" as const },
    { id: "att-11", employeeId: "emp-11", date: today, checkIn: "08:00", checkOut: "17:00", lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 480, overtimeMinutes: 0, status: "PRESENT" as const },
    { id: "att-12", employeeId: "emp-12", date: today, checkIn: "07:58", checkOut: "16:50", lateMinutes: 0, earlyLeaveMin: 10, workMinutes: 470, overtimeMinutes: 0, status: "PRESENT" as const },
    { id: "att-13", employeeId: "emp-13", date: today, checkIn: null, checkOut: null, lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 0, overtimeMinutes: 0, status: "BUSINESS_TRIP" as const },
    { id: "att-14", employeeId: "emp-14", date: today, checkIn: "08:05", checkOut: "17:00", lateMinutes: 5, earlyLeaveMin: 0, workMinutes: 475, overtimeMinutes: 0, status: "PRESENT" as const },
    { id: "att-15", employeeId: "emp-15", date: today, checkIn: "08:00", checkOut: "19:00", lateMinutes: 0, earlyLeaveMin: 0, workMinutes: 480, overtimeMinutes: 120, status: "PRESENT" as const },
  ];

  function toDateTime(dateStr: string, timeStr: string | null): Date | undefined {
    if (!timeStr) return undefined;
    return new Date(`${dateStr}T${timeStr}:00+07:00`);
  }

  for (const a of attData) {
    await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: a.employeeId, date: new Date(a.date) } },
      update: {},
      create: {
        id: a.id,
        employeeId: a.employeeId,
        date: new Date(a.date),
        checkIn: toDateTime(a.date, a.checkIn),
        checkOut: toDateTime(a.date, a.checkOut),
        lateMinutes: a.lateMinutes,
        earlyLeaveMin: a.earlyLeaveMin,
        workMinutes: a.workMinutes,
        overtimeMinutes: a.overtimeMinutes,
        status: a.status,
      },
    });
  }
  console.log(`✅ Attendance Records: ${attData.length}`);

  // ==========================================
  // 15. OVERTIME REQUESTS (5)
  // ==========================================
  const yesterday = "2026-03-22";
  const twoDaysAgo = "2026-03-21";
  const otData = [
    { id: "ot-1", employeeId: "emp-3", date: yesterday, startTime: "17:00", endTime: "20:00", plannedMinutes: 180, reason: "Deployment server produksi", status: "APPROVED" as const, approvedById: "emp-1" },
    { id: "ot-2", employeeId: "emp-15", date: today, startTime: "17:00", endTime: "19:00", plannedMinutes: 120, reason: "Maintenance mesin produksi", status: "PENDING" as const, approvedById: null },
    { id: "ot-3", employeeId: "emp-4", date: twoDaysAgo, startTime: "17:00", endTime: "19:30", plannedMinutes: 150, reason: "Bug fixing release v2.1", status: "APPROVED" as const, approvedById: "emp-3" },
    { id: "ot-4", employeeId: "emp-11", date: today, startTime: "17:00", endTime: "20:00", plannedMinutes: 180, reason: "Migrasi database", status: "PENDING" as const, approvedById: null },
    { id: "ot-5", employeeId: "emp-13", date: yesterday, startTime: "17:00", endTime: "18:30", plannedMinutes: 90, reason: "Follow up client", status: "REJECTED" as const, approvedById: "emp-10" },
  ];

  for (const ot of otData) {
    await prisma.overtimeRequest.upsert({
      where: { id: ot.id },
      update: {},
      create: {
        id: ot.id,
        employeeId: ot.employeeId,
        date: new Date(ot.date),
        startTime: ot.startTime,
        endTime: ot.endTime,
        plannedMinutes: ot.plannedMinutes,
        reason: ot.reason,
        status: ot.status,
        approvedById: ot.approvedById,
      },
    });
  }
  console.log(`✅ Overtime Requests: ${otData.length}`);

  // ==========================================
  // 16. LEAVE BALANCES (7)
  // ==========================================
  const lbData = [
    { employeeId: "emp-1", leaveTypeId: "lt-1", year: 2026, entitlement: 12, carried: 3, used: 2, pending: 0 },
    { employeeId: "emp-2", leaveTypeId: "lt-1", year: 2026, entitlement: 12, carried: 5, used: 3, pending: 1 },
    { employeeId: "emp-3", leaveTypeId: "lt-1", year: 2026, entitlement: 12, carried: 2, used: 1, pending: 0 },
    { employeeId: "emp-4", leaveTypeId: "lt-1", year: 2026, entitlement: 12, carried: 0, used: 4, pending: 2 },
    { employeeId: "emp-8", leaveTypeId: "lt-1", year: 2026, entitlement: 12, carried: 6, used: 5, pending: 0 },
    { employeeId: "emp-9", leaveTypeId: "lt-1", year: 2026, entitlement: 12, carried: 0, used: 3, pending: 1 },
    { employeeId: "emp-10", leaveTypeId: "lt-1", year: 2026, entitlement: 12, carried: 4, used: 6, pending: 0 },
  ];

  for (const lb of lbData) {
    await prisma.leaveBalance.upsert({
      where: { employeeId_leaveTypeId_year: { employeeId: lb.employeeId, leaveTypeId: lb.leaveTypeId, year: lb.year } },
      update: {},
      create: lb,
    });
  }
  console.log(`✅ Leave Balances: ${lbData.length}`);

  // ==========================================
  // 17. LEAVE REQUESTS (7)
  // ==========================================
  const lrData = [
    { id: "lr-1", employeeId: "emp-9", leaveTypeId: "lt-1", startDate: "2026-03-23", endDate: "2026-03-24", totalDays: 2, reason: "Urusan keluarga", status: "APPROVED" as const },
    { id: "lr-2", employeeId: "emp-4", leaveTypeId: "lt-1", startDate: "2026-03-25", endDate: "2026-03-26", totalDays: 2, reason: "Liburan keluarga", status: "PENDING" as const },
    { id: "lr-3", employeeId: "emp-6", leaveTypeId: "lt-2", startDate: "2026-03-23", endDate: "2026-03-23", totalDays: 1, reason: "Sakit demam", status: "APPROVED" as const },
    { id: "lr-4", employeeId: "emp-12", leaveTypeId: "lt-1", startDate: "2026-04-01", endDate: "2026-04-03", totalDays: 3, reason: "Wisuda adik", status: "PENDING" as const },
    { id: "lr-5", employeeId: "emp-13", leaveTypeId: "lt-5", startDate: "2026-04-10", endDate: "2026-04-12", totalDays: 3, reason: "Pernikahan", status: "PENDING" as const },
    { id: "lr-6", employeeId: "emp-2", leaveTypeId: "lt-1", startDate: "2026-02-14", endDate: "2026-02-14", totalDays: 1, reason: "Acara keluarga", status: "APPROVED" as const },
    { id: "lr-7", employeeId: "emp-15", leaveTypeId: "lt-1", startDate: "2026-03-10", endDate: "2026-03-11", totalDays: 2, reason: "Mengurus surat-surat", status: "REJECTED" as const, approverNote: "Tidak bisa, deadline project" },
  ];

  for (const lr of lrData) {
    await prisma.leaveRequest.upsert({
      where: { id: lr.id },
      update: {},
      create: {
        id: lr.id,
        employeeId: lr.employeeId,
        leaveTypeId: lr.leaveTypeId,
        startDate: new Date(lr.startDate),
        endDate: new Date(lr.endDate),
        totalDays: lr.totalDays,
        reason: lr.reason,
        status: lr.status,
        approverNote: "approverNote" in lr ? lr.approverNote : undefined,
      },
    });
  }
  console.log(`✅ Leave Requests: ${lrData.length}`);

  // ==========================================
  // 18. ONBOARDING TEMPLATES (2) + TASKS
  // ==========================================
  const tpl1 = await prisma.onboardingTemplate.upsert({
    where: { id: "tpl-1" },
    update: {},
    create: { id: "tpl-1", name: "Standard Onboarding", description: "Template onboarding standar untuk karyawan baru" },
  });

  const tpl1Tasks = [
    { id: "t-1", title: "Kumpulkan fotokopi KTP", category: "DOKUMEN" as const, assignee: "KARYAWAN" as const, dueDay: 1, sortOrder: 1 },
    { id: "t-2", title: "Kumpulkan fotokopi NPWP", category: "DOKUMEN" as const, assignee: "KARYAWAN" as const, dueDay: 1, sortOrder: 2 },
    { id: "t-3", title: "Kumpulkan ijazah terakhir", category: "DOKUMEN" as const, assignee: "KARYAWAN" as const, dueDay: 3, sortOrder: 3 },
    { id: "t-4", title: "Foto 3x4 (2 lembar)", category: "DOKUMEN" as const, assignee: "KARYAWAN" as const, dueDay: 3, sortOrder: 4 },
    { id: "t-5", title: "Setup email perusahaan", category: "AKUN" as const, assignee: "IT" as const, dueDay: 1, sortOrder: 5 },
    { id: "t-6", title: "Setup akses sistem HRIS", category: "AKUN" as const, assignee: "IT" as const, dueDay: 1, sortOrder: 6 },
    { id: "t-7", title: "Penyerahan laptop/PC", category: "EQUIPMENT" as const, assignee: "IT" as const, dueDay: 1, sortOrder: 7 },
    { id: "t-8", title: "ID Card karyawan", category: "EQUIPMENT" as const, assignee: "HR" as const, dueDay: 3, sortOrder: 8 },
    { id: "t-9", title: "Orientasi perusahaan", category: "TRAINING" as const, assignee: "HR" as const, dueDay: 1, sortOrder: 9 },
    { id: "t-10", title: "Training SOP departemen", category: "TRAINING" as const, assignee: "MANAGER" as const, dueDay: 7, sortOrder: 10 },
    { id: "t-11", title: "Perkenalan tim", category: "LAINNYA" as const, assignee: "MANAGER" as const, dueDay: 1, sortOrder: 11 },
    { id: "t-12", title: "Daftarkan BPJS Kesehatan", category: "DOKUMEN" as const, assignee: "HR" as const, dueDay: 14, sortOrder: 12 },
    { id: "t-13", title: "Daftarkan BPJS Ketenagakerjaan", category: "DOKUMEN" as const, assignee: "HR" as const, dueDay: 14, sortOrder: 13 },
  ];

  for (const t of tpl1Tasks) {
    await prisma.onboardingTask.upsert({
      where: { id: t.id },
      update: {},
      create: { ...t, templateId: tpl1.id },
    });
  }

  const tpl2 = await prisma.onboardingTemplate.upsert({
    where: { id: "tpl-2" },
    update: {},
    create: { id: "tpl-2", name: "Onboarding Magang", description: "Template onboarding untuk anak magang" },
  });

  const tpl2Tasks = [
    { id: "t-20", title: "Kumpulkan fotokopi KTP", category: "DOKUMEN" as const, assignee: "KARYAWAN" as const, dueDay: 1, sortOrder: 1 },
    { id: "t-21", title: "Surat pengantar kampus", category: "DOKUMEN" as const, assignee: "KARYAWAN" as const, dueDay: 1, sortOrder: 2 },
    { id: "t-22", title: "Setup email perusahaan", category: "AKUN" as const, assignee: "IT" as const, dueDay: 1, sortOrder: 3 },
    { id: "t-23", title: "Penyerahan laptop/PC", category: "EQUIPMENT" as const, assignee: "IT" as const, dueDay: 1, sortOrder: 4 },
    { id: "t-24", title: "Orientasi perusahaan", category: "TRAINING" as const, assignee: "HR" as const, dueDay: 1, sortOrder: 5 },
    { id: "t-25", title: "Perkenalan tim", category: "LAINNYA" as const, assignee: "MANAGER" as const, dueDay: 1, sortOrder: 6 },
  ];

  for (const t of tpl2Tasks) {
    await prisma.onboardingTask.upsert({
      where: { id: t.id },
      update: {},
      create: { ...t, templateId: tpl2.id },
    });
  }
  console.log("✅ Onboarding Templates: 2 (with tasks)");

  // ==========================================
  // 19. EMPLOYEE ONBOARDINGS (2)
  // ==========================================
  // Onboarding 1: emp-14 (Putri Rahayu) - Magang template, IN_PROGRESS
  const onb1 = await prisma.employeeOnboarding.upsert({
    where: { id: "onb-1" },
    update: {},
    create: { id: "onb-1", employeeId: "emp-14", templateId: "tpl-2", startDate: new Date("2026-03-15"), status: "IN_PROGRESS" },
  });

  const onb1Tasks = [
    { taskId: "t-20", isCompleted: true, completedAt: new Date("2026-03-15") },
    { taskId: "t-21", isCompleted: true, completedAt: new Date("2026-03-15") },
    { taskId: "t-22", isCompleted: true, completedAt: new Date("2026-03-15") },
    { taskId: "t-23", isCompleted: true, completedAt: new Date("2026-03-15") },
    { taskId: "t-24", isCompleted: true, completedAt: new Date("2026-03-15") },
    { taskId: "t-25", isCompleted: false, completedAt: null },
  ];

  for (const t of onb1Tasks) {
    await prisma.employeeOnboardingTask.upsert({
      where: { onboardingId_taskId: { onboardingId: onb1.id, taskId: t.taskId } },
      update: {},
      create: { onboardingId: onb1.id, taskId: t.taskId, isCompleted: t.isCompleted, completedAt: t.completedAt },
    });
  }

  // Onboarding 2: emp-15 (Wahyu Hidayat) - Standard template, COMPLETED
  const onb2 = await prisma.employeeOnboarding.upsert({
    where: { id: "onb-2" },
    update: {},
    create: { id: "onb-2", employeeId: "emp-15", templateId: "tpl-1", startDate: new Date("2026-03-01"), status: "COMPLETED" },
  });

  const onb2Tasks = [
    { taskId: "t-1", isCompleted: true, completedAt: new Date("2026-03-01") },
    { taskId: "t-2", isCompleted: true, completedAt: new Date("2026-03-01") },
    { taskId: "t-9", isCompleted: true, completedAt: new Date("2026-03-01") },
    { taskId: "t-10", isCompleted: true, completedAt: new Date("2026-03-05") },
  ];

  for (const t of onb2Tasks) {
    await prisma.employeeOnboardingTask.upsert({
      where: { onboardingId_taskId: { onboardingId: onb2.id, taskId: t.taskId } },
      update: {},
      create: { onboardingId: onb2.id, taskId: t.taskId, isCompleted: t.isCompleted, completedAt: t.completedAt },
    });
  }
  console.log("✅ Employee Onboardings: 2 (with task progress)");

  // ==========================================
  // 20. LIFECYCLE EVENTS (5)
  // ==========================================
  const lcData = [
    { id: "lc-1", employeeId: "emp-2", type: "PROMOTION" as const, fromDepartment: "Human Resources", toDepartment: "Human Resources", fromPosition: "HR Staff", toPosition: "HR Manager", fromSalary: 10000000, toSalary: 18000000, effectiveDate: "2024-01-01", reason: "Kinerja excellent selama 3 tahun, memenuhi syarat promosi", approvedBy: "Budi Santoso" },
    { id: "lc-2", employeeId: "emp-5", type: "TRANSFER" as const, fromDepartment: "Information Technology", toDepartment: "Operations", fromPosition: "Software Developer", toPosition: "IT Operations Specialist", fromSalary: 10000000, toSalary: 11000000, effectiveDate: "2025-07-01", reason: "Kebutuhan operasional dan minat karyawan", approvedBy: "Budi Santoso" },
    { id: "lc-3", employeeId: "emp-7", type: "CONFIRMATION" as const, fromDepartment: null, toDepartment: "Information Technology", fromPosition: null, toPosition: "UI/UX Designer", fromSalary: 8000000, toSalary: 9000000, effectiveDate: "2026-04-15", reason: "Lulus masa probation 3 bulan", approvedBy: "Sari Dewi" },
    { id: "lc-4", employeeId: "emp-10", type: "PROMOTION" as const, fromDepartment: "Sales", toDepartment: "Sales", fromPosition: "Sales Staff", toPosition: "Sales Manager", fromSalary: 15000000, toSalary: 18000000, effectiveDate: "2025-10-01", reason: "Pencapaian target penjualan 3 kuartal berturut-turut", approvedBy: "Budi Santoso" },
    { id: "lc-5", employeeId: "emp-12", type: "TRANSFER" as const, fromDepartment: "Finance & Accounting", toDepartment: "Human Resources", fromPosition: "Accountant", toPosition: "Payroll Specialist", fromSalary: 8500000, toSalary: 9000000, effectiveDate: "2026-01-01", reason: "Reorganisasi departemen dan keahlian payroll", approvedBy: "Sari Dewi" },
  ];

  for (const lc of lcData) {
    await prisma.lifecycleEvent.upsert({
      where: { id: lc.id },
      update: {},
      create: {
        ...lc,
        effectiveDate: new Date(lc.effectiveDate),
      },
    });
  }
  console.log(`✅ Lifecycle Events: ${lcData.length}`);

  // ==========================================
  // 21. EMPLOYEE ADVANCES (4)
  // ==========================================
  const advData = [
    { id: "adv-1", employeeId: "emp-4", amount: 2000000, purpose: "Perjalanan dinas ke Surabaya", requestDate: "2026-03-15", status: "APPROVED" as const, approvedBy: "Sari Dewi", approvedDate: "2026-03-16", returnedAmount: 0, notes: "Untuk hotel dan transport" },
    { id: "adv-2", employeeId: "emp-9", amount: 1500000, purpose: "Event marketing exhibition", requestDate: "2026-03-20", status: "PENDING" as const, approvedBy: null, approvedDate: null, returnedAmount: 0, notes: "Biaya booth dan materi promosi" },
    { id: "adv-3", employeeId: "emp-10", amount: 3000000, purpose: "Client visit Bandung", requestDate: "2026-03-10", status: "RETURNED" as const, approvedBy: "Sari Dewi", approvedDate: "2026-03-11", returnedAmount: 500000, notes: "Sisa kasbon dikembalikan" },
    { id: "adv-4", employeeId: "emp-12", amount: 1000000, purpose: "Training sertifikasi akuntansi", requestDate: "2026-03-22", status: "PENDING" as const, approvedBy: null, approvedDate: null, returnedAmount: 0, notes: "" },
  ];

  for (const adv of advData) {
    await prisma.employeeAdvance.upsert({
      where: { id: adv.id },
      update: {},
      create: {
        id: adv.id,
        employeeId: adv.employeeId,
        amount: adv.amount,
        purpose: adv.purpose,
        requestDate: new Date(adv.requestDate),
        status: adv.status,
        approvedBy: adv.approvedBy,
        approvedDate: adv.approvedDate ? new Date(adv.approvedDate) : undefined,
        returnedAmount: adv.returnedAmount,
        notes: adv.notes || undefined,
      },
    });
  }
  console.log(`✅ Employee Advances: ${advData.length}`);

  // ==========================================
  // 22. EXPENSE CLAIMS (3) + ITEMS
  // ==========================================
  const expData = [
    {
      id: "exp-1", employeeId: "emp-4", title: "Perjalanan Dinas Surabaya", totalAmount: 1850000,
      submittedDate: "2026-03-20", status: "PENDING" as const, approvedBy: null, approvedDate: null,
      items: [
        { id: "ei-1", description: "Tiket pesawat PP", amount: 1200000, category: "TRANSPORT" as const, date: "2026-03-17" },
        { id: "ei-2", description: "Hotel 1 malam", amount: 450000, category: "AKOMODASI" as const, date: "2026-03-17" },
        { id: "ei-3", description: "Makan 2 hari", amount: 200000, category: "MAKAN" as const, date: "2026-03-18" },
      ],
    },
    {
      id: "exp-2", employeeId: "emp-9", title: "Client Meeting Dinner", totalAmount: 750000,
      submittedDate: "2026-03-18", status: "APPROVED" as const, approvedBy: "Sari Dewi", approvedDate: "2026-03-19",
      items: [
        { id: "ei-4", description: "Dinner dengan klien", amount: 500000, category: "MAKAN" as const, date: "2026-03-16" },
        { id: "ei-5", description: "Taxi PP", amount: 250000, category: "TRANSPORT" as const, date: "2026-03-16" },
      ],
    },
    {
      id: "exp-3", employeeId: "emp-3", title: "Supplies Kantor", totalAmount: 350000,
      submittedDate: "2026-03-15", status: "PAID" as const, approvedBy: "Sari Dewi", approvedDate: "2026-03-16",
      items: [
        { id: "ei-6", description: "Toner printer", amount: 250000, category: "SUPPLIES" as const, date: "2026-03-14" },
        { id: "ei-7", description: "ATK", amount: 100000, category: "SUPPLIES" as const, date: "2026-03-14" },
      ],
    },
  ];

  for (const exp of expData) {
    const claim = await prisma.expenseClaim.upsert({
      where: { id: exp.id },
      update: {},
      create: {
        id: exp.id,
        employeeId: exp.employeeId,
        title: exp.title,
        totalAmount: exp.totalAmount,
        submittedDate: new Date(exp.submittedDate),
        status: exp.status,
        approvedBy: exp.approvedBy,
        approvedDate: exp.approvedDate ? new Date(exp.approvedDate) : undefined,
      },
    });

    for (const item of exp.items) {
      await prisma.expenseItem.upsert({
        where: { id: item.id },
        update: {},
        create: {
          id: item.id,
          claimId: claim.id,
          description: item.description,
          amount: item.amount,
          category: item.category,
          date: new Date(item.date),
        },
      });
    }
  }
  console.log(`✅ Expense Claims: ${expData.length} (with items)`);

  // ==========================================
  // 23. ACTIVITY FEED (8)
  // ==========================================
  const actData = [
    { id: "act-1", type: "LEAVE" as const, action: "Pengajuan Cuti", description: "Budi Santoso mengajukan cuti tahunan 25-27 Mar 2026", actor: "Budi Santoso", timestamp: "2026-03-23T08:30:00" },
    { id: "act-2", type: "PAYROLL" as const, action: "Payroll Dihitung", description: "Payroll Maret 2026 selesai dihitung untuk 14 karyawan", actor: "Sari Dewi", timestamp: "2026-03-22T16:00:00" },
    { id: "act-3", type: "EMPLOYEE" as const, action: "Karyawan Baru", description: "Dewi Lestari bergabung sebagai Software Developer di dept IT", actor: "System", timestamp: "2026-03-21T09:00:00" },
    { id: "act-4", type: "ATTENDANCE" as const, action: "Lembur Disetujui", description: "Lembur Andi Prasetyo (3 jam) telah disetujui", actor: "Sari Dewi", timestamp: "2026-03-20T17:30:00" },
    { id: "act-5", type: "RECRUITMENT" as const, action: "Pelamar Baru", description: "5 pelamar baru untuk posisi Frontend Developer", actor: "System", timestamp: "2026-03-20T10:00:00" },
    { id: "act-6", type: "TRAINING" as const, action: "Training Dimulai", description: "Leadership Workshop dimulai dengan 8 peserta", actor: "System", timestamp: "2026-03-19T09:00:00" },
    { id: "act-7", type: "LEAVE" as const, action: "Cuti Disetujui", description: "Cuti Rina Wulandari (2 hari) telah disetujui", actor: "Budi Santoso", timestamp: "2026-03-19T14:00:00" },
    { id: "act-8", type: "EMPLOYEE" as const, action: "Kontrak Diperpanjang", description: "Kontrak Agus Setiawan diperpanjang hingga Des 2026", actor: "Sari Dewi", timestamp: "2026-03-18T11:00:00" },
  ];

  for (const act of actData) {
    await prisma.activityFeed.upsert({
      where: { id: act.id },
      update: {},
      create: {
        id: act.id,
        type: act.type,
        action: act.action,
        description: act.description,
        actor: act.actor,
        timestamp: new Date(act.timestamp),
      },
    });
  }
  console.log(`✅ Activity Feed: ${actData.length}`);

  // ==========================================
  // 24. APP CONFIG
  // ==========================================
  await prisma.appConfig.upsert({
    where: { id: "app-config" },
    update: {},
    create: {
      id: "app-config",
      data: {
        defaultStartTime: "08:00",
        defaultEndTime: "17:00",
        lateToleranceMinutes: 15,
        breakDurationMinutes: 60,
        workDays: [1, 2, 3, 4, 5],
        overtimeMultiplier: 1.5,
        minOvertimeMinutes: 60,
        maxOvertimeHoursPerDay: 4,
        annualLeaveEntitlement: 12,
        leaveWaitingPeriodMonths: 3,
        maxCarryOverDays: 5,
        collectiveLeaveDays: 2,
        weddingLeaveDays: 3,
        maternityLeaveDays: 90,
        paternityLeaveDays: 2,
        bereavementLeaveDays: 2,
        sickWithoutNoteDays: 1,
        attendanceMethod: "MANUAL",
        gpsRadiusMeters: 100,
        autoCheckoutTime: "23:59",
        allowOutOfSchedule: false,
      },
    },
  });
  console.log("✅ App Config");

  // ==========================================
  // DONE
  // ==========================================
  console.log("\n🎉 Seeding completed successfully!\n");
  console.log("Login Credentials:");
  console.log("  Super Admin : admin@company.co.id / admin123");
  console.log("  HR Admin    : hr@company.co.id / hr123");
  console.log("  Manager     : manager@company.co.id / manager123");
  console.log("  Karyawan    : karyawan@company.co.id / karyawan123");
}

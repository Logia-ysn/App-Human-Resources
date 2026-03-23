import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create Company
  const company = await prisma.company.upsert({
    where: { id: "company-1" },
    update: {},
    create: {
      id: "company-1",
      name: "PT Maju Bersama",
      legalName: "PT Maju Bersama Sejahtera",
      npwp: "01.234.567.8-901.000",
      address: "Jl. Sudirman No. 123",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      postalCode: "12190",
      phone: "021-5551234",
      email: "info@majubersama.co.id",
      umrAmount: 5067381,
      umrRegion: "DKI Jakarta",
      cutOffDate: 25,
      payDate: 28,
    },
  });
  console.log(`Company created: ${company.name}`);

  // Create Departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { code: "BOD" },
      update: {},
      create: { name: "Board of Directors", code: "BOD", description: "Direksi" },
    }),
    prisma.department.upsert({
      where: { code: "HR" },
      update: {},
      create: { name: "Human Resources", code: "HR", description: "Sumber Daya Manusia" },
    }),
    prisma.department.upsert({
      where: { code: "FIN" },
      update: {},
      create: { name: "Finance & Accounting", code: "FIN", description: "Keuangan & Akuntansi" },
    }),
    prisma.department.upsert({
      where: { code: "IT" },
      update: {},
      create: { name: "Information Technology", code: "IT", description: "Teknologi Informasi" },
    }),
    prisma.department.upsert({
      where: { code: "MKT" },
      update: {},
      create: { name: "Marketing", code: "MKT", description: "Pemasaran" },
    }),
    prisma.department.upsert({
      where: { code: "OPS" },
      update: {},
      create: { name: "Operations", code: "OPS", description: "Operasional" },
    }),
    prisma.department.upsert({
      where: { code: "SALES" },
      update: {},
      create: { name: "Sales", code: "SALES", description: "Penjualan" },
    }),
  ]);
  console.log(`Departments created: ${departments.length}`);

  // Create Positions
  const hrDept = departments.find((d) => d.code === "HR")!;
  const itDept = departments.find((d) => d.code === "IT")!;

  const positions = await Promise.all([
    prisma.position.upsert({
      where: { code: "HR-MGR" },
      update: {},
      create: {
        name: "HR Manager",
        code: "HR-MGR",
        departmentId: hrDept.id,
        level: "MANAGER",
        minSalary: 15000000,
        maxSalary: 25000000,
      },
    }),
    prisma.position.upsert({
      where: { code: "HR-STAFF" },
      update: {},
      create: {
        name: "HR Staff",
        code: "HR-STAFF",
        departmentId: hrDept.id,
        level: "STAFF",
        minSalary: 6000000,
        maxSalary: 10000000,
      },
    }),
    prisma.position.upsert({
      where: { code: "IT-MGR" },
      update: {},
      create: {
        name: "IT Manager",
        code: "IT-MGR",
        departmentId: itDept.id,
        level: "MANAGER",
        minSalary: 18000000,
        maxSalary: 30000000,
      },
    }),
    prisma.position.upsert({
      where: { code: "IT-DEV" },
      update: {},
      create: {
        name: "Software Developer",
        code: "IT-DEV",
        departmentId: itDept.id,
        level: "STAFF",
        minSalary: 8000000,
        maxSalary: 18000000,
      },
    }),
  ]);
  console.log(`Positions created: ${positions.length}`);

  // Create Work Schedule
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
  console.log(`Work schedule created: ${schedule.name}`);

  // Create Leave Types
  const leaveTypes = await Promise.all([
    prisma.leaveType.upsert({
      where: { code: "ANNUAL" },
      update: {},
      create: {
        name: "Cuti Tahunan",
        code: "ANNUAL",
        defaultQuota: 12,
        isPaid: true,
        isCarryOver: true,
        maxCarryOver: 6,
        allowHalfDay: true,
      },
    }),
    prisma.leaveType.upsert({
      where: { code: "SICK" },
      update: {},
      create: {
        name: "Cuti Sakit",
        code: "SICK",
        defaultQuota: 14,
        isPaid: true,
        requiresDoc: true,
      },
    }),
    prisma.leaveType.upsert({
      where: { code: "MATERNITY" },
      update: {},
      create: {
        name: "Cuti Melahirkan",
        code: "MATERNITY",
        defaultQuota: 90,
        isPaid: true,
        genderRestrict: "FEMALE",
        maxConsecutive: 90,
      },
    }),
    prisma.leaveType.upsert({
      where: { code: "PATERNITY" },
      update: {},
      create: {
        name: "Cuti Ayah",
        code: "PATERNITY",
        defaultQuota: 2,
        isPaid: true,
        genderRestrict: "MALE",
      },
    }),
    prisma.leaveType.upsert({
      where: { code: "MARRIAGE" },
      update: {},
      create: {
        name: "Cuti Menikah",
        code: "MARRIAGE",
        defaultQuota: 3,
        isPaid: true,
      },
    }),
    prisma.leaveType.upsert({
      where: { code: "BEREAVEMENT" },
      update: {},
      create: {
        name: "Cuti Duka",
        code: "BEREAVEMENT",
        defaultQuota: 3,
        isPaid: true,
      },
    }),
  ]);
  console.log(`Leave types created: ${leaveTypes.length}`);

  // Create Tax Config for 2026
  await prisma.taxConfig.upsert({
    where: { year: 2026 },
    update: {},
    create: {
      year: 2026,
      ptkpRates: {
        TK0: 54000000,
        TK1: 58500000,
        TK2: 63000000,
        TK3: 67500000,
        K0: 58500000,
        K1: 63000000,
        K2: 67500000,
        K3: 72000000,
        KI0: 112500000,
        KI1: 117000000,
        KI2: 121500000,
        KI3: 126000000,
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
  console.log("Tax config 2026 created");

  // Create Salary Components
  await Promise.all([
    prisma.salaryComponent.upsert({
      where: { code: "BASIC" },
      update: {},
      create: {
        name: "Gaji Pokok",
        code: "BASIC",
        type: "EARNING",
        isTaxable: true,
        isFixed: true,
        isMandatory: true,
        sortOrder: 1,
      },
    }),
    prisma.salaryComponent.upsert({
      where: { code: "TRANSPORT" },
      update: {},
      create: {
        name: "Tunjangan Transport",
        code: "TRANSPORT",
        type: "EARNING",
        isTaxable: true,
        isFixed: true,
        defaultAmount: 500000,
        sortOrder: 2,
      },
    }),
    prisma.salaryComponent.upsert({
      where: { code: "MEAL" },
      update: {},
      create: {
        name: "Tunjangan Makan",
        code: "MEAL",
        type: "EARNING",
        isTaxable: true,
        isFixed: true,
        defaultAmount: 500000,
        sortOrder: 3,
      },
    }),
    prisma.salaryComponent.upsert({
      where: { code: "POSITION" },
      update: {},
      create: {
        name: "Tunjangan Jabatan",
        code: "POSITION",
        type: "EARNING",
        isTaxable: true,
        isFixed: true,
        sortOrder: 4,
      },
    }),
    prisma.salaryComponent.upsert({
      where: { code: "OVERTIME" },
      update: {},
      create: {
        name: "Lembur",
        code: "OVERTIME",
        type: "EARNING",
        isTaxable: true,
        isFixed: false,
        sortOrder: 5,
      },
    }),
    prisma.salaryComponent.upsert({
      where: { code: "LOAN" },
      update: {},
      create: {
        name: "Pinjaman Karyawan",
        code: "LOAN",
        type: "DEDUCTION",
        isTaxable: false,
        isFixed: false,
        sortOrder: 10,
      },
    }),
  ]);
  console.log("Salary components created");

  // Create Super Admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@majubersama.co.id" },
    update: {},
    create: {
      email: "admin@majubersama.co.id",
      passwordHash: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  console.log("Super Admin user created: admin@majubersama.co.id / admin123");

  // Create HR Admin user
  const hrPosition = positions.find((p) => p.code === "HR-MGR")!;
  const hrEmployee = await prisma.employee.upsert({
    where: { employeeNumber: "EMP-0001" },
    update: {},
    create: {
      employeeNumber: "EMP-0001",
      firstName: "Sari",
      lastName: "Dewi",
      email: "sari.dewi@majubersama.co.id",
      phone: "081234567890",
      gender: "FEMALE",
      dateOfBirth: new Date("1990-05-15"),
      placeOfBirth: "Jakarta",
      religion: "ISLAM",
      maritalStatus: "MARRIED",
      dependents: 1,
      nik: "3171234567890001",
      npwp: "12.345.678.9-012.000",
      departmentId: hrDept.id,
      positionId: hrPosition.id,
      status: "ACTIVE",
      type: "PERMANENT",
      joinDate: new Date("2020-01-02"),
      ptkpStatus: "K1",
      taxMethod: "GROSS",
    },
  });

  const hrHashedPassword = await bcrypt.hash("hr123", 12);
  await prisma.user.upsert({
    where: { email: "sari.dewi@majubersama.co.id" },
    update: {},
    create: {
      email: "sari.dewi@majubersama.co.id",
      passwordHash: hrHashedPassword,
      role: "HR_ADMIN",
      isActive: true,
      employeeId: hrEmployee.id,
    },
  });
  console.log("HR Admin user created: sari.dewi@majubersama.co.id / hr123");

  // Create holidays for 2026
  const holidays2026 = [
    { name: "Tahun Baru 2026", date: new Date("2026-01-01"), type: "NATIONAL" as const },
    { name: "Isra Miraj", date: new Date("2026-01-27"), type: "NATIONAL" as const },
    { name: "Imlek", date: new Date("2026-02-17"), type: "NATIONAL" as const },
    { name: "Hari Raya Nyepi", date: new Date("2026-03-19"), type: "NATIONAL" as const },
    { name: "Wafat Isa Almasih", date: new Date("2026-04-03"), type: "NATIONAL" as const },
    { name: "Hari Buruh", date: new Date("2026-05-01"), type: "NATIONAL" as const },
    { name: "Hari Raya Waisak", date: new Date("2026-05-12"), type: "NATIONAL" as const },
    { name: "Kenaikan Isa Almasih", date: new Date("2026-05-14"), type: "NATIONAL" as const },
    { name: "Hari Lahir Pancasila", date: new Date("2026-06-01"), type: "NATIONAL" as const },
    { name: "Idul Adha", date: new Date("2026-06-17"), type: "NATIONAL" as const },
    { name: "Tahun Baru Islam", date: new Date("2026-07-07"), type: "NATIONAL" as const },
    { name: "Hari Kemerdekaan RI", date: new Date("2026-08-17"), type: "NATIONAL" as const },
    { name: "Maulid Nabi Muhammad", date: new Date("2026-09-16"), type: "NATIONAL" as const },
    { name: "Hari Natal", date: new Date("2026-12-25"), type: "NATIONAL" as const },
  ];

  for (const holiday of holidays2026) {
    await prisma.holiday.upsert({
      where: { id: `holiday-${holiday.name.toLowerCase().replace(/\s+/g, "-")}` },
      update: {},
      create: {
        id: `holiday-${holiday.name.toLowerCase().replace(/\s+/g, "-")}`,
        ...holiday,
      },
    });
  }
  console.log(`Holidays 2026 created: ${holidays2026.length}`);

  console.log("\nSeeding completed successfully!");
  console.log("\nDefault Login Credentials:");
  console.log("  Super Admin: admin@majubersama.co.id / admin123");
  console.log("  HR Admin: sari.dewi@majubersama.co.id / hr123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

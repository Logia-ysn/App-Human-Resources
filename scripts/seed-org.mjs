import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEPARTMENTS = [
  { code: "BIS", name: "Bisnis", description: "Manajemen strategis dan pengembangan bisnis" },
  { code: "SAL", name: "Sales", description: "Penjualan dan pengembangan pelanggan" },
  { code: "FIN", name: "Keuangan", description: "Keuangan, akuntansi, dan perpajakan" },
  { code: "PRD", name: "Produksi", description: "Operasional produksi dan kualitas" },
  { code: "HRG", name: "HRGA", description: "Human Resource & General Affair" },
  { code: "MTC", name: "MTC", description: "Maintenance dan teknik" },
];

const POSITION_TEMPLATES = [
  { suffix: "Manager", level: "MANAGER", prefix: "MGR", minSalary: 12000000, maxSalary: 25000000 },
  { suffix: "Supervisor", level: "SUPERVISOR", prefix: "SPV", minSalary: 7000000, maxSalary: 12000000 },
  { suffix: "Staff", level: "STAFF", prefix: "STF", minSalary: 4000000, maxSalary: 7000000 },
  { suffix: "Karyawan Harian", level: "STAFF", prefix: "KH", minSalary: 2500000, maxSalary: 4000000 },
];

async function main() {
  console.log("== Seeding departments ==");
  const deptByCode = {};
  for (const d of DEPARTMENTS) {
    const dept = await prisma.department.upsert({
      where: { code: d.code },
      update: { name: d.name, description: d.description, isActive: true },
      create: { code: d.code, name: d.name, description: d.description, isActive: true },
    });
    deptByCode[d.code] = dept;
    console.log(`  ✓ ${dept.code} — ${dept.name}`);
  }

  console.log("\n== Seeding positions ==");

  await prisma.position.upsert({
    where: { code: "DIRUT" },
    update: {
      name: "Direktur Utama",
      departmentId: deptByCode.BIS.id,
      level: "DIRECTOR",
      minSalary: 40000000,
      maxSalary: 80000000,
      isActive: true,
    },
    create: {
      code: "DIRUT",
      name: "Direktur Utama",
      departmentId: deptByCode.BIS.id,
      level: "DIRECTOR",
      minSalary: 40000000,
      maxSalary: 80000000,
      description: "Pimpinan tertinggi perusahaan",
      isActive: true,
    },
  });
  console.log("  ✓ DIRUT — Direktur Utama (Bisnis)");

  for (const d of DEPARTMENTS) {
    const code = `DIR-${d.code}`;
    await prisma.position.upsert({
      where: { code },
      update: {
        name: `Direktur ${d.name}`,
        departmentId: deptByCode[d.code].id,
        level: "DIRECTOR",
        minSalary: 25000000,
        maxSalary: 50000000,
        isActive: true,
      },
      create: {
        code,
        name: `Direktur ${d.name}`,
        departmentId: deptByCode[d.code].id,
        level: "DIRECTOR",
        minSalary: 25000000,
        maxSalary: 50000000,
        description: `Direktur departemen ${d.name}`,
        isActive: true,
      },
    });
    console.log(`  ✓ ${code} — Direktur ${d.name}`);
  }

  for (const d of DEPARTMENTS) {
    for (const tpl of POSITION_TEMPLATES) {
      const code = `${tpl.prefix}-${d.code}`;
      const name = `${tpl.suffix} ${d.name}`;
      await prisma.position.upsert({
        where: { code },
        update: {
          name,
          departmentId: deptByCode[d.code].id,
          level: tpl.level,
          minSalary: tpl.minSalary,
          maxSalary: tpl.maxSalary,
          isActive: true,
        },
        create: {
          code,
          name,
          departmentId: deptByCode[d.code].id,
          level: tpl.level,
          minSalary: tpl.minSalary,
          maxSalary: tpl.maxSalary,
          description: `${tpl.suffix} pada departemen ${d.name}`,
          isActive: true,
        },
      });
      console.log(`  ✓ ${code} — ${name}`);
    }
  }

  const totalDept = await prisma.department.count();
  const totalPos = await prisma.position.count();
  console.log(`\nDone. Total departments: ${totalDept}, positions: ${totalPos}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

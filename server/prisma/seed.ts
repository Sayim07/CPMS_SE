import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting CPMS database seeding...");

  // 1. Seed System Settings (Idempotent)
  await prisma.systemSetting.upsert({
    where: { key: "single_offer_ctc_threshold_lpa" },
    update: {},
    create: {
      key: "single_offer_ctc_threshold_lpa",
      value: "8.0",
    },
  });
  console.log("✅ Seeded default setting: single_offer_ctc_threshold_lpa = 8.0");

  // 2. Seed Default Departments (CSE, IT, ECE, MECH)
  const departments = [
    { code: "CSE", name: "Computer Science & Engineering" },
    { code: "IT", name: "Information Technology" },
    { code: "ECE", name: "Electronics & Communication Engineering" },
    { code: "MECH", name: "Mechanical Engineering" },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name, is_active: true },
      create: {
        code: dept.code,
        name: dept.name,
        is_active: true,
      },
    });
  }
  console.log("✅ Seeded 4 departments: CSE, IT, ECE, MECH");

  // 3. Seed Default System Admin Account
  const passwordHash = await bcrypt.hash("Admin@12345", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@college.edu" },
    update: {
      full_name: "System Administrator",
      role: Role.ADMIN,
      is_active: true,
    },
    create: {
      email: "admin@college.edu",
      password_hash: passwordHash,
      full_name: "System Administrator",
      role: Role.ADMIN,
      is_active: true,
    },
  });
  console.log(`✅ Seeded Admin account: ${adminUser.email}`);

  // 4. Seed Default TPO Account
  const tpoPasswordHash = await bcrypt.hash("Tpo@12345", 10);
  const tpoUser = await prisma.user.upsert({
    where: { email: "tpo@college.edu" },
    update: {
      full_name: "Dr. Arvind Sharma",
      role: Role.TPO,
      is_active: true,
    },
    create: {
      email: "tpo@college.edu",
      password_hash: tpoPasswordHash,
      full_name: "Dr. Arvind Sharma",
      role: Role.TPO,
      is_active: true,
    },
  });
  console.log(`✅ Seeded TPO account: ${tpoUser.email}`);

  console.log("🎉 CPMS Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


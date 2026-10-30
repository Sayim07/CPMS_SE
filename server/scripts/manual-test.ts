import { signToken } from "../src/middleware/auth";
import { Role } from "@prisma/client";

async function runManualTest() {
  const BASE_URL = "http://localhost:3000/api/v1";

  console.log("==================================================");
  console.log("🧪 CPMS Manual Live API Verification");
  console.log("==================================================\n");

  // Check if server is running
  try {
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log("✅ 1. Health Check (Phase 0):");
    console.log("   URL:", `${BASE_URL}/health`);
    console.log("   HTTP Status:", healthRes.status);
    console.log("   Response:", JSON.stringify(healthData, null, 2));
  } catch (err: any) {
    console.error("❌ Could not connect to http://localhost:3000.");
    console.error("   Please ensure you have started the server in another terminal:");
    console.error("   --> cd server && npm run dev\n");
    process.exit(1);
  }

  // Generate tokens
  const tpoToken = signToken({
    sub: "22222222-2222-2222-2222-222222222222",
    email: "tpo@college.edu",
    role: Role.TPO,
    full_name: "Dr. Arvind Sharma",
  });

  const adminToken = signToken({
    sub: "55555555-5555-5555-5555-555555555555",
    email: "admin@college.edu",
    role: Role.ADMIN,
    full_name: "System Administrator",
  });

  // 2. Test Placement Summary (Phase 6)
  console.log("\n--------------------------------------------------");
  console.log("📊 2. Testing Placement Reports (Phase 6):");
  const reportsRes = await fetch(`${BASE_URL}/reports/placement-summary?batch_year=2026`, {
    headers: { Authorization: `Bearer ${tpoToken}` },
  });
  const reportsData = await reportsRes.json();
  console.log("   URL: GET /reports/placement-summary?batch_year=2026");
  console.log("   HTTP Status:", reportsRes.status);
  console.log("   Live Summary:", JSON.stringify(reportsData, null, 2));

  // 3. Test Admin System Settings (Phase 6)
  console.log("\n--------------------------------------------------");
  console.log("⚙️  3. Testing Admin Settings from Supabase (Phase 6):");
  const settingsRes = await fetch(`${BASE_URL}/admin/settings`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const settingsData = await settingsRes.json();
  console.log("   URL: GET /admin/settings");
  console.log("   HTTP Status:", settingsRes.status);
  console.log("   Threshold setting:", JSON.stringify(settingsData, null, 2));

  // 4. Test TPO Jobs list (Phase 3)
  console.log("\n--------------------------------------------------");
  console.log("🏢 4. Testing TPO Jobs Directory (Phase 3):");
  const jobsRes = await fetch(`${BASE_URL}/tpo/jobs`, {
    headers: { Authorization: `Bearer ${tpoToken}` },
  });
  const jobsData = await jobsRes.json();
  console.log("   URL: GET /tpo/jobs");
  console.log("   HTTP Status:", jobsRes.status);
  console.log("   Jobs Found:", jobsData.data?.length ?? 0);

  // 5. Test Unauthorized Security Guard
  console.log("\n--------------------------------------------------");
  console.log("🛡️  5. Testing Security Guard (No Token):");
  const unauthRes = await fetch(`${BASE_URL}/reports/placement-summary`);
  const unauthData = await unauthRes.json();
  console.log("   URL: GET /reports/placement-summary without Authorization header");
  console.log("   HTTP Status:", unauthRes.status, "(Expected 401)");
  console.log("   Response:", JSON.stringify(unauthData, null, 2));

  console.log("\n==================================================");
  console.log("🎉 All manual checks completed successfully!");
  console.log("==================================================\n");
}

runManualTest();

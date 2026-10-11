# Team Progress & Phased Work Allocation Report — CPMS

> **Project:** College Placement Management System (CPMS)  
> **Team Size:** 4 Members  
> **Project Lead:** Sayim  
> **SDLC Model:** Iterative Development Model  
> **Audit Date:** October 11, 2026  
> **Git Repository:** `Sayim07/CPMS_SE` (Branch: `main`)  
> **Non-Technical Edition:** [`progress_simple.md`](progress_simple.md) (Plain-English role guide with real-world analogies)  

---

## 1. Phased Team Categorization Matrix

| Team Member | SDLC Phase Assigned | Primary Module & Responsibilities | Complexity | Commit Status | Current Progress |
|---|---|---|---|---|---|
| **Sayim** | **Phase UI + Overall Cross-Phase Leadership** | **End-to-End System Architecture, Complete 18-Screen Interactive Client Prototype, Anti-Slop Design System (`cpms-design-taste`), Motion Physics (GSAP + shadcn + Lenis), PR Code Reviews, and Semester SE Evaluation Governance** | Comprehensive | **7 Commits (100% of pushes)** | **100% Complete** (Prototype & Specs) |
| **Joyeeta** | **Phase 0 — Database & Supabase Setup** | **Supabase Cloud PostgreSQL integration, Prisma ORM schema (`schema.prisma` with 11 relational tables), Database Migrations, Environment Pooler Config, and Database Seed script** | Moderate | **0 Commits** | **Assigned / In Progress** |
| **Aditya** | **Phase 1 — Auth & RBAC Security** | **Express Authentication (`POST /auth/register/*`, `POST /auth/login`), Password Hashing (bcrypt), JWT Token Generation, 5-Attempt Lockout Mechanism (REQ-2), and RBAC Middleware (`authenticate`, `requireRole`)** | Moderate | **0 Commits** | **Assigned / In Progress** |
| **Aakriti** | **Phase 0/1/5 — Reference APIs & Notifications** | **System Health Endpoint (`GET /health`), Active Departments Reference Catalog (`GET /departments`), and Notification Alerts Service (`GET /notifications`, `PATCH /notifications/:id/read`)** | **Beginner-Friendly / Easiest** | **0 Commits** | **Assigned (Ready to Start)** |

### B. Complete Project Lifecycle Phase Allocation (Phases 0 → 7)
This table explicitly maps every phase from [`ImplementationPlan.md`](ImplementationPlan.md) and [`Tracker.md`](Tracker.md) to team members across the entire project lifecycle, with **Sayim** providing continuous technical supervision and active contributions across all phases:

| SDLC Phase | Phase Title & Core Deliverables | Primary Phase Owner | Contributing & Supervision | Complexity & Key Constraints |
|---|---|---|---|---|
| **Phase UI** | **Frontend Prototype (18 Screens)**<br>All roles (`STUDENT`, `COMPANY`, `TPO`, `ADMIN`), GSAP physics, shadcn/ui, `Ctrl+K`. | **Sayim** *(Project Lead)* | **Sayim** | **Completed (100%)** — Zero TS errors, verified production build. |
| **Phase 0** | **Setup, Database & Supabase**<br>Prisma 11 tables, migrations, seed script, pooler config, `/health`. | **Joyeeta** | Aakriti (`/health`), **Sayim** | **Moderate** — Foundation for all persistent data. |
| **Phase 1** | **Auth & RBAC Security**<br>Bcrypt hashing, JWT 8h token, 5-attempt lockout (REQ-2), RBAC middleware (`authenticate`, `requireRole`). | **Aditya** | Aakriti (`/departments`), **Sayim** | **Moderate** — Critical security gate. |
| **Phase 2** | **Student Profile & Verification**<br>Student profile CRUD (`GET/PUT /students/me`), resume storage, verification reset on edit (REQ-5). | **Aditya** | **Sayim** | **Moderate** — Manages student data integrity. |
| **Phase 3** | **Companies & Job Postings**<br>Company approval decision, Job creation/editing (`POST/PATCH /jobs`), deadline auto-close (REQ-9). | **Joyeeta** | **Sayim** | **Moderate** — Placement drive intake. |
| **Phase 4** | **Eligibility Engine & Applications (BLOCKING)**<br>Deterministic `evaluateEligibility()` rule engine, single-offer lock (`BR-1`), 30-case matrix test. | **Sayim** *(Project Lead)* | Joyeeta (Transactional isolation & Application records), **Sayim** | **High / Critical** — Core mathematical heart of CPMS. |
| **Phase 5** | **Funnel, Rounds & Notifications**<br>Applicant stage transitions, notification service (`GET/PATCH /notifications`), interview rounds. | **Aakriti** | Aditya (Resume zip packaging), **Sayim** | **Moderate** — Beginner-friendly API endpoints & alerts. |
| **Phase 6** | **Reports, Analytics & Administration**<br>Placement summaries (REQ-17), unplaced student reports, CSV export, audit logs. | **Joyeeta** | Aakriti (Audit log APIs), **Sayim** | **Moderate** — Institutional governance. |
| **Phase 7** | **Hardening, Performance & Deployment**<br>Docker/Cloud deploy, database indexing/EXPLAIN, security hardening, final SE presentation. | **Sayim** *(Project Lead)* | Aditya (Security headers & rate limits), Joyeeta (DB indexes), **Sayim** | **High** — Production readiness & SE evaluation defense. |

---

## 2. Live Git Commit History & Codebase Audit

### A. Commit Log Audit (`git log --pretty=format`)
As of October 11, 2026, the `main` branch contains **7 commits**, all authored and pushed by **Sayim**:

| Commit Hash | Author | Date | Message / Deliverable Summary |
|---|---|---|---|
| `10c2627` | Sayim (`sks628353@gmail.com`) | 2026-10-11 | `docs: add comprehensive project README file` |
| `906034c` | Sayim (`sks628353@gmail.com`) | 2026-10-11 | `feat: implement command menu navigation, complete workspace views, and luxury motion physics` |
| `71ad2a7` | Sayim (`sks628353@gmail.com`) | 2026-10-11 | `docs: add initial project architecture, schema, TRD, implementation plan, and rules documentation` |
| `dfdb53b` | Sayim (`sks628353@gmail.com`) | 2026-10-11 | `chore: initialize client project dependencies and node modules` |
| `18b66d7` | Sayim (`sks628353@gmail.com`) | 2026-10-10 | `feat: initialize documentation and design system tracker files for CPMS` |
| `5966b14` | Sayim (`sks628353@gmail.com`) | 2026-10-09 | `docs: initialize CPMS tracking, implementation plan, PRD, rules, and technical requirements documents` |
| `88cf5b6` | Sayim (`sks628353@gmail.com`) | 2026-10-09 | `brain: initial directory setup` |

### B. Current Codebase State
- **`brain/` (Complete):** Contains all foundational SDLC engineering specifications authored by Sayim ([`PRD.md`](PRD.md), [`TRD.md`](TRD.md), [`AppFlow.md`](AppFlow.md), [`Design.md`](Design.md), [`Schema.md`](Schema.md), [`Rules.md`](Rules.md), [`ImplementationPlan.md`](ImplementationPlan.md), [`Tracker.md`](Tracker.md), [`UI.md`](UI.md), [`progress_simple.md`](progress_simple.md), and this [`progress_technical.md`](progress_technical.md)).
- **`client/` (Complete):** Contains the fully functional 18-screen React 19 / Vite 8 client with typed mock data, shadcn/ui Radix components, GSAP 3D perspective cards, magnetic buttons, Lenis smooth scrolling, and `Ctrl+K` command menu.
- **`server/` (Pending Scaffolding):** The backend directory is ready to be initialized as Joyeeta begins Phase 0, Aditya begins Phase 1, and Aakriti builds reference APIs.

---

## 3. Phase Breakdown & Detailed Member Responsibilities

### Sayim (Project Lead)
- **Assigned Phase:** **Phase UI (Delivered) + Cross-Phase Engineering Oversight (Phases 0 → 7)**
- **Scope:** Complete System Architecture & Governance.
- **Contributions Delivered Till Now:**
  1. **System Blueprint Delivery:** Architected all 9 formal specifications in `brain/`, establishing deterministic eligibility rules, single-offer policy constraints, and relational database schemas.
  2. **Full Working Client Prototype:** Scaffolding `client/` and creating all 18 interactive views across Student, Company, TPO, and Admin roles so teammates have clear visual targets and API contracts to code against.
  3. **Motion Physics & Design System:** Integrated `cpms-design-taste`, `shadcn/ui`, `GSAP` 3D perspective cards, `Lenis` inertial smooth scroll, and global `Ctrl+K` command palette.
  4. **Repository & Security Hygiene:** Setup `.env.example`, `.gitignore`, `private.txt` credential isolation, and production documentation (`README.md`, `ui_global.md`).
  5. **Ongoing Leadership:** Overseeing Joyeeta's database layer, Aditya's authentication security, and Aakriti's endpoints, followed by cross-module integration and semester evaluation review.

---

### Joyeeta (Database Engineer)
- **Assigned Phase:** **Phase 0 — Setup, Database & Supabase Integration**
- **Prerequisites:** Supabase credentials provided in `private.txt`.
- **Detailed Tasks:**
  1. **Task 0.3 (Prisma Schema):** Create `server/prisma/schema.prisma` with all 11 tables matching [`Schema.md §3`](Schema.md):
     - `users`, `departments`, `students`, `companies`, `jobs`, `applications`, `interview_rounds`, `round_results`, `notifications`, `audit_logs`, `system_settings`.
  2. **Task 0.3 (Database Migration):** Run migration against Supabase cloud PostgreSQL:
     ```bash
     npx prisma migrate dev --name init
     ```
  3. **Task 0.4 (Environment Configuration):** Configure `server/.env` with `DATABASE_URL` (pooler) and `DIRECT_URL` (direct).
  4. **Task 0.6 (Database Seeding):** Create `server/prisma/seed.ts` to populate default departments (`CSE`, `IT`, `ECE`, `MECH`), initial system admin account, and default policy settings (8.0 LPA threshold).
- **Exit Criteria:** Database tables visible in Supabase dashboard with initial seed records populated.

---

### Aditya (Auth & Security Engineer)
- **Assigned Phase:** **Phase 1 — Authentication & RBAC Security**
- **Prerequisites:** Joyeeta's `prisma.user` schema migration complete.
- **Detailed Tasks:**
  1. **Task 1.1 (Registration Endpoints):**
     - `POST /auth/register/student`: Validates roll number format, creates `User` and `Student` records with `is_verified: false`.
     - `POST /auth/register/company`: Validates GST/Tax ID, creates `User` and `Company` records with `status: PENDING`.
  2. **Task 1.2 (Login & 5-Attempt Lockout - REQ-2):**
     - `POST /auth/login`: Verifies email and password using `bcrypt.compare()`.
     - Generates signed JWT with 8-hour expiration (`cpms_token`).
     - Tracks failed attempts: if `failed_login_attempts >= 5`, lock account for 15 minutes (`HTTP 423 Locked`).
  3. **Task 1.3 (RBAC Middleware):**
     - `authenticate`: Extracts Bearer token, verifies JWT, and attaches user payload to `req.user`.
     - `requireRole(["STUDENT", "COMPANY", "TPO", "ADMIN"])`: Rejects unauthorized role access with `HTTP 403 Forbidden`.
- **Exit Criteria:** Postman tests confirm student registration, company registration, login token generation, and account lockout after 5 consecutive failures.

---

### Aakriti (Backend API & Notification Engineer)
- **Assigned Phase:** **Phase 0/1/5 Micro-Services (Reference Data & Notifications)**
- **Why this is the easiest & beginner-friendly module:**
  - Simple read (`findMany`) and update (`updateMany`) queries.
  - Zero complex business math or multi-stage locks.
  - Independent endpoints that do not block other team members.
- **Detailed Tasks:**
  1. **Task 0.5 (System Health Check):**
     - `GET /health`: Returns server status, timestamp, and process uptime.
  2. **Task 1.4 (Department Reference Catalog):**
     - `GET /departments`: Returns active departments (`where: { is_active: true }`) for registration dropdowns.
  3. **Task 5.3 (Notification Alerts Service):**
     - `GET /notifications`: Fetches alert feed for the logged-in user.
     - `PATCH /notifications/:id/read`: Marks a single notification as read.
     - `PATCH /notifications/read-all`: Marks all notifications as read.
- **Exit Criteria:** Endpoints tested via Postman returning status 200 with JSON payloads.

---

## 4. Copy-Paste Code Templates for Aakriti

To ensure Aakriti can start immediately and succeed without confusion, here is the exact code for her endpoints:

### Template 1: Health Check (`server/src/routes/health.routes.ts`)
```ts
import { Router, Request, Response } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "College Placement Management System API"
  });
});
```

### Template 2: Department Catalog (`server/src/routes/department.routes.ts`)
```ts
import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const departmentRouter = Router();

departmentRouter.get("/departments", async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      where: { is_active: true },
      select: { id: true, code: true, name: true },
      orderBy: { code: "asc" }
    });
    res.status(200).json({ data: departments });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve departments" });
  }
});
```

### Template 3: Notification Alerts (`server/src/routes/notification.routes.ts`)
```ts
import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

export const notificationRouter = Router();

// GET all notifications for the authenticated user
notificationRouter.get("/notifications", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: "desc" },
    });
    const unreadCount = notifications.filter(n => !n.read_at).length;
    res.status(200).json({ data: notifications, meta: { unread_count: unreadCount } });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PATCH mark single notification read
notificationRouter.patch("/notifications/:id/read", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.notification.updateMany({
      where: { id, user_id: req.user.id },
      data: { read_at: new Date() },
    });
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// PATCH mark all notifications read
notificationRouter.patch("/notifications/read-all", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { user_id: req.user.id, read_at: null },
      data: { read_at: new Date() },
    });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});
```

---

## 5. Team Next Steps & Action Plan

1. **Joyeeta (Phase 0):** Initialize `server/prisma/schema.prisma` with the 11 tables and run `npx prisma migrate dev`.
2. **Aditya (Phase 1):** Implement auth routes (`/auth/register`, `/auth/login`, lockout, RBAC middleware).
3. **Aakriti (Phase 0/1/5):** Implement `health.routes.ts`, `department.routes.ts`, and `notification.routes.ts`.
4. **Sayim (Project Lead):** Code review all pull requests, perform cross-tier integration with the client prototype, and run end-to-end smoke testing.

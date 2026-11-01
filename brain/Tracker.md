# Tracker — College Placement Management System (CPMS)

Status values: **Not Started**, **In Progress**, **Blocked**, **Done**. Tasks mirror ImplementationPlan.md §1 exactly. Frontend-first prototype progress is tracked in detail in UI.md. Rows marked **BLOCKING** gate their phase's exit criteria.

> **Frontend-First Prototype Status:** **DONE (100% Complete)**  
> All 18 screens, role dashboards (`STUDENT`, `COMPANY`, `TPO`, `ADMIN`), auth workflows, Kanban applicant pipeline, TPO verification grid, corporate approvals, institutional analytics, audit trails, and notification center are fully implemented with strict anti-slop craft (`cpms-design-taste` tokens). The client compiles with zero TypeScript errors (`dist/` verified via Vite production build). Backend implementation follows starting with Phase 0.

## 1. Phase Tables

### Phase 0 — Setup and decisions
| Task | Owner | Status | Notes |
|---|---|---|---|
| 0.1 Lock decisions D1–D6 | BE | Done | Logged in §3 |
| 0.2 Repo scaffold + docker-compose | OPS/BE | Done | Joyeeta (PR #1): `docker-compose.yml`, `server/` scaffold |
| 0.3 Prisma schema + migration | BE | Done | Joyeeta (PR #1): 11 tables matching Schema.md §3 connected to Supabase |
| 0.4 Env config (zod) | BE | Done | Joyeeta (PR #1): `server/src/config/env.ts` with Zod validation |
| 0.5 Express skeleton + `/health` | BE | Done | **BLOCKING** — `server/src/routes/health.ts` & `server/src/app.ts` |
| 0.6 Seed script | BE | Done | Joyeeta (PR #1): `server/prisma/seed.ts` (depts, admin, 8.0 LPA cutoff) |

### Phase 1 — Auth and RBAC
| Task | Owner | Status | Notes |
|---|---|---|---|
| 1.1 Register endpoints | BE | Not Started | Assigned to Aditya (student & company intake) |
| 1.2 Login + lockout | BE | Not Started | Assigned to Aditya (REQ-2, 5-attempt lockout) |
| 1.3 authenticate + requireRole | BE | In Progress | **BLOCKING** (REQ-3) — JWT verification helper in `auth.ts`; auth endpoints pending |
| 1.4 `/departments`, `/auth/me` | BE | Not Started | Assigned to Aakriti (`/departments`) & Aditya (`/auth/me`) |
| 1.5 FE login/register/guards | FE | Done | Sayim: All login/register screens, role redirection & route guards |
| 1.6 RBAC + lockout tests | QA | Not Started | |

### Phase 2 — Student profile and verification
| Task | Owner | Status | Notes |
|---|---|---|---|
| 2.1 `/students/me` GET/PUT | BE | Not Started | Assigned to Aditya |
| 2.2 Resume upload | BE | Not Started | **BLOCKING** (REQ-4) — Assigned to Aditya |
| 2.3 Pre-signed link | BE | Not Started | Assigned to Aditya |
| 2.4 Verification reset | BE | Not Started | Assigned to Aditya (REQ-5) |
| 2.5 TPO grid + verify | BE/FE | In Progress | Sayim: FE Grid Done; BE verify endpoint pending |
| 2.6 Upload/reset tests | QA | Not Started | |

### Phase 3 — Companies and jobs
| Task | Owner | Status | Notes |
|---|---|---|---|
| 3.1 Company decision | BE | Done | Joyeeta (PR #1): `POST /api/v1/tpo/companies/:id/decision` |
| 3.2 Job POST/PATCH | BE | Done | Joyeeta (PR #1): `POST/PATCH /api/v1/jobs` (REQ-7) |
| 3.3 TPO job approval | BE | Done | **BLOCKING** (REQ-8) — `POST /api/v1/tpo/jobs/:id/decision` |
| 3.4 Deadline auto-close | BE | Done | Joyeeta (PR #1): `server/src/jobs/closeExpiredJobs.ts` cron scheduler (REQ-9) |
| 3.5 FE company/TPO screens | FE | Done | Sayim: Company dashboard, drive creator, approvals views |
| 3.6 Visibility tests | QA | Done | Joyeeta (PR #1): `server/tests/phase3.test.ts` |

### Phase 4 — Eligibility and application (BLOCKING PHASE)
| Task | Owner | Status | Notes |
|---|---|---|---|
| 4.1 `evaluateEligibility()` | BE | Not Started | **BLOCKING** — Assigned to Sayim (Project Lead) |
| 4.2 `GET /jobs`, `/jobs/:id` | BE | In Progress | Jobs directory active; eligibility wiring pending |
| 4.3 `POST /jobs/:id/apply` | BE | Not Started | **BLOCKING** (REQ-10..13) |
| 4.4 FE badges + reasons | FE | Done | Sayim: Eligibility chips & detailed reason badges in client |
| 4.5 Matrix (30) + parallel test | QA | Not Started | **BLOCKING** |
| 4.6 Single Offer lock | BE | Not Started | Assigned to Sayim (BR-1) |

### Phase 5 — Funnel, rounds, notifications
| Task | Owner | Status | Notes |
|---|---|---|---|
| 5.1 Applicant list + masking | BE | Not Started | Assigned to Aakriti |
| 5.2 Stage + bulk stage | BE | Not Started | **BLOCKING** (REQ-14, 16) — Assigned to Aakriti |
| 5.3 Resume link + zip | BE | Not Started | REQ-15 — Assigned to Aditya |
| 5.4 Rounds + email | BE | In Progress | Helper service in `notification.ts`; routes assigned to Aakriti |
| 5.5 Notification bell | FE | Done | Sayim: Interactive notification drawer & unread counters |
| 5.6 Kanban + tracker UI | FE | Done | Sayim: 5-stage drag/click Kanban applicant pipeline |

### Phase 6 — Reports and admin
| Task | Owner | Status | Notes |
|---|---|---|---|
| 6.1 Placement summary | BE | Done | **BLOCKING** (REQ-17) — Joyeeta (PR #1): `/reports/placement-summary` |
| 6.2 CSV/PDF export | BE | Done | Joyeeta (PR #1): `GET /api/v1/reports/export/csv` stream |
| 6.3 Unplaced list | BE | Done | Joyeeta (PR #1): `GET /api/v1/reports/unplaced` (REQ-18) |
| 6.4 Admin endpoints | BE | Done | Joyeeta (PR #1): `server/src/routes/admin.ts` (settings & staff) |
| 6.5 Audit logging | BE | Done | Joyeeta (PR #1): `server/src/services/audit.ts` |
| 6.6 FE reports/admin | FE | Done | Sayim: Visual analytics gauge, charts, settings slider & audit viewer |

### Phase 7 — Hardening, performance, deploy
| Task | Owner | Status | Notes |
|---|---|---|---|
| 7.1 Indexes + EXPLAIN | BE | Not Started | |
| 7.2 k6 load test | QA | Not Started | **BLOCKING** (p95 ≤ 500 ms) |
| 7.3 Security hardening | BE | In Progress | Helmet, CORS allowlist, Express limits configured |
| 7.4 Deploy | OPS | Not Started | VERIFY free limits |
| 7.5 README + demo creds | OPS | In Progress | Sayim: Comprehensive README.md; demo credentials in seed |
| 7.6 Traceability + polish | QA | Not Started | |

## 2. Blockers Log

| Date | Blocker | Task | Owner | Resolution | Resolved? |
|---|---|---|---|---|---|
| | | | | | |

## 3. Decisions Log

| Date | Decision | Reason | Doc updated? |
|---|---|---|---|
| (Day 1) | D1: Backend = Node.js/TypeScript | Single language with frontend; SRS §2.4 allows Node 20+ | TRD.md §1 |
| (Day 1) | D2: ORM = Prisma | Typed migrations and composite unique constraint | TRD.md §1 |
| (Day 1) | D3: Resume storage = S3-compatible API (MinIO dev, R2 prod) | Free-tier hosts have ephemeral disks; supports pre-signed URLs | TRD.md §1.3 |
| (Day 1) | D4: Express serves built SPA (one deployable) | Simplest free deployment | TRD.md §1.4 |
| (Day 1) | D5: SDLC Model = Iterative Development Model | Selected over Waterfall to break system complexity into manageable feature releases (auth → eligibility → drive lifecycle → analytics), enabling early integration testing and business rule verification per increment. | PRD.md §0.1, ImplementationPlan.md §0 |
| (Day 1) | D6: Cloud Database = Supabase PostgreSQL | Replaces Neon as cloud PostgreSQL provider via DATABASE_URL; retains Prisma migrations, local Docker parity, and custom Express bcrypt/JWT auth. | TRD.md §1.3, §2 |
| (Day 1) | Single institution, no email activation (A2, A4) | Scope control | PRD.md §0 |

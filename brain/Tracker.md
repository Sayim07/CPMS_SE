# Tracker — College Placement Management System (CPMS)

Status values: **Not Started**, **In Progress**, **Blocked**, **Done**. Tasks mirror ImplementationPlan.md §1 exactly. Rows marked **BLOCKING** gate their phase's exit criteria.

## 1. Phase Tables

### Phase 0 — Setup and decisions
| Task | Owner | Status | Notes |
|---|---|---|---|
| 0.1 Lock decisions D1–D4 | BE | Not Started | Log in §3 |
| 0.2 Repo scaffold + docker-compose | OPS | Not Started | |
| 0.3 Prisma schema + migration | BE | Not Started | Must mirror Schema.md §3 |
| 0.4 Env config (zod) | BE | Not Started | |
| 0.5 Express skeleton + `/health` | BE | Not Started | **BLOCKING** |
| 0.6 Seed script | BE | Not Started | |

### Phase 1 — Auth and RBAC
| Task | Owner | Status | Notes |
|---|---|---|---|
| 1.1 Register endpoints | BE | Not Started | |
| 1.2 Login + lockout | BE | Not Started | REQ-2 |
| 1.3 authenticate + requireRole | BE | Not Started | **BLOCKING** (REQ-3) |
| 1.4 `/departments`, `/auth/me` | BE | Not Started | |
| 1.5 FE login/register/guards | FE | Not Started | |
| 1.6 RBAC + lockout tests | QA | Not Started | |

### Phase 2 — Student profile and verification
| Task | Owner | Status | Notes |
|---|---|---|---|
| 2.1 `/students/me` GET/PUT | BE | Not Started | |
| 2.2 Resume upload | BE | Not Started | **BLOCKING** (REQ-4) |
| 2.3 Pre-signed link | BE | Not Started | |
| 2.4 Verification reset | BE | Not Started | REQ-5 |
| 2.5 TPO grid + verify | BE/FE | Not Started | |
| 2.6 Upload/reset tests | QA | Not Started | |

### Phase 3 — Companies and jobs
| Task | Owner | Status | Notes |
|---|---|---|---|
| 3.1 Company decision | BE | Not Started | |
| 3.2 Job POST/PATCH | BE | Not Started | REQ-7 |
| 3.3 TPO job approval | BE | Not Started | **BLOCKING** (REQ-8) |
| 3.4 Deadline auto-close | BE | Not Started | REQ-9 |
| 3.5 FE company/TPO screens | FE | Not Started | |
| 3.6 Visibility tests | QA | Not Started | |

### Phase 4 — Eligibility and application (BLOCKING PHASE)
| Task | Owner | Status | Notes |
|---|---|---|---|
| 4.1 `evaluateEligibility()` | BE | Not Started | **BLOCKING** |
| 4.2 `GET /jobs`, `/jobs/:id` | BE | Not Started | |
| 4.3 `POST /jobs/:id/apply` | BE | Not Started | **BLOCKING** (REQ-10..13) |
| 4.4 FE badges + reasons | FE | Not Started | |
| 4.5 Matrix (30) + parallel test | QA | Not Started | **BLOCKING** |
| 4.6 Single Offer lock | BE | Not Started | BR-1 |

### Phase 5 — Funnel, rounds, notifications
| Task | Owner | Status | Notes |
|---|---|---|---|
| 5.1 Applicant list + masking | BE | Not Started | |
| 5.2 Stage + bulk stage | BE | Not Started | **BLOCKING** (REQ-14, 16) |
| 5.3 Resume link + zip | BE | Not Started | REQ-15 |
| 5.4 Rounds + email | BE | Not Started | |
| 5.5 Notification bell | FE | Not Started | |
| 5.6 Kanban + tracker UI | FE | Not Started | |

### Phase 6 — Reports and admin
| Task | Owner | Status | Notes |
|---|---|---|---|
| 6.1 Placement summary | BE | Not Started | **BLOCKING** (REQ-17) |
| 6.2 CSV/PDF export | BE | Not Started | |
| 6.3 Unplaced list | BE | Not Started | REQ-18 |
| 6.4 Admin endpoints | BE | Not Started | |
| 6.5 Audit logging | BE | Not Started | |
| 6.6 FE reports/admin | FE | Not Started | |

### Phase 7 — Hardening, performance, deploy
| Task | Owner | Status | Notes |
|---|---|---|---|
| 7.1 Indexes + EXPLAIN | BE | Not Started | |
| 7.2 k6 load test | QA | Not Started | **BLOCKING** (p95 ≤ 500 ms) |
| 7.3 Security hardening | BE | Not Started | |
| 7.4 Deploy | OPS | Not Started | VERIFY free limits |
| 7.5 README + demo creds | OPS | Not Started | |
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
| (Day 1) | Single institution, no email activation (A2, A4) | Scope control | PRD.md §0 |

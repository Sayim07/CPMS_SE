# ImplementationPlan — College Placement Management System (CPMS)

Assumes ~4 weeks and 1–3 developers (PRD.md §0 A1). Task IDs here are mirrored one-to-one in Tracker.md §1. Contracts: Schema.md. Stack: TRD.md §1.

Owner roles: **BE** backend, **FE** frontend, **QA** testing, **OPS** infra/deploy. With a solo developer, one person holds all roles.

## 1. Phases

### Phase 0 — Setup and decisions (Days 1–2)
Owner: BE + OPS
- [ ] 0.1 Lock Day-1 decisions D1–D4 (TRD.md §1) in Tracker.md §3
- [ ] 0.2 Repo scaffold per Schema.md §2; `docker-compose.yml` (postgres:15, minio, mailpit)
- [ ] 0.3 `prisma/schema.prisma` mirroring Schema.md §3; first migration
- [ ] 0.4 `config/env.ts` (zod) from TRD.md §6; `.env.example`
- [ ] 0.5 Express app skeleton: helmet, cors, JSON parser, pino, error handler, `GET /health`
- [ ] 0.6 Seed script: admin, TPO, 3 departments, setting `single_offer_ctc_threshold_lpa=8`
**Exit criteria:** `docker compose up` + `npm run dev` serves `/api/v1/health` = ok with DB up; seed runs twice without error.

### Phase 1 — Auth and RBAC (Days 3–5)
Owner: BE (+FE for forms)
- [ ] 1.1 Register student/company endpoints (Schema.md §5.1), bcrypt cost 10
- [ ] 1.2 Login with 5-failure/15-min lockout (REQ-2)
- [ ] 1.3 `authenticate` + `requireRole` middleware; 403 on wrong role (REQ-3)
- [ ] 1.4 `GET /departments`, `GET /auth/me`
- [ ] 1.5 FE: login/register pages, token storage, role redirect, route guards
- [ ] 1.6 Tests: RBAC matrix (role × endpoint), lockout
**Exit criteria:** every protected route rejects missing token (401) and wrong role (403); lockout test passes.

### Phase 2 — Student profile and TPO verification (Days 6–8)
Owner: BE + FE
- [ ] 2.1 `GET/PUT /students/me` with validation ranges
- [ ] 2.2 Resume upload: multer 2 MB limit, `file-type` magic-byte check, store to S3 API (`services/storage.ts`)
- [ ] 2.3 Pre-signed resume link (TTL 300 s)
- [ ] 2.4 Verification reset on CGPA/backlog change + TPO notification + audit (REQ-5)
- [ ] 2.5 TPO student grid + verify endpoint (Schema.md §5.3)
- [ ] 2.6 Tests: upload rules, reset logic
**Exit criteria:** a `.png` renamed `.pdf` and a 2.1 MB PDF are both rejected; editing CGPA flips `is_verified` to false.

### Phase 3 — Companies and jobs (Days 9–11)
Owner: BE + FE
- [ ] 3.1 Company decision endpoints; `COMPANY_NOT_APPROVED` guard
- [ ] 3.2 `POST/PATCH /jobs` with required fields (REQ-7), `JOB_PENDING` notification
- [ ] 3.3 TPO job approval (REQ-8) with state machine (AppFlow.md §5)
- [ ] 3.4 Cron `closeExpiredJobs` + lazy check (REQ-9)
- [ ] 3.5 FE: company job form/list; TPO approval screens
- [ ] 3.6 Tests: students never see non-`ACTIVE` jobs
**Exit criteria:** job created by a company is invisible to students until TPO approves; expired job auto-closes within 1 minute.

### Phase 4 — Eligibility and application (Days 12–15) — **BLOCKING PHASE**
Owner: BE + FE + QA
- [ ] 4.1 `services/eligibility.ts` implementing all reason codes (Schema.md §1)
- [ ] 4.2 `GET /jobs`, `GET /jobs/:id` with `eligibility`
- [ ] 4.3 `POST /jobs/:id/apply` in a transaction; 422/409 handling (REQ-10..13)
- [ ] 4.4 FE: job cards with badges, reason list, Apply Now
- [ ] 4.5 30-case eligibility matrix test + 10-parallel-apply test
- [ ] 4.6 Single Offer Policy lock check (BR-1) inside eligibility
**Exit criteria (BLOCKING):** matrix passes 30/30; parallel test yields exactly 1 application; API apply and UI verdict never disagree.

### Phase 5 — Funnel, rounds, notifications (Days 16–19)
Owner: BE + FE
- [ ] 5.1 Applicant list with contact masking (Schema.md §1)
- [ ] 5.2 Stage patch + bulk stage with transition rules (REQ-14); `SELECTED` → `PLACED` (REQ-16) + single-offer lock
- [ ] 5.3 Resume link and zip stream (REQ-15)
- [ ] 5.4 Rounds create/list + notifications + email via Nodemailer
- [ ] 5.5 Notification bell with 30 s polling
- [ ] 5.6 FE Kanban + student application tracker
**Exit criteria:** Company cannot see email/phone for `APPLIED`; round creation produces a notification and a Mailpit email for every shortlisted applicant.

### Phase 6 — Reports and admin (Days 20–22)
Owner: BE + FE
- [ ] 6.1 `placement-summary` aggregation (REQ-17)
- [ ] 6.2 CSV export (csv-stringify) and PDF export (pdfkit)
- [ ] 6.3 Unplaced list JSON/CSV (REQ-18)
- [ ] 6.4 Admin: users, departments, settings
- [ ] 6.5 Audit log writer wired to all actions in Schema.md §1; admin viewer
- [ ] 6.6 FE: reports page, admin pages
**Exit criteria:** placement rate on seed data equals hand-calculated value; every audit action constant is emitted at least once in tests.

### Phase 7 — Hardening, performance, deploy (Days 23–28)
Owner: QA + OPS
- [ ] 7.1 Add DB indexes from Schema.md §3; check with `EXPLAIN` on `GET /jobs`
- [ ] 7.2 k6 test: 500 VUs, p95 ≤ 500 ms (TRD.md §5); record result
- [ ] 7.3 Rate limits, CORS allow-list, helmet; password never logged
- [ ] 7.4 Deploy: Neon + R2 + Brevo + Render (VERIFY free limits)
- [ ] 7.5 README, demo credentials, seed on deploy
- [ ] 7.6 Final traceability table (REQ → code → test) and polish
**Exit criteria:** deployed URL passes a smoke test of one full flow (register → verify → post → approve → apply → shortlist → select); k6 result recorded.

## 2. Verified Reference Snippets

> Syntax from official docs as understood at writing. **VERIFY** against current docs before use.

Prisma unique composite (REQ-13):
```prisma
model Application {
  id        String   @id @default(uuid())
  jobId     String   @map("job_id")
  studentId String   @map("student_id")
  stage     Stage    @default(APPLIED)
  appliedAt DateTime @default(now()) @map("applied_at")
  @@unique([jobId, studentId])
  @@map("applications")
}
```

Catch duplicate apply (Prisma error code `P2002`):
```ts
try { await prisma.application.create({ data }); }
catch (e) { if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') throw new AppError(409, 'ALREADY_APPLIED'); throw e; }
```

bcrypt and JWT:
```ts
const hash = await bcrypt.hash(password, 10);
const ok = await bcrypt.compare(password, user.passwordHash);
const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '8h' });
```

multer limit and PDF magic-byte check:
```ts
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });
const type = await fileTypeFromBuffer(req.file.buffer);   // from 'file-type'
if (type?.mime !== 'application/pdf') throw new AppError(400, 'FILE_INVALID');
```
(multer raises `LIMIT_FILE_SIZE`; map it to 413 `FILE_TOO_LARGE`.)

Pre-signed GET URL (S3-compatible, R2/MinIO need `forcePathStyle: true` for MinIO):
```ts
const s3 = new S3Client({ region: env.S3_REGION, endpoint: env.S3_ENDPOINT, forcePathStyle: true,
  credentials: { accessKeyId: env.S3_ACCESS_KEY, secretAccessKey: env.S3_SECRET_KEY } });
const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }), { expiresIn: 300 });
```

Zip stream:
```ts
const archive = archiver('zip');
archive.pipe(res);
for (const r of rows) {
  const obj = await s3.send(new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: r.resumeKey }));
  archive.append(obj.Body as Readable, { name: `${r.rollNo}.pdf` });
}
await archive.finalize();
```

## 3. Fallback Plan for the Riskiest Task

**Riskiest:** meeting p95 ≤ 500 ms at 500 concurrent users (Phase 7.2) on free infrastructure.
1. Measure on the local Docker stack first; free hosts are not a valid benchmark.
2. If it fails: confirm indexes via `EXPLAIN`, select only needed columns, compute eligibility in one query batch (load settings once per request), and raise Prisma `connection_limit`.
3. If still failing: add an in-process 5 s cache (a plain `Map`) for `GET /departments` and settings only. No Redis.
4. Report the measured numbers honestly in the README if the target cannot be reached on free hosting.

Secondary risk: R2/Brevo free limits. Fallback: MinIO + Mailpit for the demo (document in README).

## 4. De-scope Order (cut first → last)

1. F13 TPO eligibility override
2. PDF report export (keep CSV)
3. Bulk stage endpoint (keep single stage patch)
4. Email delivery of round alerts (keep in-app notifications)
5. Admin audit-log viewer UI (keep logging)
6. Charts on reports page (keep stat cards and table)
7. Resume zip download (keep single resume links)

## 5. Never Cut

- Server-side `evaluateEligibility()` and the unique (`job_id`, `student_id`) constraint
- TPO verification gate and TPO approval of companies/jobs
- Role-based authorization with ownership checks
- PDF ≤ 2 MB validation and pre-signed resume access
- Contact masking before shortlist
- Placement summary (REQ-17) and audit logging
- Tests for eligibility and RBAC

# Schema — College Placement Management System (CPMS)

**This is the exact contract every module must follow. If a field is not defined here, do not invent it; add it here first.**

## 1. Fixed Scope Constants and Business Formulas

Constants (roles, stages, limits) are defined in TRD.md §3 and are not repeated. Formulas below are authoritative.

**Eligibility** — implemented once as `evaluateEligibility(student, job, settings, now)` in `server/src/services/eligibility.ts`. Returns `{ eligible: boolean, reasons: ReasonCode[] }`. All applicable reasons are returned (no short-circuit).

| Reason code | Condition that adds it | UI text |
|---|---|---|
| `NOT_VERIFIED` | `student.is_verified = false` | "Your profile is not verified by the TPO yet." |
| `DEPT_NOT_ALLOWED` | `student.department_id` not in job's `department_ids` | "Your department is not eligible for this drive." |
| `CGPA_BELOW_CUTOFF` | `student.cgpa < job.min_cgpa` | "Your CGPA {x} is below the required {y}." |
| `BACKLOGS_EXCEEDED` | `student.active_backlogs > job.max_backlogs` | "You have {x} active backlogs; maximum allowed is {y}." |
| `JOB_NOT_ACTIVE` | `job.status != ACTIVE` | "This drive is not open." |
| `DEADLINE_PASSED` | `job.application_deadline <= now` | "The application deadline has passed." |
| `SINGLE_OFFER_LOCK` | `student.single_offer_locked = true` AND `job.ctc_lpa <= single_offer_ctc_threshold_lpa` | "You are locked out of standard-tier drives after a high-tier offer." |
| `ALREADY_APPLIED` | application exists for (job, student) | "You have already applied." |

**Single Offer Policy:** when an application becomes `SELECTED` and `job.ctc_lpa > single_offer_ctc_threshold_lpa`, set `students.single_offer_locked = true`.

**Placement metrics (per `batch_year`):**
- `eligible_students` = count of students with `is_verified = true`, `deleted_at IS NULL`, and `batch_year` = selected.
- `placed_students` = count of those with at least one application at stage `SELECTED`.
- `placement_rate_pct` = `placed_students / eligible_students × 100`, rounded to 2 decimals; `0` when `eligible_students = 0`.
- `average_ctc_lpa` = mean over placed students of the highest `ctc_lpa` among their `SELECTED` jobs, rounded to 2 decimals; `0` if none.
- `UNPLACED` list = students counted in `eligible_students` whose `placement_status = UNPLACED`.

**Contact visibility:** `email` and `phone` of a student are returned to a COMPANY only when the application stage is `SHORTLISTED`, `IN_INTERVIEW`, or `SELECTED`.

**Audit action constants:** `USER_CREATED`, `STUDENT_VERIFIED`, `STUDENT_VERIFICATION_RESET`, `COMPANY_APPROVED`, `COMPANY_REJECTED`, `JOB_APPROVED`, `JOB_REJECTED`, `JOB_CTC_CHANGED`, `STAGE_CHANGED`, `SELECTION_POSTED`, `ELIGIBILITY_OVERRIDE`, `SETTINGS_CHANGED`.

## 2. Folder / File Structure and Naming

```
cpms/
├─ docker-compose.yml            # postgres, minio, mailpit
├─ .env.example
├─ README.md
├─ server/
│  ├─ prisma/schema.prisma       # mirrors §3 exactly
│  ├─ prisma/seed.ts
│  ├─ src/
│  │  ├─ app.ts                  # express app, middleware order
│  │  ├─ index.ts                # listen + cron start
│  │  ├─ config/env.ts           # zod-validated env (TRD.md §6)
│  │  ├─ middleware/             # authenticate.ts, requireRole.ts, errorHandler.ts, validate.ts
│  │  ├─ routes/                 # auth.ts, students.ts, tpo.ts, jobs.ts, applications.ts, rounds.ts,
│  │  │                          # notifications.ts, reports.ts, admin.ts, health.ts
│  │  ├─ services/               # eligibility.ts, storage.ts, mailer.ts, audit.ts, notify.ts, reports.ts
│  │  ├─ jobs/closeExpiredJobs.ts
│  │  └─ lib/                    # logger.ts, errors.ts, serializers.ts
│  └─ tests/                     # eligibility.test.ts, rbac.test.ts, apply.test.ts, upload.test.ts
├─ client/
│  ├─ index.html                 # title per Design.md §0
│  └─ src/ (pages/, components/, hooks/, api/, routes.tsx)
└─ loadtest/jobs-board.js        # k6
```

Naming: files `camelCase.ts`; React components `PascalCase.tsx`; DB tables and columns `snake_case`; JSON fields `snake_case`; enums `UPPER_SNAKE`; object keys `resumes/{student_id}.pdf`.

## 3. Database Tables (PostgreSQL 15, Prisma)

All `id` columns are UUID v4. All timestamps are `timestamptz`. `deleted_at` = soft delete (SR-2); queries must filter `deleted_at IS NULL`.

### 3.1 `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| email | varchar(255) | unique, lowercased |
| password_hash | varchar(100) | bcrypt |
| role | enum `STUDENT/COMPANY/TPO/ADMIN` | |
| full_name | varchar(120) | for COMPANY = contact person |
| is_active | boolean | default true |
| failed_login_count | int | default 0 |
| locked_until | timestamptz null | |
| created_at, updated_at | timestamptz | |
| deleted_at | timestamptz null | |

### 3.2 `departments`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| code | varchar(10) | unique, e.g. `CSE` |
| name | varchar(100) | |
| is_active | boolean | default true |

### 3.3 `students`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK users | unique |
| roll_no | varchar(30) | unique |
| phone | varchar(20) | |
| department_id | uuid FK departments | index |
| batch_year | int | graduation year, index |
| cgpa | numeric(4,2) | 0.00–10.00 |
| tenth_pct, twelfth_pct | numeric(5,2) | 0–100 |
| active_backlogs | int | ≥ 0 |
| resume_key | varchar(200) null | object key |
| resume_uploaded_at | timestamptz null | |
| is_verified | boolean | default false |
| verified_by | uuid FK users null | |
| verified_at | timestamptz null | |
| placement_status | enum `PLACED/UNPLACED` | default UNPLACED |
| single_offer_locked | boolean | default false |
| created_at, updated_at, deleted_at | timestamptz | |

Indexes: (`batch_year`, `is_verified`), (`department_id`).

### 3.4 `companies`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK users | unique |
| company_name | varchar(150) | |
| website | varchar(200) | |
| gst_tax_id | varchar(30) | |
| contact_phone | varchar(20) | |
| status | enum `PENDING/APPROVED/REJECTED` | default PENDING |
| decided_by | uuid FK users null | |
| decided_at | timestamptz null | |
| created_at, updated_at, deleted_at | timestamptz | |

### 3.5 `jobs`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| company_id | uuid FK companies | index |
| title | varchar(150) | |
| description | text | |
| ctc_lpa | numeric(6,2) | package in LPA |
| min_cgpa | numeric(4,2) | |
| max_backlogs | int | |
| application_deadline | timestamptz | |
| status | enum `PENDING_APPROVAL/ACTIVE/CLOSED/REJECTED` | default PENDING_APPROVAL |
| decided_by | uuid FK users null | |
| decided_at | timestamptz null | |
| created_at, updated_at, deleted_at | timestamptz | |

Indexes: (`status`, `application_deadline`).

### 3.6 `job_departments`
| Column | Type | Notes |
|---|---|---|
| job_id | uuid FK jobs | composite PK |
| department_id | uuid FK departments | composite PK |

### 3.7 `applications`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| job_id | uuid FK jobs | |
| student_id | uuid FK students | |
| stage | enum `APPLIED/SHORTLISTED/IN_INTERVIEW/SELECTED/REJECTED` | default APPLIED |
| applied_at | timestamptz | |
| updated_at | timestamptz | |
| deleted_at | timestamptz null | |

Constraints: **UNIQUE (`job_id`, `student_id`)** (REQ-13). Indexes: (`job_id`, `stage`), (`student_id`).

### 3.8 `interview_rounds`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| job_id | uuid FK jobs | index |
| round_name | varchar(100) | |
| scheduled_at | timestamptz | |
| venue_or_link | varchar(300) | |
| created_by | uuid FK users | |
| created_at | timestamptz | |

### 3.9 `notifications`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK users | index (`user_id`, `read_at`) |
| type | varchar(50) | e.g. `ROUND_SCHEDULED`, `JOB_PENDING`, `VERIFICATION_RESET` |
| message | varchar(300) | |
| link_path | varchar(200) null | client route |
| read_at | timestamptz null | |
| created_at | timestamptz | |

### 3.10 `audit_logs`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| actor_user_id | uuid FK users | |
| action | varchar(50) | constant from §1 |
| entity_type | varchar(30) | `student`, `company`, `job`, `application`, `setting`, `user` |
| entity_id | uuid null | |
| metadata | jsonb | before/after values |
| created_at | timestamptz | |

Append-only: no update or delete code paths.

### 3.11 `system_settings`
| Column | Type | Notes |
|---|---|---|
| key | varchar(80) PK | |
| value | varchar(200) | |
| updated_by | uuid FK users null | |
| updated_at | timestamptz | |

Seeded key: `single_offer_ctc_threshold_lpa` = `8`.

## 4. API Conventions

- Base path `/api/v1`; JSON UTF-8; auth header `Authorization: Bearer <jwt>` (except where marked **public**); client persists JWT in `localStorage` (`cpms_token`); database hosted on PostgreSQL 15+ (Supabase via `DATABASE_URL`).
- Success: `{ "data": <object|array>, "meta": { "page": 1, "page_size": 20, "total": 57 } }` (`meta` only on lists).
- Error: `{ "error": { "code": "NOT_ELIGIBLE", "message": "…", "details": [ … ] } }`.
- Pagination query: `page` (≥1), `page_size` (1–100).

| HTTP | `code` | When |
|---|---|---|
| 400 | `VALIDATION_ERROR`, `FILE_INVALID` | Bad body, non-PDF |
| 401 | `UNAUTHENTICATED`, `INVALID_CREDENTIALS` | Missing/bad token or login |
| 403 | `FORBIDDEN`, `COMPANY_NOT_APPROVED` | Wrong role, not owner |
| 404 | `NOT_FOUND` | Missing or hidden resource |
| 409 | `ALREADY_APPLIED`, `INVALID_TRANSITION`, `CONFLICT` | Duplicate / bad state |
| 413 | `FILE_TOO_LARGE` | Resume > 2 MB |
| 422 | `NOT_ELIGIBLE` | `details` = array of reason codes |
| 423 | `ACCOUNT_LOCKED` | Lockout active |
| 503 | `STORAGE_UNAVAILABLE` | Object storage down |

## 5. Endpoints

Roles in brackets. Every protected route checks the role (403) and, for `:id` resources, ownership.

### 5.1 Auth and users
**POST `/auth/register/student`** [public]
```json
{ "email": "asha@college.edu", "password": "Passw0rd!x", "full_name": "Asha Roy", "roll_no": "21CSE042",
  "phone": "9876543210", "department_id": "d1e2…", "batch_year": 2026 }
```
→ 201 `{ "data": { "token": "<jwt>", "redirect_path": "/student", "user": { "id": "…", "email": "asha@college.edu", "role": "STUDENT", "full_name": "Asha Roy" } } }`

**POST `/auth/register/company`** [public]
```json
{ "email": "hr@acme.com", "password": "Passw0rd!x", "full_name": "Ravi Menon", "company_name": "Acme Corp",
  "website": "https://acme.com", "gst_tax_id": "22AAAAA0000A1Z5", "contact_phone": "9000000000" }
```
→ 201 same shape, `redirect_path: "/company"`.

**POST `/auth/login`** [public] `{ "email": "…", "password": "…" }` → 200 `{ "data": { "token": "…", "redirect_path": "/tpo", "user": { … } } }`. Errors: 401 `INVALID_CREDENTIALS`, 423 `ACCOUNT_LOCKED`.

**GET `/auth/me`** [any] → `{ "data": { "id": "…", "email": "…", "role": "STUDENT", "full_name": "…" } }`

### 5.2 Student profile [STUDENT]
**GET `/students/me`** →
```json
{ "data": { "id": "…", "email": "asha@college.edu", "full_name": "Asha Roy", "roll_no": "21CSE042", "phone": "9876543210",
  "department": { "id": "…", "code": "CSE", "name": "Computer Science" }, "batch_year": 2026, "cgpa": 8.12,
  "tenth_pct": 91.5, "twelfth_pct": 88.0, "active_backlogs": 0, "has_resume": true, "resume_uploaded_at": "2026-10-01T08:00:00Z",
  "is_verified": true, "placement_status": "UNPLACED", "single_offer_locked": false } }
```
**PUT `/students/me`** body: `full_name, phone, department_id, batch_year, cgpa, tenth_pct, twelfth_pct, active_backlogs` → returns the object above. If student was verified and `cgpa` or `active_backlogs` changed → `is_verified=false`, audit `STUDENT_VERIFICATION_RESET`, notify all TPOs (REQ-5).
**POST `/students/me/resume`** multipart field `resume` (PDF, ≤ 2 MB, magic-byte checked) → `{ "data": { "has_resume": true, "resume_uploaded_at": "…" } }`. Errors: 400 `FILE_INVALID`, 413 `FILE_TOO_LARGE`.
**GET `/students/me/resume-link`** → `{ "data": { "url": "https://…signed…", "expires_in": 300 } }`
**GET `/students/me/applications`** → list of `{ "id", "stage", "applied_at", "job": { "id", "title", "ctc_lpa", "company_name" }, "rounds": [ { "round_name", "scheduled_at", "venue_or_link" } ] }`

### 5.3 TPO verification and approvals [TPO]
- **GET `/tpo/students`** query `is_verified`, `batch_year`, `department_id`, `q`, pagination → list of `{ id, roll_no, full_name, department_code, batch_year, cgpa, active_backlogs, tenth_pct, twelfth_pct, has_resume, is_verified, placement_status }`.
- **POST `/tpo/students/:id/verify`** `{ "verified": true }` → 200 student summary; audit `STUDENT_VERIFIED`. Rejecting = `{ "verified": false }`.
- **GET `/tpo/students/:id/resume-link`** → same shape as §5.2 link.
- **GET `/tpo/companies`** query `status` → `{ id, company_name, website, gst_tax_id, contact_person, contact_phone, status }`.
- **POST `/tpo/companies/:id/decision`** `{ "decision": "APPROVED" }` or `"REJECTED"` → 200; audit `COMPANY_APPROVED/REJECTED`.
- **GET `/tpo/jobs`** query `status` → `{ id, title, company_name, ctc_lpa, min_cgpa, max_backlogs, department_codes[], application_deadline, status, applicant_count }`.
- **POST `/tpo/jobs/:id/decision`** `{ "decision": "ACTIVE" }` or `"REJECTED"` → 200; only from `PENDING_APPROVAL`; audit `JOB_APPROVED/REJECTED`. (Closing an active job: `{ "decision": "CLOSED" }`.)

### 5.4 Jobs
**POST `/jobs`** [COMPANY, status APPROVED]
```json
{ "title": "Software Engineer", "description": "Backend role…", "ctc_lpa": 12.5, "min_cgpa": 7.5, "max_backlogs": 0,
  "department_ids": ["d1e2…", "a3b4…"], "application_deadline": "2026-11-15T18:30:00Z" }
```
→ 201 `{ "data": { "id": "…", "status": "PENDING_APPROVAL", … } }`; notifies TPOs (`JOB_PENDING`). All fields required (REQ-7); deadline must be in the future.
**PATCH `/jobs/:id`** [COMPANY owner while `PENDING_APPROVAL`; TPO any] partial of the POST fields; CTC change → audit `JOB_CTC_CHANGED`.
**GET `/company/jobs`** [COMPANY] own jobs with `status`, `applicant_count`.
**GET `/jobs`** [STUDENT] only `ACTIVE`, non-expired jobs; query `eligible_only` (bool), `min_ctc_lpa`, pagination. Item:
```json
{ "id": "…", "title": "Software Engineer", "company_name": "Acme Corp", "ctc_lpa": 12.5, "min_cgpa": 7.5, "max_backlogs": 0,
  "department_codes": ["CSE", "IT"], "application_deadline": "2026-11-15T18:30:00Z", "has_applied": false,
  "eligibility": { "eligible": false, "reasons": ["CGPA_BELOW_CUTOFF"] } }
```
**GET `/jobs/:id`** [STUDENT] same item plus `description` and `eligibility.messages` (array of UI texts from §1). 404 if not `ACTIVE`.
**POST `/jobs/:id/apply`** [STUDENT] no body → 201 `{ "data": { "id": "…", "job_id": "…", "stage": "APPLIED", "applied_at": "…" } }`. Errors: 422 `NOT_ELIGIBLE` (`details: ["NOT_VERIFIED", "CGPA_BELOW_CUTOFF"]`), 409 `ALREADY_APPLIED`.

### 5.5 Applications and recruitment funnel
**GET `/jobs/:id/applications`** [COMPANY owner, TPO] query `stage`, pagination →
```json
{ "id": "…", "stage": "SHORTLISTED", "applied_at": "…",
  "student": { "id": "…", "full_name": "Asha Roy", "roll_no": "21CSE042", "department_code": "CSE", "cgpa": 8.12,
               "active_backlogs": 0, "email": "asha@college.edu", "phone": "9876543210" } }
```
`email` and `phone` are `null` for stages `APPLIED` and `REJECTED` when requester is COMPANY (§1).
**PATCH `/applications/:id/stage`** [COMPANY owner] `{ "stage": "SHORTLISTED" }` → 200 application; allowed transitions: AppFlow.md §5, else 409 `INVALID_TRANSITION`. On `SELECTED`: set `students.placement_status = PLACED`, apply Single Offer rule (§1), audit `SELECTION_POSTED`; notify student.
**POST `/jobs/:id/applications/bulk-stage`** [COMPANY owner] `{ "application_ids": ["…"], "stage": "SHORTLISTED" }` → `{ "data": { "updated": 5, "failed": [ { "id": "…", "code": "INVALID_TRANSITION" } ] } }` (max 200 ids).
**GET `/applications/:id/resume-link`** [COMPANY owner only when stage is `SHORTLISTED/IN_INTERVIEW/SELECTED`; TPO any] → link object.
**GET `/jobs/:id/resumes.zip`** [COMPANY owner] streams `application/zip` of resumes for stages `SHORTLISTED/IN_INTERVIEW/SELECTED` (max 500), files named `{roll_no}.pdf`.
**POST `/tpo/jobs/:id/override-apply`** [TPO, **P2**] `{ "student_id": "…", "reason": "Special approval" }` bypasses only `DEPT_NOT_ALLOWED`, `CGPA_BELOW_CUTOFF`, `BACKLOGS_EXCEEDED`; never `NOT_VERIFIED`, deadline, or uniqueness; audit `ELIGIBILITY_OVERRIDE`.

### 5.6 Interview rounds
**POST `/jobs/:id/rounds`** [COMPANY owner, TPO] `{ "round_name": "Technical 1", "scheduled_at": "2026-11-20T09:30:00Z", "venue_or_link": "https://meet.example/abc" }` → 201 round. Creates a notification and sends an email to every applicant of that job at stage `SHORTLISTED` or `IN_INTERVIEW`.
**GET `/jobs/:id/rounds`** [COMPANY owner, TPO, STUDENT with application at stage `SHORTLISTED/IN_INTERVIEW/SELECTED`] → list of rounds.

### 5.7 Notifications [any authenticated]
**GET `/notifications`** query `unread_only`, pagination → `{ "id", "type", "message", "link_path", "read_at", "created_at" }`; `meta.unread_count` included.
**POST `/notifications/:id/read`** → 200. **POST `/notifications/read-all`** → 200.

### 5.8 Reports [TPO, ADMIN]
**GET `/reports/placement-summary?batch_year=2026`**
```json
{ "data": { "batch_year": 2026, "eligible_students": 120, "placed_students": 78, "placement_rate_pct": 65.0,
  "average_ctc_lpa": 9.4, "by_department": [ { "department_code": "CSE", "eligible": 40, "placed": 33, "placement_rate_pct": 82.5 } ],
  "top_companies": [ { "company_name": "Acme Corp", "selections": 12 } ] } }
```
**GET `/reports/export?batch_year=2026&format=csv|pdf`** → file download (`Content-Disposition: attachment; filename="cpms-placement-2026.csv"`).
**GET `/reports/unplaced?batch_year=2026&format=json|csv`** → list of `{ roll_no, full_name, department_code, cgpa, active_backlogs, email, phone }` or CSV (REQ-18).

### 5.9 Admin and reference data
**GET `/departments`** [public] → `[ { "id", "code", "name" } ]` (active only).
**POST `/admin/users`** [ADMIN] `{ "email", "password", "full_name", "role": "TPO" }` (`TPO` or `ADMIN` only) → 201; audit `USER_CREATED`.
**GET `/admin/users`** query `role`, pagination. **PATCH `/admin/users/:id`** `{ "is_active": false }`.
**POST `/admin/departments`** `{ "code": "ECE", "name": "Electronics" }` · **PATCH `/admin/departments/:id`** `{ "name", "is_active" }`.
**GET `/admin/audit-logs`** query `action`, `entity_type`, date range `from`/`to`, pagination.
**GET `/admin/settings`** → `{ "data": { "single_offer_ctc_threshold_lpa": 8 } }` · **PUT `/admin/settings`** `{ "single_offer_ctc_threshold_lpa": 10 }` → audit `SETTINGS_CHANGED`.

### 5.10 Health
**GET `/health`** [public] → `{ "data": { "status": "ok", "db": "up" } }`

No other endpoints/fields should be added without updating this section first.

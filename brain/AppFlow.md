# AppFlow — College Placement Management System (CPMS)

Cross-references: endpoints and tables are defined only in Schema.md (§3 tables, §5 endpoints). Stack is in TRD.md §1.

## 1. End-to-End Data / Processing Flow

```
1.  Admin seeds departments and TPO accounts          → table departments, users          (Schema.md §3)
2.  Student registers (POST /auth/register/student)   → users, students (is_verified=false)
3.  Student fills academics, uploads resume PDF       → students row; object key resumes/{student_id}.pdf
4.  TPO verifies student                              → students.is_verified=true; audit_logs STUDENT_VERIFIED
5.  Company registers                                 → users, companies (status=PENDING)
6.  TPO approves company                              → companies.status=APPROVED
7.  Company posts job with criteria                   → jobs (status=PENDING_APPROVAL), job_departments; notify TPO
8.  TPO approves job                                  → jobs.status=ACTIVE
9.  Student opens job → evaluateEligibility()         → eligible: true/false + reason codes
10. Student applies                                   → applications (stage=APPLIED), unique(job_id, student_id)
11. Company shortlists                                → applications.stage=SHORTLISTED (contact details now visible)
12. TPO/Company schedules round                       → interview_rounds; notifications + email to SHORTLISTED/IN_INTERVIEW
13. Company posts final selections                    → applications.stage=SELECTED; students.placement_status=PLACED;
                                                        single-offer check → students.single_offer_locked
14. TPO opens Reports for batch_year                  → aggregates (Schema.md §1 formulas)
15. TPO exports                                       → CSV / PDF stream
```

Cron path: every minute, `UPDATE jobs SET status='CLOSED' WHERE status='ACTIVE' AND application_deadline < now()`.

## 2. Runtime / Serving Flow

**2.1 Login**
1. Client `POST /auth/login` → server loads user by email.
2. If `locked_until > now` → 423 `ACCOUNT_LOCKED`.
3. bcrypt compare. On failure increment `failed_login_count`; at 5 set `locked_until = now + 15 min`, 401 `INVALID_CREDENTIALS`.
4. On success reset counter, sign JWT `{sub, role}`, return token + `redirect_path` (`/student`, `/tpo`, `/company`, `/admin`).

**2.2 Every protected request:** `authenticate` (verify JWT) → `requireRole(...)` → ownership check on `:id` resources → handler → serializer (strips fields by role). Failure order: 401, then 403, then 404.

**2.3 Student opens a job**
1. `GET /jobs/:id` → load job (must be `ACTIVE`, else 404 for students).
2. `evaluateEligibility(student, job)` returns `{eligible, reasons[]}`.
3. UI shows green **Eligible** + "Apply Now", or red **Criteria Mismatch** + each reason text.

**2.4 Student applies**
1. `POST /jobs/:id/apply` → run `evaluateEligibility()` again on the server.
2. If not eligible → 422 `NOT_ELIGIBLE` with reasons.
3. Insert application inside a transaction; unique violation → 409 `ALREADY_APPLIED`.

**2.5 Company processes applicants**
1. `GET /jobs/:id/applications` (job must belong to the company).
2. Contact fields appear only for stages `SHORTLISTED`, `IN_INTERVIEW`, `SELECTED`.
3. `PATCH /applications/:id/stage` follows the state machine in §5.

## 3. Screen-Level Flow

| Route | Role | Contents |
|---|---|---|
| `/login`, `/register/student`, `/register/company` | public | Forms; error banners |
| `/student` | STUDENT | Dashboard: verification banner, counts, upcoming rounds |
| `/student/profile` | STUDENT | Academic form, resume upload, verification status |
| `/student/jobs` | STUDENT | Card directory with Eligible / Criteria Mismatch badges, filters |
| `/student/jobs/:id` | STUDENT | Job detail, reasons list, Apply Now |
| `/student/applications` | STUDENT | Applications with stage chips, round schedules |
| `/company` | COMPANY | Approval status banner, job list |
| `/company/jobs/new` | COMPANY | Job form with criteria |
| `/company/jobs/:id` | COMPANY | Kanban of applicants by stage, bulk move, round form, resume zip |
| `/tpo` | TPO | Queue counts: students, companies, jobs awaiting action |
| `/tpo/students` | TPO | Data grid, verify action, sort/filter |
| `/tpo/companies` | TPO | Pending companies, approve/reject |
| `/tpo/jobs` | TPO | Pending jobs, approve/reject, applicant view |
| `/tpo/reports` | TPO, ADMIN | Batch selector, metrics, charts, export buttons, unplaced list |
| `/admin/users` | ADMIN | Create TPO/Admin, activate/deactivate |
| `/admin/settings` | ADMIN | Departments, single-offer threshold |
| `/admin/audit` | ADMIN | Paginated audit log |
| `/notifications` | all | Notification list (also bell dropdown) |

## 4. Error and Edge-Case Flows

| Case | Required behavior |
|---|---|
| Unverified student opens job | Detail loads; reasons include `NOT_VERIFIED`; Apply hidden; API apply → 422 |
| CGPA/backlogs edited after verification | `is_verified=false`, TPO notified, audit `STUDENT_VERIFICATION_RESET`, student sees banner |
| Resume not PDF / > 2 MB | 400 `FILE_INVALID` or 413 `FILE_TOO_LARGE`; nothing stored |
| Deadline passed | Job shows closed; apply → 422 `NOT_ELIGIBLE` with `DEADLINE_PASSED` |
| Duplicate apply (double click, parallel) | One row; others 409 `ALREADY_APPLIED` |
| Student locked by Single Offer Policy | Standard-tier jobs show `SINGLE_OFFER_LOCK`; high-tier (CTC > threshold) still allowed |
| Company not yet approved | Cannot create jobs: 403 `COMPANY_NOT_APPROVED` |
| Job not approved | Invisible to students; company cannot add rounds |
| Invalid stage transition | 409 `INVALID_TRANSITION` |
| Object storage down | Resume upload/link returns 503 `STORAGE_UNAVAILABLE`; rest of app works |
| SMTP down | Notification row still created; email failure logged; request succeeds |
| Empty states | No jobs → "No drives available for you yet"; no applicants → "No applications yet"; no data in report → zeros, not errors |
| Expired/invalid JWT | 401; client clears token and redirects to `/login` |
| Cron not run (cold start) | Lazy deadline check at apply and in `GET /jobs` filter |

## 5. State Machines

**Job status:** `PENDING_APPROVAL → ACTIVE` (TPO approve) · `PENDING_APPROVAL → REJECTED` (TPO) · `ACTIVE → CLOSED` (deadline or TPO). No other transitions.

**Application stage** (terminal: `SELECTED`, `REJECTED`):

```
APPLIED ──► SHORTLISTED ──► IN_INTERVIEW ──► SELECTED
   │             │               │
   └─────────────┴───────────────┴──► REJECTED
```

**Company status:** `PENDING → APPROVED | REJECTED` (TPO). **Student verification:** `false → true` (TPO), `true → false` (system on CGPA/backlog edit).

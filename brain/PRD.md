# PRD — College Placement Management System (CPMS)

> **Branding note:** "College Placement Management System (CPMS)" is the mandatory user-facing app name. See Design.md §0 and Rules.md §2.

## 0. Assumptions (verify before building)

| # | Assumption | Impact if wrong |
|---|---|---|
| A1 | Time available is not given. Plan assumes **4 weeks, 1–3 developers**, sized in TRD/ImplementationPlan using an **Iterative Development Model**. | Re-scope using ImplementationPlan.md §4 (de-scope order). |
| A2 | **Single institution** (one college). "Multi-tenant" in the SRS is read as multiple roles/organizations (companies) in one deployment, not multiple colleges. | Adding college tenancy would change every table; log in Tracker.md §3 first. |
| A3 | Student, Company, TPO and Admin are the only actors. TPO and Admin accounts are created by an Admin, never by self-registration. | See Schema.md §5.1. |
| A4 | Account-activation email is **not** built in v1 (accounts are active at registration; companies still need TPO approval). | Add as P2 if the evaluator requires it. |
| A5 | "Total Registered Eligible Students" = verified students (`is_verified = TRUE`) of the selected batch year, not soft-deleted. | Changes the placement-rate formula in Schema.md §1. |
| A6 | Single Offer Policy threshold is a configurable setting, default **8 LPA**. | Changeable via Admin settings, no code change. |
| A7 | SMS notifications and "Super Dream" tier rules are open (SRS TBD-1, TBD-2) and **out of scope**. | See §3. |

## 0.1 Software Development Life Cycle (SDLC) Model

The **Iterative Development Model** was selected for the College Placement Management System. Unlike the linear Waterfall model, the Iterative approach breaks system complexity into manageable feature releases—progressing from core role authorization to automated eligibility filtering, drive lifecycle management, and final institutional analytics. This ensures early detection of integration issues, allows verification of business rules at each increment, and delivers a stable working system well before final deployment.

## 1. Problem Statement

Campus placement cells run on fragmented spreadsheets, email chains, and disconnected resume folders. This causes administrative bottlenecks, human error, missed deadlines, and ineligible candidates being submitted to recruiters. CPMS centralizes student records, recruiter drives, eligibility checking, and reporting in one role-governed web platform.

## 2. Goals (scoped to ~4 weeks)

1. Four-role platform with strict role-based authorization (Student, Company, TPO, Admin).
2. TPO-verified student academic records with PDF resume upload.
3. Company registration and job drive posting with TPO approval before students see anything.
4. **Server-side automated eligibility** (department, CGPA, backlogs, verification) with a clear reason for every rejection.
5. Application funnel tracking (`APPLIED → SHORTLISTED → IN_INTERVIEW → SELECTED / REJECTED`) and interview round scheduling with in-app and email notification.
6. Placement analytics and CSV/PDF export, including an unplaced-student list.
7. Documentation conformant to the CPMS SRS (IEEE 830 structure); every REQ in the SRS maps to a feature below.

## 3. Non-Goals (do NOT build)

The most likely misinterpretation is building a **public job board / ATS** (like LinkedIn or Naukri). CPMS is a closed, institution-run system. Do NOT build:

- Public job listings, search engines, or sign-up for random job seekers. Only verified students of the institution apply.
- Resume parsing, AI/ML job matching, recommendation engines, or chatbots.
- Messaging/chat between users, video interviews, or calendar integrations (interview links are plain text fields).
- SMS notifications (SRS TBD-1), "Super Dream" multi-tier rules (SRS TBD-2), payments, or offer-letter generation.
- ERP/registrar integration. Academic data is entered by students and verified manually by the TPO.
- Social login/OAuth, password-reset-by-email flows, or email account activation (A4).
- WebSockets. Notifications use polling (Design.md §6).
- Native mobile apps. Responsive web only.
- Multi-college tenancy (A2).
- A second database, caching layer (Redis), or message queue.
- Client-side-only eligibility checks. Eligibility is enforced on the server (Rules.md §4).

## 4. Target Users / Stakeholders

| Actor | Needs | Frequency |
|---|---|---|
| Student | Maintain profile, upload resume, see only jobs and verdicts relevant to them, apply, track status and interview schedule | Daily in season |
| Company (Recruiter) | Register, post drives with criteria, review applicants, shortlist, schedule rounds, post results, download resumes | Per cycle |
| Placement Officer (TPO) | Verify students, approve companies and jobs, schedule/broadcast, view reports | Daily |
| Administrator | Manage staff accounts, departments, settings, audit logs | Occasional |
| Evaluator | Judge correctness, IEEE 830 conformance, performance, security | Once |

## 5. Core Features (prioritized)

| ID | Feature | Priority | SRS ref | Detail docs |
|---|---|---|---|---|
| F1 | Authentication, JWT, RBAC, login lockout | P0 | 4.1, REQ-1..3 | Schema.md §5.1, Rules.md §4 |
| F2 | Student profile, academic record, PDF resume | P0 | 4.2, REQ-4..6 | Schema.md §5.2 |
| F3 | TPO student verification and verification reset | P0 | 4.2, BR-2 | Schema.md §5.3 |
| F4 | Company registration + TPO approval | P0 | 4.3 | Schema.md §5.3 |
| F5 | Job posting, TPO approval, auto-close at deadline | P0 | REQ-7..9 | Schema.md §5.4 |
| F6 | Automated eligibility + apply (unique per job) | P0 | 4.4, REQ-10..13 | AppFlow.md §2, Rules.md §4 |
| F7 | Application stages, applicant review, resume zip | P0 | 4.5, REQ-14..16 | Schema.md §5.5 |
| F8 | Interview rounds + broadcast (in-app + email) | P1 | 4.5 | Schema.md §5.6 |
| F9 | Placement report, CSV/PDF export, unplaced list | P1 | 4.6, REQ-17..18 | Schema.md §5.8 |
| F10 | Single Offer Policy lock | P1 | BR-1 | Schema.md §1 |
| F11 | Audit log + soft deletion | P1 | §6, SR-2 | Schema.md §3 |
| F12 | Admin: staff accounts, departments, settings, audit viewer | P1 | 2.3 | Schema.md §5.9 |
| F13 | TPO eligibility override (audit-logged) | P2 | 2.3 | Schema.md §5.5 |
| F14 | In-app notification center | P1 | 4.5 | Schema.md §5.7 |

## 6. Success Metrics (measurable)

| Metric | Target | How measured |
|---|---|---|
| Eligibility correctness | 100% of a 30-case test matrix (dept/CGPA/backlog/verified/deadline/lock) passes | Vitest suite, Tracker P4 |
| Duplicate applications | 0 possible (DB unique constraint + 409) | Concurrency test: 10 parallel applies → 1 success |
| Read latency | p95 ≤ 500 ms at 500 concurrent virtual users on job board | k6 script, TRD.md §5 |
| Unauthorized access | 100% of protected routes return 401/403 correctly | Role × endpoint test matrix |
| Resume rules | Non-PDF or > 2 MB always rejected | Upload tests |
| Bulk export | 1,000 rows in < 5 s | Timed test, TRD.md §5 |
| Spec coverage | Every REQ-1..18 and BR-1..2 traced to code and a test | Traceability table in Tracker.md |

## 7. Key Risks and Mitigation

| Risk | Mitigation | Handled in |
|---|---|---|
| Eligibility logic duplicated or inconsistent between UI and API | One server function `evaluateEligibility()` used by detail view and apply | Rules.md §4 |
| Latency target missed on free hosting | Indexes, pagination, load test locally, document free-tier limits | TRD.md §5 |
| Resume files lost on ephemeral free disks | S3-compatible storage (R2 prod, MinIO dev) instead of local disk | TRD.md §1 |
| Contact data leaked to companies before shortlist | Serializer strips email/phone unless stage ≥ SHORTLISTED | Rules.md §4, Schema.md §5.5 |
| Scope creep into a job-board | Non-Goals §3 and hard boundaries | Rules.md §3 |
| Stack drift by the AI coding tool | Locked stack and "flag as assumption" rule | TRD.md §1, Rules.md §9 |
| Privilege escalation via IDs in URLs | Ownership checks on every `:id` route | Rules.md §4 |

## 8. Deliverables Checklist

- [ ] Running web app (frontend + API + PostgreSQL) deployed on free tiers
- [ ] All P0 and P1 features working per Schema.md
- [ ] Seed script: 1 admin, 1 TPO, 3 departments, 20 students, 3 companies, 6 jobs
- [ ] Automated tests (eligibility matrix, RBAC matrix, duplicates, upload rules)
- [ ] k6 load-test script and recorded result
- [ ] IEEE 830 SRS (separate document) matching these docs
- [ ] README with run instructions and demo credentials
- [ ] Tracker.md fully updated

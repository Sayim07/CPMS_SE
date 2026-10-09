# Rules — Grounding Rules for the AI Coding Tool (CPMS)

**Read this file before generating any code. If a request conflicts with these rules, flag it instead of silently complying.**

## 1. Source-of-Truth Hierarchy

When documents conflict, the earlier one wins: **Rules.md → Schema.md → TRD.md → PRD.md → AppFlow.md → Design.md → ImplementationPlan.md → Tracker.md**. Report the conflict and propose a fix to the lower-ranked document; do not silently pick.

## 2. App Naming Rule

The product is always **"College Placement Management System (CPMS)"** (short form `CPMS` only in the header, per Design.md §0). Never use other names ("Placement Portal", "CampusConnect", etc.) in UI text, titles, README, or code comments visible to users.

## 3. Hard Scope Boundaries (do NOT)

- Do NOT build public job search, ATS features, resume parsing, AI matching, chat, video, or calendar integrations (PRD.md §3).
- Do NOT add SMS, Super Dream tiers, payments, ERP sync, OAuth/social login, email activation, or password-reset-by-email.
- Do NOT add WebSockets, Redis, queues, or a second database.
- Do NOT add roles beyond `STUDENT`, `COMPANY`, `TPO`, `ADMIN`.
- Do NOT add endpoints, fields, tables, enum values, or error codes not in Schema.md.
- Do NOT use any library, service, or dataset not in TRD.md §1–2 without flagging it as an assumption first.
- Do NOT add multi-college tenancy, dark mode, or i18n.
- Do NOT store resume bytes in PostgreSQL or serve resumes from public/static paths.

## 4. Non-Negotiable Technical Rules

**4.1 Eligibility is computed once, on the server.**
- Required: all verdicts come from `evaluateEligibility()` (Schema.md §1). Both `GET /jobs*` and `POST /jobs/:id/apply` call it.
- Forbidden: re-implementing the checks in the client, in SQL filters used for verdicts, or in route handlers.

**4.2 Authorization on every route.**
- Required: `authenticate` then `requireRole(...)` on every route except those marked **public** in Schema.md §5; ownership checks for every `:id` (company owns job, student owns application). Order of failure: 401 → 403 → 404.
- Forbidden: trusting a role or user id sent in the request body; returning data of another user.

**4.3 Resume handling.**
- Required: PDF only, ≤ 2,097,152 bytes, verified by magic bytes via `file-type`; object key `resumes/{student_id}.pdf`; access only through pre-signed URLs with TTL 300 s or authenticated streaming (zip).
- Forbidden: trusting `Content-Type` or file extension alone; permanent public URLs; logging file contents.

**4.4 Integrity and privacy of applications.**
- Required: DB-level UNIQUE (`job_id`, `student_id`); unverified students cannot apply (`NOT_VERIFIED`); student `email`/`phone` hidden from companies until stage is `SHORTLISTED`, `IN_INTERVIEW`, or `SELECTED`; passwords hashed with bcrypt cost ≥ 10 and never logged.
- Forbidden: application-level-only duplicate checks; hard-deleting students, jobs, applications, or audit rows (use `deleted_at`; audit logs are append-only).

## 5. Schema Consistency Rule

Do not rename fields, enum values, endpoints, or files for convenience. API JSON uses `snake_case` exactly as in Schema.md §5. If a rename is truly needed: update Schema.md first, log it in Tracker.md §3, then change code and every dependent doc.

## 6. Fallback / Error-Handling Rule

- Every failure returns the error envelope in Schema.md §4 with an existing code. Never return stack traces.
- Storage down → 503 `STORAGE_UNAVAILABLE`; the rest of the app keeps working.
- SMTP failure → log with `logger.warn`, still create the in-app notification, never fail the main request.
- Missing data → empty arrays or zero values, not errors (AppFlow.md §4).
- Never swallow errors silently and never use `catch {}` without logging.

## 7. Grounded Talking Points (update if implementation changes)

| Likely question | Grounded answer |
|---|---|
| How do you stop ineligible applications? | Single server function `evaluateEligibility()` checks department, CGPA, backlogs, verification, deadline, single-offer lock; apply endpoint re-runs it (Schema.md §1). |
| How do you prevent duplicate applications? | UNIQUE (`job_id`, `student_id`) in PostgreSQL plus 409 `ALREADY_APPLIED`; tested with parallel requests. |
| How is student data isolated? | RBAC + ownership checks; company sees contact data only after shortlist; resumes via 5-minute pre-signed URLs. |
| How do you meet 500 ms at 500 users? | Indexed, paginated reads; k6 test on local Docker stack; free-tier hosts are documented as not representative (TRD.md §5). |
| What is the placement rate formula? | Unique placed students ÷ verified students of the batch × 100 (Schema.md §1). |
| How are passwords protected? | bcrypt cost 10, lockout after 5 failures for 15 minutes, JWT 8 h. |
| What SDLC model is used? | Iterative Development Model. Unlike Waterfall, it breaks system complexity into manageable feature releases (auth → eligibility → drive lifecycle → analytics) to verify business rules early and ensure system stability before final release (PRD.md §0.1). |
| What is not included? | SMS, Super Dream tiers, ERP sync (open SRS TBDs; PRD.md §3). |

## 8. Code Conventions

- TypeScript `strict: true`; no `any` without a comment; explicit return types on exported functions.
- Validate every request body/query with Zod in `middleware/validate.ts`.
- JSDoc on every exported function and every route handler (purpose, params, errors).
- No hardcoded absolute paths or secrets; read config only from `config/env.ts`.
- Use `lib/logger.ts` (pino); never `console.log`, and never log passwords, tokens, or resume content.
- Prisma migrations only; no raw SQL schema changes. No new database or datastore unless logged in Tracker.md §3.
- Lint (ESLint) and format (Prettier) clean before every commit.
- Tests live in `server/tests/`; every new endpoint ships with at least one success and one failure test.

## 9. When the Coding Tool Is Unsure

1. State the ambiguity in one or two sentences.
2. Propose the option that best fits the existing docs (cite file and section).
3. Wait for confirmation if the choice touches Schema.md or TRD.md; otherwise proceed and record the assumption in Tracker.md §3.
4. Never silently invent endpoints, fields, libraries, or behavior.

## 10. Definition of Done (per feature)

- [ ] Implements exactly the endpoints and fields in Schema.md (no extras)
- [ ] Role and ownership checks present and tested (401/403/404)
- [ ] Input validated; all error paths return Schema.md §4 codes
- [ ] Unit/integration tests written and passing
- [ ] Audit log emitted where Schema.md §1 requires it
- [ ] UI follows Design.md and shows loading, empty, and error states
- [ ] Tracker.md status updated; any decision logged in §3

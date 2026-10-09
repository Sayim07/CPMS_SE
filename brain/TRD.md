# TRD — College Placement Management System (CPMS)

**The coding tool must not substitute a library, dataset, or service not listed here without flagging it as an assumption first.**

Items marked **VERIFY** must be checked against the vendor's current docs/pricing before relying on them.

## 1. Technology Stack (all free / free-tier)

**Day-1 decisions (lock and log in Tracker.md §3):** D1 backend language = Node.js/TypeScript (not Java); D2 ORM = Prisma; D3 storage = S3-compatible API; D4 single deployable (Express serves the built SPA); D5 SDLC = Iterative Development Model (PRD.md §0.1).

### 1.1 Frontend

| Tool | Version | Why |
|---|---|---|
| React + TypeScript | React 18 | Component model fits role dashboards |
| Vite | 5.x | Fast build, simple static output |
| Tailwind CSS | 3.x | Responsive grid and badges with no custom CSS framework |
| React Router | 6.x | Role-specific routes (`/student`, `/tpo`, `/company`, `/admin`) |
| TanStack Query | 5.x | Caching, polling for notifications |
| React Hook Form + Zod | current | Form validation mirroring server rules |

### 1.2 Backend

| Tool | Version | Why |
|---|---|---|
| Node.js | 20 LTS | SRS §2.4 allows Node 20+ |
| Express | 4.x | Stateless REST, minimal |
| TypeScript | 5.x | Typed contracts matching Schema.md |
| Prisma ORM | 5.x | Migrations, typed queries, composite unique constraint |
| Zod | 3.x | Request validation |
| bcrypt | 5.x | Password hashing, cost factor 10 (REQ-1) |
| jsonwebtoken | 9.x | Signed JWT (RFC 7519) |
| helmet, cors, express-rate-limit | current | Security headers, CORS allow-list, rate limit |
| multer | 1.4.5-lts | Multipart upload with size limit (memory storage) |
| file-type | current | Verify PDF magic bytes, not only MIME |
| archiver | 7.x | Zip of shortlisted resumes (REQ-15) |
| csv-stringify | 6.x | CSV exports |
| pdfkit | 0.15.x | PDF report export |
| nodemailer | 6.x | SMTP, port 587 |
| node-cron | 3.x | Deadline auto-close job (REQ-9) |
| pino | 9.x | Structured logging |

### 1.3 Data and storage

| Layer | Choice | Notes |
|---|---|---|
| Database | PostgreSQL 15+ | Only DB. Dev: Docker `postgres:15`. Prod: Neon free tier (**VERIFY** limits) |
| Object storage | S3-compatible API via `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` | Dev: MinIO (Docker). Prod: Cloudflare R2 free tier (**VERIFY** 10 GB free, no egress fee) |
| Resume access | Pre-signed GET URL, TTL 300 s | SE-3 |

### 1.4 Deployment and tooling

| Need | Tool | Notes |
|---|---|---|
| Hosting | Render free web service (**VERIFY**) | Sleeps after inactivity; cold start expected |
| CI | GitHub Actions free minutes | Lint, test, build |
| Dev email | Mailpit (Docker) | Captures SMTP on 1025 |
| Prod email | Brevo SMTP free plan (**VERIFY** daily limit) | Port 587 |
| Tests | Vitest + Supertest | API and eligibility matrix |
| Load test | k6 (open source) | Run locally against Docker stack |
| Local orchestration | Docker Compose | postgres, minio, mailpit |

## 2. External Services / APIs

| Source | Access method | Cost | Auth needed |
|---|---|---|---|
| PostgreSQL (Neon) | Connection string `DATABASE_URL` | Free tier (**VERIFY**) | Username/password in URL |
| Cloudflare R2 (S3 API) | `S3_ENDPOINT`, access key pair | Free tier (**VERIFY**) | Access key + secret |
| Brevo SMTP | SMTP 587 | Free plan (**VERIFY**) | SMTP login + key |
| MinIO / Mailpit (dev only) | Docker | Free | Local defaults |

No other external API is permitted. No ERP, SMS, or payment service.

## 3. Fixed Scope Constants (must not change mid-project)

| Constant | Value |
|---|---|
| Roles | `STUDENT`, `COMPANY`, `TPO`, `ADMIN` |
| API base path | `/api/v1` |
| Resume type / max size | PDF only / 2 MB (2,097,152 bytes) |
| bcrypt cost | 10 |
| Login lockout | 5 consecutive failures → 15 min lock |
| JWT lifetime | 8 h access token, no refresh token |
| Pre-signed URL TTL | 300 s |
| Default page size / max | 20 / 100 |
| Single Offer threshold default | 8 LPA (setting key `single_offer_ctc_threshold_lpa`) |
| Deadline auto-close check | every 1 minute (node-cron) plus lazy check at apply time |
| Notification polling interval | 30 s |
| Time format | ISO 8601 UTC in API; display in `Asia/Kolkata` in UI |
| Application stages | `APPLIED`, `SHORTLISTED`, `IN_INTERVIEW`, `SELECTED`, `REJECTED` |
| Job statuses | `PENDING_APPROVAL`, `ACTIVE`, `CLOSED`, `REJECTED` |

## 4. Performance and Scope Constraints

- Every list endpoint is paginated (Schema.md §4). No unbounded queries.
- Resume bytes are never stored in PostgreSQL, only the object key.
- Uploads are buffered in memory (≤ 2 MB), validated, then streamed to object storage.
- Zip export streams objects (no full-archive buffering). Max 500 resumes per zip.
- Prisma connection pool limit: 20 (`?connection_limit=20`).
- Stateless API: no server-side sessions, no in-memory user state.

## 5. Performance Targets and API Contract

| Target | Value | Verification |
|---|---|---|
| Read latency (e.g. `GET /jobs`) | p95 ≤ 500 ms at 500 concurrent virtual users | k6, Docker Compose host (Render free tier is **not** a valid benchmark) |
| Bulk export | 1,000 rows CSV < 5 s | Timed integration test |
| Availability | 99.5% in peak months | Documented as a deployment goal, not tested |

Required indexes: see Schema.md §3 (each table lists its indexes). The API contract (endpoints, JSON) lives only in Schema.md §5.

## 6. Environment Variables

| Name | Example | Used by |
|---|---|---|
| `DATABASE_URL` | `postgresql://cpms:cpms@localhost:5432/cpms?connection_limit=20` | Prisma |
| `JWT_SECRET` | 32+ random chars | Auth |
| `S3_ENDPOINT` | `http://localhost:9000` | Storage |
| `S3_REGION` | `auto` | Storage |
| `S3_BUCKET` | `cpms-resumes` | Storage |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | — | Storage |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | `localhost` / `1025` | Mail |
| `MAIL_FROM` | `cpms@college.example` | Mail |
| `CORS_ORIGIN` | `http://localhost:5173` | CORS |
| `PORT` | `3000` | Express |

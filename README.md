# College Placement Management System (CPMS) — Backend

**Author / Assigned Engineer**: Aditya (Authentication & Security Engineer — "The Door Keeper")  
**Assigned Phases**: Phase 1 (Authentication & RBAC Security) | Phase 2 (Student Profiles & Verification)  
**Database**: Prisma ORM with SQLite (Zero-config local database `dev.db`)

---

## 🚀 Quick Start

### 1. Set Workspace
Open the project directory in your editor / terminal:
```powershell
cd "C:\Users\ARUSHI PRAJAPATI\.gemini\antigravity\scratch\cpms-backend"
```

### 2. Run Database Migrations
```powershell
npm run prisma:push
```

### 3. Run Automated Tests
```powershell
npm test
```
Runs 17 comprehensive tests verifying all Phase 1 and Phase 2 exit criteria.

### 4. Start Development Server
```powershell
npm run dev
```
The server will start on `http://localhost:5000`.

---

## 📋 Features Implemented

### Phase 1 — Authentication & Security (Current Sprint 1)

1. **Task 1.1: Registration Endpoints**
   - `POST /auth/register/student`:
     - Validates roll number format (`^[A-Za-z0-9\-_]{5,20}$`).
     - Hashes password using `bcrypt` (10 rounds).
     - Creates `User` (role: `STUDENT`) and `Student` records with `is_verified: false`.
   - `POST /auth/register/company`:
     - Validates GST / Tax ID format (e.g. `27AAPFU0939F1ZV` or corporate tax ID).
     - Hashes password using `bcrypt`.
     - Creates `User` (role: `COMPANY`) and `Company` records with `status: PENDING`.

2. **Task 1.2: Login & 5-Attempt Lockout Mechanism (REQ-2)**
   - `POST /auth/login`:
     - Verifies email and password using `bcrypt.compare()`.
     - Generates signed JWT with 8-hour expiration (`expiresIn: '8h'`).
     - Issues HTTP-only cookie named `cpms_token` and returns token in JSON response.
     - **5-Attempt Lockout (REQ-2)**:
       - Tracks `failed_login_attempts`.
       - On the 5th consecutive failed attempt, locks the account for 15 minutes (`HTTP 423 Locked`).
       - During the lockout window, any login attempts return `HTTP 423 Locked` with remaining freeze time.
       - Successful login or expiration after 15 minutes automatically resets the counter and lock.

3. **Task 1.3: RBAC Middleware**
   - `authenticate`: Extracts Bearer token from `Authorization` header or `cpms_token` cookie, verifies signature, and attaches user payload to `req.user`.
   - `requireRole(["STUDENT", "COMPANY", "TPO", "ADMIN"])`: Restricts endpoint access and rejects unauthorized roles with `HTTP 403 Forbidden`.

---

### Phase 2 — Student Profile & Resume Vault (Sprint 2)

1. **Task 2.1: Profile Management**
   - `GET /students/me`: Retrieves current authenticated student's profile.
   - `PUT /students/me`: Updates student's profile details.

2. **Task 2.2 & 2.3: Resume Storage Pre-Signed URLs (REQ-4)**
   - `POST /students/me/resume/presigned-url`:
     - Enforces PDF format validation (`application/pdf` or `.pdf` extension).
     - Generates pre-signed cloud storage URL with secure 15-minute expiration.

3. **Task 2.4: Verification Reset Trigger (REQ-5)**
   - When a student updates sensitive academic fields (`cgpa` or `backlogs`), the system automatically resets `is_verified = false`.
   - Modifying non-sensitive fields (e.g., `name`, `department`) leaves `is_verified` intact.

---

## 📮 Postman Collection

A complete Postman collection is included in the project root:
- File: [`cpms-auth-postman-collection.json`](./cpms-auth-postman-collection.json)

### How to use in Postman:
1. Open Postman.
2. Click **Import** and select `cpms-auth-postman-collection.json`.
3. Click **Run collection** to run all automated API tests sequentially.

---

## 📡 API Reference Summary

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Service health status |
| `POST` | `/auth/register/student` | Public | Register student (`is_verified: false`) |
| `POST` | `/auth/register/company` | Public | Register company (`status: PENDING`) |
| `POST` | `/auth/login` | Public | Login (8h JWT `cpms_token`, 5-attempt lockout `423`) |
| `POST` | `/auth/logout` | Public | Clear `cpms_token` cookie |
| `GET` | `/auth/me` | Authenticated | Current user payload from token |
| `GET` | `/auth/admin-only` | ADMIN | Admin-only route (`403` for non-admin) |
| `GET` | `/students/me` | STUDENT | Fetch student profile |
| `PUT` | `/students/me` | STUDENT | Update profile (REQ-5 verification reset on CGPA edit) |
| `POST` | `/students/me/resume/presigned-url` | STUDENT | Pre-signed URL for PDF resume (REQ-4) |
| `PATCH` | `/students/:id/verify` | TPO / ADMIN | TPO review & verification toggle |

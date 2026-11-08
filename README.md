# College Placement Management System (CPMS)

[![React 19](https://img.shields.io/badge/React-19.x-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88ce02?style=flat-square&logo=greensock)](https://gsap.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Radix-000000?style=flat-square&logo=radixui)](https://ui.shadcn.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat-square&logo=postgresql)](https://supabase.com/)
[![SDLC](https://img.shields.io/badge/SDLC-Iterative_Model-indigo?style=flat-square)](brain/PRD.md)

> **A closed, institutional campus placement automation platform.**  
> CPMS is **not** a public job board or generic ATS. It is a strictly governed, transparent operating system designed for collegiate Training & Placement Offices (TPOs), eligible student candidates, and authorized corporate recruiters.

---

## 📑 Table of Contents
1. [Core Aim & Mission](#-core-aim--mission)
2. [Visual Architecture & System Flows](#-visual-architecture--system-flows)
3. [Strict Institutional Business Rules](#-strict-institutional-business-rules)
4. [User Roles & Workspace Catalog](#-user-roles--workspace-catalog)
5. [Anti-Slop Design & Motion Architecture](#-anti-slop-design--motion-architecture)
6. [Technology Stack](#-technology-stack)
7. [Getting Started (Run Locally)](#-getting-started-run-locally)
8. [Phased SDLC Roadmap](#-phased-sdlc-roadmap)

---

## 🎯 Core Aim & Mission

Traditional campus placements rely on fragmented spreadsheets, WhatsApp groups, manual email verifications, and opaque paper trails. This results in:
- Inaccurate student data and unverifiable grade cards.
- Accidental violations of university placement policies (e.g., student hoarding multiple low-paying offers).
- Opaque shortlists where students never understand *why* they were disqualified.
- Data privacy leaks exposing candidate personal contact details prematurely.

### How CPMS Solves This:
- **Deterministic Transparency:** When a student views a placement drive, the system evaluates all eligibility rules simultaneously (CGPA, backlogs, department, deadline, single-offer lock). If disqualified, CPMS renders every failing reason code explicitly—zero mystery rejections.
- **TPO-Governed Data Integrity:** Student academic marks and resumes are locked behind TPO verification. Any subsequent modification by a student automatically resets their verification status, blocking fraudulent applications.
- **Strict Policy Enforcement:** The university-configured **Single Offer Policy** (default 8.0 LPA threshold) prevents candidates with placed offers from cannibalizing entry-level offers, while preserving their right to compete in elite "Dream" drives.
- **Privacy by Design:** Candidate personal phone numbers and emails remain strictly masked from corporate recruiters until the applicant is officially moved to `SHORTLISTED` or beyond.

---

## 🔄 Visual Architecture & System Flows

### 1. High-Level Role Interaction Flow
```
 ┌────────────────┐         ┌────────────────────────┐         ┌────────────────────────┐
 │ STUDENT        │         │ TPO (Placement Cell)   │         │ COMPANY (Recruiter)    │
 └───────┬────────┘         └───────────┬────────────┘         └───────────┬────────────┘
         │                              │                                  │
         │ 1. Registers & Enters Grades │                                  │
         ├─────────────────────────────►│                                  │
         │                              │ 2. Verifies Marks & PDF Resume   │
         │                              ├─(Approves Profile)─┐             │
         │                              │                    │             │
         │                              │                    ▼             │
         │                              │ 3. Corporate Reg & Tax Review    │
         │                              │◄─────────────────────────────────┤
         │                              │    (Vets Partner & Approves)     │
         │                              │                                  │
         │                              │ 4. Drafts Recruitment Drive      │
         │                              │◄─────────────────────────────────┤
         │                              │ 5. Approves & Publishes Drive    │
         │ 6. Evaluates Eligibility     ├─(Published Live)───►             │
         │◄─────────────────────────────┤                                  │
         │ 7. Applies (1-Click)         │                                  │
         ├────────────────────────────────────────────────────────────────►│ (APPLIED: Contact Masked)
         │                              │                                  │
         │                              │ 8. Funnel Progression            │
         │                              │    (SHORTLISTED / INTERVIEWS)    │
         │◄────────────────────────────────────────────────────────────────┤ (Contact Unmasked)
         │ 9. Final Offer Accepted      │                                  │
         ├─────────────────────────────►│ 10. Single Offer Lock Applied    │
         │ (Locked from regular drives) │     (Audit Log Permanently Saved)│
```

---

### 2. Deterministic Eligibility Engine Flow
Every job drive card evaluates student eligibility in real-time without short-circuiting:

```
               ┌──────────────────────────────┐
               │    Candidate Views Drive     │
               └──────────────┬───────────────┘
                              ▼
           ┌──────────────────────────────────────┐
           │   evaluateEligibility() Pipeline     │
           │                                      │
           │  1. Check TPO Verification Status   │
           │  2. Check Department Whitelist       │
           │  3. Check Minimum CGPA Cutoff        │
           │  4. Check Active Backlog Limit       │
           │  5. Check Application Deadline       │
           │  6. Check Single Offer Policy Lock   │
           │  7. Check Existing Application       │
           └──────────────────┬───────────────────┘
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
       [All Passed: YES]              [Any Failed: NO]
               │                             │
    ┌──────────────────────┐      ┌─────────────────────────────┐
    │ Badge: "Eligible"    │      │ Badge: "Criteria Mismatch"  │
    │ Button: "Apply Now"  │      │ Render Line-by-Line Reasons:│
    └──────────────────────┘      │ - Backlogs: 1 (Max 0)       │
                                  │ - CGPA: 6.8 (Min 7.5)       │
                                  │ Button: Disabled            │
                                  └─────────────────────────────┘
```

---

### 3. Recruiter 5-Stage Kanban Funnel & Privacy Masking
```
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  1. APPLIED      │──►│ 2. SHORTLISTED   │──►│ 3. IN_INTERVIEW  │──►│  4. SELECTED     │   │   REJECTED       │
│                  │   │                  │   │                  │   │                  │   │                  │
│ • Name & Roll No │   │ • Name & Roll No │   │ • Name & Roll No │   │ • Name & Roll No │   │ • Archived       │
│ • CGPA & Dept    │   │ • CGPA & Dept    │   │ • CGPA & Dept    │   │ • CGPA & Dept    │   │ • Reason Logged  │
│ • Email: MASKED  │   │ • Email: VISIBLE │   │ • Email: VISIBLE │   │ • Email: VISIBLE │   │ • Feedback Sent  │
│ • Phone: MASKED  │   │ • Phone: VISIBLE │   │ • Phone: VISIBLE │   │ • Phone: VISIBLE │   │                  │
└──────────────────┘   └──────────────────┘   └──────────────────┘   └──────────────────┘   └──────────────────┘
```

---

## ⚖️ Strict Institutional Business Rules

| Rule ID | Name | Constraint & Specification |
|---|---|---|
| **BR-1** | **Single Offer Policy** | Default threshold: **8.0 LPA**. A student accepting an offer $\ge$ 8.0 LPA is locked from all future drives. A student with an offer $<$ 8.0 LPA may only apply for "Dream" drives offering $>$ 8.0 LPA. |
| **BR-2** | **REQ-5 Tamper Prevention** | If a student modifies academic metrics (CGPA, active backlogs), `is_verified` immediately flips to `false`, revoking application eligibility until re-verified by TPO. |
| **BR-3** | **Contact Detail Masking** | Recruiters see `"Hidden until shortlisted"` for candidate phone numbers and emails in the `APPLIED` stage to prevent unauthorized off-platform outreach. |
| **BR-4** | **Strict Application Deadlines** | Deadlines are enforced to the second. Once passed, the database constraint rejects submissions. |
| **BR-5** | **Tamper-Resistant Audit Trail** | All administrative actions, status approvals, student verifications, and policy updates are appended immutably to `audit_logs` with actor ID, IP address, and payload delta. |

---

## 🖥️ User Roles & Workspace Catalog

CPMS provides 18 purpose-built screens across 4 institutional roles:

### 🎓 Student Workspace
- **Dashboard (`/student`):** TPO verification alert banner, KPI cards, live active drives, and upcoming interview schedules.
- **Job Directory (`/student/jobs`):** Search, department filters, and instant verdict badges (**Eligible** / **Criteria Mismatch**).
- **Drive Details Modal (`/student/jobs/:id`):** Rule-by-rule reason breakdown, CTC details, and one-click application action.
- **Application History (`/student/applications`):** Stage progress timeline and interview call join links.
- **Academic Profile (`/student/profile`):** Grade intake form, verification reset warning, and PDF resume drag-and-drop uploader.

### 🏢 Recruiter (Company) Workspace
- **Recruiter Console (`/company`):** TPO institutional vetting banner, live drive metrics, and applicant counters.
- **Drive Creator (`/company/jobs/new`):** Multi-department picker, CTC input, CGPA cutoff, and deadline scheduler.
- **Applicant Pipeline (`/company/jobs/:id`):** 5-stage interactive Kanban board with contact masking and interview round scheduling.

### 🏛️ TPO Command Center
- **Command Center (`/tpo`):** Pending action queues (Students, Companies, Drives) and university placement rate statistics.
- **Student Verification Grid (`/tpo/students`):** High-density administrative table with sticky headers, filter by batch/dept, resume preview, and verify/flag modal.
- **Corporate Approvals (`/tpo/approvals`):** Tabbed review interface for vetting employer GST/Tax IDs and publishing live drives.
- **Institutional Analytics (`/tpo/reports`):** SVG placement rate gauge (78.4%), department comparison bar chart, CSV/PDF export, and unplaced student counseling list.

### ⚙️ System Administration & Governance
- **Policy Settings (`/admin/settings`):** Single Offer Policy threshold slider (4.0 to 15.0 LPA) and department activation toggles.
- **Staff Management (`/admin/users`):** Account provisioning for TPO coordinators and IT administrators.
- **System Audit Trail (`/admin/audit`):** Cryptographically stamped event log with interactive JSON payload inspector.
- **Notification Center (`/notifications`):** Global alert feed with unread counters and deep links.

---

## 🎨 Anti-Slop Design & Motion Architecture

CPMS strictly follows the [`.agents/skills/cpms-design-taste/SKILL.md`](.agents/skills/cpms-design-taste/SKILL.md) craft guide:

### The Anti-Slop Principles
- **No AI Slop:** No neon glows, no gradient text, no floating 3D spheres, no emojis as UI buttons, no blurry drop shadows.
- **Linear / Stripe Utilitarianism:** Clean 1px borders (`border-slate-200`), subtle elevation (`shadow-sm`), and disciplined radii (`rounded-md` / `rounded-lg`).
- **Color Discipline:** Muted canvas (`bg-slate-50`), pure white cards (`bg-white`), with semantic color tokens (`indigo-600` primary, `emerald` eligible, `red` mismatch, `amber` warning).
- **Monospace Metadata:** Roll numbers, UUIDs, GST numbers, timestamps, and currency packages always render in crisp `font-mono`.

### The 5-Pillar Motion & Interaction Stack
1. **`shadcn/ui` + Radix UI:** Accessible dialogs, slide-over sheets, tooltips, dropdowns, and tabs.
2. **Global Command Palette (`Ctrl+K`):** Powered by `cmdk`—fuzzy search across all 18 screens with automatic role switching.
3. **GSAP 3D Perspective Tilt ([`TiltCard.tsx`](client/src/components/ui/TiltCard.tsx)):** GPU-accelerated 3D mouse tracking with a specular light reflection sheen on all KPI stat cards.
4. **GSAP Magnetic Physics ([`Magnetic.tsx`](client/src/components/ui/Magnetic.tsx)):** Primary buttons subtly gravitate toward the cursor on hover.
5. **Lenis Inertial Smooth Scroll ([`SmoothScrollProvider.tsx`](client/src/components/layout/SmoothScrollProvider.tsx)):** Velvety momentum scrolling across all long tables and dashboards.

---

## 💻 Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Client Core** | React 19, TypeScript 6, Vite 8 | Ultra-fast client build with zero type leaks |
| **Styling & Icons** | Tailwind CSS 3.4, Lucide React | High-density administrative tokens and crisp iconography |
| **UI Components** | shadcn/ui, Radix UI Primitives, cmdk | Accessible, unstyled primitives with keyboard focus traps |
| **Motion & Physics** | GSAP 3.15, @gsap/react, Framer Motion, Lenis | 3D perspective tilts, magnetic buttons, and smooth scrolling |
| **Backend (Phase 1+)** | Node.js, Express, TypeScript | REST API with JWT auth and RBAC middleware |
| **Database & ORM** | PostgreSQL (Supabase), Prisma ORM | Relational data integrity with pooled & direct connections |
| **Validation** | Zod | End-to-end type validation for schemas and forms |

---

## 🚀 Getting Started (Run Locally)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm`

### 1. Clone & Install Client Dependencies
```bash
git clone https://github.com/Sayim07/CPMS_SE.git
cd CPMS_SE/client
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open your browser to **[http://localhost:5173/](http://localhost:5173/)**.

### 3. Explore the Prototype Workspaces
- **Switch Roles:** Click the **Role Switcher** badge (`Role: STUDENT`) in the top navigation bar to switch between `STUDENT`, `COMPANY`, `TPO`, and `ADMIN`.
- **Global Command Menu:** Press <kbd>Ctrl</kbd> + <kbd>K</kbd> (or <kbd>Cmd</kbd> + <kbd>K</kbd>) to search and navigate to any page.
- **3D Physics:** Move your cursor over any KPI Stat Card to experience the GSAP 3D perspective tilt and light reflection.
- **Build Verification:**
  ```bash
  npm run build
  ```
  *(Produces an optimized, zero-error production bundle in `dist/`)*.

---

## 🗺️ Phased SDLC Roadmap (Iterative Development Model)

| Phase | Milestone | Description | Status |
|---|---|---|---|
| **UI Prototype** | **Frontend-First Prototype** | Complete 18-screen interactive client with mock data, shadcn, GSAP, and Lenis | **Completed (100%)** |
| **Phase 0** | **Setup & Decisions** | Express server scaffold, Prisma schema migration to Supabase PostgreSQL, health endpoints | *Ready to Start* |
| **Phase 1** | **Auth & RBAC** | Custom JWT auth, bcrypt password hashing, 5-attempt lockout, role-based middleware | *Upcoming* |
| **Phase 2** | **Student Profile & Verification** | Profile CRUD, PDF magic byte validation, REQ-5 verification reset trigger | *Upcoming* |
| **Phase 3** | **Companies & Job Drives** | Recruiter registration vetting, job drive creation, deadline auto-closer | *Upcoming* |
| **Phase 4** | **Eligibility & Applications** | Deterministic `evaluateEligibility()` engine, 1-click apply, Single Offer lock | *Upcoming (Blocking)* |
| **Phase 5** | **Funnel & Notifications** | 5-stage recruiter Kanban, contact detail masking, interview scheduling alerts | *Upcoming* |
| **Phase 6** | **TPO Command & Analytics** | Institutional reporting, CSV export generator, unplaced counseling queue | *Upcoming* |
| **Phase 7** | **Final System Verification** | Full integration testing, security audit, and performance sign-off | *Upcoming* |

---

## 📄 License
Institutional software designed for the College Placement Management System. All rights reserved.

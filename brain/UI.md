# UI — College Placement Management System (CPMS)

> **Execution Strategy:** Frontend-First / Prototype-First. The complete interactive UI/UX interface is constructed and verified with typed mock data matching `Schema.md` before wiring to backend services (Phase 0 → Phase 7).

---

## 1. Frontend-First Architecture & Strategy

Building the full UI first ensures:
1. **Immediate Visual Validation:** Every dashboard, data table, and modal can be tested interactively against the design taste guidelines (`cpms-design-taste` skill and `Design.md`).
2. **Deterministic API Contracts:** Building screens first guarantees that when backend endpoints are written in Phases 1–6, they will exactly match what the UI consumes.
3. **Zero-Rework Mock Layer:** Mock data objects strictly mirror `Schema.md §3` & `§5` (using `snake_case` keys, exact enum values, and standard response envelopes `{ data, meta }`). Swapping to real API calls later will require changing only the fetch functions.

---

## 2. Screen & Route Catalog (15 Screens per `AppFlow.md §3`)

| Route | Role | Screen Name | Key UI Elements | Status |
|---|---|---|---|---|
| `/login` | Public | Login Page | Email/password form, 5-attempt lockout banner, role redirect | Not Started |
| `/register/student` | Public | Student Registration | Personal & academic intake, department select, roll no validation | Not Started |
| `/register/company` | Public | Company Registration | Company details, tax/GST ID, contact person & phone | Not Started |
| `/student` | STUDENT | Student Dashboard | Verification status banner, quick metric cards, upcoming interview alerts | Not Started |
| `/student/profile` | STUDENT | Academic Profile & Resume | Academic form (CGPA, backlogs), PDF resume drag-and-drop dropzone, preview link | Not Started |
| `/student/jobs` | STUDENT | Job Board / Drive Directory | Responsive card grid, **Eligible** / **Criteria Mismatch** badges, search & filters | Not Started |
| `/student/jobs/:id` | STUDENT | Job Detail & Apply Modal | Criteria breakdown, line-by-line reason list, "Apply Now" action | Not Started |
| `/student/applications` | STUDENT | Student Applications | Application timeline, stage chips, scheduled interview round details | Not Started |
| `/company` | COMPANY | Recruiter Dashboard | TPO approval status banner, active drive listings, total applicants summary | Not Started |
| `/company/jobs/new` | COMPANY | Job Drive Creator | Multi-department selector, CTC in LPA, CGPA cutoffs, deadline picker | Not Started |
| `/company/jobs/:id` | COMPANY | Applicant Kanban Pipeline | 5-stage drag/click Kanban (`APPLIED` → `SELECTED`), contact masking, resume zip trigger | Not Started |
| `/tpo` | TPO | Placement Officer Command Center | Pending action queue (students, companies, drives awaiting verification) | Not Started |
| `/tpo/students` | TPO | Student Verification Grid | Data table with sticky headers, filter by batch/dept, verify/reject actions, resume preview | Not Started |
| `/tpo/companies` | TPO | Company Approval Directory | Recruiter listing, GST/Tax verification, approve/reject buttons | Not Started |
| `/tpo/jobs` | TPO | Drive Approval & Management | Pending job approval queue, status toggles, drive close action | Not Started |
| `/tpo/reports` | TPO, ADMIN | Institutional Placement Analytics | Placement rate gauge, 4 KPI `StatCard`s, department comparison bar chart, CSV/PDF export, unplaced list | Not Started |
| `/admin/users` | ADMIN | Staff Management | Create TPO/Admin accounts, activate/deactivate users | Not Started |
| `/admin/settings` | ADMIN | System Settings & Policy | Single Offer Policy threshold slider (default 8 LPA), department manager | Not Started |
| `/admin/audit` | ADMIN | Audit Log Viewer | Filterable append-only audit trail table with actor & before/after JSON viewer | Not Started |
| `/notifications` | ALL | Notification Center | Dropdown bell & full-page list, unread counters, mark-all-as-read | Not Started |

---

## 3. Component Inventory (`Design.md §4` & `cpms-design-taste`)

| Component | Purpose & Description | Tokens & Style Rules | Status |
|---|---|---|---|
| `AppShell` | Header + Collapsible Left Sidebar + Mobile Drawer | `bg-white border-b border-slate-200`, max-w 1280px, role-based nav items | Done |
| `Button` | High-craft button with micro-interactions | `bg-indigo-600 hover:bg-indigo-700`, active:scale-[0.99], clean focus rings | Done |
| `Badge` | Verdict badge (`Eligible` / `Criteria Mismatch`) | `bg-emerald-50 text-emerald-700` / `bg-red-50 text-red-700`, with Lucide icons | Done |
| `StageChip` | Funnel stage chip (`APPLIED`, `SHORTLISTED`, etc.) | Semantic colors per `Design.md §3`, rounded-md, text-xs font-medium | Done |
| `StatCard` | KPI summary card for dashboards & reports | Clean 1px border, uppercase micro-header, high-contrast metric value | Done |
| `DataTable` | High-density administrative table | Sticky header (`bg-slate-50/95`), zebra/hover rows, sortable headers, pagination | Done |
| `KanbanBoard` | 5-column recruiter workflow pipeline | Columns with count badges, candidate cards with stage transition actions | Not Started |
| `FileDropzone` | Drag-and-drop PDF resume uploader | Magic byte & 2MB client validation warning, upload progress, file preview link | Not Started |
| `VerificationBanner` | Top alert for unverified students | `bg-amber-50 border-l-4 border-amber-500`, visible until TPO approves | Done |
| `NotificationBell` | Header alert bell with unread badge | Lucide `Bell` icon with red indicator, dropdown popover with recent alerts | Done |
| `ConfirmDialog` | Modal dialog for irreversible actions | Clean backdrop blur, explicit confirm/cancel buttons, accessible trap focus | Not Started |
| `EmptyState` | Fallback container when data is empty | Muted Lucide icon, explanatory copy, optional call-to-action button | Done |

---

## 4. UI Implementation Progress Tracker

### Wave 1: Foundation & Primitives
- [x] Initialize `client/` Vite 5 + React 18 + TypeScript + Tailwind CSS
- [x] Setup Tailwind tokens matching `Design.md §3` and font hierarchy
- [x] Install `lucide-react`, `react-router-dom`, `clsx`, `tailwind-merge`
- [x] Implement `AppShell` with responsive topbar, sidebar, and breadcrumbs
- [x] Implement foundational UI primitives (`Button`, `Badge`, `StageChip`, `StatCard`, `EmptyState`, `DataTable`)

### Wave 2: Public & Student UI
- [ ] Build `/login`, `/register/student`, `/register/company` with Zod validation
- [ ] Build `/student` Dashboard with verification banner and quick stats
- [ ] Build `/student/profile` with academic form and resume dropzone
- [ ] Build `/student/jobs` with card grid, filters, and eligibility badges
- [ ] Build `/student/jobs/:id` detail modal with rule-by-rule reason list
- [ ] Build `/student/applications` with status timeline

### Wave 3: Recruiter (Company) UI
- [ ] Build `/company` Dashboard with approval status banner
- [ ] Build `/company/jobs/new` job drive creation form
- [ ] Build `/company/jobs/:id` 5-stage Kanban applicant pipeline with contact masking

### Wave 4: TPO & Admin UI
- [ ] Build `/tpo` Dashboard with pending approval queues
- [ ] Build `/tpo/students` verification grid with batch filter & modal
- [ ] Build `/tpo/companies` and `/tpo/jobs` approval interfaces
- [ ] Build `/tpo/reports` analytics dashboard with CSV export buttons
- [ ] Build `/admin/users`, `/admin/settings`, `/admin/audit` screens

### Wave 5: Polish & Anti-Slop Audit
- [ ] Audit all screens against `.agents/skills/cpms-design-taste/SKILL.md`
- [ ] Verify keyboard navigation, mobile responsiveness, empty & loading states
- [ ] Verify typed mock data exactly matches `Schema.md §5` contracts

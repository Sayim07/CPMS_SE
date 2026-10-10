---
name: cpms-design-taste
description: Anti-slop UI design system and craft guide for the College Placement Management System (CPMS). Enforces high-density, calm utilitarian minimalism, crisp typography, and strict compliance with Design.md tokens.
---

# CPMS Design Taste & Craft System

This skill enforces a high-craft, anti-slop frontend architecture for the **College Placement Management System (CPMS)**. It combines the utilitarian minimalism of modern workflow tools (Linear, Stripe Dashboard) with the strict brand and color tokens defined in `Design.md`.

---

## 1. Core Visual Identity & Design Intent
* **Design Philosophy:** "A calm, data-dense, trustworthy administrative tool" (`Design.md §1`).
* **Tone:** Institutional, authoritative, precise, and transparent.
* **Primary Value Claim:** Every user immediately sees *why* they can or cannot apply. Statuses and criteria reasons are unmistakably clear.
* **Anti-Slop Mandate:** Reject generic AI templates (no neon glows, no gradient text, no giant pill buttons, no floating 3D cards, no emoji-heavy headers).

---

## 2. Banned Elements & Negative Constraints
1. **NO Heavy Drop Shadows:** Avoid Tailwind's default `shadow-lg`, `shadow-xl`, `shadow-2xl`. Rely on crisp borders (`border border-slate-200`) and subtle elevation (`shadow-sm` or `shadow-[0_1px_2px_rgba(0,0,0,0.05)]`).
2. **NO Bubble / Pill Containers:** Avoid `rounded-2xl` and `rounded-3xl` for cards, dialogs, or data tables. Use crisp, deliberate radii: `rounded-md` (6px) or `rounded-lg` (8px).
3. **NO Emojis as UI Icons:** Never use emojis (🚨, 💼, 🎓, ❌, ✅) in UI controls, chips, or tables. Use crisp icons from `lucide-react` (`CheckCircle2`, `XCircle`, `AlertCircle`, `Building2`, `GraduationCap`, `FileText`).
4. **NO Marketing Clichés or AI Copy:** Avoid words like "Elevate your career", "Seamless experience", "Next-gen portal". Use plain, professional institutional language.
5. **NO Unrealistic Mock Data:** Use realistic placement cell data: roll numbers (`21CSE042`), CTC packages (`12.5 LPA`), Indian mobile formats (`9876543210`), and real department codes (`CSE`, `ECE`, `MECH`).
6. **NO Dark Mode or Theme Switchers (v1):** Strict adherence to `Design.md §7`. Keep all views in high-contrast light mode.

---

## 3. Color Tokens & Semantic Application (`Design.md §3`)

Color is a scarce, purposeful resource. Apply tokens strictly:

| Element | Tailwind Classes | Purpose & Rules |
|---|---|---|
| **Canvas / Page** | `bg-slate-50` | Muted backdrop for high contrast against white cards. |
| **Surface / Cards** | `bg-white border border-slate-200` | Pure white cards with clean 1px border. |
| **Primary Action** | `bg-indigo-600 hover:bg-indigo-700 text-white` | Primary buttons, active navigation, focus rings (`focus:ring-indigo-500`). |
| **Eligible Verdict** | `bg-emerald-50 text-emerald-700 border-emerald-200` | Eligible badges on job cards, `SELECTED` stage chips. |
| **Mismatch / Error** | `bg-red-50 text-red-700 border-red-200` | Criteria Mismatch badges, error banners, `REJECTED` stage chips. |
| **Warning / Pending** | `bg-amber-50 text-amber-700 border-amber-200` | Unverified banner, `PENDING_APPROVAL` status chips. |
| **Info / Progress** | `bg-sky-50 text-sky-700 border-sky-200` | `SHORTLISTED`, `IN_INTERVIEW` stage chips. |
| **Body & Muted Text**| `text-slate-900` / `text-slate-500` | High-contrast body text with readable secondary metadata. |

> **Accessibility Rule:** Never rely on color alone. Every badge, verdict, or stage chip must combine an icon and readable text.

---

## 4. Typography & Layout Standards

* **Font Stack:** Clean system sans-serif (`font-sans`) matching Apple SF / Inter system fallbacks.
* **Data & Metadata:** Monospace (`font-mono text-xs text-slate-600`) for Roll Numbers, UUIDs, GST/Tax IDs, and Timestamps.
* **Heading Hierarchy:**
  * Page Title (`h1`): `text-2xl font-bold tracking-tight text-slate-900`.
  * Section Title (`h2`): `text-lg font-semibold tracking-tight text-slate-900`.
  * Table Header (`th`): `text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/75`.
* **Micro-interactions:**
  * Subtle button feedback: `transition-colors duration-150 active:scale-[0.99]`.
  * Row hover: `transition-colors duration-100 hover:bg-slate-50/70`.

---

## 5. Core Reusable Component Blueprints

When building or reviewing frontend components, follow these architectural patterns:

### A. Data Grid (`DataTable`)
* Sticky table header (`sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm`).
* Clean cell dividers (`divide-y divide-slate-200`).
* Compact vertical padding (`py-3 px-4`).
* Dedicated empty state when row count is 0 with a muted icon and clear message.

### B. Eligibility Badge (`Badge`)
```tsx
// Example pattern for Job Card badge
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
  <CheckCircle2 className="w-3.5 h-3.5" />
  Eligible
</span>
```

### C. Kanban Board (`Company/Job Applicants`)
* Columns with count counters in pill badges (`text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full`).
* Column background: `bg-slate-100/60 rounded-lg p-3 border border-slate-200/60`.
* Draggable/clickable cards: `bg-white rounded-md p-3.5 border border-slate-200 shadow-sm hover:border-slate-300 transition-all`.
* Contact details masked for `APPLIED`: `"Hidden until shortlisted"` in `text-xs italic text-slate-400`.

### D. Verification Banner (`Student Dashboard`)
* Persistent top banner when `is_verified === false`:
  `bg-amber-50 border-l-4 border-amber-500 p-4 text-amber-800 rounded-r-md` with `AlertTriangle` icon.

---

## 6. Pre-Commit Design Checklist
Before finalizing any UI component or page:
- [ ] No missing error or loading skeletons.
- [ ] Empty state is handled gracefully with an appropriate `EmptyState` component.
- [ ] Form inputs have labels above, inline errors beneath, and `focus:ring-2 focus:ring-indigo-500`.
- [ ] Touch targets are at least 40px on mobile (`min-h-[40px]`).
- [ ] Title matches exact brand name: `College Placement Management System (CPMS)`.

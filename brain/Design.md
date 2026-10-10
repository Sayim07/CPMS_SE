# Design — College Placement Management System (CPMS)

Implementable with the free stack in TRD.md §1 (React, Tailwind, React Router). Screens are listed in AppFlow.md §3.

## 0. Branding

- **App name:** "College Placement Management System (CPMS)". No variants ("Placement Portal", "CampusHire", etc.).
- **Header:** logo text `CPMS` (bold) followed by the muted full name "College Placement Management System" on screens ≥ 768 px; on smaller screens show `CPMS` only.
- **Login/register pages:** full name as the page `<h1>`.
- **Tab title:** exact snippet for Vite + React.

`index.html`:
```html
<title>College Placement Management System (CPMS)</title>
```

Per-route titles (React Router pages, set in a `usePageTitle` hook):
```ts
document.title = `${pageName} | College Placement Management System (CPMS)`;
```

- **Tagline (the only one allowed):** "Verified placements, fewer mistakes."
- Footer: "College Placement Management System (CPMS) v1.0".

## 1. Design Intent

A calm, data-dense, trustworthy administrative tool. The main value claim is **automated, transparent eligibility**: every user must see at a glance *why* they can or cannot apply.

Frontend components must adhere to the anti-slop craft rules in `.agents/skills/cpms-design-taste/SKILL.md` (crisp 1px borders, subtle hover transitions, compact table spacing, and strict token adherence).

## 2. Layout Principles

- App shell: top bar (brand, notification bell, user menu) + left nav (collapsible to drawer under 768 px).
- Content max width 1280 px; 12-column Tailwind grid; 24 px page padding.
- Student job directory: card grid (1 / 2 / 3 columns at sm / md / lg).
- TPO: full-width tables with sticky header, sortable columns, row checkboxes, bulk action bar, export buttons top right.
- Company applicants: Kanban columns `APPLIED | SHORTLISTED | IN_INTERVIEW | SELECTED | REJECTED`; a table view toggle for mobile.
- Large touch targets (min 40 px) on mobile.

## 3. Color System (Tailwind tokens)

| Role | Token | Usage |
|---|---|---|
| Primary | `indigo-600` / hover `indigo-700` | Buttons, links, active nav |
| Surface | `white`, page bg `slate-50` | Cards, background |
| Text | `slate-900`, muted `slate-500` | Body, secondary |
| Eligible | `emerald-600` on `emerald-50` | Eligible badge, SELECTED chip |
| Mismatch | `red-600` on `red-50` | Criteria Mismatch badge, errors, REJECTED chip |
| Warning | `amber-600` on `amber-50` | Unverified banner, PENDING chips |
| Info | `sky-600` on `sky-50` | SHORTLISTED, IN_INTERVIEW chips |

Never rely on color alone: badges include an icon and text.

## 4. Typography and Components

- Font: system UI stack (`font-sans`); no paid or external fonts.
- Sizes: h1 `text-2xl`, h2 `text-xl`, body `text-sm`/`text-base`, table `text-sm`.
- Components to build once and reuse: `Badge`, `StageChip`, `StatCard`, `DataTable`, `KanbanColumn`, `FileDropzone`, `ConfirmDialog`, `EmptyState`, `Toast`, `NotificationBell`.
- Forms: label above input, inline error under the field, summary toast on failure.
- Tooltips on CGPA scale and backlog fields (SRS §2.6).

## 5. Key Visual Differentiators

1. **Eligibility badge on every job card** (green "Eligible" / red "Criteria Mismatch").
2. **Reason list** on job detail: one line per failed rule, e.g. "Your CGPA 6.9 is below the required 7.5".
3. **Verification banner** at top of student pages when `is_verified = false` ("Awaiting TPO verification. You can browse jobs but not apply.").
4. **Stage chips** with consistent colors across all roles.

## 6. Special-Feature UI

- **Notification bell:** polls `GET /notifications` every 30 s (TRD.md §3); badge shows unread count.
- **Reports page:** four `StatCard`s (placed, placement rate, average CTC, unplaced) plus a CSS/Tailwind bar chart per department. No charting library beyond one free option, **Recharts** (**VERIFY** version); fall back to plain divs if it causes issues.
- **Resume access:** "View resume" button requests a pre-signed URL then opens it in a new tab.
- **Contact masking:** for APPLIED applicants the contact cells read "Hidden until shortlisted".

## 7. What to Avoid

- No marketing landing page, hero images, or animations beyond simple transitions.
- No dark mode, i18n, or theme switcher in v1.
- No paid icon sets; use `lucide-react`.
- No client-only eligibility logic; the UI only renders what the API returns.
- No alternate names or logos for the product.
- No inline styles; use Tailwind classes.

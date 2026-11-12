---
name: neobrutalism
description: Neobrutalism design system and retro-modern UI craft guide based on neobrutalism.dev, BrutAdmin, and Neoflux templates. Enforces high-contrast solid borders, zero-blur hard offset shadows, tactile click physics, vibrant retro color blocking, and bold typography.
---

# Neobrutalism Design System & Craft Guide

This skill governs the conversion and implementation of Neobrutalism UI (inspired by [neobrutalism.dev](https://neobrutalism.dev), **BrutAdmin**, and **Neoflux** templates) across React and Tailwind CSS.

---

## 1. Visual Manifesto

Neobrutalism blends the brutalist architectural philosophy of raw structure, high contrast, and honesty of materials with modern usability, vibrant retro color palettes, and tactile micro-interactions.

- **Hard Borders**: Everything has a defined perimeter (`border-2 border-black dark:border-white`). Never subtle 1px gray borders.
- **Zero-Blur Hard Shadows**: Box shadows never use blur. They are hard-edged offsets:
  - Default Card: `shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]`
  - Small / Button Hover: `shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]`
  - Large / Hero Pill: `shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff]`
- **Tactile Click Physics**:
  - Hover: `hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000]`
  - Active: `active:translate-x-[4px] active:translate-y-[4px] active:shadow-none`
- **Retro Pop Colors**:
  - Base Light Background: Warm Cream/Paper `#FEFDF8` or `#F4F0EA`
  - Base Dark Background: Deep Ink `#121214` or `#18181B`
  - Main Accent / Violet: `#A388EE` / `#7C3AED`
  - Retro Yellow (Stickers / Warnings / Dream CTC): `#FFE600` / `#FEF08A`
  - Retro Mint / Emerald (Eligible / Live / Verifications): `#86EFAC` / `#4ADE80`
  - Retro Coral / Salmon (Locks / Deadlines / Mismatch): `#FF70A6` / `#FDA4AF`
  - Retro Cyan / Sky (Info / Departments / TPO): `#7DD3FC` / `#A5F3FC`
  - Cards: Pure white `#FFFFFF` in light mode, `#1E1E24` in dark mode, framed by `border-2 border-black dark:border-white`.

---

## 2. Core Tailwind Tokens (`tailwind.config.js`)

```js
boxShadow: {
  'neo': '4px 4px 0px 0px #000000',
  'neo-sm': '2px 2px 0px 0px #000000',
  'neo-lg': '6px 6px 0px 0px #000000',
  'neo-dark': '4px 4px 0px 0px #ffffff',
  'neo-dark-sm': '2px 2px 0px 0px #ffffff',
  'neo-dark-lg': '6px 6px 0px 0px #ffffff',
},
borderRadius: {
  'neo': '6px',
  'neo-lg': '10px',
}
```

---

## 3. Component Archetypes

### Button
```tsx
<button className="px-4 py-2 bg-yellow-300 text-black font-bold text-xs uppercase tracking-wider rounded-neo border-2 border-black shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-neo-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
  Confirm Action
</button>
```

### Card
```tsx
<div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-neo p-5 shadow-neo dark:shadow-neo-dark text-black dark:text-white">
  {/* Content */}
</div>
```

### Badge / Sticker
```tsx
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-neo bg-emerald-300 text-black text-xs font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000]">
  VERIFIED
</span>
```

### Inputs & Form Elements
```tsx
<input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-neo font-medium text-xs text-black dark:text-white shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none transition-all" />
```

### Table
```tsx
<div className="border-2 border-black dark:border-white rounded-neo overflow-hidden shadow-neo dark:shadow-neo-dark">
  <table className="w-full text-left divide-y-2 divide-black dark:divide-white">
    <thead className="bg-yellow-200 dark:bg-yellow-500 text-black font-black uppercase text-xs">
      ...
    </thead>
    <tbody className="divide-y-2 divide-black dark:divide-white bg-white dark:bg-zinc-900">
      ...
    </tbody>
  </table>
</div>
```


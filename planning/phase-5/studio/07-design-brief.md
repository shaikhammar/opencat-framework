# OpenCAT — Master Design Brief

**Version:** 1.1 (Phase 5 Track D)
**For:** Claude Design (visual mockup generation)
**App:** OpenCAT — open-source web-based CAT tool
**Domain:** opencatapp.com
**Stack:** React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui

---

## 1. Product Summary

OpenCAT is a professional translation editor for freelance translators. It handles:
- Translation memory (TM) lookup and management
- Segment-by-segment translation with inline tag support
- QA checks, machine translation suggestions, glossary term recognition
- File import/export (DOCX, PPTX, XLSX, HTML, PO, XLIFF, XML)

**Primary user:** A solo freelance translator working with files that contain inline formatting tags. The UI must feel like a professional desktop CAT tool — not a generic web app.

---

## 2. Design Principles

1. **Minimal and focused** — No decorative elements. Every pixel serves a function. Whitespace is generous but purposeful.
2. **Information density where it matters** — The editor is data-dense (segment table). Non-editor screens are spacious.
3. **Progressive disclosure** — Show the next action clearly. Never leave the user without a clear path forward.
4. **Keyboard-first** — The editor is operated primarily by keyboard. Design must accommodate visible shortcut hints.
5. **RTL-ready** — Arabic, Urdu, and Hebrew target text renders right-to-left. Layouts must accommodate mixed LTR/RTL content in the editor. Do not mirror the overall UI — only the target text field flips direction.

---

## 3. Color System

### Primary Accent — Teal

| Token | Hex | Usage |
|---|---|---|
| `accent-500` | `#14B8A6` (teal-500) | Primary buttons, active nav, links, focus rings |
| `accent-600` | `#0D9488` (teal-600) | Button hover state |
| `accent-100` | `#CCFBF1` (teal-100) | Selected segment row highlight, active TM match background |
| `accent-50` | `#F0FDFA` (teal-50) | Hover row highlight |

### Neutral Base — Warm Stone

Warm stone instead of cold slate. Same scale, warmer undertone — avoids the blue-gray look common in most SaaS tools.

| Token | Hex | Usage |
|---|---|---|
| `stone-900` | `#1C1917` | Headings, primary text |
| `stone-700` | `#44403C` | Body text, labels |
| `stone-500` | `#78716C` | Secondary text, placeholders, icons |
| `stone-300` | `#D6D3D1` | Borders, dividers |
| `stone-100` | `#F5F5F4` | Table row alt background, sidebar background |
| `stone-50` | `#FAFAF9` | Page background |
| `white` | `#FFFFFF` | Card backgrounds, editor cell backgrounds |

### Semantic Colors

| Purpose | Hex | Usage |
|---|---|---|
| Success | `#16A34A` (green-600) | "Translated" status, "Export ready" banners |
| Warning | `#D97706` (amber-600) | "Draft" status, pending QA warnings |
| Error | `#DC2626` (red-600) | QA errors, rejected segments, invalid API keys |
| Info | `#0284C7` (sky-600) | Processing banners, MT suggestions |
| Purple | `#7C3AED` (violet-600) | "Reviewed" segment status |

### Segment Status Colors

These colors are critical to the translation editor. Each status maps to a colored dot (●) displayed in the segment table.

| Status | Color | Hex | Dot label |
|---|---|---|---|
| Untranslated | Stone-300 (warm grey) | `#D6D3D1` | ○ empty circle |
| Draft | Amber-400 | `#FBBF24` | ● amber |
| Translated | Green-500 | `#22C55E` | ● green |
| Reviewed | Violet-500 | `#8B5CF6` | ● violet |
| Approved | Green-700 | `#15803D` | ● dark green (filled with checkmark) |
| Rejected | Red-500 | `#EF4444` | ● red |

### Dark Mode

Dark mode uses the same accent color (teal-500) but inverts the warm stone palette:

| Light token | Dark equivalent |
|---|---|
| `stone-50` (page bg) | `#1C1917` (stone-900) |
| `white` (card bg) | `#292524` (stone-800) |
| `stone-100` (subtle bg) | `#292524` (stone-800) |
| `stone-900` (primary text) | `#F5F5F4` (stone-100) |
| `stone-700` (body text) | `#D6D3D1` (stone-300) |
| `stone-300` (borders) | `#44403C` (stone-700) |

---

## 4. Typography

**Primary typeface:** Inter (Google Fonts)
- Excellent Latin and Arabic/Urdu Unicode coverage
- Clean, professional, widely used in developer tools
- Available via `@fontsource/inter` (self-hosted)

**Type Scale:**

| Role | Size | Weight | Line-height |
|---|---|---|---|
| Page heading (h1) | 24px | 600 | 32px |
| Section heading (h2) | 18px | 600 | 28px |
| Card heading (h3) | 16px | 500 | 24px |
| Body / labels | 14px | 400 | 20px |
| Small / metadata | 12px | 400 | 16px |
| Segment source text | 14px | 400 | 22px |
| Segment target text | 14px | 400 | 22px (RTL: same size, `dir="rtl"`) |
| Keyboard shortcut badge | 11px | 500 | monospace |

**Monospace (for shortcut badges):** `ui-monospace, 'JetBrains Mono', monospace`

---

## 5. Spacing System

Tailwind v4 default spacing (4px base unit):

- `4` (16px) — base padding for cards, inputs
- `6` (24px) — section gap, form field gap
- `8` (32px) — page section separator
- `3` (12px) — inline padding for badges, chips
- `2` (8px) — dense table row padding

---

## 6. Layout Modes

### AppLayout (most screens)
```
┌─────────────────────────────────────────────────────┐
│  Sidebar (240px fixed) │  Main content (flex-1)      │
│                        │                             │
│  [Logo]                │  [Page header]              │
│  ────────              │  [Content area]             │
│  Dashboard             │                             │
│  TM Library            │                             │
│  Glossary              │                             │
│  ────────              │                             │
│  Settings              │                             │
└─────────────────────────────────────────────────────┘
```

- Sidebar bg: `stone-100` (light) / `stone-800` (dark)
- Active nav item: `accent-100` bg + `accent-600` text + left border bar `accent-500`
- Nav item hover: `stone-200` bg
- Logo area: 56px tall, app name "OpenCAT" in `stone-900` weight-700, possibly with a small icon

### EditorLayout (translation editor only)
```
┌──────────────────────────────────────────────────────┐
│  Top bar (full-width, 56px)                           │
├──────────────────────────────────────────────────────┤
│  Segment table (flex-1)    │  Side panel (380px)      │
│                            │  (collapsible)           │
├──────────────────────────────────────────────────────┤
│  Status bar (full-width, 32px)                        │
└──────────────────────────────────────────────────────┘
```

---

## 7. Core Component Patterns

### Buttons

Primary: `bg-teal-500 text-white hover:bg-teal-600` — rounded-md, 36px height, px-4
Secondary: `bg-white border border-stone-300 text-stone-700 hover:bg-stone-50`
Destructive: `bg-red-600 text-white hover:bg-red-700`
Ghost: `text-stone-700 hover:bg-stone-100` — for icon buttons

### Input Fields

`border border-stone-300 rounded-md px-3 py-2 text-stone-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent`
Label: `text-sm font-medium text-stone-700` above field

### Cards

`bg-white border border-stone-200 rounded-lg shadow-sm p-6`
Hover (clickable cards): `hover:shadow-md hover:border-stone-300 transition-shadow`

### Badges / Status Pills

Rounded-full, text-xs, font-medium, 4px vertical padding, 10px horizontal padding.

| Badge type | Colors |
|---|---|
| Active | `bg-green-100 text-green-700` |
| Processing | `bg-amber-100 text-amber-700` |
| Error | `bg-red-100 text-red-700` |
| Archived | `bg-stone-100 text-stone-500` |
| Format (DOCX, PPTX) | `bg-teal-50 text-teal-700` |

### Progress Bars

Height: 6px, rounded-full.
Track: `bg-stone-200`
Fill: `bg-teal-500`
Complete (100%): `bg-green-500`

### Empty States

Center-aligned in their container. Pattern:
- Icon (40px, `text-stone-300`)
- Heading (16px, `text-stone-700`)
- Body (14px, `text-stone-500`, max 280px wide)
- CTA button (primary)

### Tag Chips (editor only)

Inline elements within the target editor contenteditable. Represent format codes `{1}`, `{/1}`, `{2/}`.

- Size: 20px height, rounded, `px-2`, `text-xs font-mono`
- Opening tag `{1}`: `bg-teal-100 text-teal-700 border border-teal-300`
- Closing tag `{/1}`: same colors as opening
- Self-closing `{2/}`: `bg-violet-100 text-violet-700 border border-violet-300`
- Non-editable: cursor is `default`, no caret inside chip
- Selected chip: `bg-teal-200 border-teal-400`

### TM Match Percentage Badges

Displayed inline in segment rows and TM panel.

| Match % | Colors |
|---|---|
| 100% (exact) | `bg-green-100 text-green-700` |
| 95–99% | `bg-emerald-100 text-emerald-700` |
| 75–94% | `bg-amber-100 text-amber-700` |
| < 75% | Not shown (below threshold) |

---

## 8. Sidebar Navigation

```
┌──────────────────────┐
│  ◆ OpenCAT           │  ← Logo + app name, 56px header
├──────────────────────┤
│  ⊞ Dashboard         │  ← active: teal bg + left border
│  ◎ TM Library        │
│  ≡ Glossary          │
├──────────────────────┤  ← divider
│  ⚙ Settings          │
└──────────────────────┘
```

Icon style: 18px, `text-stone-500` default, `text-teal-600` active
Nav item height: 40px, `px-3`, `rounded-md` inside sidebar padding

---

## 9. Iconography

Use **Lucide React** icons throughout. Do not mix icon sets.

Key icons to use:
- Dashboard: `LayoutDashboard`
- Projects: `FolderOpen`
- TM Library: `Database`
- Glossary: `BookOpen`
- Settings: `Settings`
- Upload: `Upload`
- Export: `Download`
- Edit/Translate: `Pencil`
- QA: `ShieldCheck`
- Warning: `AlertTriangle`
- Success: `CheckCircle`
- Processing: `Loader2` (animated spin)
- Tag: `Tag`
- Search: `Search`
- Back arrow: `ChevronLeft`
- Close: `X`
- Add: `Plus`
- Delete: `Trash2`
- Eye (show API key): `Eye` / `EyeOff`

---

## 10. Motion & Transitions

Keep motion minimal. Professional tools do not animate casually.

- Page transitions: None (Inertia handles navigation; no transition needed)
- Button hover: `transition-colors duration-150`
- Card hover: `transition-shadow duration-150`
- Side panel open/close: `transition-all duration-200`
- Processing spinner: `animate-spin` on `Loader2` icon
- TM panel match insertion: brief `bg-amber-50` flash on target cell (200ms), no animation needed in mockups

---

## 11. RTL Considerations

**Do not mirror the overall app layout for RTL.** The sidebar remains on the left. Navigation is always LTR. Only the segment text cells adapt — each cell independently reads its language from the project's source/target language setting.

RTL languages: Arabic (`ar`), Urdu (`ur`), Persian/Farsi (`fa`), Hebrew (`he`).

### Four source/target combinations

| Combination | Source cell | Target cell | Example pair |
|---|---|---|---|
| LTR → LTR | `dir="ltr"`, left-aligned | `dir="ltr"`, left-aligned | EN → DE |
| LTR → RTL | `dir="ltr"`, left-aligned | `dir="rtl"`, right-aligned | EN → UR |
| RTL → LTR | `dir="rtl"`, right-aligned | `dir="ltr"`, left-aligned | AR → EN (back-translation) |
| RTL → RTL | `dir="rtl"`, right-aligned | `dir="rtl"`, right-aligned | AR → UR |

Both cells are independently controlled — there is no assumption that the source is always LTR.

### Implementation rule

Determine `dir` for each cell at the project level using the source/target language codes stored on the `Project` model. Apply `dir="rtl"` and `text-align: right` together — neither alone is sufficient.

### Tag chips in RTL

Tag chips `{1}`, `{/1}`, `{2/}` are inline elements and flow with the surrounding text direction. In an RTL cell a chip appears at the right end of the text visually. The chip badge itself always renders its number LTR (i.e., `{1}` not `{١}`) — only its position in the flow changes.

### Mockup instruction

Show two editor variants:
- **LTR → RTL** (EN → UR): source cell left-aligned English, target cell right-aligned Urdu
- **RTL → LTR** (AR → EN): source cell right-aligned Arabic, target cell left-aligned English (back-translation case)

---

## 12. Screen Priority for Mockups

Generate mockups in this order:

1. **Translation Editor** (`08-screen-briefs/editor.md`) — the most complex screen; most important to get right
2. **Dashboard + Project Overview** (`08-screen-briefs/dashboard.md`) — the home screen
3. **Project Creation Wizard** (`08-screen-briefs/project-wizard.md`) — 3-step flow
4. **Settings** (`08-screen-briefs/settings.md`) — MT + QA config

---

## 13. shadcn/ui Component Mapping

**Primitive layer:** shadcn/ui components in this project use **Base UI** as the underlying primitive (not Radix UI). shadcn has migrated from Radix UI to Base UI; Base UI is currently in active development. Component names and visual output are identical from a design perspective — this distinction matters at the implementation layer (import paths, prop names).

These shadcn/ui components are used throughout. Render them in the mockups using their canonical appearance:

| Component | Used in |
|---|---|
| `Button` | All screens |
| `Input`, `Textarea` | Forms, wizard, search |
| `Select` | Language pickers, dropdowns |
| `Badge` | Status pills, format labels |
| `Progress` | File progress bars |
| `Table` | File list, TM concordance, segment table |
| `Dialog` | Confirmations, Add Term modal |
| `Tabs` | Settings screen, side panel tabs |
| `Separator` | Section dividers |
| `Switch` | MT toggle, QA toggles |
| `Checkbox` | QA defaults, wizard TM settings |
| `DropdownMenu` | Action menus (Export, Archive) |
| `Tooltip` | Keyboard shortcut labels on icon buttons |
| `ScrollArea` | Segment table scroll, side panel |

shadcn/ui theme: default (zinc) base, overridden with teal primary. Border radius: `rounded-md` (6px) for inputs, `rounded-lg` (8px) for cards.

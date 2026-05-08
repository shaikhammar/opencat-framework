# OpenCAT — Screen Brief: Dashboard & Project Overview

**Document type:** UI/UX mockup brief for Claude Design
**Screens:** Dashboard + Project Overview (two related screens in one brief)
**URLs:** `/dashboard` and `/projects/{id}`
**Layout:** AppLayout (sidebar + main content)
**Priority:** 2 of 4

Read `07-design-brief.md` first for color tokens, typography, and component patterns.

---

## AppLayout Structure (both screens use this)

```
┌────────────────┬────────────────────────────────────────────────┐
│                │                                                  │
│   SIDEBAR      │   MAIN CONTENT AREA                             │
│   240px fixed  │   flex-1, max-w-screen-xl, px-8 py-8           │
│                │                                                  │
│                │                                                  │
└────────────────┴────────────────────────────────────────────────┘
```

### Sidebar Detail

```
┌──────────────────────────┐
│  ◆  OpenCAT              │  ← 56px, brand header, bg-white border-b
├──────────────────────────┤
│                          │
│  ⊞  Dashboard            │  ← active item: bg-indigo-50, text-indigo-700,
│                          │    left-border 3px indigo-500
│  ◉  TM Library           │  ← inactive: text-slate-600 hover:bg-slate-100
│  ≡  Glossary             │
│                          │
├──────────────────────────┤  ← separator: border-t border-slate-200
│                          │
│  ⚙  Settings             │
│                          │
│                          │
│  [User avatar + name]    │  ← bottom of sidebar, 56px footer
└──────────────────────────┘
```

Sidebar background: `bg-slate-50 border-r border-slate-200`
Nav item: `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium`
Logo: `◆` diamond shape or simple CAT-themed icon, `text-indigo-600 text-xl`, "OpenCAT" `text-slate-900 font-bold text-base`

---

## Screen A: Dashboard

**Inertia page:** `Pages/Dashboard.tsx`

### Page Header

```
My Projects                               [+ New Project]
```

- Heading: `text-2xl font-semibold text-slate-900`
- Button: primary button style with `Plus` icon

---

### State 1: No Projects (Empty State)

Render this in a secondary mockup showing the new-user experience.

```
┌──────────────────────────────────────────────┐
│                                              │
│         [FolderOpen icon — 48px]             │
│         text-slate-200                       │
│                                              │
│         No projects yet                      │
│         text-xl font-medium text-slate-700   │
│                                              │
│         Create your first project to         │
│         start translating.                   │
│         text-sm text-slate-500               │
│                                              │
│         [Create project →]                   │
│         primary button                       │
│                                              │
└──────────────────────────────────────────────┘
```

Empty state container: centered within main content, `mt-24`

---

### State 2: Projects Exist (Primary Mockup)

Project grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6`

#### ProjectCard

```
┌──────────────────────────────────────────────┐
│  EN → UR                    [Active ●]        │  ← header row
│                                              │
│  Legal Contract Translation                  │  ← project name
│  text-lg font-semibold text-slate-900        │
│                                              │
│  ████████░░░░░░░░  45%                       │  ← progress bar + %
│  1,904 / 4,231 words                         │  ← word counts
│                                              │
│  3 files  ·  Last activity 2 hours ago       │  ← metadata
│                                              │
│  ┌─────────────────────────┐                 │
│  │  Ready to translate →   │  ← next-step    │
│  └─────────────────────────┘                 │
│                                              │
│                         [Open project →]     │
└──────────────────────────────────────────────┘
```

Card: `bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md hover:border-slate-300 transition-all`

**Header row:**
- Language pair badge: `bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full px-2.5 py-1`
- Status badge on right: see badge patterns in design brief

**Project name:** `text-base font-semibold text-slate-900 mt-2`

**Progress row:**
- Progress bar: 100% width, 6px height, `bg-slate-200` track, `bg-indigo-500` fill
- Percentage: `text-sm font-medium text-slate-700` inline after bar
- Word count: `text-xs text-slate-500`

**Metadata row:**
- File count + last activity: `text-xs text-slate-400 mt-1`
- Separated by `·`

**Next-step chip (conditional):**
Render the "Ready to translate" variant in primary mockup.
- `bg-indigo-50 text-indigo-600 text-xs font-medium rounded px-2.5 py-1.5 w-full text-center mt-3`

Other chip variants (for reference — show at least one in mockup):
- Processing: `bg-amber-50 text-amber-600` + `Loader2` spin icon
- "Translation complete — export?": `bg-green-50 text-green-700`

**Open button:** bottom-right, ghost/secondary style, `text-sm`

#### Show 3 project cards in primary mockup:

Card 1: "Legal Contract Translation" — EN→UR — 45% — Active — "Ready to translate →"
Card 2: "Marketing Brochure Q4" — EN→AR — 0% — Active — processing chip (Loader2)
Card 3: "User Manual v2" — EN→HI — 100% — "Translation complete — export?"

---

## Screen B: Project Overview

**URL:** `/projects/{id}`
**Inertia page:** `Pages/Projects/Show.tsx`

### Breadcrumb + Page Header

```
Dashboard  >  Legal Contract Translation
                                              [⚙ Settings]  [Archive]
Legal Contract Translation
EN → UR  ·  Active  ·  Created Jan 12, 2026
```

Breadcrumb: `text-sm text-slate-500` with `text-slate-400` separators. Current page: `text-slate-700`.
Page title: `text-2xl font-semibold text-slate-900`
Metadata row: `text-sm text-slate-500`, language pair as `text-indigo-600 font-medium`
Action buttons: top-right, secondary style

---

### Next-Step Banner

Below the page header, above file list. Full-width card.

**Show this variant in mockup (all files ready, not yet translated):**

```
┌──────────────────────────────────────────────────────────────┐
│  ▶  Your files are ready. Click a file to start translating.  │
└──────────────────────────────────────────────────────────────┘
```

Banner: `bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 flex items-center gap-3 text-sm text-indigo-700`

Other variants (show as secondary reference):

Processing banner: `bg-amber-50 border-amber-200 text-amber-700` + `Loader2` spin
"Run QA" banner: `bg-green-50 border-green-200 text-green-700` + CheckCircle icon + "Run QA on all files" button inline
QA errors banner: `bg-red-50 border-red-200 text-red-700` + AlertTriangle icon

---

### Files Section

```
Files (3)                                            [+ Upload file]
```

**FileList Table:**

```
┌─────────────────────┬────────┬──────────┬────────────────────┬────────────┬─────────────────┐
│ File                │ Format │ Words    │ Progress           │ Status     │ Actions         │
├─────────────────────┼────────┼──────────┼────────────────────┼────────────┼─────────────────┤
│ contract.docx       │ DOCX   │ 4,231    │ ████░░░ 45%        │ ● Ready    │ [Translate]     │
│                     │        │          │ 1,904 translated   │            │ [Export]        │
├─────────────────────┼────────┼──────────┼────────────────────┼────────────┼─────────────────┤
│ slides.pptx         │ PPTX   │ 892      │ ░░░░░░░░ 0%        │ ● Ready    │ [Translate]     │
├─────────────────────┼────────┼──────────┼────────────────────┼────────────┼─────────────────┤
│ report.xlsx         │ XLSX   │ —        │ ⏳ Processing…     │ Processing │ —               │
└─────────────────────┴────────┴──────────┴────────────────────┴────────────┴─────────────────┘
```

Table: `w-full text-sm`
Header row: `bg-slate-50 border-y border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500`
Data rows: `border-b border-slate-100 hover:bg-slate-50`

**File name cell:** `text-slate-900 font-medium`
**Format badge:** `bg-indigo-50 text-indigo-600 text-xs font-medium rounded px-2 py-0.5`
**Word count:** `text-slate-700`

**Progress cell:**
- Inline progress bar: 80px wide, 4px height, + percentage text
- Processing row: `Loader2` spin icon (14px, `text-amber-500`) + "Processing…" `text-amber-600 text-xs`

**Status cell:**
- Ready: `● Ready` — green dot + `text-slate-700`
- Processing: `Loader2` + "Processing" `text-amber-600`
- Error: red dot + "Error" + hover shows error message

**Actions cell:**
- [Translate] button: primary small
- [Export] button: secondary small (shown only when file is `ready`)
- While processing: dash `—`

---

### Translation Memory Section

Below file table, after a `<Separator />`.

```
Translation Memory
──────────────────

  Project TM (EN → UR)                 [Search TM]  [Import TMX]  [Export TMX]
  1,204 entries  ·  Last updated 2h ago
```

Section heading: `text-base font-semibold text-slate-900`
TM name: `text-sm font-medium text-slate-700`
Metadata: `text-xs text-slate-500`
Action buttons: ghost/secondary style, `text-xs`

**Empty state variant:**
```
  No translation memory for this project.
  Translations you confirm are saved automatically once you add a TM.
  [Add TM]
```

---

### Glossary Section

Same structure as TM section.

```
Glossary
──────────────────

  Project Glossary (EN → UR)     [Import TBX]  [Export TBX]  [+ Add term]
  342 terms
```

---

## States to Render in Mockups

**Mockup A1 — Dashboard, projects exist:**
3 project cards in grid. Show all three next-step chip variants. Sidebar with "Dashboard" active.

**Mockup A2 — Dashboard, empty state:**
Centered empty state. Sidebar visible. "Dashboard" active.

**Mockup B1 — Project Overview, files mixed state:**
Banner: "Your files are ready." File table with contract.docx (45%), slides.pptx (0%, ready), report.xlsx (processing). TM section with 1,204 entries.

---

## Do Not Include

- No notification bell or notification dropdown in the top bar (not in V1)
- No user menu in the sidebar header (name only in sidebar footer)
- No chart visualizations for progress (progress bar only — no pie charts)
- No dark mode in primary mockups (show light mode; dark is secondary)

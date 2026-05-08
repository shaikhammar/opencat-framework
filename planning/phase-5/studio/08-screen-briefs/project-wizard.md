# OpenCAT — Screen Brief: Project Creation Wizard

**Document type:** UI/UX mockup brief for Claude Design
**Screen:** New Project Wizard (3-step flow)
**URL:** `/projects/create`
**Layout:** AppLayout (sidebar + main content) with wizard content in center
**Priority:** 3 of 4

Read `07-design-brief.md` first for color tokens, typography, and component patterns.

---

## Purpose

A first-time or returning user creates a new project through a 3-step guided wizard. The goal is to reduce cognitive load by presenting one decision at a time. No long scrolling forms.

The wizard sits inside the normal AppLayout (sidebar visible). The wizard content area is a centered card — not full-width. This reinforces focus.

---

## Overall Wizard Layout

```
┌────────────────┬─────────────────────────────────────────────────┐
│                │                                                   │
│   SIDEBAR      │   [Breadcrumb: Dashboard > Create project]        │
│   (standard)   │                                                   │
│                │   ┌───────────────────────────────────────────┐   │
│                │   │                                           │   │
│                │   │   STEP INDICATOR                          │   │
│                │   │                                           │   │
│                │   │   WIZARD CONTENT CARD                     │   │
│                │   │                                           │   │
│                │   └───────────────────────────────────────────┘   │
│                │                                                   │
└────────────────┴─────────────────────────────────────────────────┘
```

Wizard wrapper: `max-w-2xl mx-auto py-8`
Sidebar: same as AppLayout — "Dashboard" or no item active (Create project is not in nav)

---

## Step Indicator

Displayed above the wizard card. Three steps connected by a progress line.

```
  ●───────────●───────────○
  1           2           3
  Project     Translation  Upload
  Details     Memory       Files
```

**Completed step (●):** `bg-indigo-500 text-white` circle (28px), line after: `bg-indigo-500`
**Active step (●):** `bg-indigo-500 text-white` circle with ring: `ring-4 ring-indigo-100`
**Upcoming step (○):** `bg-white border-2 border-slate-300 text-slate-400` circle, line: `bg-slate-200`

Step label: `text-xs font-medium` below each circle, `text-indigo-600` active, `text-slate-500` upcoming

Connector line: 2px, full-width between circles, `bg-indigo-500` if step passed, `bg-slate-200` if upcoming.

---

## Wizard Card

`bg-white border border-slate-200 rounded-xl shadow-sm p-8`

---

## Step 1: Project Details

**Step indicator:** Step 1 active, steps 2 and 3 upcoming.

### Card Content

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  Create a project                        Step 1 of 3     │
│  text-2xl font-semibold slate-900        text-sm slate-400│
│                                                           │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  Project name *                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Legal Contract Translation                         │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Source language *              Target language *         │
│  ┌──────────────────────────┐  ┌──────────────────────┐  │
│  │  English (en-US)       ▼ │  │  Urdu (ur)         ▼ │  │
│  └──────────────────────────┘  └──────────────────────┘  │
│                                                           │
│  Description  (optional)                                  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                                                     │ │
│  │                                                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [Cancel]                               [Next →]         │
└───────────────────────────────────────────────────────────┘
```

**Form fields:**

Project name:
- Label: `text-sm font-medium text-slate-700` + `*` required marker `text-red-500`
- Input: standard input style from design brief
- Validation error state: `border-red-400` + `text-red-500 text-xs mt-1` error message below

Source/Target language:
- Two columns side-by-side: `grid grid-cols-2 gap-4`
- Each: shadcn `Select` component, searchable dropdown
- Options formatted as "English (en-US)", "Arabic (ar)", "Urdu (ur)", "Hindi (hi)", "German (de)"…

Description:
- shadcn `Textarea`, 3 rows, resize-none
- Placeholder: "Optional: project notes, client name, domain…"

**Footer row:**
- [Cancel]: ghost/text button `text-slate-500 hover:text-slate-700`
- [Next →]: primary button, right-aligned, disabled until name + languages filled

---

## Step 2: Translation Memory

**Step indicator:** Step 1 checked (completed), Step 2 active, Step 3 upcoming.

### Card Content

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  Translation Memory                      Step 2 of 3     │
│                                                           │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  Translations you confirm are saved automatically and     │
│  suggested as matches in future projects.                 │
│  text-sm text-slate-600                                   │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  ─── Project TM ──────────────────────────────────  │ │
│  │                                                     │ │
│  │  [✓]  Create a project TM for this project         │ │
│  │       (always checked, greyed checkbox — no toggle) │ │
│  │                                                     │ │
│  │       Translations confirmed in this project are    │ │
│  │       saved here automatically.                     │ │
│  │       text-xs text-slate-500                        │ │
│  │                                                     │ │
│  │  ▶  Import existing TMX file  (collapsed by default)│ │
│  │     text-sm text-indigo-600 cursor-pointer          │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  ─── Global TM ────────────────────────────────── │ │
│  │                                                     │ │
│  │  [✓]  Also use the global TM                       │ │
│  │       (pre-checked, user can uncheck)               │ │
│  │                                                     │ │
│  │       Matches from all your past projects appear    │ │
│  │       in the TM panel. Confirmed translations are   │ │
│  │       saved to both TMs.                            │ │
│  │       text-xs text-slate-500                        │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [← Back]                               [Next →]         │
└───────────────────────────────────────────────────────────┘
```

**Project TM box:**
- Container: `bg-slate-50 border border-slate-200 rounded-lg p-4`
- Section label "─── Project TM ───": `text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3`
- Checkbox: shadcn `Checkbox`, disabled (always checked), `opacity-60` to indicate non-toggleable
- Body text: `text-sm text-slate-700`
- Import TMX: collapsed `<details>` or click-to-expand. Show collapsed in mockup (the `▶` chevron + "Import existing TMX file" text in `text-indigo-600`)

**Global TM box:**
- Same container style
- Checkbox: enabled, pre-checked `bg-indigo-500`
- Body text: same

---

## Step 3: Upload Files

**Step indicator:** Steps 1 and 2 completed, Step 3 active.

### Card Content

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  Upload your files                       Step 3 of 3     │
│                                                           │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                                                     │ │
│  │              [Upload icon — 32px]                   │ │
│  │         Drop files here, or click to browse         │ │
│  │         text-sm font-medium text-slate-700          │ │
│  │                                                     │ │
│  │    Supported: DOCX · PPTX · XLSX · HTML · TXT       │ │
│  │               PO · XLIFF · XML                      │ │
│  │    Max 50 MB per file                               │ │
│  │    text-xs text-slate-400                           │ │
│  │                                                     │ │
│  └─────────────────────────────────────────────────────┘ │
│  Drag-drop zone: border-2 border-dashed border-slate-300   │
│  rounded-xl bg-slate-50 p-10 text-center                  │
│  hover: border-indigo-400 bg-indigo-50                    │
│                                                           │
│  Files added:                                             │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  [📄] contract.docx    [DOCX]  [123 KB]      [×]   │ │
│  │  [📄] slides.pptx      [PPTX]  [4.2 MB]      [×]   │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  ▶  Auto-fill untranslated segments with machine          │
│     translation  (collapsed — click to expand)            │
│     text-sm text-slate-600                               │
│     [chevron icon] text-slate-400                         │
│                                                           │
│  ─────────────────────────────────────────────────────── │
│                                                           │
│  [← Back]                     [Create project →]         │
└───────────────────────────────────────────────────────────┘
```

**Drag-and-drop zone:**
- Border: `2px dashed slate-300`
- Background: `bg-slate-50`
- Hover / drag-over state: `border-indigo-400 bg-indigo-50` + `Upload` icon turns `text-indigo-500`
- Icon: `Upload` 32px `text-slate-400`
- Text hierarchy: main text `text-sm font-medium text-slate-700`, supported formats `text-xs text-slate-400`

**File list (after files added):**
- Container below the drop zone: `mt-4 space-y-2`
- Each file row: `bg-white border border-slate-200 rounded-lg px-4 py-2.5 flex items-center gap-3`
- File icon: `FileText` icon 18px `text-slate-400`
- File name: `text-sm font-medium text-slate-700`
- Format badge: `bg-indigo-50 text-indigo-600 text-xs font-medium rounded px-2 py-0.5`
- File size: `text-xs text-slate-400`
- Remove button: `X` icon 16px, right-aligned, `text-slate-400 hover:text-red-500`

**MT Pre-fill (collapsed section):**
- Trigger row: `flex items-center gap-2 cursor-pointer text-sm text-slate-600`
- `ChevronRight` icon 16px `text-slate-400` (rotates on expand)
- When expanded (show in secondary mockup):
  ```
  ┌──────────────────────────────────────────────────────┐
  │  Auto-fill with machine translation    [Toggle: Off] │
  │                                                      │
  │  Requires a DeepL or Google API key in Settings.     │
  │  Off by default. You can enable this per upload.     │
  │  text-xs text-slate-500                              │
  │                                                      │
  │  Tip: Save this as a project template in V2.         │
  │  text-xs text-slate-400 italic                       │
  └──────────────────────────────────────────────────────┘
  ```
  Container: `bg-slate-50 border border-slate-200 rounded-lg p-4 mt-3`
  Toggle: shadcn `Switch`, off state

**Footer row:**
- [← Back]: ghost button
- [Create project →]: primary button, disabled until at least 1 file added

---

## States to Render in Mockups

**Mockup W1 — Step 1 (active):**
Step indicator shows step 1 active, 2 and 3 upcoming. Form has project name "Legal Contract Translation" typed. Source: English (en-US). Target: Urdu (ur). Description empty.

**Mockup W2 — Step 2 (active):**
Step indicator: step 1 completed (checkmark), step 2 active, step 3 upcoming. Both TM boxes visible. Project TM checked (greyed). Global TM checked (enabled). TMX import collapsed.

**Mockup W3 — Step 3 (active):**
Step indicator: steps 1 and 2 completed, step 3 active. Drop zone shows two files added: contract.docx and slides.pptx. MT section collapsed. "Create project →" button enabled.

---

## Do Not Include

- No progress bar at top of page (the step indicator IS the progress — do not add a second one)
- No "Save draft" — the wizard is not saveable mid-flow in V1
- Do not show a modal overlay for the wizard — it lives in the main content area with sidebar visible
- No file preview — just name, format badge, size, and remove button

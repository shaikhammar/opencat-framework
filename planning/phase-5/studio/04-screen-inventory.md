# OpenCAT — Screen Inventory & User Flows

**Version:** 1.0 (Phase 5 Track D)

This document lists every screen in the V1 studio, its URL, purpose, key UI components, and the guided next-step hints it surfaces. Screens are ordered by the critical path a new user walks.

---

## Navigation Structure

```
/ (redirect to /dashboard)
│
├── /login
├── /register                  (disabled after first user)
├── /forgot-password
├── /reset-password/{token}
│
├── /dashboard                 ← home after login
│
├── /projects/create           ← 3-step wizard
│
└── /projects/{id}             ← project overview
    ├── /projects/{id}/files/{fileId}/editor   ← translation editor (full-screen)
    ├── /projects/{id}/tm                      ← TM manager
    └── /projects/{id}/glossary                ← glossary manager
│
├── /tm                        ← global TM manager
├── /glossary                  ← global glossary manager
│
└── /settings                  ← user settings
```

**Layout modes:**
- **AppLayout** — sidebar navigation + main content area. Used for all screens except editor.
- **EditorLayout** — full-screen, no sidebar. Used for the translation editor only.

---

## Screen 1: Login

**URL:** `/login`
**Layout:** Minimal (no sidebar, centered card)

**Components:**
- Email + password fields
- Remember me checkbox
- "Forgot your password?" link
- Submit button: "Sign in"

**Empty state / first run:**
- If no users exist in the database, the login page shows a banner:
  > "No account found — set up your workspace to get started."
  > [Create your account →]
  This redirects to `/register`.

**After login:** Redirect to `/dashboard`.

---

## Screen 2: Register

**URL:** `/register`
**Layout:** Minimal (centered card)
**Gate:** Returns HTTP 403 (and renders a "Setup complete" page) if any user already exists — regardless of `.env` flags. This is not a configurable toggle; single-user is a V1 invariant (D-S1). To reset: truncate the `users` table.

**Components:**
- Name, email, password, confirm password fields
- Submit: "Create account"

**After register:**
- Auto-login
- Redirect to `/dashboard`
- Dashboard shows the new-user empty state with the project creation CTA

---

## Screen 3: Dashboard

**URL:** `/dashboard`
**Layout:** AppLayout
**Inertia page:** `Pages/Dashboard.tsx`

**Purpose:** Central hub. Shows all projects and surfaces the next action.

**Components:**

```
Header: "My Projects"          [+ New Project]
│
├── [IF no projects] Empty state:
│     Icon + heading: "No projects yet"
│     Body: "Create your first project to start translating."
│     CTA button: "Create project →"
│
└── [IF projects exist] Project grid/list:
      ProjectCard × N (sorted by updated_at DESC)
        - Project name
        - Language pair badge: "EN → UR"
        - Status badge: Active / Completed / Archived
        - Progress bar: X% translated (translated_count / segment_count across files)
        - File count: "3 files"
        - "Last activity" timestamp
        - [Open project] button
```

**Next-step hints on dashboard:**
- A project with all files in `ready` status and 0% translated:
  > Chip on ProjectCard: "Ready to translate →"
- A project with 100% translated segments:
  > Chip on ProjectCard: "Translation complete — export?"
- A project where a file is still processing:
  > Chip: "Processing… (spinning indicator)"

**Sidebar navigation:**
```
[Logo / App name]
─────────────────
Dashboard          ← active
─────────────────
TM Library
Glossary
─────────────────
Settings
```

---

## Screen 4: New Project Wizard

**URL:** `/projects/create`
**Layout:** AppLayout with `WizardLayout` inside main content
**Inertia page:** `Pages/Projects/Create.tsx`

**Purpose:** Guide the user through creating a project step by step. No overwhelming form.

### Step 1 of 3 — Project Basics

```
Heading: "Create a project"
Sub: "Step 1 of 3 — Project details"

Fields:
  - Project name (required, max 255)
  - Source language (searchable select: "English (en-US)", "Arabic (ar)", etc.)
  - Target language (same select, excludes source)
  - Description (optional textarea)

[Cancel]                          [Next →]
```

**Validation:** name required, source ≠ target language.

### Step 2 of 3 — Translation Memory

```
Heading: "Translation Memory"
Sub: "Step 2 of 3 — TM settings"

Body text:
  "Translations you confirm are saved automatically and suggested
   as matches in future projects. Both options are on by default."

  ─── Project TM ───────────────────────────────────────────
  [✓] Create a project TM for this project  (always checked, cannot uncheck)
      "Translations confirmed in this project are saved here."
      [Import existing TMX file] (optional, expands a file picker)

  ─── Global TM ────────────────────────────────────────────
  [✓] Also use global TM  (pre-checked — D-S2)
      "Matches from all your projects appear in the TM panel.
       Confirmed translations are saved to both TMs."
      (User can uncheck to disable global TM for this project)

[← Back]                          [Next →]
```

**Note:** If the user unchecks "use global TM", the `projects.use_global_tm` column is set to `false`. This can be re-enabled later from project settings.

### Step 3 of 3 — Upload Files

```
Heading: "Upload your files"
Sub: "Step 3 of 3 — Add the files you want to translate"

  Drag-and-drop zone:
    "Drop files here, or click to browse"
    "Supported: DOCX, PPTX, XLSX, HTML, TXT, PO, XLIFF, XML"
    "Max 50 MB per file"

  File list (as files are added):
    [filename.docx] [DOCX] [123 KB] [×]
    [report.pptx]   [PPTX] [4.2 MB] [×]

  MT pre-fill (D-S3: opt-in, collapsed by default):
    ▶ "Auto-fill untranslated segments with machine translation"
       "Off by default. Requires a DeepL or Google API key in Settings."
       "Tip: You can save your preferred settings as a project template (coming in V2)."
       [Toggle: Off / On]   ← default Off

[← Back]                   [Create project →]
```

**After submit:**
- Creates `Project` record
- Creates `TranslationMemory` record (if not "No TM")
- Uploads files and dispatches `ProcessUploadedFile` jobs
- Redirects to `/projects/{id}` (project overview)

---

## Screen 5: Project Overview

**URL:** `/projects/{id}`
**Layout:** AppLayout
**Inertia page:** `Pages/Projects/Show.tsx`

**Purpose:** Show all files in a project with their processing status and translation progress. Primary entry point to the editor.

```
Breadcrumb: Dashboard > [Project Name]

Project header:
  [Project Name]
  EN → UR  •  Active  •  Created Jan 12, 2026
  [⚙ Settings]  [Archive]

─────────────────────────────────────────────
Next-step banner (conditional):
  [IF any file is processing]
    ⏳ "Preparing your files… this usually takes under a minute."
    [auto-refreshes via polling every 3s]

  [IF all files ready, 0% translated]
    ▶ "Your files are ready. Click a file to start translating."

  [IF all segments translated, QA not yet run]
    ✓ "All segments translated. Run QA to check for issues before exporting."
    [Run QA on all files]

  [IF QA ran, errors found]
    ⚠ "QA found 12 errors across 2 files. Review before exporting."

  [IF QA ran, no errors OR user dismissed QA banner]
    ✓ "Looking good — ready to export."
─────────────────────────────────────────────

Files section:
  Heading: "Files (3)"          [+ Upload file]

  FileList table:
  ┌──────────────────┬────────┬───────────┬──────────────────┬──────────┬─────────────┐
  │ File             │ Format │ Words     │ Progress         │ Status   │ Actions     │
  ├──────────────────┼────────┼───────────┼──────────────────┼──────────┼─────────────┤
  │ contract.docx    │ DOCX   │ 4,231 w   │ ████░░░░ 45%     │ Ready    │ [Translate] │
  │                  │        │           │ 1,904 / 4,231    │          │ [Export]    │
  ├──────────────────┼────────┼───────────┼──────────────────┼──────────┼─────────────┤
  │ slides.pptx      │ PPTX   │ 892 w     │ ░░░░░░░░  0%     │ Ready    │ [Translate] │
  ├──────────────────┼────────┼───────────┼──────────────────┼──────────┼─────────────┤
  │ report.xlsx      │ XLSX   │ —         │ ⏳ Processing…   │ Processing│ —          │
  └──────────────────┴────────┴───────────┴──────────────────┴──────────┴─────────────┘

─────────────────────────────────────────────

Translation Memory section:
  [IF project TM exists]
    TM: "Project TM (EN → UR)"  •  1,204 entries
    [Search TM]  [Import TMX]  [Export TMX]

  [IF no project TM]
    Empty state:
      "No translation memory for this project."
      "Translations you confirm are saved automatically once you add a TM."
      [Add TM]

─────────────────────────────────────────────

Glossary section:
  [Similar structure to TM section]
```

---

## Screen 6: Translation Editor

**URL:** `/projects/{id}/files/{fileId}/editor`
**Layout:** `EditorLayout` (full-screen — no sidebar)
**Inertia page:** `Pages/Editor/Index.tsx`

**This screen has its own dedicated specification document: `05-editor-spec.md`.** The summary here is for navigation context only.

```
Top bar:
  [← Project Name]  contract.docx  •  EN → UR
  Progress: 1,904 / 4,231 words (45%)  ████░░░░
  [QA: 3 errors ⚠]  [Export ↓]

Main content (3-panel):
  ┌────────────────────────────────┬─────────────────────┐
  │  Segment table                 │  TM / MT / QA panel │
  │  (source | target rows)        │  (collapsible)      │
  │                                │                     │
  │  Row 1: [●] source | [target▌] │  TM Matches         │
  │  Row 2: [●] source | target    │  95% match...       │
  │  Row 3: [○] source | ——        │  82% match...       │
  │  ...                           │                     │
  └────────────────────────────────┴─────────────────────┘

Status bar:
  Seg 42 / 312  •  Auto-saved  •  Ctrl+? for shortcuts
```

---

## Screen 7: TM Manager (Project-level)

**URL:** `/projects/{id}/tm`
**Layout:** AppLayout
**Inertia page:** `Pages/Tm/Index.tsx`

```
Breadcrumb: Dashboard > [Project] > Translation Memory

Heading: "Translation Memory — EN → UR"
Sub: "1,204 entries  •  Last updated 2 hours ago"

Actions bar:
  [Import TMX]  [Export TMX]  [Clear all...]

Concordance search:
  [Search source text…]              [Search]
  Results table:
  ┌───────────────────────────┬───────────────────────────┬───────────┐
  │ Source                    │ Target                    │ Actions   │
  ├───────────────────────────┼───────────────────────────┼───────────┤
  │ The contract is binding…  │ معاہدہ پابند ہے…          │ [Delete]  │
  └───────────────────────────┴───────────────────────────┴───────────┘

[IF empty AND no search]
  Empty state:
    "No translation memory entries yet."
    "Entries are added automatically when you confirm translations,
     or you can import a TMX file."
    [Import TMX]
```

---

## Screen 8: Glossary Manager (Project-level)

**URL:** `/projects/{id}/glossary`
**Layout:** AppLayout
**Inertia page:** `Pages/Glossary/Index.tsx`

```
Breadcrumb: Dashboard > [Project] > Glossary

Heading: "Glossary — EN → UR"
Sub: "342 terms"

Actions bar:
  [Import TBX]  [Export TBX]  [+ Add term]

Search + filter:
  [Search terms…]   Filter: [All] [A–Z]

Term table:
┌──────────────────┬──────────────────┬───────────┬───────────┐
│ Source term      │ Target term      │ Domain    │ Actions   │
├──────────────────┼──────────────────┼───────────┼───────────┤
│ binding          │ پابند            │ Legal     │ [Edit][×] │
│ contract         │ معاہدہ           │ Legal     │ [Edit][×] │
└──────────────────┴──────────────────┴───────────┴───────────┘

[+ Add term] opens inline row or modal:
  Source: [________]  Target: [________]  Domain: [________]  [Save]
```

---

## Screen 9: Global TM Manager

**URL:** `/tm`
**Layout:** AppLayout
**Inertia page:** `Pages/Tm/Global.tsx`

Identical to Screen 7 but scoped to the global TM (shared across all projects). Shows a note:
> "This TM is shared across all projects. Entries are added when you confirm translations in any project that uses the global TM."

---

## Screen 10: Global Glossary Manager

**URL:** `/glossary`
**Layout:** AppLayout
Identical to Screen 8 but scoped to the global glossary.

---

## Screen 11: Settings

**URL:** `/settings`
**Layout:** AppLayout
**Inertia page:** `Pages/Settings/Index.tsx`

```
Heading: "Settings"

Tab navigation:
  [Profile]  [Machine Translation]  [QA Defaults]

──── Profile tab ────
  Name:     [________]
  Email:    [________]
  Password: [Change password...]
  UI Language: [English ▼]
  [Save changes]

──── Machine Translation tab ────
  Heading: "MT Providers"
  Body: "API keys are stored encrypted. They are never shared."

  DeepL:
    API Key: [•••••••••••••••] [Show] [Test]
    Status: ✓ Connected  (or ✗ Invalid key)
    [Save]  [Remove]

  Google Translate:
    API Key: [•••••••••••••••] [Show] [Test]
    Status: Not configured
    [Save]

  Default provider: [DeepL ▼]
  Auto-request MT in editor: [Toggle: On]

  [IF no keys configured]
    Banner: "No MT provider configured. Add a DeepL or Google API key
             to enable machine translation suggestions in the editor."

──── QA Defaults tab ────
  "These settings apply to new projects. You can override them per project."

  Checks:
    [✓] Tag consistency
    [✓] Length ratio     Max ratio: [2.5]
    [✓] Trailing spaces
    [✓] Double spaces
    [✓] Terminology consistency
    [✓] Number consistency

  [Save defaults]
```

---

## Empty States Summary

Every empty state in the studio follows the same pattern: icon + heading + short explanation + single CTA. No dead ends.

| Screen | Empty state heading | CTA |
|---|---|---|
| Dashboard, no projects | "No projects yet" | "Create project →" |
| Project overview, no files | "No files uploaded" | "Upload a file" |
| Project overview, file processing | "Preparing your files…" | (auto-refresh, no CTA) |
| TM manager, no entries | "No translation memory yet" | "Import TMX" |
| Glossary manager, no terms | "No glossary terms yet" | "Import TBX" |
| Editor, no TM matches | "No matches foun
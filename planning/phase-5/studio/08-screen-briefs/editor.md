# OpenCAT — Screen Brief: Translation Editor

**Document type:** UI/UX mockup brief for Claude Design
**Screen:** Translation Editor
**URL:** `/projects/{id}/files/{fileId}/editor`
**Layout:** EditorLayout (full-screen, no sidebar)
**Priority:** 1 of 4 (most complex screen)

Read `07-design-brief.md` first for color tokens, typography, and component patterns.

---

## Purpose

The translation editor is the core of OpenCAT. A translator opens a file and works through segments one at a time: reading the source, typing the target, and confirming each segment. The right-side panel shows TM matches, MT suggestions, and QA issues. This screen is used for hours at a stretch — density and keyboard ergonomics matter more than visual flair.

---

## Layout Skeleton

```
┌──────────────────────────────────────────────────────────────────┐
│  TOP BAR  (56px, full-width, bg-white, border-bottom)            │
├──────────────────────────────────────────────────────────────────┤
│                                        │                          │
│  SEGMENT TABLE                         │  SIDE PANEL (380px)      │
│  (flex-1, scrollable)                  │  (collapsible)           │
│                                        │                          │
│                                        │                          │
│                                        │                          │
│                                        │                          │
├──────────────────────────────────────────────────────────────────┤
│  STATUS BAR  (32px, full-width, bg-slate-50, border-top)         │
└──────────────────────────────────────────────────────────────────┘
```

Splitter between table and side panel: draggable 4px divider (optional in mockup — just show the two-panel layout at 380px side panel).

---

## Zone 1: Top Bar

**Height:** 56px
**Background:** `white`
**Border-bottom:** `1px solid slate-200`

```
┌───────────────────────────────────────────────────────────────────┐
│  [← My Project]  contract.docx  ·  EN → UR     [Progress]  [QA]  [Export ↓]  │
└───────────────────────────────────────────────────────────────────┘
```

**Left section:**
- Back button: `ChevronLeft` icon + "My Project" text link — `text-slate-500 hover:text-slate-900`
- Separator: `·` in `text-slate-300`
- File name: `contract.docx` — `text-slate-900 font-medium text-sm`
- Separator: `·`
- Language pair: `EN → UR` — `text-slate-500 text-sm`

**Center section (progress):**
- Text: `1,904 / 4,231 words (45%)` — `text-slate-700 text-sm`
- Progress bar inline: 120px wide, 6px height, `bg-indigo-500` fill on `bg-slate-200` track

**Right section:**
- `QA` button with warning badge: `ShieldCheck` icon + "QA" label + orange badge `3` — `text-amber-600`
  - If no issues: `text-slate-500`
- `Export ↓` button: secondary button style (`bg-white border border-slate-300`) with `Download` icon

---

## Zone 2: Segment Table

**Background:** `bg-white`
**Overflow:** vertical scroll only (horizontal fixed)

### Column Layout

```
┌──┬───┬──────────────────────────────┬──────────────────────────────┬───────┐
│  │ # │  Source                       │  Target                       │  TM%  │
├──┼───┼──────────────────────────────┼──────────────────────────────┼───────┤
│● │ 1 │  This Agreement is entered…  │  یہ معاہدہ اس تاریخ سے…      │  95%  │
│○ │ 2 │  The parties agree to…       │  [empty — cursor here ▌]     │       │
│● │ 3 │  Payment shall be due…       │  ادائیگی واجب الادا ہوگی…    │ 100%  │
│⚠ │ 4 │  See clause {1}3.2{/1}       │  دیکھیں شق {1}3.2{/1}        │  82%  │
└──┴───┴──────────────────────────────┴──────────────────────────────┴───────┘
```

**Column widths:**
- Status dot: 36px (fixed)
- Number (#): 48px (fixed, `text-right text-slate-400 text-xs`)
- Source: flex-1 (grows)
- Target: flex-1 (grows, same width as source)
- TM%: 60px (fixed)

### Status Dot Column

Each row's leftmost cell shows a colored dot (16px circle):
- ○ Untranslated: hollow circle, `border-2 border-slate-300`
- ● Draft: `bg-amber-400`
- ● Translated: `bg-green-500`
- ● Reviewed: `bg-violet-500`
- ● Approved: `bg-green-700` with tiny `✓` inside
- ● Rejected: `bg-red-500`
- ⚠ QA error: `bg-red-500` dot + small `!` tooltip indicator

### Row States

**Default (unselected):**
- `bg-white`
- Border-bottom: `1px solid slate-100`
- Hover: `bg-slate-50`

**Selected (active segment):**
- `bg-indigo-50` (entire row)
- Left border: `3px solid indigo-500`
- Target cell has visible cursor

**100% TM match (unconfirmed):**
- Target cell: faint `bg-amber-50` tint to indicate auto-filled content not yet confirmed

### Source Cell

- `text-sm text-slate-800`
- `px-3 py-2`
- Non-editable
- `dir` set from the project's source language — `dir="ltr"` for Latin-script languages, `dir="rtl"` for Arabic, Urdu, Persian, Hebrew. Not hardcoded to LTR.

**Inline tags within source:** Rendered as tag chips.
Tag chip appearance:
- `{1}` opening: `bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-xs font-mono px-1.5 py-0`
- `{/1}` closing: same colors
- `{2/}` self-closing: `bg-violet-100 text-violet-700 border border-violet-200 rounded text-xs font-mono px-1.5 py-0`
- Chips are inline with surrounding text, not block elements

### Target Cell

- `text-sm text-slate-900`
- `px-3 py-2`
- **Editable** (contenteditable)
- `dir` set from the project's target language — `dir="rtl"` for Arabic, Urdu, Persian, Hebrew; `dir="ltr"` otherwise
- `text-align: right` when `dir="rtl"`
- When empty: placeholder text `Type translation…` in `text-slate-400` (placeholder also respects `dir`)
- Focus ring: `ring-2 ring-teal-500` (inset, on the cell not the row)

**RTL examples to show in mockup:**
- LTR → RTL (EN → UR): Segment #1 target `یہ معاہدہ اس تاریخ سے نافذ العمل ہے…` — right-aligned, flows RTL
- RTL → LTR (AR → EN): Source cell shows `هذه الاتفاقية مبرمة…` right-aligned; target cell shows English left-aligned

### TM% Column

- `text-xs font-medium text-right pr-3`
- 100%: `text-green-600`
- 95–99%: `text-emerald-600`
- 75–94%: `text-amber-600`
- Empty if no match

---

## Zone 3: Side Panel

**Width:** 380px
**Background:** `bg-slate-50`
**Border-left:** `1px solid slate-200`

### Tab Bar

```
┌────────────────────────────────────┐
│  [TM]  [MT]  [QA]  [Glossary]     │  ← tabs, 36px height
└────────────────────────────────────┘
```

Tabs: `text-sm font-medium`. Active tab: `text-indigo-600 border-b-2 border-indigo-500`. Inactive: `text-slate-500 hover:text-slate-700`.

### TM Panel (active tab)

**Heading:** "TM Matches" `text-xs font-semibold uppercase tracking-wide text-slate-400 px-4 pt-4 pb-2`

**Match card (repeat for each match, max 4):**

```
┌─────────────────────────────────────┐
│  [95%]  project TM                  │
│  ─────────────────────────────────  │
│  Source: This Agreement is entered  │  ← word-diff highlighted
│          into as of the date…       │
│  Target: یہ معاہدہ اس تاریخ سے     │  ← RTL
│          نافذ العمل ہے              │
│                                     │
│  [Insert ↵]                        │
└─────────────────────────────────────┘
```

Match card styles:
- `bg-white border border-slate-200 rounded-lg p-3 mb-2 mx-3`
- Header row: match % badge + TM name
- % badge: `bg-green-100 text-green-700` for 100%, `bg-amber-100 text-amber-700` for 75–99%
- TM name: `text-xs text-slate-400`
- Source text: `text-sm text-slate-700` with **diff words highlighted**: words present in current source but changed shown in `bg-amber-100 text-amber-800 rounded px-0.5`
- Target text: `text-sm text-slate-900`, `dir="rtl"` for RTL languages
- "Insert" button: small, ghost, `text-indigo-600 hover:bg-indigo-50 text-xs`

**Empty state:** "No TM matches for this segment." centered, `text-slate-400 text-sm`

### MT Panel

Similar card structure. One card per MT provider response.

```
┌─────────────────────────────────────┐
│  DeepL  •  Machine Translation      │
│  ─────────────────────────────────  │
│  یہ معاہدہ ان تاریخوں کے درمیان    │
│  طے کیا گیا ہے…                   │
│                                     │
│  [Insert ↵]                        │
└─────────────────────────────────────┘
```

MT card: same structure as TM card but no % badge, shows provider name instead.
Note below MT card (if Google Translate is used): `text-xs text-amber-600` — "Google Translate strips formatting tags. Review tags before confirming."

### QA Panel

List of QA issues for the current segment (or all segments if "Run all" was clicked).

```
┌─────────────────────────────────────┐
│  ⚠  Missing closing tag {/1}        │  ← warning
│     Segment 4                       │
│                                     │
│  ⚠  Length ratio: 1.8× (max 2.5×)  │
│     Segment 12                      │
│                                     │
│  ●  No issues in current segment    │  ← info (green)
└─────────────────────────────────────┘
```

Issue row: `bg-white border-l-4 border-amber-400 rounded p-2 mb-2 mx-3`
Error issue: `border-red-400`
Text: `text-sm text-slate-800`
Sub-text (segment #): `text-xs text-slate-500`

### Glossary Panel

Shows glossary terms found in the current source segment.

```
┌────────────────────┬────────────────────┐
│  Source term       │  Target term        │
├────────────────────┼────────────────────┤
│  Agreement         │  معاہدہ            │
│  binding           │  پابند             │
└────────────────────┴────────────────────┘
```

Table: `text-sm`. Source: `text-slate-700`. Target: `text-slate-900 font-medium dir="rtl"`.
Empty: "No glossary terms found in this segment." `text-slate-400 text-sm`

---

## Zone 4: Status Bar

**Height:** 32px
**Background:** `bg-slate-50`
**Border-top:** `1px solid slate-200`

```
┌──────────────────────────────────────────────────────────────────┐
│  Seg 2 / 312  ·  45 words  ·  Auto-saved  ·  Ctrl+? for shortcuts │
└──────────────────────────────────────────────────────────────────┘
```

All text: `text-xs text-slate-500`
"Auto-saved" shows `CheckCircle` icon (12px) in `text-green-500` + "Auto-saved" when last save was < 5s ago.
"Saving…" shows `Loader2` spin (12px) in `text-slate-400` while PATCH request is in flight.

---

## Keyboard Shortcut Overlay (modal)

Triggered by `Ctrl+?`. A full-screen overlay dim + centered dialog.

```
┌────────────────────────────────────────┐
│  Keyboard Shortcuts          [×]       │
├────────────────────────────────────────┤
│  Navigation                            │
│  Tab / Shift+Tab    Next / prev segment│
│  Alt+↓ / Alt+↑     Jump 10 segments   │
│                                        │
│  Segment Actions                       │
│  Ctrl+Enter         Confirm + advance  │
│  Ctrl+Shift+Enter   Confirm (stay)     │
│  Ctrl+Space         Copy source        │
│                                        │
│  TM / MT                               │
│  Ctrl+M             Insert top match   │
│  Ctrl+1 … Ctrl+4    Insert match 1–4  │
│                                        │
│  Status                                │
│  F1   Untranslated  F2  Draft          │
│  F3   Translated    F4  Reviewed       │
│                                        │
│  Other                                 │
│  Ctrl+Z / Ctrl+Y    Undo / Redo        │
│  Ctrl+F             Find in file       │
│  Ctrl+?             Toggle this dialog │
└────────────────────────────────────────┘
```

Dialog: `bg-white rounded-xl shadow-xl max-w-sm w-full p-6`
Section headings: `text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2 mt-4`
Shortcut rows: two-column, key badge on left + description on right
Key badge: `bg-slate-100 text-slate-700 text-xs font-mono rounded px-1.5 py-0.5`

---

## States to Render in Mockup

**Primary mockup — LTR → RTL (EN → UR):**
- Segment #2 selected (teal-50 row, left teal border)
- Segment #1 translated (green dot)
- Segment #3 translated (green dot)
- Segment #4 has QA warning (amber dot + indicator)
- Source cell: left-aligned English text
- Target cell: right-aligned Urdu text (`dir="rtl"`)
- TM panel active showing 2 match cards (95%, 82%)
- Status bar: "Seg 2 / 312 · Auto-saved"

**Secondary mockup — RTL → LTR (AR → EN, back-translation):**
- Same layout, different project language pair
- Source cell: right-aligned Arabic text (`dir="rtl"`)
- Target cell: left-aligned English text (`dir="ltr"`)
- Demonstrates that `dir` is per-cell, not per-project-direction

**Tertiary mockup — QA panel:**
- LTR → RTL layout, QA tab active in side panel
- Show 2–3 QA issue rows

---

## Do Not Include

- No decorative illustrations or abstract shapes
- No gradients (except progress bar fill — solid color only)
- No drop shadows on the segment table rows (keep it flat)
- No rounded corners on the segment table itself (full-width table, no card wrapper)
- Do not center-align source or target text (always left-align source, right-align RTL target)

# OpenCAT — Translation Editor Specification

**Version:** 1.1 (Phase 5 Track D — updated from mockup JSX)
**Screen:** `/projects/{id}/files/{fileId}/editor`
**Component:** `Pages/Editor/Index.tsx`

The translation editor is the most critical screen in the studio. Every design decision here directly affects translator productivity.

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  EDITOR TOP BAR                                                      │
├───────────────────────────────────────────┬─────────────────────────┤
│                                           │                         │
│  SEGMENT TABLE                            │  SIDE PANEL             │
│  (scrollable, takes remaining height)     │  (collapsible, 320px)   │
│                                           │                         │
│                                           │                         │
├───────────────────────────────────────────┴─────────────────────────┤
│  STATUS BAR                                                          │
└─────────────────────────────────────────────────────────────────────┘
```

### Top Bar

```
[← project name]  filename.docx  EN→UR  ·  1,904/4,231 words  ████░  45%  ·  [TM] [TB] [MT]  ·  [QA ⚠3]  [Export ↓]
```

Left section (left-aligned, flex row):
- **Back link** — `ChevL` icon + project name, returns to project overview
- **File name** — 13.5px, `stone-900`, weight 600
- **Language pair badge** — `<Badge tone="teal">EN → UR</Badge>`

Center section (flex 1, right-aligned):
- **Word progress** — "{done} / {total} words", tabular-nums, 12.5px, `stone-700`
- **Progress bar** — `<Progress value={pct}/>`, width 120px
- **Percentage** — "45%", 12.5px, `stone-700`, weight 600, min-width 32px

Right section (after vertical divider):
- **Resource indicators** — three pills: TM (`teal`), TB (`violet`), MT (`sky`). See §29 of component reference for exact styling.
- **QA button** — `<Btn variant="secondary" size="sm" icon={I.Shield}>QA <span>{count}</span></Btn>`. Count badge: `amber-100` bg, `amber-700` text, padding `1px 6px`, border-radius 999, font 11px weight 600.
- **Export button** — `<Btn variant="secondary" size="sm" icon={I.Download} iconR={I.ChevD}>Export</Btn>`

### Status Bar (bottom)

32px, `stone-50` bg, `stone-200` top border, padding `0 16px`, font 11.5px, `stone-500`.

**Left side** (items separated by `·`):
1. `Seg **{NNN}** / {total}` — current segment number bold `stone-700`, zero-padded to 3 digits
2. `{n} words` — source word count of active segment
3. **Chars display** — current segment char count vs limit, styled with `charTone()` (green/amber/red pill). Shows "+{n} over" when over, "{n} left" when near or under.
4. `Check icon + "Auto-saved"` — green-500 check, updates to "Saving…" while save is in flight

**Right side** (when `charLimit` is set on the project):
- Legend: green square "under" · amber square "≥90%" · red square "over {limit}"
- Then `·` separator
- `Press KeyBadge(Ctrl) KeyBadge(?) for shortcuts`

When no `charLimit`: right side shows only the shortcut hint.

---

## Segment Table

### Column Layout

7-column CSS grid. **Exact grid template:** `'36px 48px 1fr 1fr 60px 72px 96px'`

```
┌──────┬──────┬──────────────────┬──────────────────┬──────┬───────┬─────────┐
│  ●   │  #   │ SOURCE           │ TARGET           │  TM  │ CHARS │ ACTIONS │
├──────┼──────┼──────────────────┼──────────────────┼──────┼───────┼─────────┤
│  ●   │ 001  │ The {1}contract  │ معاہدہ {1}پابند  │ 100% │ 42/120│ ✓ 🔒 🔖 💬│
│  ○   │ 002  │ Payment is due…  │ [▌ cursor]       │  95% │  —    │ ✓ 🔒 🔖 💬│
│  ○   │ 003  │ Termination…     │                  │      │  —    │         │
└──────┴──────┴──────────────────┴──────────────────┴──────┴───────┴─────────┘
```

**Columns:**

| Col | Grid width | Content |
|---|---|---|
| Status | 36px | `<Dot status={s.status}/>`, centered |
| Number | 48px | Segment number zero-padded to 3 digits (`padStart(3,'0')`), right-aligned, `stone-400`, 11.5px, tabular-nums |
| Source | `1fr` | Source text with tag chips. `dir` from project source language. Read-only. |
| Target | `1fr` | Target text. `dir` from project target language. Active: contenteditable with focus ring. |
| TM% | 60px | TM match percentage. Right-aligned. Color-coded by value (see §26 of component reference). Hidden when null. |
| Chars | 72px | Character count pill. Green/amber/red from `charTone()`. `—` for empty target. |
| Actions | 96px | 4 `RowAction` buttons: Confirm, Lock, Bookmark, Comment. |

**Table header row:** `stone-50` bg, `stone-200` borders top and bottom, 32px height. Font: 10.5px uppercase, letter-spacing 0.6, `stone-500`, weight 700. Column labels: `#`, `Source · {SRC}`, `Target · {TGT}`, `TM`, `Chars` (with title tooltip showing limit), `Actions`.

### Status Dot Colours

| Colour | Status | Meaning |
|---|---|---|
| ⬜ Grey | `untranslated` | No translation entered |
| 🟡 Amber | `draft` | Text entered but not confirmed (MT or partial) |
| 🟢 Green | `translated` | Translator-confirmed |
| 🔵 Blue | `reviewed` | Reviewed by second person (V2) |
| ✅ Dark green | `approved` | Final, locked |
| 🔴 Red | `rejected` | Sent back for correction (V2) |

### Row States

**Inactive row** — target text shown as plain text (non-editable). Clicking the row activates it.

**Active row** — target text becomes a `contenteditable` div (the `TargetEditor` component). The row gets a visible focus ring. Source and target cells expand vertically to show full text.

**Active row layout (expanded):**
```
┌────────────────────────────────────────────────────────────────────┐
│ 2 ○ │ Payment is due within [1/] 30 days.  │ ادائیگی [1/] 30 دنوں ▌│  MT │
│     │                                       │ کے اندر ہونی چاہیے۔  │     │
└────────────────────────────────────────────────────────────────────┘
                    [Ctrl+Enter: Confirm]  [Esc: Cancel]
```

- `[Ctrl+Enter: Confirm]` and `[Esc: Cancel]` appear as small hints below the active row.
- The target editor auto-expands vertically with content.

---

## Tag Display (TagChip component)

Tags from the D28 placeholder format are rendered as coloured inline chips — never as raw `{1}` text.

### Chip appearance

```
[b]   ← opening tag, blue pill
[/b]  ← closing tag, blue pill (slightly lighter)
[br/] ← self-closing tag, purple pill
```

**Chip properties:**
- `displayText` from the `source_tags` / `target_tags` tag map (e.g., `"b"`, `"/b"`, `"br/"`)
- Non-editable: the chip content cannot be typed over
- Draggable within the target editor
- The chip `data-tag-id` attribute links it to the source tag map

**Source tags** — always grey (read-only visual reference for the translator).
**Target tags** — coloured (blue/purple) when correctly placed; red outline when a required tag is missing.

### Tag validation (real-time, client-side)
After every target text change:
- Compare source tag IDs against target tag IDs
- If a source tag ID is missing from the target: chip in source column gets a red pulsing outline, status bar shows "⚠ Tag missing: {1}"
- If an extra tag ID exists in target (not in source): chip shows with red background
- These are visual warnings only — saving is not blocked (the QA check will catch it)

### Tag insertion

Three methods to insert a tag into the target:

1. **Keyboard:** `F1`–`F9` inserts the Nth tag from the source in order (e.g., `F1` inserts the first source tag at cursor position)
2. **Click source chip:** clicking a source tag chip inserts a copy at cursor position in the active target editor
3. **Drag:** drag a source tag chip into the target editor

---

## Target Editor (TargetEditor component)

The target text input is a `contenteditable` `div`, not a `<textarea>`, because it must render tag chips inline with text.

### Behaviour

- **Cursor placement** — standard contenteditable cursor. Arrow keys, Home/End work normally.
- **Tag chips are atomic** — the cursor cannot enter a chip. Arrow key at a chip boundary skips over the chip in one keypress (using a custom `SelectionHelper`).
- **Paste** — strips HTML, preserves plain text only. Tag chips cannot be pasted; they must be inserted via the methods above.
- **RTL support** — when target language is RTL (`ar`, `ur`, `he`, `fa`): the `dir="rtl"` attribute is set on the `contenteditable` div. The cursor, caret, and selection behave correctly in RTL mode. Tag chips still flow inline with text.
- **Undo/Redo** — `Ctrl+Z` / `Ctrl+Y` within the target editor (browser native undo stack per contenteditable). This does NOT undo a segment status change — status is only changed on explicit Ctrl+Enter.
- **Composition events** — `compositionstart` / `compositionend` are handled to avoid auto-save firing during IME composition (Hindi/Urdu input methods).

### Auto-save

```
On keystroke (with composition guard):
    → Start 500ms debounce timer
    → Cancel any pending timer

On debounce fire OR on blur (leaving the segment):
    → Serialise target text: extract tag chips → rebuild {N}/{/N}/{N/} placeholders
    → PATCH /api/editor/segments/{id}
         body: { target_text: "...", target_tags: [...], status: "draft" }
    → On success: update local React state, show "Saved" in status bar
    → On failure: show "⚠ Save failed — retrying" toast, retry once after 2s

On Ctrl+Enter:
    → Same serialisation
    → PATCH with status: "translated"
    → On success: advance cursor to next untranslated segment (Tab behaviour)
```

**Status assignment on save:**
- Auto-save (blur / debounce) → always saves with `status: "draft"` (does not promote to translated)
- `Ctrl+Enter` → saves with `status: "translated"`, advances to next untranslated segment

---

## Keyboard Shortcuts

### Navigation

| Shortcut | Action |
|---|---|
| `Tab` | Next segment (wraps to first if at last) |
| `Shift+Tab` | Previous segment |
| `Ctrl+↓` | Next untranslated segment |
| `Ctrl+↑` | Previous untranslated segment |
| `Ctrl+G` | Jump to segment number (opens input popup) |
| `Esc` | Cancel edit, restore previous target text |

### Translation

| Shortcut | Action |
|---|---|
| `Ctrl+Enter` | Confirm segment (→ Translated) and advance |
| `Ctrl+Shift+Enter` | Confirm segment without advancing |
| `Ctrl+M` | Apply MT suggestion (inserts into target, status → Draft) |
| `Ctrl+1` | Apply TM match #1 |
| `Ctrl+2` | Apply TM match #2 |
| `Ctrl+3` | Apply TM match #3 |
| `Ctrl+4` | Apply TM match #4 |
| `Ctrl+Space` | Copy source text to target (useful as starting point) |

### Tags

| Shortcut | Action |
|---|---|
| `F1` | Insert source tag #1 at cursor |
| `F2` | Insert source tag #2 at cursor |
| … | … |
| `F9` | Insert source tag #9 at cursor |

### Panels

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+M` | Toggle TM panel tab |
| `Ctrl+Shift+T` | Toggle MT panel tab |
| `Ctrl+Shift+Q` | Toggle QA panel tab |
| `Ctrl+Shift+G` | Toggle Glossary panel tab |
| `Ctrl+Shift+P` | Collapse/expand side panel entirely |
| `Ctrl+?` | Show keyboard shortcut overlay |

### Editor-level

| Shortcut | Action |
|---|---|
| `Ctrl+F` | Open segment filter (same as Filter dropdown in top bar) |
| `Ctrl+Z` | Undo (within current segment target text) |
| `Ctrl+Y` | Redo (within current segment target text) |

---

## Side Panel

The side panel has four tabs: **TM**, **MT**, **QA**, **Glossary**. It is collapsible (chevron button on its left edge). **Default width: 380px.** Min width: 280px. Collapsing is remembered per session.

The active tab updates automatically when a segment is entered:
- TM tab updates with matches for the active segment
- Glossary tab updates with term hits in the active source text

### TM Tab

```
TM Matches (4)
──────────────
[95%] [TM]
  Source: The [b]contract[/b] is legally binding.
          ─────────────────────────  ← diff: "legally" is new word (highlighted)
  Target: معاہدہ [b]قانونی طور پر پابند[/b] ہے۔
  [Apply  Ctrl+1]

[82%] [TM]
  Source: This agreement is binding on all parties.
  Target: یہ معاہدہ تمام فریقین پر پابند ہے۔
  [Apply  Ctrl+2]

[No more matches]

──────────────
Concordance [Search TM…]
```

**Match display:**
- Match percentage badge (colour: green ≥ 95%, yellow 75–94%, grey < 75%)
- Origin badge: `TM` (human), `Exact` (100%), `MT` (machine)
- Source text with diff highlights (words changed vs. source are underlined)
- Target text (applying will insert into editor)
- `[Apply Ctrl+N]` button

**Diff highlighting:**
- Words in the TM source that differ from the active source segment are `<mark>` highlighted in orange
- Matching words are plain text
- This uses a word-level diff (not character-level) for readability

### MT Tab

```
Machine Translation
───────────────────
Provider: DeepL

[IF not yet requested]
  [Get MT suggestion  Ctrl+Shift+T]
  or: enable auto-request in Settings

[IF requested, loading]
  ⏳ Requesting…

[IF result available]
  "ادائیگی 30 دنوں کے اندر ہونی چاہیے۔"
  [Apply  Ctrl+M]
  ⚠ Tags not preserved (Google Translate limitation)  ← shown if D18 strip occurred

[IF MT not configured]
  "No MT provider configured."
  [Go to Settings →]

[IF error]
  "⚠ MT request failed: Invalid API key."
  [Retry]
```

**Auto-request:** if `Settings → mt_auto_request = true`, the MT suggestion is fetched automatically when the active segment changes and has no target text. The request is non-blocking — the translator can type immediately while MT loads.

### QA Tab

```
QA Issues — contract.docx
──────────────────────────
[Run QA ▶]   Last run: 5 min ago

Filter: [All ▼]  Showing 12 issues

  [ERROR] Seg 2  — Missing tag: {1}
  [ERROR] Seg 7  — Missing tag: {2/}
  [WARN]  Seg 15 — Length ratio: 3.2× (max 2.5×)
  [WARN]  Seg 23 — Double space in target
  [INFO]  Seg 41 — Terminology: "contract" → "معاہدہ" not used

  [Click any row to jump to that segment]

  ── Summary ──
  2 errors  ·  2 warnings  ·  1 info
```

- **Run QA** dispatches `RunQaOnFile` job; result appears via polling
- Issues are sorted: errors first, then warnings, then info
- Clicking an issue row sets the segment table's active row to that segment number
- QA results are cached — a badge in the top bar shows the count until the next run

### Glossary Tab

```
Glossary Matches
──────────────────
Terms found in this segment (2):

  contract
  → معاہدہ  [Legal]
  → معاہدہ نامہ  [Formal]   [Copy]

  binding
  → پابند  [Legal]          [Copy]

No terms found?
[Search glossary…]
```

- Terms recognised in the active source segment are listed automatically
- Each term shows source → target mapping with optional domain label
- `[Copy]` inserts the target term at the cursor in the target editor
- `[Search glossary…]` opens a free-text search of the full glossary

---

## Segment Loading Strategy

Segments are **paginated** — the editor does not load all segments at once.

```
Initial load: first 100 segments (page 1)
  → Passed as Inertia prop on page load (server-rendered)

Infinite scroll:
  → As the user scrolls near the bottom, fetch next 100 via
    GET /api/editor/files/{fileId}/segments?page=2&limit=100
  → Prepend/append to virtual list

Active segment TM/MT:
  → TM: GET /api/editor/segments/{id}/tm  (per-segment, on activate)
  → MT: GET /api/editor/segments/{id}/mt  (on demand or auto if enabled)
```

**Virtual list:** Use a windowed list (e.g., `react-virtual` or `@tanstack/virtual`) to render only the visible rows. This prevents DOM bloat on files with thousands of segments.

**Active segment persistence:** The currently active segment number is stored in the URL hash (`#42`) so that refreshing the page or returning from the TM manager restores the position.

---

## RTL Handling

The editor must handle four combinations:

| Source lang | Target lang | Behaviour |
|---|---|---|
| LTR (en) | LTR (de) | Both columns: `dir="ltr"` |
| LTR (en) | RTL (ur, ar) | Source: `dir="ltr"`, Target: `dir="rtl"` |
| RTL (ar) | LTR (en) | Source: `dir="rtl"`, Target: `dir="ltr"` |
| RTL (ar) | RTL (ur) | Both columns: `dir="rtl"` |

The `dir` attribute is set on the column container, not per-row. The active `contenteditable` target editor always uses the target language direction.

**Bidirectional content** (e.g., an English product name inside a Urdu sentence): browsers handle this automatically via the Unicode Bidi Algorithm when `dir="rtl"` is set. No custom logic required.

**Tag chip position in RTL:** In RTL target text, tag chips flow right-to-left along with the text. The chip `F1`/`F2` shortcut inserts at the cursor regardless of direction. This is handled correctly by the contenteditable + DOM insertion.

---

## Filter Bar & Chip Row

The filter area sits directly above the table header, inside the segment table area. It has two rows.

### Filter bar (row 1, 44px)

Grid: `36px 1fr 1fr 70px 72px`

- Column 1: `Filter` icon (14px, `stone-500`)
- Column 2: Source search input — `stone-50` bg, `stone-200` border, `Search` icon, placeholder "Filter source ({src})…"
- Column 3: Target search input — same, "Filter target ({tgt})…"
- Column 4: Column toggle button (26×26, `Columns` icon, `stone-200` border, `border-radius 6`) + "Clear" text button (`teal-600`, 12px, weight 500)
- Column 5: spacer

### Chip row (row 2, auto height)

`stone-50` bg, `stone-200` bottom border, padding `8px 14px`, flex wrap, gap 6.

Left section — "STATUS" label (11px uppercase, tracking 0.5, `stone-500`) followed by status chips:

| Chip | Count | Extras |
|---|---|---|
| All | 312 | active by default |
| Untranslated | 184 | `<Dot status="untranslated" size={8}/>` |
| Draft | 42 | `<Dot status="draft" size={8}/>` |
| Translated | 68 | `<Dot status="translated" size={8}/>` |
| Reviewed | 12 | `<Dot status="reviewed" size={8}/>` |
| Approved | 4 | `<Dot status="approved" size={8}/>` |
| Rejected | 2 | `<Dot status="rejected" size={8}/>` |

Vertical divider (1px `stone-200`, 16px tall) separates status chips from action chips:

| Chip | Extras |
|---|---|
| Confirmed | `CheckSm` icon |
| Unconfirmed | `Pencil` icon |
| Locked | no icon |
| QA flagged | count 3, `Warning` icon, red tone |
| Has TM match | `Database` icon |
| Over char limit | red tone |

"Add filter" button (right-aligned): white bg, `stone-200` border, `border-radius 6`, `Plus` icon (12px), 11.5px, `stone-600`, weight 500.

See `FilterChip` in the component reference (§15) for chip visual states.

---

## Error States in the Editor

| Scenario | UI response |
|---|---|
| Segment save fails (network error) | Red toast: "Save failed — retrying." Auto-retry once. If still fails: "⚠ Offline — changes will sync when reconnected." |
| TM lookup fails | TM tab shows: "Could not load matches — check server." [Retry] |
| MT request fails | MT tab shows error + [Retry]. Does not block editing. |
| QA job fails | QA tab shows: "QA run failed." [Retry] |
| File not found / deleted | Redirect to project overview with error banner. |
| Segment locked (V2 — reviewer locked) | Target editor renders as read-only. Tooltip: "Locked by reviewer." |

---

## Character Limit Feature

The project wizard allows setting an optional character limit per segment. When set, the editor activates char-count feedback throughout.

**`charTone(count, limit)` function:**

| Condition | Pill bg | Pill text | Label |
|---|---|---|---|
| `limit` null, or `count === 0` | transparent | `stone-400` | `ok` |
| `count / limit > 1` | `red-100` | `red-700` | `over` (adds `1px solid red-400` border) |
| `count / limit >= 0.9` | `amber-100` | `amber-700` | `near` |
| otherwise | `green-100` | `green-700` | `under` |

**Chars column display:** `{tgtChars}/{charLimit}` in a pill. Empty target: `—` in `stone-300`.

**Status bar:** Shows current segment char count with the same pill styling, plus contextual text ("5 left" or "+12 over").

**Status bar legend** (right side, only when `charLimit` is set): Three 8×8px colored squares labeled "under", "≥90%", "over {limit}".

---

## Per-Row Actions (RowAction)

Each segment row has 4 icon buttons in the Actions column (96px wide, right-aligned, gap 2).

| Button | Icon | Active color | Inactive |
|---|---|---|---|
| Confirm | `CheckSm` | `green-600` | `stone-300` |
| Lock | `Lock` | `stone-700` | `stone-300` |
| Bookmark | `Bookmark` | `amber-600` | `stone-300` |
| Comment | `Comment` | `teal-600` + count badge | `stone-300` |

Icon size: 13px. Active stroke: 2.4. Inactive stroke: 1.8. Button size: 22×22px.

The Comment button shows a count badge (`teal-600` bg, white text, 9px, positioned `top: -2, right: -2`) when `comments > 0`.

These are toggle actions. Confirm sets `status: 'translated'` (same as `Ctrl+Enter`). Lock prevents further editing. Bookmark is a personal marker. Comment opens the comments panel (side panel).

---

## Component Tree (React)

```
EditorLayout
└── EditorPage (Pages/Editor/Index.tsx)
    ├── EditorTopBar
    │   ├── BackLink
    │   ├── LanguagePairBadge
    │   ├── ProgressSection (word count + Progress bar + %)
    │   ├── ResourceIndicators (TM · TB · MT pills)
    │   ├── QaButton (with count badge)
    │   └── ExportButton
    ├── EditorBody
    │   ├── SegmentTable
    │   │   ├── FilterBar
    │   │   │   ├── SourceSearchInput
    │   │   │   ├── TargetSearchInput
    │   │   │   └── ColumnToggleButton
    │   │   ├── FilterChipRow
    │   │   │   ├── FilterChip × (status group)
    │   │   │   └── FilterChip × (action group)
    │   │   ├── SegmentTableHeader
    │   │   └── SegmentRow × N  (virtual list)
    │   │       ├── StatusDot
    │   │       ├── SegmentNumber (zero-padded)
    │   │       ├── SourceCell (dir from srcLang)
    │   │       │   └── TagChip × M  (read-only)
    │   │       ├── TargetCell (dir from tgtLang)
    │   │       │   └── TargetEditor (if active)
    │   │       │       └── TagChip × M  (interactive)
    │   │       ├── TmPercent
    │   │       ├── CharCountPill
    │   │       └── RowActions
    │   │           ├── ConfirmAction
    │   │           ├── LockAction
    │   │           ├── BookmarkAction
    │   │           └── CommentAction (with count badge)
    │   └── SidePanel (collapsible, 380px default)
    │       ├── PanelTabBar  (TM | MT | QA | Glossary)
    │       ├── TmPanel
    │       │   ├── TmMatchCard × N
    │       │   └── ConcordanceSearch
    │       ├── MtPanel
    │       ├── QaPanel
    │       │   ├── QaRow × N
    │       │   └── ReRunButton
    │       └── GlossaryPanel
    │           └── TermMatch × N
    └── EditorStatusBar
        ├── SegmentPosition
        ├── WordCount
        ├── CharDisplay (charTone styled)
        ├── AutoSaveIndicator
        ├── CharLimitLegend (when charLimit set)
        └── ShortcutHint → ShortcutOverlay (modal, Ctrl+?)
```

---

## State Management

The editor uses **React state + URL hash**, not a global state library (Redux/Zustand). The state is kept local to `EditorPage`:

```typescript
// Core editor state (sketch)
interface EditorState {
  segments: Segment[];          // loaded segments (paginated)
  activeSegmentId: string | null;
  activeSegmentDirty: boolean;  // target text changed since last save
  filter: SegmentFilter;
  tmMatches: TmMatch[];         // for active segment
  mtSuggestion: string | null;  // for active segment
  qaIssues: QaIssue[];          // for current file
  sidePanel: 'tm' | 'mt' | 'qa' | 'glossary';
  sidePanelCollapsed: boolean;
  saving: 'idle' | 'saving' | 'saved' | 'error';
}
```

React `useReducer` is used for the segment list (immutable updates). The `TargetEditor` component manages its own contenteditable state internally and calls `onSave(targetText, targetTags)` on blur/Ctrl+Enter.

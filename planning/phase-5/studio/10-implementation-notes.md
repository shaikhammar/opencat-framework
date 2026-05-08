# 10 — Implementation Notes (Mockup Delta)

**Purpose:** Documents every feature, component, or behaviour introduced in the `08-screen-briefs/` mockup JSX files that was not present or was different in the earlier planning documents (`01` through `07`). Use this as a checklist when building — if something looks new or surprising, it's probably listed here.

The authoritative source for visual details is `09-component-reference.md`. This document explains the *what* and *why*, not the exact pixel values.

---

## 1. Project Wizard — new fields in Step 1

**Added: Character limit per segment (optional)**

The wizard Step 1 now includes two new fields below the source/target language selects:

- **Character limit per segment** — optional numeric input. Default shown in mockup: 120. When set, activates char-count colour coding in the editor (Chars column and status bar).
- **Soft warning threshold** — percentage of the limit at which amber warning appears. Default: 90%.

These fields need a new column pair on the `projects` table: `char_limit_per_segment` (nullable integer) and `char_limit_warning_pct` (integer, default 90).

**Added: RTL info banner**

When target language is detected as RTL (ar, ur, fa, he), Step 1 shows a sky-50/sky-200/sky-700 info banner: "Both {SRC} and {TGT} are supported. {TGT} will render right-to-left in the translation editor."

This banner is conditional and dynamic — it appears only when the selected target language is RTL.

---

## 2. Project Wizard — Step 2: Match Threshold slider

**Added: TM match threshold slider**

Step 2 now includes a "Match thresholds" section below the Project TM and Global TM boxes. It uses an `<input type="range" min="50" max="100">` with the current value displayed in a `teal-50` pill.

This needs a `tm_min_match_pct` column on `projects` (integer, default 75). The editor TM panel should only show matches at or above this threshold.

**Added: Global TM entry count**

The Global TM checkbox label shows the current entry count: "Also use the global TM · 12,840 entries". This count is fetched at project creation time and displayed as a hint only — it does not need to be real-time.

---

## 3. Settings — Three MT providers, not two

The mockup adds **Azure Translator** as a third provider alongside DeepL and Google Translate. Azure was not in the original spec.

| Provider | Letter | Brand color |
|---|---|---|
| DeepL | D | `sky-600` |
| Google Translate | G | `amber-600` |
| Azure Translator | A | `violet-600` |

**Collapsed state:** ProviderCard supports a collapsed visual state (header only + ChevD). Azure is collapsed by default in the mockup. Consider persisting per-card collapse state in the user's session or localStorage.

**Usage stats:** Connected providers show "3,420 chars used this month". This needs a `mt_usage_monthly` value per provider. Simplest implementation: store cumulative monthly char usage in the `mt_providers` table with a reset job on the 1st of each month.

**Get API key link:** Unconfigured providers show "Get an API key →" as a plain link. This is a static URL per provider, not fetched — hardcode the URLs in the ProviderCard configuration.

---

## 4. Settings — QA: Punctuation Parity check

The mockup adds a **7th QA check**: "Punctuation parity" — flags mismatched terminal punctuation between source and target.

This check is **unchecked by default** in the QA Defaults tab, unlike the other 6 which are checked.

The QA checks in the mockup (in order):
1. Tag consistency ✅
2. Length ratio ✅ (configurable max ratio field, default 2.5×)
3. Trailing whitespace ✅
4. Double spaces ✅
5. Terminology consistency ✅
6. Number consistency ✅
7. Punctuation parity ☐ (new, off by default)

The `qa_defaults` JSON column on `users` (or a `qa_settings` table) needs to include `punctuation_parity` as a key, defaulting to `false`.

---

## 5. Editor — 7-column segment grid

The original spec described a 5-column table. The mockup adds **two new columns**:

- **Chars** (72px) — character count pill, coloured by `charTone()` vs `project.char_limit_per_segment`
- **Actions** (96px) — four `RowAction` icon buttons per row

The grid template is now `'36px 48px 1fr 1fr 60px 72px 96px'`.

The segment number column also changed: numbers are now **zero-padded to 3 digits** (`padStart(3, '0')`), rendered right-aligned in monospace `stone-400`.

---

## 6. Editor — Filter bar replaces filter dropdown

The original spec described a "Filter dropdown" in the top bar. The mockup replaces this with a **two-row filter area** at the top of the segment table:

**Row 1 — Filter bar:** Source search input + target search input + column toggle + Clear button. The language-specific search inputs use the project's `src`/`tgt` language codes in the placeholder text.

**Row 2 — FilterChip row:** Persistent chip buttons for all filter states. Always visible. No dropdown required.

The top bar no longer contains a filter dropdown — the resource indicator pills, QA button, and Export button take that space instead.

See `05-editor-spec.md §Filter Bar & Chip Row` and `09-component-reference.md §15` for exact layout and styling.

---

## 7. Editor — RowAction buttons

The original spec did not include per-row action buttons. The mockup adds four:

| Action | Shortcut equivalent | DB column |
|---|---|---|
| Confirm | `Ctrl+Enter` | `segments.status = 'translated'` |
| Lock | — | `segments.is_locked = true` |
| Bookmark | — | `segments.is_bookmarked = true` |
| Comment | — | `comments` relation |

`is_locked` and `is_bookmarked` are new nullable boolean columns on the `segments` table.

The Confirm button is a visual toggle — it goes green when the segment is confirmed (status `translated` or above) and returns to inactive when the segment is draft/untranslated.

---

## 8. Editor — Resource indicator pills

The mockup adds three small labelled pills to the editor top bar: **TM**, **TB** (Term Base), **MT**. These indicate which resources are linked to the current project/file.

These are not interactive in the mockup (no click target), but clicking them could navigate to the relevant side panel tab in V2. For V1 they are display-only.

The pills appear only when the corresponding resource is linked. A project with no configured MT provider should not show the MT pill.

---

## 9. Editor — Side panel width

Updated from **320px** (original spec) to **380px** (mockup). This is the default width. The min/max and collapse behaviour remain unchanged.

---

## 10. Dashboard — Filter button

The mockup adds a **Filter** button (`Btn secondary md`, `Filter` icon) next to "New project" in the dashboard header. The original spec did not include this.

This implies a dashboard filter state (filter by language pair, status, date, etc.). For V1 this can be a client-side filter over the loaded project list. The filter UI is not shown in the mockup — treat it as a future implementation detail.

---

## 11. Dashboard — Project subtitle

The dashboard subtitle changes from static text to dynamic counts:

```
3 active · 1 archived · last activity 2h ago
```

"Last activity" refers to the most recent segment save across all active projects. This needs a `last_activity_at` timestamp on `projects`, updated on segment save.

---

## 12. Dashboard — 5 next-step chip kinds

The original spec did not define next-step chips. The mockup defines 5:

| Kind | Label pattern | Icon |
|---|---|---|
| `translate` | "Ready to translate" | None |
| `processing` | "Processing files…" | `Loader` (spinning) |
| `export` | "Translation complete — export?" | `Download` |
| `review` | "Ready for review · {n} segments" | `Pencil` |
| `qa` | "QA found {n} warnings" | `Warning` |

The chip kind is derived from project state logic (not stored):
- `processing`: at least one file has status `processing`
- `export`: all files 100% translated, none exported
- `review`: any segment has status `reviewed` but not `approved`
- `qa`: last QA run returned warnings/errors
- `translate`: default/fallback

---

## 13. Project Overview — Next-step banner

The project overview includes a teal banner showing the next action. In the mockup it shows:

```
▶ Your files are ready. Open `contract.docx` to continue translating, or upload another file.
```

The filename is rendered in a monospace `code` element with `teal-100` bg. This banner can be dismissed (ghost "Dismiss" button). Dismissed state should be stored in the session or per-project user preference.

---

## 14. Project Overview — FileTable status column

Two specific status states in the file table:

- **Translated** (100% done): `<Dot status="approved" size={10}/>` + "Translated" in `green-700`
- **Ready** (not 100%): `<Dot status="translated" size={10}/>` + "Ready" in `stone-700`
- **Processing**: `<Badge tone="amber">Processing</Badge>` with spinning `Loader` + "Extracting segments…" text in progress column

The processing spinner text "Extracting segments…" (not "Processing…") is the exact copy. Use this string.

---

## 15. Dashboard — Spinning Loader animation

The `Loader` icon in processing states uses a CSS animation:

```css
@keyframes oc-spin { 100% { transform: rotate(360deg); } }
```

Applied as `animation: oc-spin 1s linear infinite`. This must be defined globally (once per page), not inline per element.

---

## Unchanged from original spec

The following were in the original planning docs and match the mockup without changes:

- Sidebar structure and navigation items (Dashboard, TM Library, Glossary, Settings)
- User initials avatar in sidebar footer
- Teal + Warm Stone color system (see `07-design-brief.md v1.1`)
- All 6 segment status states and their dot colors
- TM match percentage color thresholds (100%: green, ≥95%: emerald, ≥75%: amber, <75%: stone)
- TagChip styling (teal for open/close, violet for self-closing)
- MatchCard diff highlighting (amber-100/amber-700)
- QaRow structure (red = error, amber = warning)
- 3-step wizard flow (Project details → TM → Upload)
- StepIndicator visual design
- Settings tabs (Profile, Machine Translation, QA Defaults)
- Auto-save behaviour and debounce logic
- Keyboard shortcuts (unchanged)
- RTL four-combination matrix

---

## Open questions raised by mockups

These are not blocking but should be resolved before implementation:

1. **Column toggle button** — the `Columns` icon in the filter bar implies some columns can be hidden. Which columns are toggleable? (TM%, Chars, Actions — probably. Source/Target cannot be hidden.)

2. **"Add filter" button** — the chip row has an "Add filter" button at the right. What additional filters does it offer? The mockup doesn't show the dropdown.

3. **ProviderCard collapsed persistence** — Azure Translator is collapsed by default. Is this per-user, per-session, or a hard-coded default?

4. **Concordance search** — the TM panel spec mentions it but the mockup doesn't show it. Is it in V1 scope?

5. **Comment panel** — the Comment RowAction implies a comments system (with a count badge). The mockup shows the count but not the comments UI itself. Scope for V2.

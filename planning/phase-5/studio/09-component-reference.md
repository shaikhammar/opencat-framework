# 09 — Component Reference

**Derived from:** `08-screen-briefs/shared.jsx`, `editor.jsx`, `dashboard.jsx`, `wizard.jsx`, `settings.jsx`
**Purpose:** Canonical reference for Claude Code when building the React/TypeScript component layer. Every component here is authoritative — props, tokens, and visual states are taken directly from the mockup source, not inferred.

---

## Table of Contents

1. [Design Tokens](#1-design-tokens)
2. [Icon System](#2-icon-system)
3. [Sidebar](#3-sidebar)
4. [Btn](#4-btn)
5. [Badge](#5-badge)
6. [Dot](#6-dot)
7. [Field](#7-field)
8. [Input](#8-input)
9. [Select](#9-select)
10. [Switch](#10-switch)
11. [Checkbox](#11-checkbox)
12. [Progress](#12-progress)
13. [TagChip](#13-tagchip)
14. [KeyBadge](#14-keybadge)
15. [FilterChip](#15-filterchip)
16. [RowAction](#16-rowaction)
17. [MatchCard](#17-matchcard)
18. [QaRow](#18-qarow)
19. [ProjectCard](#19-projectcard)
20. [ResourceCard](#20-resourcecard)
21. [ProviderCard](#21-providercard)
22. [StepIndicator](#22-stepindicator)
23. [FileRow (Wizard)](#23-filerow-wizard)
24. [FileTable (Project Overview)](#24-filetable-project-overview)
25. [SectionHeader](#25-sectionheader)
26. [Editor: Segment Row](#26-editor-segment-row)
27. [Editor: Side Panel](#27-editor-side-panel)
28. [Editor: Filter Bar & Chip Row](#28-editor-filter-bar--chip-row)
29. [Editor: Resource Indicators](#29-editor-resource-indicators)
30. [Editor: Status Bar](#30-editor-status-bar)
31. [charTone Utility](#31-chartone-utility)

---

## 1. Design Tokens

All tokens live in a single `OC` object. In production code this maps 1:1 to the Tailwind v4 theme. Do not use arbitrary hex values — always reference these tokens.

### Teal accent (primary)

| Token | Hex | Usage |
|---|---|---|
| `teal50` | `#F0FDFA` | Background tints, resource indicator TM bg |
| `teal100` | `#CCFBF1` | Active sidebar bg, tag chip bg, focus ring shadow, FilterChip count badge (active) |
| `teal200` | `#99F6E4` | TM resource indicator border, tag chip selected bg |
| `teal300` | `#5EEAD4` | Tag chip border |
| `teal400` | `#2DD4BF` | FilterChip border (active) |
| `teal500` | `#14B8A6` | Primary button bg, sidebar active border, step indicator circle, progress fill, switch (on), checkbox (checked) |
| `teal600` | `#0D9488` | Logo gradient end, sidebar active icon, segment selected border, teal_ghost text, resource indicator TM text |
| `teal700` | `#0F766E` | Sidebar active text, tag chip text, FilterChip text (active), next-step banner text |

### Warm Stone (neutral base)

| Token | Hex | Usage |
|---|---|---|
| `stone50` | `#FAFAF9` | App background, filter chip row bg, table header bg |
| `stone100` | `#F5F5F4` | Sidebar background, KeyBadge bg, odd-row zebra stripe |
| `stone200` | `#E7E5E4` | Borders throughout (cards, dividers, inputs default) |
| `stone300` | `#D6D3D1` | Secondary button border, dot (untranslated) border, switch (off) |
| `stone400` | `#A8A29E` | Placeholder text, icon default, segment number, TM% below threshold |
| `stone500` | `#78716C` | Subtitle text, nav label inactive |
| `stone600` | `#57534E` | Body text secondary |
| `stone700` | `#44403C` | Input text, nav label, ghost button text |
| `stone800` | `#292524` | Source cell text |
| `stone900` | `#1C1917` | Headings, target cell text |

### Semantic colors

| Group | Token | Hex | Usage |
|---|---|---|---|
| Green | `green100` | `#DCFCE7` | Confirm action active bg, toast bg |
| | `green500` | `#22C55E` | Translated dot fill, progress complete |
| | `green600` | `#16A34A` | Confirm active icon, QA ok check |
| | `green700` | `#15803D` | Approved dot fill, green badge text |
| Amber | `amber100` | `#FEF3C7` | Draft dot fill, TM diff highlight bg, char near-limit bg |
| | `amber400` | `#FBBF24` | Draft dot fill (lighter) |
| | `amber600` | `#D97706` | Bookmark active, TM diff highlight text |
| | `amber700` | `#B45309` | Amber badge text, char near-limit text |
| Red | `red100` | `#FEE2E2` | QaRow error bg tint, char over-limit bg |
| | `red500` | `#EF4444` | Rejected/QA dot, required star |
| | `red600` | `#DC2626` | Destructive button |
| | `red700` | `#B91C1C` | Char over-limit text |
| Violet | `violet100` | `#EDE9FE` | Reviewed dot, self-closing tag chip bg, TB resource indicator |
| | `violet500` | `#8B5CF6` | Reviewed dot fill |
| | `violet600` | `#7C3AED` | Reviewed dot (darker), Azure Translator branded color |
| | `violet700` | `#6D28D9` | Violet badge text |
| Sky | `sky50` | `#F0F9FF` | MT resource indicator bg |
| | `sky200` | `#BAE6FD` | MT resource indicator border |
| | `sky600` | `#0284C7` | DeepL branded color |
| | `sky700` | `#0369A1` | MT resource indicator text |
| Emerald | `emerald600` | `#059669` | TM% ≥ 95 color |

### Typography

```
font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
mono: 'JetBrains Mono', ui-monospace, 'Menlo', monospace
```

The monospace font is used for: segment numbers, char counts, `KeyBadge`, `TagChip`, range input value pill, MT API key masked values.

---

## 2. Icon System

Icons are Lucide-inspired SVGs with `strokeWidth 1.75`, `strokeLinecap round`, `strokeLinejoin round`. All icons accept `size`, `color`, and `stroke` props.

| Name | Used in |
|---|---|
| `Dashboard` | Sidebar nav |
| `Folder` | Dashboard empty state |
| `Database` | Sidebar (TM Library), ResourceCard TM, TM resource indicator |
| `Book` | Sidebar (Glossary), ResourceCard Glossary, TB resource indicator |
| `Settings` | Sidebar, Project Overview button |
| `Upload` | Wizard file drop zone, Upload file button |
| `Download` | Editor Export button, FileTable export |
| `Pencil` | FilterChip (Unconfirmed), review next-step chip |
| `Shield` | Editor QA button |
| `Warning` | QaRow (both red and amber), FilterChip QA flagged |
| `Check` | Dot (approved), toast, status bar auto-save, QA ok |
| `CheckSm` | StepIndicator done, RowAction confirm, Checkbox |
| `Loader` | Processing badge, next-step chip processing, FileTable processing |
| `Tag` | (reserved — not used in current screens) |
| `Search` | FilterChip search input, ResourceCard action |
| `ChevL` | Editor back breadcrumb, Btn Back |
| `ChevR` | Breadcrumb separator, ProviderCard (collapsed toggle), StepIndicator connector |
| `ChevD` | Select dropdown, ProviderCard (collapsed arrow) |
| `X` | FileRow (Wizard) remove, close |
| `Plus` | New project button, Add filter, ResourceCard Add term |
| `Trash` | ProviderCard remove API key |
| `Eye` | ProviderCard show API key |
| `EyeOff` | (reserved) |
| `File` | FileRow (Wizard), FileTable file column |
| `Zap` | ProviderCard Test button |
| `Info` | Wizard Step 1 RTL info banner |
| `Play` | QA side panel "Re-run", Project Overview next-step banner |
| `GripV` | (design canvas only — not used in app) |
| `Diamond` | Sidebar logo mark |
| `Globe` | MT resource indicator |
| `ArrowR` | Wizard "Next/Create project", EmptyState CTA, ProjectCard "Open project" |
| `Archive` | Project Overview Archive button |
| `Filter` | Filter bar icon, Dashboard Filter button |
| `KB` | (keyboard shortcut reference — not used in current screens) |
| `Lock` | RowAction lock |
| `Bookmark` | RowAction bookmark |
| `Comment` | RowAction comment |
| `Columns` | Filter bar column toggle |

**Icon size conventions:**

| Context | Size |
|---|---|
| Sidebar nav | 18 |
| Button icon (sm) | 14 |
| Button icon (md/lg) | 16 |
| Inline text icons | 10–14 |
| Logo diamond | 14 |
| RowAction | 13 |
| FilterChip | 11 |

---

## 3. Sidebar

Shared across Dashboard, Project Overview, Wizard, and Settings screens. The Editor screen does **not** include the Sidebar — it uses its own full-width layout.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `active` | `'dashboard' \| 'tm' \| 'glossary' \| 'settings'` | `'dashboard'` |
| `userName` | `string` | `'Ammar Shaikh'` |

**Structure:**

```
aside (240px, stone-100 bg, stone-200 right border)
├── Header bar (56px, white bg, stone-200 bottom border)
│   ├── Logo mark (26×26, border-radius 6, teal-500→teal-600 gradient, Diamond icon white)
│   └── "OpenCAT" wordmark (15px, weight 700, stone-900, tracking -0.2)
├── nav (flex column, gap 2)
│   ├── NavRow: Dashboard
│   ├── NavRow: TM Library
│   ├── NavRow: Glossary
│   ├── Divider (1px, stone-200, margin 12px 12px)
│   └── NavRow: Settings
└── User footer (56px, stone-200 top border)
    ├── Avatar (28×28, stone-300 bg, stone-700 text, 12px mono initials)
    └── User name (13px, stone-700, weight 500)
```

**NavRow active state:**

- Background: `teal-100`
- Left border: `3px solid teal-500`
- Border radius: `0 6px 6px 0` (right side only)
- Text color: `teal-700`, weight 600
- Icon color: `teal-600`

**NavRow inactive state:**

- Background: transparent
- Left border: `3px solid transparent`
- Border radius: 6px
- Text color: `stone-700`, weight 500
- Icon color: `stone-500`

**User avatar:** First two initials derived from `userName.split(' ').map(n => n[0]).slice(0, 2).join('')`.

---

## 4. Btn

**Props:**

| Prop | Type | Default |
|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'destructive' \| 'teal_ghost'` | `'primary'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `icon` | Icon component (left) | — |
| `iconR` | Icon component (right) | — |
| `disabled` | `boolean` | — |

**Size values:**

| Size | Height | Padding x | Font | Gap |
|---|---|---|---|---|
| `sm` | 28px | 10px | 12.5px | 6px |
| `md` | 36px | 14px | 14px | 8px |
| `lg` | 40px | 16px | 14px | 8px |

**Variant values:**

| Variant | Background | Text | Border |
|---|---|---|---|
| `primary` | `teal-500` | white | transparent |
| `secondary` | white | `stone-700` | `stone-300` |
| `ghost` | transparent | `stone-700` | transparent |
| `destructive` | `red-600` | white | transparent |
| `teal_ghost` | transparent | `teal-600` | transparent |

Disabled state: `opacity 0.5`, `cursor not-allowed`. All other styles unchanged.

Icon size: 14px for `sm`, 16px for `md` and `lg`.

---

## 5. Badge

**Props:**

| Prop | Type | Default |
|---|---|---|
| `tone` | `'stone' \| 'teal' \| 'teal100' \| 'green' \| 'emerald' \| 'amber' \| 'red' \| 'violet' \| 'sky'` | `'stone'` |

**Style:** `border-radius 999`, `font-size 11.5`, `font-weight 600`, `padding 3px 10px`, `display inline-flex`.

**Tone values:**

| Tone | Background | Text |
|---|---|---|
| `stone` | `stone-100` | `stone-500` |
| `teal` | `teal-50` | `teal-700` |
| `teal100` | `teal-100` | `teal-700` |
| `green` | `green-100` | `green-700` |
| `emerald` | `emerald-100` | `emerald-700` |
| `amber` | `amber-100` | `amber-700` |
| `red` | `red-100` | `red-700` |
| `violet` | `violet-100` | `violet-700` |
| `sky` | `sky-50` | `sky-700` |

**Usage patterns:**
- Language pair `EN → UR`: `<Badge tone="teal">EN → UR</Badge>`
- File format: `<Badge tone="teal">DOCX</Badge>`
- Status: `<Badge tone="green">Active</Badge>`, `<Badge tone="stone">Archived</Badge>`

---

## 6. Dot

Segment status indicator. Circular dot rendered in the status column.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `status` | `'untranslated' \| 'draft' \| 'translated' \| 'reviewed' \| 'approved' \| 'rejected' \| 'qa'` | `'untranslated'` |
| `size` | `number` | `12` |

**Status map:**

| Status | Fill | Border | Special |
|---|---|---|---|
| `untranslated` | transparent | `stone-300` | Hollow ring |
| `draft` | `amber-400` | `amber-400` | — |
| `translated` | `green-500` | `green-500` | — |
| `reviewed` | `violet-500` | `violet-500` | — |
| `approved` | `green-700` | `green-700` | White checkmark (`CheckSm`, size-5, stroke 3) |
| `rejected` | `red-500` | `red-500` | — |
| `qa` | `red-500` | `red-500` | Same as rejected |

Border is always `2px solid`. In FilterChips the dot is rendered at `size={8}`.

---

## 7. Field

Form field wrapper. Renders label, optional hint, optional error message, and the field's child input.

**Props:**

| Prop | Type |
|---|---|
| `label` | `string` |
| `required` | `boolean` |
| `hint` | `string` |
| `error` | `string` |

When `error` is set, hint is suppressed. Required star: `red-500`. Label: `13px`, `stone-700`, weight 500.

---

## 8. Input

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `value` | `string` | Rendered as `defaultValue` in mockup |
| `placeholder` | `string` | — |
| `focused` | `boolean` | Visual focus state |
| `type` | `string` | Default `'text'` |

**Focused state:**
- Border: `teal-500`
- Box shadow: `0 0 0 3px teal-100`

**Default state:**
- Border: `stone-300`
- Height: 36px, padding 0 12px, font 14px, `stone-900` text

---

## 9. Select

Visual-only select trigger (no dropdown logic in mockup). Renders value + `ChevD` icon.

**Props:** `value: string`

Same dimensions as Input (36px height, stone-300 border). Dropdown implementation is delegated to shadcn/ui Select.

---

## 10. Switch

**Props:** `on: boolean`

- Track: 38×22px, border-radius 999
- On: `teal-500` track
- Off: `stone-300` track
- Thumb: 18×18px, white, `box-shadow 0 1px 3px rgba(0,0,0,0.15)`
- On position: `left: 18px`
- Off position: `left: 2px`

---

## 11. Checkbox

**Props:** `checked: boolean`, `disabled: boolean`

- Size: 18×18px, border-radius 4
- Checked: `teal-500` bg and border, white `CheckSm` (size 12, stroke 3)
- Unchecked: white bg, `stone-300` border
- Disabled: `opacity 0.6`

---

## 12. Progress

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | `number` | — (0–100) |
| `width` | `string \| number` | `'100%'` |
| `height` | `number` | `6` |
| `complete` | `boolean` | — |

Fill color: `green-500` when `complete === true` or `value >= 100`; otherwise `teal-500`. Track: `stone-200`.

---

## 13. TagChip

Inline tag placeholder inside source/target text cells.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `kind` | `'open' \| 'close' \| 'self'` | `'open'` |
| `selected` | `boolean` | — |

**Styles:**

- Height: 18px, padding 0 6px, margin 0 1px
- Font: `mono`, 11px, weight 500
- Border-radius: 4
- **Always** `direction: 'ltr'` — tags render their number LTR regardless of surrounding text direction

**Color by kind:**

| State | Background | Text | Border |
|---|---|---|---|
| `open` / `close` (default) | `teal-100` | `teal-700` | `teal-300` |
| `self` (self-closing) | `violet-100` | `violet-700` | `violet-200` |
| selected | `teal-200` | `teal-700` | `teal-400` |

---

## 14. KeyBadge

Keyboard shortcut display.

**Props:** `children: ReactNode`

- Height: 20px, padding 0 6px
- Background: `stone-100`, border: `stone-200`
- Font: mono, 11px, weight 500
- Border-radius: 4

---

## 15. FilterChip

Segment list filter button. Appears in the active filter chip row below the filter bar in the Editor.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `label` | `string` | — |
| `count` | `number` | Optional count badge |
| `dot` | `ReactNode` | Optional `<Dot>` prepended to label |
| `icon` | Icon component | Optional icon prepended |
| `tone` | `'red' \| undefined` | Red styling for error filters |
| `active` | `boolean` | Active/selected state |

**Visual states:**

| State | Background | Border | Text |
|---|---|---|---|
| Active | `teal-50` | `teal-400` | `teal-700`, weight 600 |
| Default | white | `stone-200` | `stone-700`, weight 500 |
| Red tone | white | `red-100` | `red-700`, weight 500 |

Height: 24px, padding 0 8px, border-radius 999, font 11.5px.

**Count badge** (when count is provided): monospace 10.5px, weight 600. Active: `teal-100` bg, `teal-700` text. Inactive: `stone-100` bg, `stone-500` text.

**Full chip list in Editor (from mockup):**

Status group: All (count 312, active), Untranslated (184), Draft (42), Translated (68), Reviewed (12), Approved (4), Rejected (2) — each with corresponding Dot at size 8.

Action filters (no dot, optional icon): Confirmed, Unconfirmed, Locked, QA flagged (count 3, Warning icon, red tone), Has TM match (Database icon), Over char limit (red tone).

---

## 16. RowAction

Per-segment inline icon button in the Actions column.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `icon` | Icon component | — |
| `active` | `boolean` | — |
| `activeColor` | CSS color | Color when active |
| `count` | `number` | Optional notification badge |
| `title` | `string` | Tooltip |

**Dimensions:** 22×22px button, padding 0, transparent bg, no border.

**Icon size:** 13px. Active stroke: 2.4. Inactive stroke: 1.8.

**Inactive color:** `stone-300`

**Active colors by action:**

| Action | Icon | Active color |
|---|---|---|
| Confirm | `CheckSm` | `green-600` |
| Lock | `Lock` | `stone-700` |
| Bookmark | `Bookmark` | `amber-600` |
| Comment | `Comment` | `teal-600` |

**Count badge** (Comment only): 12×12px min, positioned `top: -2, right: -2` (absolute). Background: `teal-600`, text: white, font 9px weight 700.

---

## 17. MatchCard

TM match card rendered in the side panel TM tab.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `pct` | `number` | Match percentage |
| `name` | `string` | TM source name |
| `srcDiff` | `Array<{t: string, diff: boolean, tag?: 'open'}>` | Source with diff highlighting |
| `tgt` | `string` | Target translation |
| `srcRtl` | `boolean` | Source is RTL |
| `tgtRtl` | `boolean` | Target is RTL |

**Match percentage badge tone:**

| % | Badge tone |
|---|---|
| 100 | `green` |
| ≥ 95 | `emerald` |
| ≥ 75 | `amber` |
| < 75 | `stone` |

**Source diff highlighting:** Differing spans get `background: amber-100`, `color: amber-700`, `border-radius 3`, `padding 0 2px`.

**Source text:** `dir` set from `srcRtl`, `text-align` matches direction. Font 13px, `stone-700`.

**Target text:** `dir` set from `tgtRtl`, `text-align` matches direction. Font 13px, `stone-900`.

**Insert button:** "Insert" text + `KeyBadge` with `↵`. Color: `teal-600`, font 11.5px.

Card: white bg, `stone-200` border, border-radius 8, padding 12px, margin `0 12px 8px`.

---

## 18. QaRow

QA issue card in the side panel QA tab.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `tone` | `'red' \| 'amber'` | Error severity |
| `title` | `string` | Issue description |
| `sub` | `string` | "Segment 004 · Rule name" |

**Red tone:** `border-left: 3px solid red-500`, icon color `red-600`.

**Amber tone:** `border-left: 3px solid amber-400`, icon color `amber-600`.

Both tones use `I.Warning` as the icon. "Fix" button: `teal-600`, 11.5px, no border.

Full border on all 4 sides: left is 3px colored, others are `1px solid stone-200`. Border-radius 6.

---

## 19. ProjectCard

Dashboard project card.

**Props (from `p` object):**

| Key | Type |
|---|---|
| `name` | `string` |
| `src` | `string` (e.g. `'EN'`) |
| `tgt` | `string` |
| `status` | `'active' \| 'processing' \| 'archived'` |
| `done` | `number` (words) |
| `total` | `number` (words) |
| `files` | `number` |
| `last` | `string` (last activity label) |
| `next` | `{ kind: NextKind, label: string } \| null` |

**Status badge:**

| Status | Badge |
|---|---|
| active, < 100% | `<Badge tone="green">● Active</Badge>` |
| active, 100% | `<Badge tone="green"><CheckSm/> Complete</Badge>` |
| processing | `<Badge tone="amber"><Loader/> Processing</Badge>` |
| archived | `<Badge tone="stone">Archived</Badge>` |

Archived card: `background stone-50`, `opacity 0.75`.

**Next-step chip colors:**

| Kind | Background | Text | Icon |
|---|---|---|---|
| `translate` | `teal-50` | `teal-700` | None |
| `processing` | `amber-100` | `amber-700` | `Loader` (spinning) |
| `export` | `green-100` | `green-700` | `Download` |
| `review` | `violet-100` | `violet-700` | `Pencil` |
| `qa` | `red-100` | `red-700` | `Warning` |

All chips except `processing` include a `ChevR` (size 12) at the right. The `processing` chip shows a spinning `Loader` instead.

**Spinning animation:** `@keyframes oc-spin { 100% { transform: rotate(360deg); } }` applied as `animation: 'oc-spin 1s linear infinite'`.

Grid layout: `repeat(3, 1fr)`, gap 20px.

---

## 20. ResourceCard

Project Overview resource section card (TM, Glossary).

**Props:**

| Prop | Type |
|---|---|
| `icon` | Icon component |
| `title` | `string` |
| `subtitle` | `string` |
| `meta` | `string` |
| `actions` | `Array<{label: string, icon?: IconComponent, primary?: boolean}>` |

Icon container: 32×32px, border-radius 8, `teal-50` bg. Icon size: 16, color `teal-600`.

Action buttons: `Btn` with `primary` variant if `a.primary`, else `secondary`, size `sm`.

---

## 21. ProviderCard

Settings → Machine Translation tab. One card per MT provider.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `name` | `string` | Provider display name |
| `letter` | `string` | Single-letter monogram |
| `color` | CSS color | Brand color for monogram bg |
| `status` | `'connected' \| 'empty'` | — |
| `masked` | `string` | Masked API key (`••••••••••••f4a2`) |
| `placeholder` | `string` | Input placeholder for empty state |
| `collapsed` | `boolean` | Collapsed state (show header only) |

**Provider brand colors:**

| Provider | Letter | Color |
|---|---|---|
| DeepL | D | `sky-600` |
| Google Translate | G | `amber-600` |
| Azure Translator | A | `violet-600` |

**Monogram:** 32×32px, border-radius 8, white text, 14px mono bold.

**Connected status line:** Green `Check` icon (size 12) + "Connected" in `green-700` weight 500 + "· 3,420 chars used this month" in `stone-500`.

**Empty status line:** `stone-400` dash + "Not configured".

**Collapsed state:** Renders header row only + `ChevD` icon at right. No API key field.

**Expanded state:** Shows `Field` with API key input. Connected state: masked value + `Eye` button. Empty state: placeholder. Both have a "Test" button (`Btn secondary sm`, `Zap` icon). Connected state additionally shows "Remove" button (`Btn secondary sm`, `Trash` icon). Unconfigured shows "Get an API key →" link in `teal-600` 12.5px.

---

## 22. StepIndicator

Wizard 3-step progress indicator.

**Props:** `current: 1 | 2 | 3`

Steps: `[{n:1, label:'Project details'}, {n:2, label:'Translation memory'}, {n:3, label:'Upload files'}]`

**Circle states:**

| State | Background | Border | Text/Icon | Ring |
|---|---|---|---|---|
| Done (`current > n`) | `teal-500` | none | White `CheckSm` (size 14, stroke 3) | none |
| Active (`current === n`) | `teal-500` | none | White number | `0 0 0 4px teal-100` |
| Future | white | `2px solid stone-300` | `stone-400` number | none |

Circle size: 28×28px, border-radius 50%.

**Connector line:** `flex: 1`, height 2px, `margin-top: 13px`. Color: `teal-500` for completed (n < current), `stone-200` for pending.

**Label:** 11.5px, weight 500. Active: `teal-700`. Done: `stone-700`. Future: `stone-400`.

---

## 23. FileRow (Wizard)

File in the upload list — Step 3 of the wizard.

**Props:** `name: string`, `fmt: string`, `size: string`

Layout: white bg, `stone-200` border, border-radius 8, padding `10px 14px`, flex row with gap 12.

- File icon: `I.File`, size 16, `stone-400`
- Name: 13.5px, weight 500, `stone-800`, flex 1
- Format badge: `<Badge tone="teal">{fmt}</Badge>`
- Size: 12px, `stone-400`, tabular nums, min-width 56, right-aligned
- Remove button: `I.X` size 14, `stone-400`

---

## 24. FileTable (Project Overview)

Table of files in the project.

**Grid columns:** `2.4fr 1fr 1fr 1.6fr 1.2fr 1.2fr` (File, Format, Words, Progress, Status, Actions).

**File status rendering:**

| Condition | Status column |
|---|---|
| `status === 'processing'` | `<Badge tone="amber">Processing</Badge>` |
| `done === words` (100%) | `<Dot status="approved" size={10}/>` + "Translated" in `green-700` |
| Otherwise | `<Dot status="translated" size={10}/>` + "Ready" in `stone-700` |

**Progress column:**

| Condition | Rendering |
|---|---|
| Processing | `<Loader/>` + "Extracting segments…" in `amber-600` |
| Otherwise | `<Progress value={pct} width={120} height={4}/>` + `{pct}%` |

**Actions column:**

- Non-processing: `<Btn variant="primary" size="sm">Translate</Btn>`
- 100% done: also shows `<Btn variant="secondary" size="sm" icon={I.Download}>Export</Btn>`
- Processing: `—`

Words column: `—` for files with null word count (still processing).

---

## 25. SectionHeader

Used in Project Overview above file and resource sections.

**Props:** `title: string`, `count: number`, `action: ReactNode`

```
<h2>{title} <span>({count})</span></h2>   [action button right-aligned]
```

Title: 16px, weight 600, `stone-900`. Count: 13px, `stone-400`, weight 500. Flex row, space-between.

---

## 26. Editor: Segment Row

The most complex rendering unit. Each row is a 7-column CSS grid.

**Grid:** `gridTemplateColumns: '36px 48px 1fr 1fr 60px 72px 96px'`

**Columns (left to right):**

| # | Width | Content |
|---|---|---|
| 1 | 36px | `<Dot status={s.status}/>` centered |
| 2 | 48px | Segment number, zero-padded to 3 digits (`padStart(3, '0')`), right-aligned, `stone-400`, 11.5px tabular |
| 3 | 1fr | Source text cell |
| 4 | 1fr | Target text cell |
| 5 | 60px | TM% — right-aligned, weight 600, 11.5px |
| 6 | 72px | Char count pill |
| 7 | 96px | RowAction buttons (4 icons) |

**Row background:**

| State | Background |
|---|---|
| Selected | `teal-50` |
| Even rows (non-selected) | white |
| Odd rows (non-selected) | `stone-50` |

Selected row also gets: `border-left: 3px solid teal-500`. Non-selected: `border-left: 3px solid transparent`.

**Source cell (column 3):**

- `dir` = `project.srcDir` (`'ltr'` or `'rtl'`)
- `text-align`: `right` if `rtl`, else `left`
- Padding: `10px 14px`, font 14px, `stone-800`, line-height 22px
- Right border: `1px solid stone-100`

**Target cell (column 4):**

- `dir` = `project.tgtDir` (`'ltr'` or `'rtl'`)
- `text-align`: `right` if `rtl`, else `left`
- Selected state: `background: white`, `box-shadow: inset 0 0 0 2px teal-500`
- Empty + selected: blinking cursor (`oc-blink` CSS animation) + "Type translation…" placeholder
- Empty + not selected: "Type translation…" in `stone-400`

**TM% color:**

| Value | Color |
|---|---|
| `null` | transparent (nothing shown) |
| 100 | `green-600` |
| ≥ 95 | `emerald-600` |
| ≥ 75 | `amber-600` |
| < 75 | `stone-400` |

**Char count column (column 6):**

Uses `charTone()` utility (see §31). Empty target: renders `—` in `stone-300`. Non-empty:

```
{tgtChars}/{charLimit}
```

Wrapped in a `<span>` pill with:
- Background and text from `charTone()`
- `border: 1px solid red-400` when over limit
- Font: mono, 11px, weight 600, tabular-nums
- Padding: `2px 6px`, border-radius 4

If `charLimit` is null/undefined, no denominator shown and no pill background.

**Blink animation:**

```css
@keyframes oc-blink { 50% { opacity: 0; } }
```

Cursor: `display: inline-block`, width 1px, height 16px, `background: teal-600`, `vertical-align: middle`.

---

## 27. Editor: Side Panel

380px, `stone-50` bg, `stone-200` left border. Contains 4 tabs.

**Tabs:** TM, MT, QA, Glossary — each shows a count.

**Active tab:** `teal-600` text, `border-bottom: 2px solid teal-500`, count in `teal-600`.

**Inactive tab:** `stone-500` text, `border-bottom: 2px solid transparent`, count in `stone-400`.

**TM tab content:**

- Section label: 11px uppercase, tracking 0.6, `stone-400`, padding `14px 16px 8px`
- Label text: "TM Matches for Segment {NNN}"
- `MatchCard` components (see §17)

**QA tab content:**

- Header row: "QA Issues" label + error count in `red-600`
- `QaRow` components (see §18)
- "No issues in current segment." line: `Check` icon (14, `green-600`) + text in `green-600`, 12.5px
- Divider: `1px stone-200`, margin `12px 16px`
- "Re-run all QA checks" button: `Btn secondary sm`, `Play` icon, full width, left-justified

---

## 28. Editor: Filter Bar & Chip Row

**Filter bar** (44px tall, `stone-200` bottom border, white bg):

Grid: `36px 1fr 1fr 70px 72px`

- Column 1: `Filter` icon (14, `stone-500`)
- Column 2: Source search input (stone-50 bg, stone-200 border, Search icon, placeholder "Filter source ({src.toLowerCase()})…")
- Column 3: Target search input (same, "Filter target ({tgt.toLowerCase()})…")
- Column 4: Column toggle button (26×26, `Columns` icon, stone-200 border) + "Clear" link (teal-600, 12px)
- Column 5: empty spacer

**Chip row** (`stone-50` bg, `stone-200` bottom border, `padding: 8px 14px`):

- "STATUS" label: 11px uppercase, tracking 0.5, `stone-500`
- Status `FilterChip` components (with Dot at size 8)
- Vertical divider: `1px stone-200`, 16px tall
- Action `FilterChip` components
- "Add filter" button (right-aligned): white bg, `stone-200` border, border-radius 6, `Plus` icon, 11.5px `stone-600`

---

## 29. Editor: Resource Indicators

Shown in the Editor top bar, right of center divider, left of QA button. Three pills.

**TM pill:**
- Background: `teal-50`
- Text: `teal-700`, weight 600
- Border: `1px solid teal-200`
- Icon: `Database` (size 10, `teal-700`)
- Label: "TM"

**TB (Term Base) pill:**
- Background: `violet-100`
- Text: `violet-700`, weight 600
- Border: `1px solid violet-200`
- Icon: `Book` (size 10, `violet-700`)
- Label: "TB"

**MT pill:**
- Background: `sky-50`
- Text: `sky-700`, weight 600
- Border: `1px solid sky-200`
- Icon: `Globe` (size 10, `sky-700`)
- Label: "MT"

All three: `padding: 2px 7px`, border-radius 4, font 11.5px, inline-flex, gap 3.

---

## 30. Editor: Status Bar

32px footer, `stone-50` bg, `stone-200` top border, padding `0 16px`, font 11.5px, `stone-500`.

**Left side content (separated by `·`):**

1. "Seg **{NNN}** / 312" — segment number bold `stone-700`
2. "{n} words" — word count for current segment
3. Chars display (see below)
4. Auto-save: `Check` icon (12, `green-500`) + "Auto-saved"

**Chars display:**

Shows current segment char count vs limit using `charTone()`. Font: mono, 11px, weight 600. Pill styled same as column 6. Additional text: when over limit shows "+{n} over", when near shows "{n} left".

**Right side** (when `charLimit` is set):

Three legend items separated by `·`:
- `stone-500` square (8×8, border-radius 2) + "under"
- `amber-400` square + "≥90%"
- `red-500` square + "over {charLimit}"

Then `·` separator and keyboard shortcut hint: `Press KeyBadge(Ctrl) KeyBadge(?) for shortcuts`.

---

## 31. charTone Utility

Used in the segment row Chars column and the status bar Chars display.

```typescript
function charTone(count: number, limit: number | null) {
  if (!limit || count === 0) return { fg: stone400, bg: 'transparent', label: 'ok' }
  const ratio = count / limit
  if (ratio > 1)   return { fg: red700,   bg: red100,   label: 'over'  }
  if (ratio >= 0.9) return { fg: amber700, bg: amber100, label: 'near'  }
  return               { fg: green700, bg: green100, label: 'under' }
}
```

`label` is used to conditionally add the `red-400` border in the pill (only when `'over'`).

---

## Screen-level layout notes

### Editor (full screen, no Sidebar)

```
div (column flex, full viewport)
├── header (56px)
├── body (flex row, flex 1, min-height 0)
│   ├── segment table area (flex 1, column flex)
│   │   ├── filter bar (44px)
│   │   ├── chip row (auto)
│   │   ├── table header (32px)
│   │   └── segment list (scroll, flex 1)
│   └── side panel (380px, fixed width)
└── status bar (32px)
```

### Dashboard / Settings / Wizard

```
div (row flex, full viewport)
├── Sidebar (240px)
└── main (flex 1, overflow auto)
    └── content (max-width constrained, centered)
```

### Project Overview

Same shell as Dashboard. Max-width: 1100px.

---

## Animation keyframes

Define globally (once per page):

```css
@keyframes oc-blink { 50% { opacity: 0; } }
@keyframes oc-spin  { 100% { transform: rotate(360deg); } }
```

`oc-blink`: blinking cursor in selected empty target cell.

`oc-spin`: spinning `Loader` icon in "Processing" badges and next-step chips.

# OpenCAT — Screen Brief: Settings

**Document type:** UI/UX mockup brief for Claude Design
**Screen:** Settings
**URL:** `/settings`
**Layout:** AppLayout (sidebar + main content)
**Priority:** 4 of 4

Read `07-design-brief.md` first for color tokens, typography, and component patterns.

---

## Purpose

A single-screen settings page for the solo user. Three tabs cover user profile, machine translation API keys, and QA check defaults. The screen is functional and dense — it is not visited often, so clarity over visual flair.

---

## Overall Layout

```
┌────────────────┬─────────────────────────────────────────────────┐
│                │                                                   │
│   SIDEBAR      │   Settings                                        │
│                │   ─────────────────────────────────────────────   │
│   Dashboard    │   [Profile]  [Machine Translation]  [QA Defaults] │
│   TM Library   │                                                   │
│   Glossary     │   TAB CONTENT AREA                               │
│   ─────────    │                                                   │
│   Settings ←   │                                                   │
│                │                                                   │
└────────────────┴─────────────────────────────────────────────────┘
```

"Settings" is active in the sidebar: `bg-indigo-50 text-indigo-700 border-l-[3px] border-indigo-500`

Page heading: `text-2xl font-semibold text-slate-900 mb-6`

---

## Tab Navigation

```
[Profile]  [Machine Translation]  [QA Defaults]
```

Tabs component: shadcn `Tabs`. Below the heading, above a full-width `<Separator />`.
Tab list: `bg-transparent border-b border-slate-200`
Active tab: `text-indigo-600 border-b-2 border-indigo-500 font-medium`
Inactive tab: `text-slate-500 hover:text-slate-700`

Tab content area: `pt-8 max-w-2xl`

---

## Tab 1: Profile

**Show this tab as the primary mockup state.**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Profile                                                        │
│  text-lg font-semibold text-slate-900 mb-6                     │
│                                                                 │
│  Name *                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Ammar Shaikh                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Email *                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ammar@example.com                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  UI Language                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  English  ▼                                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│  Note: text-xs text-slate-400 — "UI language only. Source and  │
│  target languages are set per project."                         │
│                                                                 │
│  ──────────────────────────────────────────────────────────    │
│                                                                 │
│  Password                                                       │
│  text-sm font-medium text-slate-700                             │
│                                                                 │
│  [Change password…]   ghost/secondary button                    │
│                                                                 │
│  ──────────────────────────────────────────────────────────    │
│                                                                 │
│  [Save changes]   primary button                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

All form fields use standard input style from design brief.
"Change password" button: secondary style, expands an inline password change form (show collapsed in mockup).

**Saved success state:**
After save, show a toast notification (bottom-right): `bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg shadow-sm` with `CheckCircle` icon and "Changes saved."

---

## Tab 2: Machine Translation

**Show this tab as a secondary mockup state.**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Machine Translation Providers                                  │
│  text-lg font-semibold text-slate-900                          │
│                                                                 │
│  API keys are stored encrypted and never shared.               │
│  text-sm text-slate-500 mb-6                                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  DeepL                                                  │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │                                                         │   │
│  │  API Key                                                │   │
│  │  ┌──────────────────────────────────────┐  [Show] [Test]│   │
│  │  │  ••••••••••••••••••••••              │               │   │
│  │  └──────────────────────────────────────┘               │   │
│  │                                                         │   │
│  │  Status:  ✓ Connected                                   │   │
│  │           text-green-600 + CheckCircle icon             │   │
│  │                                                         │   │
│  │  [Save]  [Remove]                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│  Provider card: bg-white border border-slate-200 rounded-lg p-5│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Google Translate                                        │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │                                                         │   │
│  │  API Key                                                │   │
│  │  ┌──────────────────────────────────────┐  [Show] [Test]│   │
│  │  │  Paste your Google API key…          │               │   │
│  │  └──────────────────────────────────────┘               │   │
│  │                                                         │   │
│  │  Status:  ✗ Not configured                              │   │
│  │           text-slate-400 + dash icon                    │   │
│  │                                                         │   │
│  │  [Save]                                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ──────────────────────────────────────────────────────────    │
│                                                                 │
│  Default MT provider                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  DeepL  ▼                                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│  text-xs text-slate-400 "Used when no project-level provider   │
│  is specified."                                                 │
│                                                                 │
│  Auto-request MT suggestions in editor                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  [Toggle: ON]   Automatically fetch MT for each         │    │
│  │                 segment when you open the editor.        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [Save settings]   primary button                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Provider card states:**

Connected (DeepL):
- Card: `bg-white border border-slate-200 rounded-lg p-5`
- Status: `CheckCircle` 16px `text-green-600` + "Connected" `text-sm text-green-600`
- API key field shows masked value `••••••••••••••••`
- [Show] button: ghost, `Eye` icon + "Show" text
- [Test] button: ghost, `Zap` icon + "Test" text
- [Save] primary small, [Remove] destructive small

Not configured (Google):
- Same card structure
- Status: `–` dash + "Not configured" `text-slate-400`
- Input is empty with placeholder
- [Save] only (no Remove when nothing saved)

Testing state (after clicking [Test]):
- Inline below button: `Loader2` spin + "Testing…" `text-slate-400 text-xs`
- Success: `✓ API key is valid` `text-green-600 text-xs`
- Failure: `✗ Invalid API key` `text-red-600 text-xs`

**No MT provider configured — banner:**
If both providers are unconfigured, show a full-width info banner above the provider cards:
```
┌──────────────────────────────────────────────────────────────────┐
│  ℹ  No MT provider configured.                                   │
│     Add a DeepL or Google API key to enable MT suggestions       │
│     in the editor.                                               │
└──────────────────────────────────────────────────────────────────┘
```
Banner: `bg-sky-50 border border-sky-200 rounded-lg px-4 py-3 text-sm text-sky-700 flex items-start gap-3`

---

## Tab 3: QA Defaults

**Show as third mockup state.**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  QA Check Defaults                                              │
│  text-lg font-semibold text-slate-900                          │
│                                                                 │
│  These settings apply when creating new projects.              │
│  You can override them per project.                            │
│  text-sm text-slate-500 mb-6                                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [✓]  Tag consistency                                   │   │
│  │       Flags segments where inline tags in source        │   │
│  │       are missing or mismatched in target.              │   │
│  │                                                         │   │
│  │  [✓]  Length ratio                                      │   │
│  │       Flags segments where target is much longer or     │   │
│  │       shorter than source.                              │   │
│  │       Max ratio:  [  2.5  ]  × source length           │   │
│  │                  small number input, 60px               │   │
│  │                                                         │   │
│  │  [✓]  Trailing spaces                                   │   │
│  │       Flags trailing whitespace in target.              │   │
│  │                                                         │   │
│  │  [✓]  Double spaces                                     │   │
│  │       Flags consecutive spaces in target.               │   │
│  │                                                         │   │
│  │  [✓]  Terminology consistency                           │   │
│  │       Flags segments where glossary terms are not       │   │
│  │       translated using the approved target term.         │   │
│  │                                                         │   │
│  │  [✓]  Number consistency                                │   │
│  │       Flags segments where numbers in source don't      │   │
│  │       appear in target.                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│  Container: bg-white border border-slate-200 rounded-lg p-5    │
│  Each check: border-b border-slate-100 pb-4 mb-4 (last: no border)│
│                                                                 │
│  [Save defaults]   primary button                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Each QA check row:**
- `flex items-start gap-3`
- Checkbox: shadcn `Checkbox`, 18px, checked = `bg-indigo-500`
- Label: `text-sm font-medium text-slate-800`
- Description: `text-xs text-slate-500 mt-0.5`
- "Length ratio" row has an additional inline number input for the ratio threshold

**Number input (Max ratio):**
- `w-16 text-center border border-slate-300 rounded px-2 py-1 text-sm`
- Suffix label: `text-sm text-slate-500 ml-1`

---

## States to Render in Mockups

**Mockup S1 — Profile tab (primary):**
Sidebar with Settings active. Tab navigation showing Profile as active. Form with name, email, UI language filled. Password section collapsed. Save button enabled.

**Mockup S2 — Machine Translation tab:**
DeepL provider: connected status (green), masked API key. Google: not configured, placeholder input. Default provider select set to DeepL. Auto-request toggle ON.

**Mockup S3 — QA Defaults tab:**
All 6 checks displayed and checked. Length ratio input showing "2.5". Save button at bottom.

---

## Component Detail Notes

**Toggle (Switch) appearance:**
- ON: `bg-indigo-500` track, white thumb
- OFF: `bg-slate-300` track, white thumb
- Size: 44×24px (standard shadcn Switch)

**Checkbox appearance:**
- Checked: `bg-indigo-500 border-indigo-500` with white checkmark
- Unchecked: `bg-white border border-slate-300`
- Disabled: `opacity-50`

**Input: API key masked:**
- Value: `••••••••••••••••••••` using bullet characters or `type="password"`
- Right side: icon buttons `[Eye]  [Zap]` — 28px touch target each
- `Eye` toggles between masked/visible
- `Zap` triggers API test

---

## Do Not Include

- No "Danger Zone" / account deletion section in V1
- No team or workspace management (V4 concern)
- No billing or subscription UI
- No webhook or API token settings
- Do not show all tabs open simultaneously — show one tab active per mockup

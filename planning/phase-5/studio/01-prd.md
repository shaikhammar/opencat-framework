# OpenCAT — Product Requirements Document

**Version:** 1.0 (Phase 5 Track D)
**Status:** Pre-development design
**Stack:** Laravel 13 + Inertia.js v2 + React 19 + TypeScript + Tailwind CSS v4
**Integration:** Direct Composer (`opencat/*` packages run in-process, no HTTP API dependency)

---

## Vision

An open-source, self-hosted web CAT tool built on the `opencat/*` package ecosystem. The studio is the reference application that proves the framework works end-to-end — and is genuinely useful to a working translator.

The studio is **not** a competitor to Phrase or memoQ. It is the open-source tool that a solo freelance translator can run on a $5/month VPS or their local machine, without paying per word, per seat, or per API call.

**North star:** A new translator can upload a file, translate it with TM and MT assistance, and export the target file — without reading a manual or watching a tutorial.

---

## Guiding Principles

### 1. Progressive disclosure
Show only what is needed at each step. Advanced options (QA configuration, MT adapter settings, filter options) are accessible but not in the way. The dashboard does not show TM statistics when the user has no TM yet.

### 2. Next-step hints
After every major action, surface the single most logical next action. Examples:

| State | Next-step hint |
|---|---|
| File upload complete, processing | "Your file is being prepared — this takes a few seconds." |
| File processing done | "Ready to translate → Open Editor" |
| All segments translated | "Translation complete — run QA or export?" |
| QA ran, issues found | "3 errors found — click to review before exporting." |
| QA ran, no issues | "No issues found — ready to export." |
| Export complete | "File exported. Return to project or upload another file." |
| Project has no TM | "No translation memory yet — translations will be saved automatically as you work." |
| Project has no MT config | "Add a DeepL or Google API key in Settings to enable machine translation suggestions." |

These hints appear as inline banners or empty-state callouts — not modal dialogs.

### 3. Keyboard-first editor
The translation editor must be fully operable without a mouse. Translators who work at speed use keyboard shortcuts exclusively. Every action in the editor has a keyboard equivalent.

### 4. RTL from day one
Urdu, Arabic, and Hebrew are first-class target languages. The segment editor, tag display, and exported files must handle right-to-left text correctly. This is non-negotiable — not a "future enhancement."

### 5. Transparent complexity
Power features exist but are not front and center. A translator who has never used a CAT tool should not be confused by the dashboard. A translator who has used Trados for 10 years should not feel limited.

### 6. Open by default
No licensing, no phone-home, no "enterprise only" features gated behind a paywall. Every feature in the codebase is available to every installation.

---

## User Personas

### V1 — Solo Translator (primary)
- Freelance translator working alone
- Uses English, Hindi, Urdu (or any language pair)
- Familiar with basic CAT tool concepts (segments, TM, QA)
- May or may not have a DeepL/Google API key
- Runs the studio on a personal server or locally
- Does not need collaboration features

### V2 — Translator + Reviewer (secondary, not in V1)
- Same as above, plus a second user who reviews and approves translations
- Needs a review queue and segment-locking

### V3 — Small Team (not in V1 or V2)
- Project manager creates projects and assigns files to translators
- Multiple translators work on different files of the same project
- PM sees overall project progress

### V4 — Multi-tenant (not in V1–V3)
- Multiple organizations share one installation
- Each organization has its own TM, glossary, and users
- Admin panel for org management

---

## V1 Scope (MVP — Solo Translator)

### Must-have

**Authentication**
- Strictly single-user: registration creates the one and only account; the `/register` route returns 403 on any subsequent visit
- Email + password login
- Remember me
- Password reset via email (requires mail driver configured in `.env`)

**Project Management**
- Create a project: name, source language, target language, optional description
- Project list on dashboard with status badge and progress bar
- Archive and delete projects
- Project overview: list of files with segment counts, word counts, and status

**File Handling**
- Upload source files: DOCX, PPTX, XLSX, HTML, TXT, PO, XLIFF, XML
- Async background processing (segmentation, TM matching, optional MT pre-fill)
- Processing status shown in real time via polling (SSE deferred to Phase 6)
- Download processed XLIFF (optional, for use in other tools)
- Export translated target file (same format as source)

**Translation Editor**
- Table-based segment grid: source | target rows
- Inline tag display as coloured chip badges (from D28 placeholder format)
- Segment status indicator per row (untranslated / draft / translated)
- TM matches panel showing top 4 fuzzy matches with diff highlighting
- MT suggestions panel (on-demand if MT configured, or auto-request)
- Terminology highlights in source text (terms from active glossary)
- QA issues panel (run on demand, or per-segment on save)
- Keyboard-first workflow (Tab, Ctrl+Enter, Ctrl+M, Ctrl+1–4)
- Auto-save target text on segment blur
- Segment notes (translator can attach a note to any segment)
- Filter segments by status (show only untranslated, show only errors)
- Jump to segment by number
- Word count progress bar in header

**Translation Memory**
- Project-level TM (PostgreSQL-backed via `PostgresTranslationMemoryProvider`)
- Auto-populate TM on segment status → Translated or Approved
- Import TMX file into project TM
- Export project TM as TMX
- Concordance search (search TM by source text)
- Global TM (shared across all projects, opt-in per project)

**Glossary**
- Project-level glossary (SQLite-backed via `SqliteTerminologyProvider`, or Postgres TM analog)
- Import TBX file
- Browse and search terms
- Term highlights in editor source text
- Term suggestions in TM panel when active segment contains recognized terms

**MT Integration**
- DeepL adapter (tag-preserving via XML mode, from D17)
- Google Translate adapter (plain text only, tags stripped, from D18)
- Per-user API key storage (encrypted in database)
- MT provider selection per project (or per user as default)
- MT pre-fill option: opt-in per file upload (toggle off by default); future V2 "Project Templates" feature will allow saving this as a default per language pair or project type

**QA**
- Run QA on all segments in a file (triggers background job)
- QA issues panel in editor: filterable list of errors/warnings/info
- Click issue to jump to affected segment
- QA checks from `opencat/qa`: missing tags, length ratio, leading/trailing spaces, double spaces, terminology consistency, number consistency
- QA configuration per project (enable/disable each check, set thresholds)

**Settings**
- User profile (name, email, password change, locale/UI language)
- MT API keys (DeepL key, Google key — stored encrypted)
- Default MT provider
- Default QA configuration

### Explicitly NOT in V1

| Feature | Why deferred |
|---|---|
| Multiple users / team sharing | Adds auth complexity; solo translator does not need it |
| Real-time collaboration / segment locking | Phase 6 |
| Reviewer role / review workflow | V2 |
| Project manager role | V3 |
| Multi-tenant / org isolation | V4 |
| SSE job progress | Polling is sufficient for single-user |
| Email notifications | No other users to notify |
| Project templates | Not enough variety in V1 to justify |
| Batch project creation | Not a solo-translator use case |
| Vendor management / assignments | V3+ |
| Invoice / billing | Not an open-source concern |
| Custom SRX segmentation rules | V2 (default SRX rules are good enough for V1) |
| Fuzzy Match Repair | Phase 6 |
| align tool (aligning bilingual documents to create TM) | Phase 6 |

---

## Feature Roadmap by Version

### V1 — Solo Translator
See "Must-have" above. Complete working CAT tool for one person.

### V2 — Translator + Reviewer
- Invite a second user (reviewer role)
- Segment-level locking (translator submits → reviewer locks segment during review)
- Reviewer inbox: list of files ready for review
- Rejected → Draft flow (D29 status transitions)
- Comment threads per segment (reviewer can explain rejection)
- Email notifications for status changes

### V3 — Small Team (PM + Translators + Reviewers)
- Project manager role
- Invite multiple translators and reviewers
- Assign files to specific translators
- Deadline per file
- PM dashboard: project progress across all files and assignees
- Word count reports (translated/reviewed/approved by date)
- Notification emails (file assigned, deadline approaching)

### V4 — Multi-tenant
- Organisation model (each org has its own users, projects, TM, glossary)
- Row-level security on all data (enforced at service layer)
- Org admin role (manage users, billing, settings for their org)
- Global admin role (manage orgs, system settings)
- Optional: subscription/billing integration hooks (not implemented, but schema supports it)
- Shared TM at org level (cross-project within the same org)

---

## Success Metrics (V1)

The V1 is successful when:

1. A translator can upload a DOCX file, translate all segments with TM and MT assistance, run QA, and export the target file — without consulting documentation.
2. Segment save latency is under 200ms (p95) on a $10/month VPS.
3. A 50,000-word file processes (segmentation + TM matching) in under 5 minutes on the same VPS.
4. The editor works correctly with Urdu → English and Arabic → English (RTL source or target).
5. Round-trip fidelity: exported DOCX is byte-identical in structure to the source, with only translated text replaced.

---

## Resolved Decisions

| # | Decision | Rationale |
|---|---|---|
| **D-S1** | **V1 is strictly single-user.** Registration is disabled after the first account is created. No additional users, no invite flow, no role differences in V1. V2 introduces a second user (reviewer). | The tool is a freelancer's personal CAT tool — one installation, one translator. Keeps auth and data isolation trivially simple. |
| **D-S2** | **Global TM is on by default for every new project.** Th
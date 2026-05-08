# Phase 5 Overview

Phase 5 begins after Phase 4 (framework packages + API service) is complete and stable.

## What changed from the original Phase 5 plan

The research report (`planning/research-formats-storage-architecture.md`) established that a web-based CAT studio must not use XLIFF as its persistence layer. Segments belong in PostgreSQL; XLIFF is generated on demand. This requires framework-level changes before the studio can be built correctly.

**Added:**
- Track A — DB-centric framework extension (new interfaces, adapters, and a Postgres TM provider across `opencat/core`, `opencat/project`, `opencat/translation-memory`, and `opencat/workflow`)
- Track B — API enhancements for segment-level CRUD, shared Postgres TM, and webhook callbacks

**Unchanged from original plan:**
- `opencat/filter-po` (D26–D27)
- `opencat/filter-xml` (D24–D25)
- `cat-framework-studio` (now depends on Track A + B completing first)

**Pushed to Phase 6:**
- SSE (Server-Sent Events) job progress — polling is sufficient for single-user MVP
- Multi-user collaborative editing (segment locking, conflict detection)
- Fuzzy Match Repair (Koehn & Senellart 2010) — Phase 6 once studio is stable

**Studio scope:** single-user MVP only. Multi-user infrastructure (locking, real-time sync) is Phase 6.

---

## Tracks

### Track A — DB-centric framework extension

Extends the framework's core packages to support PostgreSQL-backed segment and skeleton persistence. No breaking changes — all existing behaviour is preserved through the `InMemorySegmentStore` default.

**Packages modified:**

| Package | Change | Decision(s) |
|---|---|---|
| `opencat/core` | Add `InlineTagSerializer`, `SegmentStatus` enum | D28, D29 |
| `opencat/project` | Add `SegmentStoreInterface` + 3 adapters, `SkeletonStoreInterface` + 2 adapters | D30, D31 |
| `opencat/translation-memory` | Add `PostgresTranslationMemoryProvider` (pg_trgm) | D32 |
| `opencat/workflow` | Inject optional `SegmentStoreInterface` into `WorkflowRunner` | D33 |

**Build order within Track A:**

```
A1  opencat/core additions (D28, D29)
      │
      ▼
A2  opencat/project additions (D30, D31)
      │
      ▼
A3  opencat/translation-memory: PostgresProvider (D32)
      │
      ▼
A4  opencat/workflow: SegmentStoreInterface injection (D33)
```

Track A has no dependency on Track B, C, or D — it is pure framework work.

---

### Track B — API enhancements (`opencat-api`)

Extends the existing Phase 4 API with segment-level persistence, shared TM, and webhooks. Depends on Track A completing first (uses the new adapters).

**New capabilities:**

| Capability | Notes |
|---|---|
| Postgres migrations for segments, TM, TB | Replaces project-scoped SQLite as the primary store |
| `WorkflowRunner` wired to `PostgresSegmentStore` | Files processed via `/process` now also write segments to DB |
| Segment CRUD endpoints | GET/PATCH individual segments, bulk status update |
| Export endpoint | Generate target file from DB segments + skeleton |
| Shared TM (Postgres-backed, cross-project) | Replaces Phase 4's per-project SQLite TM for API users |
| Webhook callbacks | POST to caller URL on job completion |
| filter-po + filter-xml support | Once Track C packages ship |

**New/modified endpoints:**

```
# Segment management (new in Phase 5)
GET    /projects/{id}/files                        List files in a project
GET    /projects/{id}/files/{fileId}/segments      Paginated segment list (filterable by status)
GET    /projects/{id}/files/{fileId}/segments/{segId}  Segment detail
PATCH  /projects/{id}/files/{fileId}/segments/{segId}  Update target text + status
PATCH  /projects/{id}/files/{fileId}/segments      Bulk status update
GET    /projects/{id}/files/{fileId}/export        Generate + download target file

# Shared TM (new in Phase 5)
GET    /projects/{id}/tm                           TM for this project (Postgres-backed)
POST   /projects/{id}/tm/import                    Import TMX into shared Postgres TM
POST   /projects/{id}/tm/lookup                    Fuzzy lookup via pg_trgm

# Webhooks (new in Phase 5)
POST   /projects/{id}/webhooks                     Register webhook URL
DELETE /projects/{id}/webhooks/{id}                Remove webhook
```

**API decisions:** DA6–DA8. See `D28-D33-db-centric-decisions.md`.

---

### Track C — Filters

Two new filter packages. No dependency on Track A or B — they work against `BilingualDocument` like all other filters.

**`opencat/filter-po`** (D26–D27)
- Parses `.po` and `.pot` files
- Handles plurals (`msgid_plural`/`msgstr[n]`), context (`msgctxt`), extracted comments (`#.`)
- Round-trips to XLIFF preserving plural forms as separate segment pairs
- Fuzzy flag maps to `SegmentStatus::Draft`

**`opencat/filter-xml`** (D24–D25)
- Configurable XML filter covering Android `strings.xml`, DITA, DocBook, generic XML
- Rule DSL based on XPath expressions declaring which elements/attributes are translatable
- ITS 2.0 compatibility: respects `translate="no"`, `its:translate="no"`, `dir` attributes

Track C can be built in parallel with Track A. The API (Track B) enables these filters once the packages exist.

---

### Track D — `cat-framework-studio`

A fully functional single-user CAT tool built as a Laravel + Inertia + React application. Calls `opencat-api` over HTTP — does not use framework packages directly.

**Repository:** `cat-framework-studio` (separate repo)  
**Stack:** Laravel 11 + Inertia.js + React + TypeScript + Tailwind CSS  
**Depends on:** Tracks A, B, and C (filter-po at minimum) complete

**Core screens (MVP):**

| Screen | Notes |
|---|---|
| Projects list + create | Create project, upload source file, select language pair |
| File manager | List files in a project, show segment counts + word counts by status |
| Translation editor | Segment grid, TM panel, MT panel, terminology highlights, inline tag display |
| QA report | Filterable list of QA issues, click to jump to segment |
| TM management | Import TMX, export TMX, concordance search |
| Glossary | Import TBX, browse terms, TBX export |
| Settings | API connection, MT adapter, QA check config |

**RTL/Unicode requirements:** full RTL support in the segment editor. Urdu, Arabic, Hebrew target text must render correctly in a bidi-aware editor. Segment editor must handle bidirectional text — LTR source row, RTL target in the same table.

**Tag display in editor:** use the tag placeholder format defined in D28. Display `{1}`, `{/1}`, `{2/}` as coloured chips, not raw text. Prevent free-text editing of chip content; chips are drag-and-drop or keyboard-insertable.

**No multi-user features in MVP:** no segment locking, no concurrent-edit detection, no presence indicators. These are Phase 6.

**Segment save flow:**
```
Translator types in editor
  → PATCH /projects/{id}/files/{fileId}/segments/{segId}
      body: { targetText, status }
  → Response: updated segment (with auto TM write if status = Translated)
  → TM auto-populated: on Translated/Approved, segment is written to shared TM
```

---

## Build order summary

```
Track A1  opencat/core additions (D28, D29)
    │
Track A2  opencat/project additions (D30, D31)
    │
Track A3  opencat/translation-memory: PostgresProvider (D32)
    │
Track A4  opencat/workflow update (D33)
    │
    ├──────────────────────────────────────────┐
    │                                          │
Track C   filter-po (D26–D27)          Track B  API enhancements
Track C   filter-xml (D24–D25)                  (Postgres migrations,
    │                                            segment CRUD,
    │                                            shared TM, webhooks)
    │                                          │
    └──────────────────────────────────────────┘
                          │
                    Track D  cat-framework-studio
```

---

## What Phase 5 does NOT include

These are Phase 6:

| Item | Reason |
|---|---|
| SSE job progress | Polling is sufficient for single-user. SSE adds complexity. |
| Multi-user collaborative editing | Single-user MVP first. Locking + real-time sync is a separate feature. |
| Segment locking / presence | Same as above. |
| Fuzzy Match Repair service | Phase 6 once studio is stable and UX impact can be measured. |
| `opencat/filter-json` | Not yet scoped. Evaluate after studio is live. |

---

## Time estimate

| Track | Estimate |
|---|---|
| A Framework extension | 3–4 weeks |
| B API enhancements | 4–6 weeks |
| C filter-po + filter-xml | 3–5 weeks |
| D cat-framework-studio | 8–14 weeks |
| **Total Phase 5** | **~5–7 months at 5–10 hrs/week** |

Tracks A and C can overlap. Track B starts after Track A. Track D starts after Tracks A, B, and C (filter-po).

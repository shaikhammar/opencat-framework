# Phase 6 Overview

Phase 6 begins after Phase 5 (`cat-framework-studio` single-user MVP) is stable and in regular use.

---

## What was pushed here from Phase 5

| Item | Original plan | Reason pushed |
|---|---|---|
| SSE job progress | Phase 5 API | Polling is sufficient for single-user Phase 5. SSE adds complexity without clear MVP value. |
| Multi-user collaborative editing | Phase 5 | Single-user MVP first. Validate core workflow before adding collaboration complexity. |
| Fuzzy Match Repair service | Phase 5 | Both opencat/mt and opencat/translation-memory must be stable. Build once studio UX shows where repair would have the highest impact. |
| Semantic TM via pgvector | Phase 5 (discussed) | Phase 5 two-stage pg_trgm + Levenshtein already handles string-based matching correctly. pgvector requires ONNX embedding infrastructure and real usage data to tune. |

---

## Deliverables

### 1. SSE job progress

Replace the polling-based job status endpoint with Server-Sent Events.

**Change:** `GET /jobs/{id}/stream` opens a persistent HTTP connection. Events are pushed for each segment processed (using the `WorkflowRunner::onSegmentProcessed` callback).

**Why polling is fine for Phase 5:** the studio polls `GET /jobs/{id}` every 2 seconds. For typical file sizes (< 5 MB, < 500 segments), this completes in under a minute. SSE becomes worth the complexity once large files or batch processing are common use cases.

**Package affected:** `opencat-api` only. No framework package changes needed.

---

### 2. Multi-user collaborative editing

Enable multiple translators to work on the same project simultaneously without overwriting each other's segments.

**Scope:**

- **Segment locking:** a translator working on a segment holds a soft lock (TTL: 30 seconds, auto-renewed while editor is focused). Another translator sees the segment as locked and cannot PATCH it.
- **Lock table:**
  ```sql
  CREATE TABLE segment_locks (
      segment_id  UUID NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
      user_id     UUID NOT NULL,
      locked_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at  TIMESTAMPTZ NOT NULL,
      PRIMARY KEY (segment_id)
  );
  ```
- **API:** `POST /segments/{id}/lock`, `DELETE /segments/{id}/lock`, `GET /projects/{id}/files/{fileId}/segments` returns `lockedBy` field.
- **Studio UI:** locked segments shown with a user avatar indicator. Segment editor is disabled for locked segments.
- **Presence (optional, Phase 6):** WebSocket channel per project showing which segments each user is currently viewing.

**Why deferred:** single-user MVP has no race conditions. Locking adds UI complexity (lock indicators, auto-unlock on disconnect) and backend complexity (TTL cleanup job). Not worth building before the core translation UX is validated.

---

### 3. Fuzzy Match Repair

Implement the sub-segment repair algorithm from Koehn & Senellart (2010) to improve the quality of high-fuzzy-but-not-exact TM matches.

**What it does:**

When a TM match is 65â€“95% (fuzzy, but not exact), the matched TM target often needs only small changes corresponding to the differences between the stored TM source and the new segment source. Fuzzy Match Repair identifies the difference spans and uses the MT adapter to translate only the changed spans, then substitutes them into the TM target.

Example:
```
New source:    "Click the blue button to submit the form."
TM source:     "Click the green button to submit the form."   (90% match)
TM target:     "Cliquez sur le bouton vert pour soumettre le formulaire."

Repair:
  Changed span: "green" â†’ "blue"
  MT translates "blue" â†’ "bleu" (in context)
  Repaired TM target: "Cliquez sur le bouton bleu pour soumettre le formulaire."
```

**Implementation plan:**

- New service: `OpenCat\TranslationMemory\FuzzyMatchRepair`
- Dependencies: `TranslationMemoryInterface` (for the raw match), `MtAdapterInterface` (for span translation), `InlineTagSerializer` (to handle tags around changed spans)
- Integration point: called by `WorkflowRunner` when TM match score is between `repairMinThreshold` (default 0.65) and 1.0
- New `WorkflowOptions` field: `$fuzzyRepairEnabled = false` (opt-in)
- New `TmMatchStats` field: `repaired` count

**Why this is high value:** translators currently spend most post-editing time on 65â€“95% matches. Repair reduces that work significantly. The MT adapter (Phase 3) is already integrated. The framework just needs the repair orchestration.

**Reference:** Koehn, P. & Senellart, J. (2010). "Translation Memory with Source Correction." Proceedings of AMTA 2010.

---

### 4. `opencat/filter-json`

Support JSON-based resource files (i18next flat and nested formats, Flutter ARB).

**Why Phase 6:** JSON localization formats have no standard â€” every framework uses a slightly different structure. Scoping this correctly requires data from real studio users about which formats they actually encounter. Build after Phase 5 is in use.

**Decisions to lock:** D34 (key/namespace extraction strategy), D35 (plural form handling in JSON).

---

### 5. Semantic TM via `pgvector`

Extend `PostgresTranslationMemoryProvider` with vector-based semantic similarity lookup alongside the existing pg_trgm trigram lookup.

**What it adds:** surface TM matches that are semantically equivalent but string-dissimilar. Example: the query "I need to save the document" matches the TM entry "The file must be saved" even though trigram similarity is low. String-based fuzzy matching at any threshold would miss this entirely.

**Implementation:**

- Add `pgvector` extension to the Postgres instance (`CREATE EXTENSION vector`)
- Add `embedding vector(384)` column to `tm_units`
- Generate embeddings at TM import time using `all-MiniLM-L6-v2` (384-dimension model, runs locally via ONNX Runtime â€” no external API call required, no cost per query)
- HNSW index: `CREATE INDEX tm_units_vec ON tm_units USING hnsw(embedding vector_cosine_ops)`
- New provider: `SemanticPostgresTranslationMemoryProvider` â€” runs vector lookup in parallel with pg_trgm Stage 1, merges and re-ranks candidates before PHP Levenshtein re-score
- `TranslationMemoryInterface` contract unchanged â€” drop-in replacement

**Why Phase 6 and not Phase 5:**
- Phase 5's two-stage pg_trgm + Levenshtein approach already covers the string-similarity use case correctly.
- Embedding generation at import time requires bundling or calling an ONNX runtime â€” a new dependency that should only be introduced once the studio has real usage data showing where string-based matching fails.
- HNSW approximate search has tunable recall vs. speed trade-offs (`m`, `ef_construction`) that need calibration on real TM data.
- No production open-source CAT framework implements this. Phase 6 is the right point to do it properly rather than ship it prematurely.

**PHP ONNX options:**
- `onnxruntime-php` (FFI-based, runs natively) â€” experimental but functional
- Local HTTP microservice (Python FastAPI + `sentence-transformers`) â€” more reliable, adds Docker service
- Decision deferred to Phase 6 planning based on PHP ecosystem maturity at that time.

**Reference:** `pgvector` GitHub: https://github.com/pgvector/pgvector. Model: `sentence-transformers/all-MiniLM-L6-v2`.

---

### 6. Shared TM across projects (global TM pool)

Phase 5 adds a per-project Postgres TM. Phase 6 adds the ability to designate a TM as shared across all projects within an account (or all projects globally for self-hosted instances).

**Schema change:** `translation_memories.project_id` is already nullable (NULL = shared). Phase 6 adds the UI + API surface for managing shared TMs and controlling which projects read from them.

**Why deferred:** per-project TM is sufficient for single-translator use. Shared TM becomes valuable when multiple projects translate similar content (e.g., same product, different features).

---

## Time estimate

Phase 6 scope is TBD â€” it depends on what the studio reveals about actual usage patterns. Rough estimates:

| Item | Estimate |
|---|---|
| SSE job progress | 1 week |
| Multi-user locking | 3â€“4 weeks |
| Fuzzy Match Repair | 2â€“3 weeks |
| Semantic TM (pgvector) | 3â€“4 weeks |
| filter-json | 2â€“3 weeks |
| Shared TM | 1â€“2 weeks |
| **Total Phase 6** | **~4â€“5 months at 5â€“10 hrs/week** |

Revisit and scope Phase 6 precisely at Phase 5 completion.

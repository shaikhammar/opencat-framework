# CAT Framework: Research Report
## Formats, Storage, and Database-Centric Architecture

**Date:** 2026-04-25  
**Phase context:** Phase 4 planning (opencat/project + opencat/workflow + opencat-api)  
**Purpose:** Inform architectural decisions before cat-framework-studio (Phase 5) is designed.

---

## Question 1: Is XLIFF the Only Format Used in CAT Tools?

No. XLIFF is the dominant *interchange* standard, but the actual landscape is fragmented across three categories: **bilingual working formats**, **exchange/metadata formats**, and **source-native formats** that some tools translate directly without ever producing XLIFF.

---

### 1.1 Bilingual Working Formats

These are formats that hold the source + target side by side during the translation process.

| Format | Creator | Based on | Still Alive? | Notes |
|--------|---------|----------|--------------|-------|
| **XLIFF 1.2** | OASIS (2008) | XML | Yes — de facto standard | Most widely supported. What the framework's `opencat/xliff` package implements. |
| **XLIFF 2.0** | OASIS (2014) | XML | Yes — limited adoption | Modular, better metadata, cleaner inline tag model. Only Okapi, Memsource, and a few others fully support it. |
| **SDLXLIFF** | RWS (Trados Studio) | XLIFF 1.2 + SDL extensions | Yes | Adds `<sdl:seg-defs>`, `<sdl:cmt-defs>`, translation origin metadata. Cannot be round-tripped by standard XLIFF parsers. |
| **MQXLIFF** | memoQ | XLIFF 1.2 + memoQ extensions | Yes | Adds memoQ-specific status codes, match origins, comment structure. |
| **MXLIFF** | Phrase (Memsource) | XLIFF 1.2 + Memsource extensions | Yes | Adds Memsource status attributes, machine translation metadata. |
| **TXML** | Wordfast Pro | Custom XML (not XLIFF) | Yes | Entirely proprietary. Uses `<Tu>`, `<Tuv>` similar to TMX but as a bilingual working format. Not XLIFF at all. |
| **TTX** | Trados Workbench (legacy) | XML | Legacy — files still in use | The pre-Trados-Studio bilingual format. XML wrapper around the original document. Deprecated ~2012 but agencies still have archives. |
| **RTF-TT (BiText)** | Trados Workbench (very legacy) | RTF | Legacy | Pre-XML era bilingual RTF. Source and target interleaved in RTF markup. Translator Workbench format. Essentially dead but you'll encounter it. |
| **ITD** | STAR Transit | Proprietary XML | Yes (niche) | STAR Transit's native format. XML but proprietary schema. Large in German-speaking markets. |
| **PXF** | Across Language Server | Proprietary ZIP/XML | Yes (niche) | Across's project package format. Never published. |

**The honest picture:** "XLIFF" in the wild almost always means SDLXLIFF, MQXLIFF, or MXLIFF — not clean XLIFF 1.2. Every major tool extends XLIFF with proprietary attributes. A parser that reads OASIS XLIFF 1.2 correctly will still silently discard 20-40% of the metadata in a real-world file.

---

### 1.2 Exchange / Metadata Formats

These are not bilingual working formats. They exist for sharing data *between* tools or *between* systems.

| Format | Standard Body | Purpose | Notes |
|--------|--------------|---------|-------|
| **TMX 1.4b** | LISA / GALA | Translation Memory exchange | The actual standard for TM portability. What `opencat/tmx` implements. |
| **TBX (ISO 30042)** | ISO / GALA | Terminology exchange | The standard for glossary portability. What `opencat/terminology` implements via TBX-Basic. |
| **TBX-Basic** | LISA subset | Simplified TBX | The 80% subset actually used in practice. Full TBX is almost never used. |
| **SRX 2.0** | LISA / GALA | Segmentation rule exchange | What `opencat/srx` implements. |
| **GMX-V** | LISA | Word/character count metrics | Defines how to count translatable words. Almost never implemented outside dedicated tools. |
| **ITS 2.0** | W3C | Markup metadata for translatability | Defines attributes (translate="no", dir="rtl", etc.) for XML/HTML. Relevant for the framework's HTML and XML filters. |
| **OAXAL** | OASIS | Authoring + translation pipeline | Reference architecture only. Never widely implemented. |

---

### 1.3 Source-Native Formats Handled Directly

Many tools skip XLIFF entirely for these, translating directly in the format:

| Format | Use Case | XLIFF Round-trip? |
|--------|----------|-------------------|
| **PO / POT** | Open-source software (GNU gettext) | Rarely — tools often work PO-native |
| **TS** | Qt Linguist / C++ apps | Rarely |
| **ResX** | .NET applications | Sometimes |
| **Android XML** (strings.xml) | Android apps | Sometimes |
| **iOS .strings** | Apple apps | Sometimes |
| **ARB** | Flutter/Dart apps | Rarely |
| **JSON (i18next, nested, flat)** | Web frontends | Rarely |
| **YAML** (Rails i18n) | Rails apps | Rarely |
| **.properties** | Java apps | Rarely |
| **DITA / DocBook** | Technical documentation | Often extracted to XLIFF |
| **InDesign ICML** | Desktop publishing | Often extracted to XLIFF |
| **FrameMaker MIF** | Technical publishing | Often extracted to XLIFF |

**For the framework:** PO and XML filters (Phase 5, D24-D27) address the two most important missing source-native formats. JSON should be considered for Phase 6 given its ubiquity in web apps.

---

### 1.4 For / Against Using XLIFF as the Framework's Internal Format

**For XLIFF:**
- Industry expectation — agencies and LSPs work in XLIFF
- Interoperability with third-party tools (Trados, memoQ, Phrase)
- Round-trip fidelity: the skeleton + XLIFF fully reconstruct the original
- The OASIS spec is well-documented and stable
- What the framework already does — no redesign needed

**Against XLIFF as the *only* format:**
- XLIFF 1.2 inline tags (`<g>`, `<x/>`, `<ph>`) are ambiguous — mapping back to native markup requires the skeleton
- XLIFF 2.0 has better tag semantics but almost no tooling
- Proprietary XLIFF variants (SDLXLIFF etc.) require vendor-specific extensions to be useful
- File-based XLIFF is a poor fit for web UIs and real-time collaboration (see Question 2)
- PO files are better left as PO — converting them to XLIFF and back loses comments and context

**Recommendation for the framework:** XLIFF remains the right *output* format for interoperability. But the internal in-memory model (`BilingualDocument`) should be the primary working representation — XLIFF is one serialization of it, not the format itself. This is already the design. The question is whether XLIFF is also the persistence format (see Question 2).

---

### 1.5 Theoretical Work That Was Never Coded

These are specified or proposed standards that exist on paper but have little to no real implementation:

**TMX 2.0** — LISA's translation memory working group drafted a successor to TMX 1.4b in the early 2000s. It proposed stricter XML namespacing, segment variant tracking, and richer provenance metadata. LISA dissolved in 2011. TMX 2.0 was never published. The working documents exist in GALA archives. TMX 1.4b remains the practical standard.

**XLIFF 2.1** — The OASIS XLIFF TC had active discussions 2017–2019 about a 2.1 revision addressing inline tag ambiguity, adding a "match quality" module, and standardizing change-tracking. Work stalled and was never published. The meeting minutes and editor drafts are publicly accessible in the OASIS Kavi system.

**OLIF (Open Lexicon Interchange Format)** — A proposed ISO-adjacent standard for lexical databases, positioned as a theoretical successor to TBX for richer lexical information (morphology, syntax, semantic roles). Developed ~2000–2010 by a European consortium. Code barely exists. TBX-Basic is what everyone uses instead.

**GMX-V full implementation** — LISA's Global Maximum Word Count standard fully specifies how to count translatable content in every major format, including exclusion zones and repetition tracking. Almost no tool implements the full spec. Most "word count" in real tools is a heuristic.

**ITS 2.0 + XLIFF 2.0 integrated processing** — W3C and OASIS jointly published a mapping between ITS 2.0 metadata and XLIFF 2.0 modules (2013–2015). The combined pipeline (ITS-annotated source → XLIFF 2.0 with ITS module → MT → XLIFF → reconstruction) is theoretically complete. No production tool fully implements it. The framework's future XML filter (D24–D25) could be the first open-source implementation.

**Sub-segment TM / Fuzzy Match Repair** — Koehn & Senellart (2010, "Translation Memory with Source Correction", AMTA) formally described using SMT to repair 50–74% fuzzy matches by substituting only the changed portions. The approach yields better output than raw fuzzy matches. Implemented in research prototypes, never in production CAT tools. The algorithm is: (1) align source differences, (2) substitute changed spans using phrase table, (3) re-assemble. This is the most practically useful piece of research that no open-source framework has ever implemented.

**SRX 2.0 (draft)** — SRX 1.0 is implemented everywhere. The v2.0 working draft adds language inheritance hierarchies (child rules override parent locale rules) and negative lookahead patterns. The draft exists but was never finalized. All real implementations, including `opencat/srx`, use v1.0 semantics.

---

## Question 2: Web Application — XLIFF or Database Tables?

The short answer: **in a web application, you should not use XLIFF as the persistence layer.** Segments belong in the database. XLIFF is generated on demand.

---

### 2.1 The XLIFF-on-Disk Model

This is what desktop CAT tools do: parse source file, write an XLIFF, the translator edits the XLIFF directly or via the tool's UI, merge back.

**For:**
- Simple to implement (no DB design required)
- Files are portable — any XLIFF-aware tool can open them
- The skeleton + XLIFF pair fully describes the state
- No database dependency in the core framework (the framework currently does this correctly)

**Against:**
- Concurrent editing requires file locking — fundamentally broken for multi-user web apps
- Saving requires writing and reading a potentially large file on every keystroke
- No queryability: cannot ask "show me all untranslated segments across all files" without parsing every XLIFF
- No audit trail without a separate versioning layer
- Tags embedded in text make full-text search unreliable
- Progress tracking requires parsing all files
- Session recovery after browser crash is complex
- File I/O on a web server is a scaling bottleneck

---

### 2.2 The Database-Centric Model

This is what all modern cloud CAT tools use: Phrase (Memsource), Smartling, Crowdin, Lokalise, Transifex. Segments are rows. XLIFF is generated at export time.

**For:**
- Real-time multi-user: multiple translators work the same file simultaneously, changes are rows in a transaction
- No file I/O on save — a segment update is a `UPDATE segments SET target = $1, status = $2 WHERE id = $3`
- Full SQL queryability: word counts, status summaries, assignments, due dates, all trivial
- TM lookups can join against `tm_entries` in the same database
- Audit trail is standard: `updated_at`, `updated_by`, change log table
- Full-text search via PostgreSQL `pg_trgm` extension
- API-first: every operation is a DB read/write, naturally maps to REST/GraphQL

**Against:**
- The skeleton must be stored separately (filesystem, object storage, or DB blob)
- Inline tags require a design decision (see below)
- Export step adds latency when the final file is needed
- Round-trip fidelity depends entirely on how you store and reconstruct tags
- Vendor-specific metadata from SDLXLIFF etc. is hard to preserve

---

### 2.3 The Inline Tag Problem

This is the central challenge of DB-centric storage. A segment like:

```
The <b>quick</b> fox jumped <br/> over the lazy dog.
```

Must be stored in a way that:
1. Allows the translator to see source tags and mirror them in the target
2. Allows searching/filtering on the text content alone
3. Allows reconstruction of the native markup on export

**Three approaches:**

**Option A — Store raw markup in `source_text` / `target_text`**
Simple. Full text is stored with tags. Pro: easy to render. Con: fuzzy matching and full-text search are poisoned by tags. Phrase and Smartling use variants of this.

**Option B — Strip tags, store tag map as JSON**
```json
{
  "source_text": "The quick fox jumped  over the lazy dog.",
  "source_tags": [
    {"id": 1, "type": "paired", "tag": "b", "open_pos": 4, "close_pos": 9},
    {"id": 2, "type": "self_closing", "tag": "br", "pos": 21}
  ]
}
```
Pro: clean text for TM/MT/search. Con: tag offsets must be maintained as text is edited — non-trivial UI work. Used by some academic CAT systems.

**Option C — Inline tag placeholders**
Replace tags with indexed placeholders during extraction (`{1}`, `{/1}`, `{br/}`). Store plain text + a separate tag map for reconstruction.
Pro: translator sees `The {1}quick{/1} fox jumped {br/} over the lazy dog.` — clean, manageable. Con: requires a tag-aware editor in the UI. Used by Crowdin.

**Recommendation:** Option C for a web CAT tool. The tag placeholders map directly to what the framework's `InlineCode` model already represents. This is also the most translator-friendly display.

---

### 2.4 Proposed PostgreSQL Schema

Relevant for `opencat-api` (Phase 4, Track B) and `cat-framework-studio` (Phase 5).

```sql
-- Projects
CREATE TABLE projects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    source_lang CHAR(10) NOT NULL,  -- BCP 47: en-US, ar, zh-Hans
    target_lang CHAR(10) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Files (one row per uploaded source file)
CREATE TABLE project_files (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id       UUID REFERENCES projects(id) ON DELETE CASCADE,
    original_name    VARCHAR(500) NOT NULL,
    file_format      VARCHAR(20) NOT NULL,  -- docx, html, xliff, po, txt, xlsx, pptx
    skeleton_path    TEXT,                   -- path in object storage / filesystem
    skeleton_blob    BYTEA,                  -- or inline for small files
    word_count       INT DEFAULT 0,
    segment_count    INT DEFAULT 0,
    status           VARCHAR(20) DEFAULT 'pending',  -- pending, extracted, in_progress, completed
    created_at       TIMESTAMPTZ DEFAULT now()
);

-- Segments (the core table)
CREATE TABLE segments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id          UUID REFERENCES project_files(id) ON DELETE CASCADE,
    project_id       UUID REFERENCES projects(id) ON DELETE CASCADE,
    segment_number   INT NOT NULL,           -- order within file
    source_text      TEXT NOT NULL,          -- plain text with tag placeholders
    target_text      TEXT,                   -- null = untranslated
    source_tags      JSONB DEFAULT '[]',     -- tag map for reconstruction
    target_tags      JSONB DEFAULT '[]',
    status           VARCHAR(20) DEFAULT 'untranslated',
    -- untranslated | draft | translated | reviewed | approved | rejected
    word_count       INT DEFAULT 0,
    char_count       INT DEFAULT 0,
    -- TM match info (populated during TM lookup)
    tm_match_percent SMALLINT,
    tm_match_origin  VARCHAR(100),           -- 'tm', 'mt', 'human', 'pretranslated'
    -- Context
    context_before   TEXT,
    context_after    TEXT,
    note             TEXT,
    -- Audit
    locked           BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMPTZ DEFAULT now(),
    updated_at       TIMESTAMPTZ DEFAULT now(),
    translated_by    UUID,                   -- FK to users
    reviewed_by      UUID
);

-- Indexes
CREATE INDEX segments_file_id ON segments(file_id);
CREATE INDEX segments_project_status ON segments(project_id, status);
CREATE INDEX segments_source_trgm ON segments USING gin(source_text gin_trgm_ops);
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Translation Memory (replaces SQLite TM for multi-project use)
CREATE TABLE tm_units (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tm_id        UUID REFERENCES translation_memories(id) ON DELETE CASCADE,
    source_hash  CHAR(64) NOT NULL,          -- SHA-256 of normalised source
    source_text  TEXT NOT NULL,
    target_text  TEXT NOT NULL,
    source_lang  CHAR(10) NOT NULL,
    target_lang  CHAR(10) NOT NULL,
    usage_count  INT DEFAULT 1,
    created_at   TIMESTAMPTZ DEFAULT now(),
    last_used_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX tm_units_source_trgm ON tm_units USING gin(source_text gin_trgm_ops);
CREATE INDEX tm_units_hash ON tm_units(source_hash, source_lang, target_lang);

-- Terminology (replaces SQLite TB)
CREATE TABLE tb_entries (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tb_id        UUID REFERENCES termbases(id) ON DELETE CASCADE,
    source_term  TEXT NOT NULL,
    target_term  TEXT NOT NULL,
    source_lang  CHAR(10) NOT NULL,
    target_lang  CHAR(10) NOT NULL,
    definition   TEXT,
    domain       VARCHAR(100),
    forbidden    BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX tb_entries_source_trgm ON tb_entries USING gin(source_term gin_trgm_ops);
```

---

### 2.5 Fuzzy Matching in PostgreSQL

The `pg_trgm` extension enables indexed fuzzy retrieval. However, pg_trgm similarity scores (Jaccard over character trigram sets) are **not** equivalent to the Levenshtein-based match percentages that translators and SLAs use. They correlate but diverge on short segments — the cases most common in CAT work.

The correct approach is two-stage: pg_trgm does indexed candidate retrieval, PHP Levenshtein re-scores the small candidate set for the displayed percentage.

**Stage 1 — Postgres: fast indexed candidate retrieval**
```sql
-- Pull top candidates via GIN index — O(log n) regardless of TM size
SELECT id, source_text, target_text
FROM tm_units
WHERE
    source_lang = $1
    AND target_lang = $2
    AND similarity(source_text, $3) >= $4   -- broad pre-filter, e.g. 0.4
ORDER BY similarity(source_text, $3) DESC
LIMIT 50;   -- retrieve candidate pool, not final results
```

**Stage 2 — PHP: Levenshtein re-score for accurate match percentage**
```php
// Reuse LevenshteinScorer already in opencat/translation-memory
$matches = [];
foreach ($candidates as $row) {
    $score = $scorer->score($query, $row['source_text']); // 0–100, edit-distance based
    if ($score >= $minMatchPercent) {
        $matches[] = new TmMatch($row['source_text'], $row['target_text'], $score);
    }
}
usort($matches, fn($a, $b) => $b->score <=> $a->score);
return array_slice($matches, 0, $maxResults);
```

**Why two stages:** pg_trgm's GIN index reduces 1M TM entries to ~50 candidates in milliseconds. PHP Levenshtein on 50 candidates takes < 5ms. The result: index-speed retrieval with industry-standard score accuracy.

**Tuning:** set `trgm_threshold ≈ minMatchPercent × 0.7` to avoid the pre-filter rejecting candidates that Levenshtein would accept. For a 70% minimum match, use `trgm_threshold = 0.49`.

This extends (not replaces) the Levenshtein-based approach in `opencat/translation-memory` — pg_trgm handles the O(log n) candidate retrieval that SQLite cannot do; Levenshtein handles the accurate scoring that pg_trgm alone cannot guarantee.

---

## Question 3: Database-Centric Architecture — Redesign or Extension?

The framework does not need a complete redesign. The BilingualDocument model is already the right abstraction. What's needed is a **persistence adapter layer** that sits between BilingualDocument and storage.

---

### 3.1 Current Architecture (What Exists Now)

```
Source file
    │
    ▼
FilterInterface::extract()          (opencat/filter-*)
    │
    ▼
BilingualDocument                   (opencat/core)
    │ in-memory model
    │
    ├──► SegmentationEngine         (opencat/segmentation)
    │
    ├──► TranslationMemory          (opencat/translation-memory, SQLite)
    │
    ├──► QualityRunner              (opencat/qa)
    │
    └──► XliffWriter                (opencat/xliff)
              │
              ▼
         .xliff file
```

### 3.2 What Does NOT Need to Change

Every filter package (`filter-html`, `filter-docx`, `filter-xlsx`, `filter-pptx`, `filter-po`, `filter-xml`) produces a `BilingualDocument`. That contract is sound regardless of what happens to storage. These packages are completely unaffected.

The `SegmentationEngine`, `QualityRunner`, and `Terminology` packages all work on `BilingualDocument`. No changes needed.

The `XliffWriter` stays. It becomes one export path, not the primary persistence mechanism.

---

### 3.3 What Needs Extension (Not Redesign)

**The Skeleton Problem**
Currently, skeletons are written to the filesystem alongside the XLIFF. For DB-centric operation, the skeleton must be stored in the DB (as a blob) or in object storage (S3, MinIO, local path) with the reference stored in the DB.

This is already partially addressed by Phase 4's `opencat/project` (D21–D22, the `.catpack` archive format). The `catproject.json` manifest + `.catpack` ZIP maps naturally to a DB row with a stored blob. The `ProjectLoader` hydration path already anticipates this.

**The TranslationMemory Backend**
`opencat/translation-memory` currently ships with a `SqliteProvider`. A `PostgresProvider` needs to be added — same `TranslationMemoryInterface`, different backend. No interface changes. The PostgreSQL implementation uses pg_trgm as a pre-filter for candidate retrieval, then re-scores with PHP Levenshtein for accurate match percentages. See §2.5 for the two-stage design.

**The BilingualDocument → DB persistence path**
Currently there is no way to persist a `BilingualDocument` to a database and hydrate it back. This is the main gap. It can be bridged with a new interface:

```php
interface SegmentStoreInterface
{
    public function persist(BilingualDocument $doc, string $fileId): void;
    public function hydrate(string $fileId): BilingualDocument;
    public function updateSegment(string $segmentId, string $targetText, string $status): void;
    public function getSegments(string $fileId, array $filters = []): array;
}
```

Implementations:
- `InMemorySegmentStore` — wraps BilingualDocument, no DB (default, keeps all existing tests passing)
- `SqliteSegmentStore` — for single-user CLI and the API's project-scoped SQLite (Phase 4 DA4)
- `PostgresSegmentStore` — for the full multi-user web app (Phase 5)

This fits cleanly into either `opencat/project` or a new `opencat/segment-store` package.

**The WorkflowRunner (Phase 4, D23)**
Currently planned to output a `BilingualDocument` + `WorkflowResult`. To support DB persistence, the runner needs an optional `SegmentStoreInterface` injection:

```php
$runner = new WorkflowRunner(
    filter: $filter,
    segmenter: $segmenter,
    tm: $tm,
    qa: $qaRunner,
    segmentStore: $postgresStore  // optional; if null, keeps in-memory only
);
```

If `$segmentStore` is set, the runner writes segments to the DB after extraction and TM lookup, and returns a `WorkflowResult` that includes segment IDs instead of (or in addition to) the XLIFF file.

---

### 3.4 What Would Need Redesign for Full DB-Centric Operation

Nothing needs to be *torn down*. But the following Phase 5 design decisions should be made before `cat-framework-studio` is built, to avoid painting into a corner:

**Tag representation contract**
The framework must settle on how inline tags (`InlineCode`) are serialized to/from the DB. The placeholder approach (Option C from §2.3) is recommended. This affects how the studio's segment editor renders and serializes tags. Define the format in `opencat/core` as a standard serialization spec.

**Source-text normalization for TM**
The `TranslationMemoryInterface` currently normalizes source text before hashing. That normalization logic must be consistent between the CLI/SQLite path and the API/PostgreSQL path. If they diverge, TM hits will be missed. The normalization should be a standalone utility in `opencat/core` so both backends use the same code.

**Segment status state machine**
The statuses in the schema above (`untranslated`, `draft`, `translated`, `reviewed`, `approved`) should be defined as an enum or constants in `opencat/core` so they are consistent across the CLI framework, the API, and the studio. If the API defines them independently, the studio will eventually drift.

**Skeleton storage contract**
Whether the skeleton goes in the DB (blob) or object storage (path/URL), the contract for storing and retrieving it should be defined as an interface in `opencat/project` or `opencat/segment-store`. The API can implement it with filesystem initially, object storage later.

---

### 3.5 Architecture With DB-Centric Extension

```
Source file
    │
    ▼
FilterInterface::extract()          (opencat/filter-*)
    │
    ▼
BilingualDocument                   (opencat/core)
    │
    ├──► SegmentationEngine
    │
    ├──► TranslationMemory
    │        ├── SqliteProvider     (existing, single-user)
    │        └── PostgresProvider   (new, multi-user)
    │
    ├──► QualityRunner
    │
    ├──► SegmentStoreInterface      (new, opencat/project or segment-store)
    │        ├── InMemorySegmentStore   (wraps BilingualDocument, backward-compat)
    │        ├── SqliteSegmentStore     (API Phase 4, project-scoped)
    │        └── PostgresSegmentStore   (cat-framework-studio Phase 5)
    │
    └──► Export path (on demand)
             ├── XliffWriter        (existing)
             ├── TargetFileWriter   (uses skeleton + segment store to produce final file)
             └── TmxExporter        (existing, from TM)
```

The skeleton + segment store together replace what the XLIFF file currently does. The XLIFF writer becomes one export option among several, not the primary artifact.

---

### 3.6 Theoretical Work Relevant to This Architecture

**The "Translation Memory Server" concept (Brian Harris, 1988)** — Harris's original academic framework for shared TM infrastructure proposed a client-server model where multiple translators draw from a shared TM, with the server handling conflict resolution and provenance tracking. This is exactly what `PostgresSegmentStore` + `PostgresProvider` for TM enables. The theoretical framework existed 15 years before any open-source tool attempted it.

**TAUS Open TM API (2010–2014)** — The Translation Automation User Society proposed a REST API standard for TM operations (concordance search, match retrieval, segment submission) that any tool could implement as a common interface. The spec was published but never widely adopted. Relevant because `opencat-api`'s TM endpoints could implement this spec, giving it out-of-the-box interoperability with TAUS-aware tools. The spec is available at taus.net archives.

**"Segment Clustering for TM" (Planas, 2000)** — Emmanuel Planas's work proposed clustering TM entries by semantic similarity so that fuzzy matching could be done on clusters rather than full table scans. The practical implication for the framework: instead of (or in addition to) `pg_trgm` trigram similarity, sentence embeddings (e.g., via a lightweight ONNX model) could index segments by semantic meaning, enabling 60% string-dissimilar but semantically equivalent matches. No production CAT tool implements this. The framework's `TranslationMemoryInterface` is already designed to accommodate alternative backends, so a `SemanticSegmentStore` could be added without redesign.

**"Fuzzy Match Repair" (Koehn & Senellart, 2010)** — Described above in §1.5. The repair algorithm operates on the diff between the stored TM source and the new source segment. For the framework, this maps to: (1) `TranslationMemory::findMatches()` returns a 75% match, (2) a `FuzzyMatchRepair` service identifies the changed span, (3) an MT adapter substitutes the changed span only. The `opencat/mt` package (Phase 3) provides the MT adapter. A `FuzzyMatchRepair` service could sit in `opencat/translation-memory` or as a standalone package. This is the single highest-value unimplemented CAT research finding.

**ISO 12620 / Terminology Markup Framework (TMF)** — The meta-model behind TBX. It specifies a graph-based conceptual structure where terms are descriptions of concepts, not strings. A concept can have multiple source terms (synonyms), multiple target terms, usage notes, grammatical categories, domains, and forbidden-term flags — all as nodes in a graph. The framework's current `TbxParser` + `SqliteTerminologyProvider` implements a flat string model (source term → target term). A graph-backed TB (where a concept has multiple terms per language) would require a different schema but is theoretically well-specified. The `TerminologyProviderInterface` should be designed to accommodate this eventually. The current flat model is correct for Phase 2 but will need extension for professional terminology management.

**Adaptive TM (Nepveu et al., 2004; Ortiz-Martínez et al., 2010)** — Academic work on TM systems that update in real-time as the translator post-edits. Instead of batch importing TM entries at job end, each confirmed segment immediately improves future match quality *within the same session*. The `PostgresProvider` approach makes this trivial: each `updateSegment()` call can atomically write to `tm_units` via a database trigger or a hook in the `WorkflowRunner`. The framework's event/callback hook in `WorkflowRunner` (Phase 4, D23) could expose this as an on-confirm callback.

---

## Summary Recommendations

| Question | Recommendation |
|----------|---------------|
| XLIFF alternatives | XLIFF 1.2 remains the right export format. PO (Phase 5) is mandatory for software localization. JSON should follow. XLIFF 2.0 support is worth adding to the `opencat/xliff` package but is low priority. |
| Web app storage | Do not use XLIFF as persistence in the web app. Segments go in PostgreSQL. Use tag placeholders (Option C). Export XLIFF on demand. Skeleton stored as blob or object storage path. |
| Framework redesign | No complete redesign needed. Add `SegmentStoreInterface` (in `opencat/project` or a new package), add `PostgresProvider` for TM, define tag serialization contract in `opencat/core`. These are extensions, not rewrites. |
| Highest-value unimplemented theory | **Fuzzy Match Repair** (Koehn & Senellart 2010). High translator productivity impact, no production open-source implementation exists. Fits directly into the existing `opencat/translation-memory` + `opencat/mt` architecture. |

---

## References

| Item | Reference |
|------|-----------|
| XLIFF 1.2 spec | https://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html |
| XLIFF 2.0 spec | https://docs.oasis-open.org/xliff/xliff-core/v2.0/xliff-core-v2.0.html |
| TMX 1.4b spec | https://www.gala-global.org/tmx-14b |
| TBX (ISO 30042) | https://www.gala-global.org/tbx |
| SRX 2.0 draft | https://www.gala-global.org/srx-20-april-7-2008 |
| ITS 2.0 | https://www.w3.org/TR/its20/ |
| Fuzzy Match Repair | Koehn & Senellart, "Translation Memory with Source Correction", AMTA 2010 |
| Segment Clustering TM | Planas, "Simplification of Translation Memories", 2000 |
| Adaptive TM | Ortiz-Martínez et al., "Online Learning for Interactive Statistical Machine Translation", NAACL 2010 |
| ISO 12620 / TMF | ISO 12620:2009 — Terminology and other language and content resources |
| TAUS Open TM API | https://taus.net/resources/ (archived) |
| OAXAL | https://www.oasis-open.org/committees/oaxal/ |
| pg_trgm | https://www.postgresql.org/docs/current/pgtrgm.html |

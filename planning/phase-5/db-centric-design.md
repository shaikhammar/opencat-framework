# Phase 5 â€” DB-Centric Design Reference

Technical reference for the database-centric architecture introduced in Phase 5. Read this before implementing Track A or Track B.

---

## Architecture overview

```
Source file
    â”‚
    â–¼
FilterInterface::extract()        â†’ BilingualDocument + skeletonBytes
    â”‚                                       â”‚
    â”‚                               SkeletonStoreInterface::store()
    â”‚                               (FilesystemSkeletonStore or DatabaseSkeletonStore)
    â–¼
WorkflowRunner (per segment)
    â”œâ”€â”€ SegmentationEngine
    â”œâ”€â”€ TranslationMemory (SqliteProvider or PostgresProvider)
    â”œâ”€â”€ TerminologyProvider
    â”œâ”€â”€ MtAdapter
    â””â”€â”€ SegmentStoreInterface::persistSegment()
            â”‚
            â–¼
        InMemorySegmentStore     â† default, no persistence (CLI/tests)
        SqliteSegmentStore       â† .catpack / offline use
        PostgresSegmentStore     â† opencat-api + studio

Export path (on demand):
    SkeletonStoreInterface::retrieve() + InlineTagSerializer::deserialize()
    â†’ FilterInterface::rebuild() â†’ target file
```

---

## PostgreSQL schema

This is the canonical schema for `opencat-api` Phase 5. Use as-is for Laravel migrations.

```sql
-- Enable required extension (run once)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid()

-- -------------------------------------------------------
-- Projects
-- -------------------------------------------------------
CREATE TABLE projects (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(255) NOT NULL,
    source_lang  VARCHAR(20)  NOT NULL,  -- BCP 47: en-US, ar, ur, zh-Hans
    target_lang  VARCHAR(20)  NOT NULL,
    config       JSONB        DEFAULT '{}',  -- catproject.json content
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- Files
-- -------------------------------------------------------
CREATE TABLE project_files (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    original_name   VARCHAR(500) NOT NULL,
    file_format     VARCHAR(20)  NOT NULL,   -- docx, html, xliff, po, pptx, xlsx, txt, xml
    skeleton_blob   BYTEA,                   -- inline skeleton (DatabaseSkeletonStore)
    skeleton_path   TEXT,                    -- or filesystem path (FilesystemSkeletonStore)
    word_count      INT          NOT NULL DEFAULT 0,
    segment_count   INT          NOT NULL DEFAULT 0,
    status          VARCHAR(20)  NOT NULL DEFAULT 'pending',
    -- pending | extracting | extracted | in_progress | completed | error
    error_message   TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX project_files_project_id ON project_files(project_id);

-- -------------------------------------------------------
-- Segments  (the core table)
-- -------------------------------------------------------
CREATE TABLE segments (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id          UUID         NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
    project_id       UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    segment_number   INT          NOT NULL,     -- 1-based order within file
    source_text      TEXT         NOT NULL,     -- plain text with {N} {/N} {N/} placeholders (D28)
    target_text      TEXT,                      -- null = untranslated
    source_tags      JSONB        NOT NULL DEFAULT '[]',  -- tag map (see D28)
    target_tags      JSONB        NOT NULL DEFAULT '[]',
    status           VARCHAR(20)  NOT NULL DEFAULT 'untranslated',  -- SegmentStatus enum values (D29)
    word_count       INT          NOT NULL DEFAULT 0,
    char_count       INT          NOT NULL DEFAULT 0,
    -- TM/MT provenance
    tm_match_percent SMALLINT,                  -- 0-100, null = no match found
    tm_match_origin  VARCHAR(20),               -- 'tm', 'mt', 'human', 'exact'
    -- Context (for TM concordance and display)
    context_before   TEXT,
    context_after    TEXT,
    -- Translator notes
    note             TEXT,
    -- Lock (Phase 6: multi-user segment locking)
    locked           BOOLEAN      NOT NULL DEFAULT FALSE,
    -- Audit
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX segments_file_id       ON segments(file_id);
CREATE INDEX segments_project_status ON segments(project_id, status);
-- Full-text search / TM concordance on source text
CREATE INDEX segments_source_trgm   ON segments USING gin(source_text gin_trgm_ops);

-- -------------------------------------------------------
-- Translation Memory
-- -------------------------------------------------------
CREATE TABLE translation_memories (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID         REFERENCES projects(id) ON DELETE CASCADE,
    -- null project_id = shared/global TM (future Phase 6)
    name        VARCHAR(255) NOT NULL,
    source_lang VARCHAR(20)  NOT NULL,
    target_lang VARCHAR(20)  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE tm_units (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tm_id        UUID         NOT NULL REFERENCES translation_memories(id) ON DELETE CASCADE,
    source_hash  CHAR(64)     NOT NULL,     -- SHA-256 of normalised source text
    source_text  TEXT         NOT NULL,
    target_text  TEXT         NOT NULL,
    usage_count  INT          NOT NULL DEFAULT 1,
    last_used_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX tm_units_hash ON tm_units(tm_id, source_hash);
CREATE INDEX tm_units_source_trgm ON tm_units USING gin(source_text gin_trgm_ops);

-- -------------------------------------------------------
-- Termbases
-- -------------------------------------------------------
CREATE TABLE termbases (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID         REFERENCES projects(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    source_lang VARCHAR(20)  NOT NULL,
    target_lang VARCHAR(20)  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE tb_entries (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tb_id        UUID         NOT NULL REFERENCES termbases(id) ON DELETE CASCADE,
    source_term  TEXT         NOT NULL,
    target_term  TEXT         NOT NULL,
    definition   TEXT,
    domain       VARCHAR(100),
    forbidden    BOOLEAN      NOT NULL DEFAULT FALSE,
    note         TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX tb_entries_source_trgm ON tb_entries USING gin(source_term gin_trgm_ops);

-- -------------------------------------------------------
-- Webhooks  (DA8)
-- -------------------------------------------------------
CREATE TABLE webhooks (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    url         TEXT         NOT NULL,
    secret      VARCHAR(255) NOT NULL,  -- for HMAC signing
    events      TEXT[]       NOT NULL DEFAULT ARRAY['job.completed', 'job.failed'],
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

---

## TM fuzzy lookup â€” two-stage design

pg_trgm similarity (Jaccard over character trigram sets) is not the same metric as the Levenshtein-based match percentages that CAT tools display and SLAs reference. They correlate but diverge on short segments. Using raw pg_trgm as the displayed score would produce percentages that differ from industry norms and break pricing/workflow rules based on match bands.

The `PostgresTranslationMemoryProvider` (D32) uses two stages.

### Stage 1 â€” Postgres: indexed candidate retrieval

```sql
-- GIN index on source_text gin_trgm_ops makes this O(log n)
SELECT id, source_text, target_text
FROM tm_units
WHERE
    tm_id       = :tm_id
    AND source_lang = :source_lang
    AND target_lang = :target_lang
    AND similarity(source_text, :query) >= :trgm_threshold
ORDER BY similarity(source_text, :query) DESC
LIMIT 50;
```

`trgm_threshold` is a broad pre-filter, not the final match gate. Set it to approximately `minMatchPercent Ã— 0.7`. For a 70% minimum: `trgm_threshold = 0.49`. This ensures no valid Levenshtein candidate is discarded by the pre-filter.

### Stage 2 â€” PHP: Levenshtein re-score

```php
$matches = [];
foreach ($candidates as $row) {
    // Same LevenshteinScorer used by SqliteTranslationMemoryProvider
    $score = $this->scorer->score($query, $row['source_text']); // 0â€“100
    if ($score >= $this->minMatchPercent) {
        $matches[] = new TmMatch(
            sourceText: $row['source_text'],
            targetText: $row['target_text'],
            score:      $score,
            origin:     'tm'
        );
    }
}
usort($matches, fn($a, $b) => $b->score <=> $a->score);
return array_slice($matches, 0, $this->maxResults);
```

### Performance profile

| TM size | pg_trgm candidate retrieval | PHP Levenshtein on 50 candidates | Total |
|---|---|---|---|
| 10k entries | < 1ms | < 1ms | < 2ms |
| 100k entries | 2â€“5ms | < 5ms | < 10ms |
| 1M entries | 5â€“15ms | < 5ms | < 20ms |

The GIN index means Stage 1 scales logarithmically. Stage 2 is always bounded by the fixed candidate limit (50), so it never scales with TM size.

### pgvector upgrade path (Phase 6)

`pgvector` is a PostgreSQL extension â€” no separate service required. It adds a `vector(N)` column type and HNSW/IVFFlat indexes for approximate nearest-neighbor search. Adding semantic TM lookup to `PostgresTranslationMemoryProvider` requires:

1. `vector(384)` column on `tm_units` (using `all-MiniLM-L6-v2` embeddings, 384 dimensions)
2. HNSW index: `CREATE INDEX tm_units_vec ON tm_units USING hnsw(embedding vector_cosine_ops)`
3. Embedding generation at import time (ONNX model via PHP FFI, or HTTP call to a local embedding service)
4. Parallel vector lookup merged with Stage 1 trigram results, re-ranked by combined score

The `TranslationMemoryInterface` contract does not change. A `SemanticPostgresTranslationMemoryProvider` can be a subclass or separate adapter. This is planned for Phase 6 once the studio has real usage data to validate whether semantic matching improves translator productivity.

---

## Tag placeholder examples

These examples show how the `InlineTagSerializer` (D28) transforms `BilingualDocument` segments for storage.

**Example 1 â€” bold text (paired tags)**

Source file content: `The <b>quick</b> fox.`

BilingualDocument `InlineCode` sequence:
```
[PlainText "The "] [InlineCode open id=1 data="<b>"] [PlainText "quick"] [InlineCode close id=1 data="</b>"] [PlainText " fox."]
```

Stored in DB:
```
source_text = "The {1}quick{/1} fox."
source_tags = [
  {"id": 1, "type": "open",  "data": "<b>",  "displayText": "b"},
  {"id": 1, "type": "close", "data": "</b>", "displayText": "/b"}
]
```

Translator types target:
```
target_text = "Le {1}renard{/1} rapide."
```

Export reconstruction:
```
"Le <b>renard</b> rapide."
```

---

**Example 2 â€” self-closing tag (line break)**

Source: `First line.<br/>Second line.`

Stored:
```
source_text = "First line.{1/}Second line."
source_tags = [{"id": 1, "type": "self", "data": "<br/>", "displayText": "br/"}]
```

---

**Example 3 â€” DOCX run with formatting (InlineCode from OoxmlRunMerger)**

Source DOCX: `Hello ` (bold) + `world` (normal) â€” the bold-to-normal transition creates InlineCodes.

BilingualDocument:
```
[InlineCode open id=1 data="<w:r><w:rPr><w:b/></w:rPr><w:t>"] [PlainText "Hello "] [InlineCode close id=1 data="</w:t></w:r>"] [PlainText "world"]
```

Stored:
```
source_text = "{1}Hello {/1}world"
source_tags = [
  {"id": 1, "type": "open",  "data": "<w:r><w:rPr><w:b/></w:rPr><w:t>", "displayText": "b"},
  {"id": 1, "type": "close", "data": "</w:t></w:r>",                      "displayText": "/b"}
]
```

The `displayText` is what the studio renders as a chip label. The `data` is what is written back into the skeleton on export. The translator never sees the `data`.

---

**Example 4 â€” missing tag in target (QA catch)**

Source: `Click {1}here{/1}.`
Target typed: `Cliquez ici.`  â† translator dropped the tags

`SegmentStoreInterface::updateSegment()` accepts this â€” it does not validate tags on save. The QA runner's `TagConsistencyCheck` flags it as an ERROR when the translator runs QA or when the project's QA check runs on export. The PATCH endpoint returns the updated segment with a `qaWarnings` field if real-time QA is enabled in the API config.

---

## SegmentStatus state machine

```
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â–¼                           â”‚
 â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  MT fill  â”Œâ”€â”€â”€â”€â”€â”€â”€â”  confirm  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
 â”‚ Untranslatedâ”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚ Draft â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚ Translated â”‚
 â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜           â””â”€â”€â”€â”€â”€â”€â”€â”˜           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
        â”‚                      â–²                      â”‚
        â”‚   exact TM match      â”‚   reject             â”‚  review + approve
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–ºâ”‚              â”Œâ”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”
                                â”‚              â”‚   Reviewed   â”‚
                           â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                           â”‚   Rejected    â”‚â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     reject
                                                         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                                                         â”‚ Approved â”‚
                                                         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Auto-TM write rule:** when a segment transitions to `Translated` or `Approved` and `autoWriteToTm = true`, `PostgresSegmentStore` writes the pair to `tm_units`. Hash is SHA-256 of the normalised source text (whitespace collapsed, case-preserved). If the hash already exists, `usage_count++` and `last_used_at` is updated rather than inserting a duplicate.

---

## InlineTagSerializer â€” implementation sketch

This is guidance for implementation, not a final spec. Adjust as needed.

```php
namespace OpenCat\Core\Serializer;

class InlineTagSerializer
{
    public static function serialize(Segment $segment): SerializedSegment
    {
        $text = '';
        $tagMap = [];
        $idCounter = 1;
        // Track which InlineCode IDs map to which placeholder IDs
        $idMapping = []; // InlineCode->id => placeholder int ID

        foreach ($segment->getContent() as $item) {
            if ($item instanceof PlainText) {
                $text .= $item->getText();
            } elseif ($item instanceof InlineCode) {
                if ($item->getType() === InlineCodeType::Open) {
                    $pid = $idCounter++;
                    $idMapping[$item->getId()] = $pid;
                    $text .= '{' . $pid . '}';
                    $tagMap[] = [
                        'id' => $pid, 'type' => 'open',
                        'data' => $item->getData(), 'displayText' => $item->getDisplayText() ?? self::guessLabel($item->getData())
                    ];
                } elseif ($item->getType() === InlineCodeType::Close) {
                    $pid = $idMapping[$item->getId()] ?? $idCounter++;
                    $text .= '{/' . $pid . '}';
                    $tagMap[] = [
                        'id' => $pid, 'type' => 'close',
                        'data' => $item->getData(), 'displayText' => $item->getDisplayText() ?? self::guessLabel($item->getData())
                    ];
                } else { // self-closing
                    $pid = $idCounter++;
                    $text .= '{' . $pid . '/}';
                    $tagMap[] = [
                        'id' => $pid, 'type' => 'self',
                        'data' => $item->getData(), 'displayText' => $item->getDisplayText() ?? self::guessLabel($item->getData())
                    ];
                }
            }
        }

        return new SerializedSegment(text: $text, tagMap: $tagMap);
    }

    public static function deserialize(string $text, array $tagMap): Segment
    {
        // Parse {N}, {/N}, {N/} placeholders back into InlineCode objects
        // Build tag lookup: [id => [open_data, close_data, type]]
        // Split text on placeholder pattern, reconstruct Segment content
        // ...
    }

    private static function guessLabel(string $data): string
    {
        // Strip angle brackets and namespace prefixes for display
        // "<b>" â†’ "b", "<w:r>" â†’ "r", "<br/>" â†’ "br/"
        preg_match('/<\/?([a-zA-Z:]+)/', $data, $m);
        return $m[1] ?? '?';
    }
}
```

---

## API: processing flow with segment store (Phase 5)

```
POST /projects/{id}/process
  body: { fileId, targetLang, options }

1. ProjectService::buildWorkflowRunner($project, withSegmentStore: true)
   â†’ builds WorkflowRunner with PostgresSegmentStore + DatabaseSkeletonStore

2. WorkflowRunner::process($filePath, $targetLang)
   â†’ extract â†’ segment â†’ TM â†’ MT â†’ QA
   â†’ foreach segment: PostgresSegmentStore::persistSegment($pair, $fileId)
   â†’ DatabaseSkeletonStore::store($fileId, $format, $skeletonBytes)
   â†’ XliffWriter::write() if writeXliff = true

3. Return WorkflowResult
   { storeFileId, matchStats, qaIssues, xliffFileId?, timings }
```

After this call, the studio can:
- `GET /projects/{id}/files/{fileId}/segments` â†’ list all segments
- `PATCH /projects/{id}/files/{fileId}/segments/{segId}` â†’ translate
- `GET /projects/{id}/files/{fileId}/export` â†’ download target file

---

## Export flow (DB segments â†’ target file)

```
GET /projects/{id}/files/{fileId}/export

1. Load project_files row (get format, skeleton reference)
2. DatabaseSkeletonStore::retrieve($handle) â†’ skeletonBytes
3. Load all segments for fileId, ordered by segment_number
4. For each segment:
   a. InlineTagSerializer::deserialize(target_text, target_tags) â†’ Segment
5. Reconstruct BilingualDocument from segments
6. FilterRegistry::getFilter(format)::rebuild(document, skeletonBytes) â†’ targetFileBytes
7. Return binary response
   Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document (or correct MIME)
   Content-Disposition: attachment; filename="{original_name}"
```

**Untranslated segments on export:**
- If `target_text` is null for a segment, export uses the source text as fallback.
- This is the standard CAT tool behaviour (source fallback for untranslated segments).

---

## Laravel Eloquent models (API, Phase 5 additions)

```php
// app/Models/Segment.php
class Segment extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $casts = [
        'source_tags'      => 'array',
        'target_tags'      => 'array',
        'status'           => SegmentStatus::class,  // cast to PHP enum
        'locked'           => 'boolean',
        'tm_match_percent' => 'integer',
    ];

    public function file(): BelongsTo    { return $this->belongsTo(ProjectFile::class); }
    public function project(): BelongsTo { return $this->belongsTo(Project::class); }
}

// app/Models/TmUnit.php
class TmUnit extends Model
{
    protected $casts = ['last_used_at' => 'datetime'];
    public function tm(): BelongsTo { return $this->belongsTo(TranslationMemory::class); }
}
```

---

## `PostgresSegmentStore` dependency injection in the API

`ProjectService::buildWorkflowRunner()` is the single place that constructs a `WorkflowRunner` for the API. In Phase 5, it conditionally injects the segment store:

```php
class ProjectService
{
    public function buildWorkflowRunner(
        Project $project,
        string $targetLang,
        bool $withSegmentStore = false
    ): WorkflowRunner {
        $tm = new PostgresTranslationMemoryProvider(
            pdo: DB::connection('pgsql')->getPdo(),
            tmId: $project->tm_id,
            minSimilarity: 0.5
        );

        $segmentStore = $withSegmentStore
            ? new PostgresSegmentStore(DB::connection('pgsql')->getPdo())
            : null;

        $skeletonStore = $withSegmentStore
            ? new DatabaseSkeletonStore(DB::connection('pgsql')->getPdo())
            : null;

        return new WorkflowRunner(
            fileFilterRegistry:  app(FileFilterRegistry::class),
            segmentationEngine:  app(SrxSegmentationEngine::class),
            translationMemory:   $tm,
            terminologyProvider: $this->buildTermProvider($project),
            mtAdapter:           $this->buildMtAdapter($project),
            qaRunner:            $this->buildQaRunner($project),
            xliffWriter:         app(XliffWriter::class),
            options:             WorkflowOptions::fromProject($project),
            segmentStore:        $segmentStore,
            skeletonStore:       $skeletonStore,
        );
    }
}
```

# Phase 5 Design Decisions â€” DB-Centric Architecture (D28â€“D33, DA6â€“DA8)

These decisions lock the contracts for database-centric segment and skeleton persistence. They extend the framework without breaking any existing interface.

---

## D28 â€” InlineCode tag placeholder serialization contract

**Package:** `opencat/core`

**Decision:** Define a canonical text representation for `InlineCode` objects when stored in a database `source_text` / `target_text` column. Add `OpenCat\Core\Serializer\InlineTagSerializer` to `opencat/core`.

**Placeholder format:**

| InlineCode type | Example tag | Placeholder |
|---|---|---|
| Opening paired (`<g>`) | `<b>` | `{1}` |
| Closing paired (`</g>`) | `</b>` | `{/1}` |
| Self-closing / isolated (`<x/>`, `<ph>`) | `<br/>` | `{1/}` |

IDs are sequential integers assigned per segment (reset to 1 for each new segment). The ID connects a `{1}` open to its `{/1}` close.

**Tag map (stored alongside `source_text` as JSON):**

```json
[
  { "id": 1, "type": "open",  "data": "<b>",  "displayText": "b" },
  { "id": 1, "type": "close", "data": "</b>", "displayText": "/b" },
  { "id": 2, "type": "self",  "data": "<br/>","displayText": "br/" }
]
```

**`InlineTagSerializer` API:**

```php
// Segment source: "The <b>quick</b> fox.<br/>"
// Produces:
$result = InlineTagSerializer::serialize($segment);
// $result->text    = "The {1}quick{/1} fox.{2/}"
// $result->tagMap  = [ ...JSON above... ]

// Reverse:
$segment = InlineTagSerializer::deserialize("The {1}quick{/1} fox.{2/}", $tagMap);
```

**Why these placeholders:**
- Curly braces `{}` are not valid XLIFF inline tag content, so they cannot appear in source InlineCode data.
- The format is human-readable in the editor UI (translators see `{1}`, `{/1}` rather than XML).
- Numeric IDs rather than tag names: prevents exposing implementation details (e.g., `<w:r>` OOXML tag names) to translators.
- Self-closing uses `{N/}` to distinguish from paired opens `{N}` â€” a translator who inserts `{1}` without `{/1}` will produce a detectable QA error.

**Alternatives rejected:**
- XLIFF inline markup in DB text: mixes presentation and storage concerns; impossible to full-text search.
- HTML tags (`<b>`, `</b>`): conflict with target languages that may naturally contain angle brackets in source text.
- Named placeholders (`{bold_open}`, `{bold_close}`): verbose, and multiple spans of the same type become ambiguous.

---

## D29 â€” SegmentStatus as PHP 8.2 backed enum in opencat/core

**Package:** `opencat/core`

**Decision:** Define `SegmentStatus` as a PHP 8.2 backed `string` enum in `opencat/core`. Every part of the system (framework packages, API models, studio) uses this single definition.

```php
namespace OpenCat\Core;

enum SegmentStatus: string
{
    case Untranslated = 'untranslated';
    case Draft        = 'draft';         // partial translation or MT fill, needs review
    case Translated   = 'translated';    // translator-confirmed
    case Reviewed     = 'reviewed';      // reviewed by second translator/editor
    case Approved     = 'approved';      // final, locked
    case Rejected     = 'rejected';      // reviewed + sent back for correction
}
```

**Allowed transitions:**

```
Untranslated â†’ Draft â†’ Translated â†’ Reviewed â†’ Approved
                                  â†˜ Rejected â†’ Draft â†’ Translated â†’ Reviewed â†’ Approved
```

Transitions are enforced in `SegmentStoreInterface::updateSegment()` â€” an attempt to move `Approved â†’ Draft` throws `InvalidStatusTransitionException`. This prevents accidentally reopening finalized segments.

**Mapping from existing sources:**
- XLIFF `state="translated"` â†’ `Translated`
- XLIFF `state="signed-off"` â†’ `Approved`
- TM exact match (100%) â†’ `Translated` (auto-confirmed)
- TM fuzzy match â†’ `Draft`
- MT fill â†’ `Draft`
- PO fuzzy flag â†’ `Draft`

**Why in `opencat/core`:**
- The enum is referenced by `SegmentPair`, `SegmentStoreInterface`, the API's Eloquent models, and the studio's React components (via the API's JSON). One definition, no duplication.
- If it lived in `opencat/project`, the API could not use it without pulling in the full project package.

---

## D30 â€” SegmentStoreInterface in opencat/project

**Package:** `opencat/project`

**Decision:** Add `SegmentStoreInterface` and three concrete adapters to `opencat/project`. The interface is the persistence contract for segments. All adapters implement it. `WorkflowRunner` is updated (D33) to optionally accept one.

**Interface:**

```php
namespace OpenCat\Project\Store;

interface SegmentStoreInterface
{
    /**
     * Persist all SegmentPairs from a BilingualDocument under a file ID.
     * Returns the file ID (may be generated if not provided).
     */
    public function persist(BilingualDocument $doc, string $fileId): string;

    /** Hydrate a BilingualDocument from stored segments. */
    public function hydrate(string $fileId): BilingualDocument;

    /**
     * Update a single segment's target text and/or status.
     * Throws InvalidStatusTransitionException on illegal transition.
     */
    public function updateSegment(
        string $segmentId,
        ?string $targetText,
        ?SegmentStatus $status
    ): void;

    /** Retrieve segments with optional filtering. */
    public function getSegments(
        string $fileId,
        ?SegmentStatus $filterStatus = null,
        int $limit = 100,
        int $offset = 0
    ): array; // returns StoredSegment[]

    /** Retrieve a single segment by ID. */
    public function getSegment(string $segmentId): StoredSegment;

    /** Total segment count for a file (optionally filtered). */
    public function countSegments(string $fileId, ?SegmentStatus $status = null): int;
}
```

**Three adapters:**

| Adapter | Use case |
|---|---|
| `InMemorySegmentStore` | Default, wraps `BilingualDocument`. No persistence. Keeps all existing CLI/test behaviour. |
| `SqliteSegmentStore` | For `.catpack` archives and single-project CLI workflows. Writes to a `segments.db` SQLite file. |
| `PostgresSegmentStore` | For `opencat-api` and `cat-framework-studio`. Uses PDO + PostgreSQL. |

`ProjectLoader::buildWorkflowRunner()` gains an optional `SegmentStoreInterface` parameter. If absent, `InMemorySegmentStore` is used and nothing changes.

**`StoredSegment` value object:**

```php
class StoredSegment
{
    public string $id;
    public string $fileId;
    public int $segmentNumber;
    public string $sourceText;       // with tag placeholders (D28 format)
    public ?string $targetText;
    public array $sourceTags;        // tag map JSON-decoded
    public array $targetTags;
    public SegmentStatus $status;
    public int $wordCount;
    public ?int $tmMatchPercent;
    public ?string $tmMatchOrigin;   // 'tm', 'mt', 'human'
    public ?string $contextBefore;
    public ?string $contextAfter;
    public ?string $note;
    public \DateTimeImmutable $createdAt;
    public \DateTimeImmutable $updatedAt;
}
```

**Why in opencat/project and not a new package:**
- Segment persistence is a project-level concern. A project owns its segments the same way it owns its TM and glossary SQLite files.
- `ProjectLoader` already hydrates framework objects. Adding segment store hydration is natural.
- Keeps the package count down â€” one more package adds maintenance overhead.

---

## D31 â€” SkeletonStoreInterface in opencat/project

**Package:** `opencat/project`

**Decision:** Extract skeleton storage from the filter packages' filesystem assumption into an interface. Filters produce a skeleton and pass it to the store. The store returns it when the target file is generated.

**Interface:**

```php
namespace OpenCat\Project\Store;

interface SkeletonStoreInterface
{
    /** Store skeleton bytes and return a reference handle. */
    public function store(string $fileId, string $format, string $skeletonBytes): string;

    /** Retrieve skeleton bytes by handle. */
    public function retrieve(string $handle): string;

    /** Delete skeleton (on project or file deletion). */
    public function delete(string $handle): void;
}
```

**Two adapters:**

| Adapter | Behaviour |
|---|---|
| `FilesystemSkeletonStore` | Writes to `{outputDir}/{fileId}.skl` â€” exactly the current behaviour (D2). Default adapter. |
| `DatabaseSkeletonStore` | Stores bytes as a `BYTEA` blob in `project_files.skeleton_blob`. Used by the API. |

**Why not object storage (S3) as a first-class adapter:**
- Object storage is a deployment concern, not a framework concern.
- The API's `FileStorageService` (Phase 4) already abstracts Laravel's filesystem (local/S3). The `FilesystemSkeletonStore` in the API context writes to whatever `FileStorageService` resolves â€” the adapter sees a path, not a disk type.

**No change to filter packages:**
- Filters currently write skeletons to disk via `file_put_contents`. This changes: `WorkflowRunner` injects the `SkeletonStoreInterface` and passes it to the filter after extraction. Filters that currently write skeletons directly will need a small update to call `$skeletonStore->store(...)` instead.
- This is the only breaking change to existing filter packages. It is backward compatible because `FilesystemSkeletonStore` writes to the same path as before.

---

## D32 â€” PostgresTranslationMemoryProvider

**Package:** `opencat/translation-memory`

**Decision:** Add `PostgresTranslationMemoryProvider` to `opencat/translation-memory`. Uses `pg_trgm` trigram similarity for fuzzy matching instead of Levenshtein. Requires `ext-pdo_pgsql` (declared as a Composer `suggest`, not `require`).

**Constructor:**

```php
$provider = new PostgresTranslationMemoryProvider(
    pdo: $pdo,                  // PDO connected to Postgres
    tmId: 'shared',             // discriminator for multi-TM within same DB
    minSimilarity: 0.5,         // pg_trgm similarity threshold (= 50% match)
    maxResults: 10
);
```

**Two-stage fuzzy lookup (pg_trgm pre-filter + PHP Levenshtein re-score):**

pg_trgm similarity and Levenshtein-based match percentages are correlated but not identical. pg_trgm is a Jaccard similarity over character trigram sets; professional CAT match percentages are based on normalised edit distance. The difference is most visible on short segments (under ~10 words). Using raw pg_trgm as the displayed score would produce percentages that differ from industry norms.

The solution: use pg_trgm to retrieve candidates via the GIN index (fast), then re-score each candidate in PHP using the same Levenshtein calculation already in `opencat/translation-memory`. This gives index-speed retrieval with accurate match percentages.

**Stage 1 â€” Postgres candidate retrieval:**
```sql
SELECT
    id,
    source_text,
    target_text
FROM tm_units
WHERE
    tm_id       = :tm_id
    AND source_lang = :src_lang
    AND target_lang = :tgt_lang
    AND similarity(source_text, :query) >= :trgm_threshold   -- broad pre-filter (e.g. 0.4)
ORDER BY similarity(source_text, :query) DESC
LIMIT :candidate_limit;   -- retrieve top 50 candidates
```

**Stage 2 â€” PHP re-score:**
```php
// Reuse the same LevenshteinScorer already in opencat/translation-memory
$matches = [];
foreach ($candidates as $row) {
    $score = $this->scorer->score($query, $row['source_text']); // 0â€“100
    if ($score >= $this->minMatchPercent) {
        $matches[] = new TmMatch($row['source_text'], $row['target_text'], $score, 'tm');
    }
}
usort($matches, fn($a, $b) => $b->score <=> $a->score);
return array_slice($matches, 0, $this->maxResults);
```

**Tuning parameters:**
- `trgm_threshold`: the pg_trgm pre-filter. Set lower than `minMatchPercent` to avoid rejecting candidates the Levenshtein scorer would have accepted. Recommended: `minMatchPercent * 0.7`. Example: if you want 70%+ TM matches, set `trgm_threshold = 0.49`.
- `candidate_limit`: number of rows to pull from Postgres before re-scoring. 50 is safe; at 50 candidates, PHP Levenshtein re-scoring takes < 5ms.

**Required Postgres extension:**
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX tm_units_src_trgm ON tm_units USING gin(source_text gin_trgm_ops);
```

**Why pg_trgm over pure PHP Levenshtein at scale:**
- `pg_trgm` GIN index: candidate retrieval is O(log n) regardless of TM size. Full-table PHP Levenshtein scan is O(n).
- At 100k+ TM entries, pg_trgm reduces the candidate set from 100,000 rows to ~50 before PHP sees any data.
- At 1M+ entries, the GIN index still returns candidates in single-digit milliseconds.

**Why not use Postgres Levenshtein (`fuzzystrmatch` extension) directly:**
- `levenshtein()` in Postgres has no index support â€” it is a full table scan.
- The `fuzzystrmatch` extension's `levenshtein()` function is limited to strings â‰¤ 255 characters (segments longer than that would error).
- PHP-level Levenshtein on the pre-filtered candidate set is faster and has no length limit.

**Future upgrade path â€” `pgvector` semantic TM (Phase 6+):**
The `PostgresTranslationMemoryProvider` can be extended to run a parallel vector similarity lookup alongside the trigram search, then merge and re-rank results. This requires: (1) a `vector(N)` column on `tm_units`, (2) an embedding model call per new segment at import time, (3) HNSW index via the `pgvector` extension. The `TranslationMemoryInterface` contract does not need to change. pgvector runs inside the same Postgres instance â€” no separate service needed. This is the right Phase 6 research direction; no other open-source CAT framework has implemented it.

**Shared vs. per-project TM:**
- A single `tm_units` table with a `tm_id` discriminator column supports both per-project and shared TMs.
- The API controls which `tm_id` values a project reads from (see DA6).
- `PostgresTranslationMemoryProvider` is constructed with a single `tmId`. Multiple instances (one per TM) can be composed via `CompositeTranslationMemoryProvider` (already planned in `opencat/translation-memory`).

**`SqliteTranslationMemoryProvider` is not deprecated.** It remains the default for CLI use and `.catpack` workflows. The Postgres provider is additive.

---

## D33 â€” WorkflowRunner accepts optional SegmentStoreInterface

**Package:** `opencat/workflow`

**Decision:** Add `segmentStore: ?SegmentStoreInterface = null` and `skeletonStore: ?SkeletonStoreInterface = null` to `WorkflowRunner`'s constructor. If present, segments are written to the store and skeleton is handed off to `SkeletonStoreInterface` during `process()`. `WorkflowResult` gains `?string $storeFileId`.

**Updated constructor:**

```php
$runner = new WorkflowRunner(
    fileFilterRegistry: $registry,
    segmentationEngine: $engine,
    translationMemory:  $tm,
    terminologyProvider: $terms,
    mtAdapter:          $deepl,
    qaRunner:           $qa,
    xliffWriter:        $writer,
    options:            WorkflowOptions::defaults(),
    segmentStore:       $postgresStore,    // new, optional
    skeletonStore:      $dbSkeletonStore,  // new, optional
);
```

**Updated `WorkflowOptions`:**

```php
class WorkflowOptions
{
    public float  $mtFillThreshold     = 0.0;
    public float  $autoConfirmThreshold = 1.0;
    public string $outputDir           = '/tmp';
    public bool   $writeXliff          = true;
    public bool   $writeSkeleton       = true;
    public bool   $autoWriteToTm       = false; // if true, confirmed segments written back to TM
}
```

**Updated pipeline (additions marked â†’):**

```
1. FileFilterRegistry::getFilter($filePath) â†’ FileFilterInterface
2. FileFilterInterface::extract($filePath, $sourceLang, $targetLang) â†’ BilingualDocument + skeletonBytes
â†’ 2a. If $skeletonStore set: $skeletonStore->store($fileId, $format, $skeletonBytes)
3. For each SegmentPair:
   a. SrxSegmentationEngine::segment()
   b. TranslationMemory::lookup()
   c. TerminologyProvider::recognize()
   d. MtAdapter::translate() if below threshold
   e. fire onSegmentProcessed callback
â†’ f. If $segmentStore set: $segmentStore->persistSegment($pair, $fileId)
4. QualityRunner::run($document) â†’ QAIssueCollection
5. XliffWriter::write($document, $outputPath) â†’ xliffPath  [skipped if writeXliff = false]
6. Return WorkflowResult (now includes $storeFileId)
```

**Auto-TM write:**
If `WorkflowOptions::$autoWriteToTm = true`, any segment that reaches `SegmentStatus::Translated` or `SegmentStatus::Approved` during a `updateSegment()` call on the segment store is automatically written to the TM. This is implemented inside `PostgresSegmentStore::updateSegment()` via a callback injection, not inside `WorkflowRunner` â€” it is a storage-layer concern.

**Why the segment store is optional:**
- The default path (no store) is identical to Phase 4. All existing tests pass without modification.
- CLI consumers, the `.catpack` workflow, and framework unit tests never need to set `$segmentStore`.
- The API sets it; the studio relies on the API.

---

## DA6 â€” Postgres as the primary DB for the API (Phase 5)

**Repo:** `opencat-api`

**Decision:** Phase 5 API uses PostgreSQL as the application database, replacing the SQLite TM files for segment and TM storage. Laravel's `DB_CONNECTION=pgsql` is the new default for Phase 5 deployments.

**Rationale:**
- SQLite is suitable for embedded/CLI use but cannot handle multi-connection writes safely in a web server context.
- `pg_trgm` is a hard requirement for performant fuzzy TM lookup (D32).
- The studio will query segments, filter by status, join with TM â€” these are SQL queries that need indexes. PostgreSQL's query planner handles this far better than SQLite.

**Migration approach:**
- New Laravel migrations for: `projects`, `project_files`, `segments`, `tm_units`, `termbases`, `tb_entries`, `webhooks`.
- Existing Phase 4 behaviour (file-based processing, XLIFF output) is preserved. The Phase 5 `/process` endpoint writes to both Postgres segments AND generates an XLIFF if `writeXliff = true`.
- Phase 4's project-scoped SQLite TM files are deprecated for API use but still supported in the framework core.

**docker-compose.yml updated:**
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: opencat
      POSTGRES_USER: opencat
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data
  app:
    # ... existing config ...
    depends_on: [postgres]
```

---

## DA7 â€” Segment CRUD via API

**Repo:** `opencat-api`

**Decision:** Expose segment-level read and update operations as REST endpoints. The segment is the unit of work in the studio.

**Key design choices:**
- `PATCH /segments/{id}` accepts partial updates â€” `targetText` and/or `status` independently.
- `targetText` is stored in the D28 tag-placeholder format. The API validates that all source tag placeholders present in `source_text` are either present in `targetText` or intentionally omitted (which produces a `tag_consistency` QA warning, not a 422 error).
- Auto-TM write: if `status` is set to `translated` or `approved`, the segment is automatically written to the project's shared TM. No separate API call needed.
- Bulk status update (`PATCH /projects/{id}/files/{fileId}/segments`) accepts `{ segmentIds: [...], status: "approved" }` for batch approval flows.

**Export endpoint:**
```
GET /projects/{id}/files/{fileId}/export
```
Retrieves skeleton from `SkeletonStoreInterface::retrieve()`, reconstructs target file using `InlineTagSerializer::deserialize()` for each segment, returns binary response with correct `Content-Type`. The filter's `rebuild()` method is called with the translated `BilingualDocument` reconstructed from DB segments.

---

## DA8 â€” Webhook callbacks

**Repo:** `opencat-api`

**Decision:** On job completion (or failure), fire a POST request to each registered webhook URL for the project.

**Webhook payload:**
```json
{
  "event": "job.completed",
  "jobId": "job_abc123",
  "projectId": "proj_xyz",
  "fileId": "file_123",
  "status": "completed",
  "matchStats": { "exact": 10, "fuzzy": 4, "mt": 8, "unmatched": 2 },
  "completedAt": "2026-05-01T09:00:00Z"
}
```

**Delivery:**
- Dispatched via Laravel Queue after `ProcessFileJob` completes.
- 3 retry attempts with exponential backoff (5s, 25s, 125s).
- HMAC-SHA256 signature header: `X-OpenCat-Signature: sha256={hex}`. The signing secret is per-webhook, set at registration.
- Responses: 2xx = success, anything else = retry.

**Why HMAC signature:**
- Allows the receiving server to verify the payload came from the API and was not tampered with.
- Standard practice (same as GitHub/Stripe webhooks).

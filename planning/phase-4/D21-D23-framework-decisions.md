# Phase 4 Framework Design Decisions (D21â€“D23)

---

## D21 â€” Project manifest format

**Package:** `opencat/project`

**Decision:** Use a JSON file named `catproject.json` as the project manifest. UTF-8, human-editable.

**Schema:**

```json
{
  "$schema": "https://opencat.org/schema/catproject/1.0.json",
  "name": "my-project",
  "sourceLang": "en-US",
  "targetLangs": ["fr-FR", "de-DE"],
  "tm": [
    { "path": "tm/main.db", "readOnly": false },
    { "path": "tm/reference.db", "readOnly": true }
  ],
  "glossaries": [
    { "path": "glossaries/main.db", "readOnly": true }
  ],
  "mt": {
    "adapter": "deepl",
    "apiKey": "${DEEPL_API_KEY}",
    "fillThreshold": 0.0
  },
  "qa": {
    "checks": ["TagConsistencyCheck", "NumberConsistencyCheck", "EmptyTranslationCheck", "SegmentConsistencyCheck"],
    "failOnSeverity": "error"
  },
  "filters": {
    "docx": { "mergeSplitRuns": true },
    "xlsx": { "skipEmptyCells": true }
  }
}
```

**Key rules:**

- `sourceLang` and `targetLangs` use BCP 47 tags.
- All `path` values are relative to the directory containing `catproject.json`.
- `${ENV_VAR}` syntax is supported in string values (resolved at load time). Sensitive values like API keys should use env vars, not be hardcoded.
- `mt` is optional. If absent, MT step is skipped.
- `mt.fillThreshold`: MT only fills segments where TM match score is below this value (0.0 = fill all unmatched, 0.75 = only fill below 75%).
- `qa.failOnSeverity`: workflow throws `QaFailureException` if any issue at or above this severity is found. Values: `"warning"` | `"error"` | `null` (never throw).

**Why JSON over YAML or XML:**
- No PHP YAML extension in stdlib; XML would be ironic given the framework. JSON is unambiguous and has native `json_decode`.
- Human-editable but structured enough for programmatic generation.

**Alternatives rejected:**
- INI/properties: too flat for nested TM/QA config.
- PHP array: not portable, not editable without PHP.

---

## D22 â€” `.catpack` archive format

**Package:** `opencat/project`

**Decision:** A `.catpack` file is a ZIP archive with a defined internal directory layout.

**Layout:**

```
my-project.catpack
â”œâ”€â”€ catproject.json          â† manifest (paths are relative to archive root)
â”œâ”€â”€ source/
â”‚   â”œâ”€â”€ document.docx        â† original source files
â”‚   â””â”€â”€ slides.pptx
â”œâ”€â”€ tm/
â”‚   â””â”€â”€ main.db              â† SQLite TM files
â”œâ”€â”€ glossaries/
â”‚   â””â”€â”€ main.db              â† SQLite terminology files
â””â”€â”€ xliff/
    â””â”€â”€ document.docx.xlf   â† generated XLIFF (if project has been processed)
```

**`CatpackArchive` API:**

```php
// Create
$archive = CatpackArchive::create('/path/to/output.catpack', $manifest);
$archive->addSourceFile('/path/to/document.docx');
$archive->addTm('/path/to/main.db', 'main.db');
$archive->save();

// Open
$archive = CatpackArchive::open('/path/to/my-project.catpack');
$manifest = $archive->getManifest();
$archive->extractTo('/tmp/working-dir/');
```

**Why ZIP:**
- Native PHP `ext-zip` already a framework dependency (filter-docx).
- Self-contained. Can be emailed, versioned, shared without external storage.
- Inspectable without special tools.

**Constraints:**
- TM SQLite files can be large (100MB+). `.catpack` is for project portability, not for archiving huge TMs â€” that use case is out of scope. Document this clearly.
- No compression on `.db` files (SQLite doesn't benefit from generic compression at the block level).

---

## D23 â€” WorkflowRunner design

**Package:** `opencat/workflow`

**Decision:** A single `WorkflowRunner` class orchestrates the full translation pipeline. Configuration is injected at construction. Processing is triggered per file.

**Interface:**

```php
interface WorkflowRunnerInterface
{
    public function process(string $filePath, string $targetLang): WorkflowResult;
}
```

**`WorkflowRunner` constructor:**

```php
$runner = new WorkflowRunner(
    fileFilterRegistry: $registry,         // FileFilterRegistry
    segmentationEngine: $engine,           // SrxSegmentationEngine
    translationMemory: $tm,               // TranslationMemoryInterface|null
    terminologyProvider: $terms,           // TerminologyProviderInterface|null
    mtAdapter: $deepl,                    // MtAdapterInterface|null
    qaRunner: $qa,                        // QualityRunner|null
    xliffWriter: $writer,                 // XliffWriter
    options: WorkflowOptions::defaults(), // thresholds, output dir, etc.
);
```

All dependencies are nullable. A runner with only `fileFilterRegistry + segmentationEngine + xliffWriter` is valid (pure extraction with no TM/MT/QA).

**`WorkflowOptions`:**

```php
class WorkflowOptions
{
    public float $mtFillThreshold = 0.0;      // MT fills if TM score < this
    public float $autoConfirmThreshold = 1.0; // Auto-confirm if TM score >= this
    public string $outputDir = '/tmp';
    public bool $writeXliff = true;
    public bool $writeSkeleton = true;
}
```

**`WorkflowResult`:**

```php
class WorkflowResult
{
    public BilingualDocument $document;
    public QAIssueCollection $qaIssues;        // empty if no QA runner
    public TmMatchStats $matchStats;           // exact/fuzzy/mt/unmatched counts
    public string|null $xliffPath;            // null if writeXliff = false
    public array $timings;                    // ['extract' => 0.12, 'segment' => 0.03, ...]
}
```

**Progress hook:**

```php
$runner->onSegmentProcessed(function (SegmentPair $pair, int $index, int $total): void {
    echo "[$index/$total] " . $pair->source->getPlainText() . "\n";
});
```

Single callback. No event system. Callback receives segment pair post-processing (after TM/MT/QA applied) so it can read match scores or QA results.

**Pipeline steps (in order):**

```
1. FileFilterRegistry::getFilter($filePath) â†’ FileFilterInterface
2. FileFilterInterface::extract($filePath, $sourceLang, $targetLang) â†’ BilingualDocument
3. For each SegmentPair:
   a. SrxSegmentationEngine::segment($pair->source, $sourceLang)
   b. TranslationMemory::lookup() â†’ apply best match if score >= threshold
   c. TerminologyProvider::recognize() â†’ attach TerminologyMatches to pair metadata
   d. If score < mtFillThreshold && MtAdapter set â†’ MtAdapter::translate() â†’ fill target
   e. fire onSegmentProcessed callback
4. QualityRunner::run($document) â†’ QAIssueCollection
5. XliffWriter::write($document, $outputPath) â†’ xliffPath
6. Return WorkflowResult
```

**`ProjectLoader` (bridge between project and workflow):**

```php
$loader = new ProjectLoader('/path/to/catproject.json');
$manifest = $loader->getManifest();
$runner = $loader->buildWorkflowRunner($targetLang);
// Hydrates all framework objects from manifest config, resolves env vars
```

**Why no PSR-14 events:**
- Adds a Composer dependency and forces consumers to wire a dispatcher.
- A single progress callback covers 95% of use cases (CLI progress bars, API job progress).
- Can add PSR-14 support later via an optional `EventDispatchingWorkflowRunner` decorator if demand exists.

**Why `WorkflowRunner` is not a static factory / facade:**
- All dependencies injected â†’ fully testable without touching the filesystem.
- Consumers who don't use the project manifest can still use `WorkflowRunner` directly with their own objects.

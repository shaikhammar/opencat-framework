# opencat/workflow

Pipeline orchestration for the [OpenCAT Framework](https://github.com/shaikhammar/opencat-framework).

`WorkflowRunner` wires filter, segmentation, TM, terminology, MT, QA, and XLIFF output into a single `process()` call. `ProjectWorkflowBuilder` constructs a fully configured runner from a `ProjectManifest` with no manual wiring.

## Installation

```bash
composer require opencat/workflow
```

## Quick start — from a project manifest

```php
use CatFramework\Project\ProjectLoader;
use CatFramework\Workflow\FileFilterRegistry;
use CatFramework\Workflow\ProjectWorkflowBuilder;
use CatFramework\FilterDocx\DocxFilter;
use CatFramework\FilterPlaintext\PlainTextFilter;

$manifest = ProjectLoader::load('catproject.json');
$registry = new FileFilterRegistry();
$registry->register(new DocxFilter());
$registry->register(new PlainTextFilter());

$runner = (new ProjectWorkflowBuilder($manifest))->build('fr-FR', $registry);
$result = $runner->process('report.docx', 'fr-FR');

echo "Exact TM: {$result->matchStats->exact}" . PHP_EOL;
echo "Fuzzy TM: {$result->matchStats->fuzzy}" . PHP_EOL;
echo "MT filled: {$result->matchStats->mt}"   . PHP_EOL;
echo "XLIFF: {$result->xliffPath}"            . PHP_EOL;
```

## Manual wiring

Build `WorkflowRunner` directly when you need finer control:

```php
use CatFramework\Workflow\WorkflowRunner;
use CatFramework\Workflow\WorkflowOptions;
use CatFramework\Workflow\FileFilterRegistry;
use CatFramework\Segmentation\SrxSegmentationEngine;
use CatFramework\Xliff\XliffWriter;
use CatFramework\TranslationMemory\SqliteTranslationMemory;
use CatFramework\Mt\DeepL\DeepLAdapter;
use CatFramework\Qa\QualityRunner;

$options = WorkflowOptions::defaults();
$options->mtFillThreshold    = 0.75;   // use MT when best TM match < 75%
$options->autoConfirmThreshold = 1.0;  // auto-lock only exact TM matches
$options->autoWriteToTm      = true;   // feed MT output back into TM
$options->writeXliff         = true;
$options->qaFailOnSeverity   = 'error';

$runner = new WorkflowRunner(
    fileFilterRegistry: $registry,
    segmentationEngine: new SrxSegmentationEngine(),
    xliffWriter: new XliffWriter(),
    sourceLang: 'en-US',
    translationMemory: new SqliteTranslationMemory($pdo),
    mtAdapter: $deepLAdapter,
    qaRunner: $qaRunner,
    options: $options,
);

$result = $runner->process('report.docx', 'fr-FR');
```

## Pipeline steps

`WorkflowRunner::process()` executes these steps in order:

| Step | What happens |
|---|---|
| **1. Extract** | `FileFilterRegistry` selects the correct filter and calls `extract()` |
| **2. Segment** | `SrxSegmentationEngine` splits multi-sentence structural units into individual sentences |
| **3a. TM lookup** | Looks up each segment; auto-locks exact matches; marks fuzzy matches as Draft |
| **3b. Terminology** | Calls `TerminologyProvider::recognize()` for timing and future highlight data |
| **3c. MT fill** | For segments below `$mtFillThreshold`, calls the MT adapter |
| **3d. Persist** | Stores each `SegmentPair` to `SegmentStore` if configured |
| **3e. TM write-back** | If `$autoWriteToTm`, stores each translated pair back into TM |
| **4. QA** | Runs all registered QA checks; throws `WorkflowException` if `$qaFailOnSeverity` is hit |
| **5. XLIFF output** | Writes `{source}.xlf` + `{source}.xlf.skl` to `$outputDir` (if `$writeXliff`) |
| **6. Skeleton store** | Persists skeleton to `SkeletonStore` if configured |

## Progress callback

Get notified after each segment is processed:

```php
$runner->onSegmentProcessed(function ($pair, int $index, int $total) {
    echo "  [{$index}/{$total}] {$pair->source->getPlainText()}" . PHP_EOL;
});
```

## WorkflowResult

`process()` returns a `WorkflowResult`:

```php
$result->document;            // BilingualDocument with all segment pairs
$result->qaIssues;            // QualityIssue[]
$result->matchStats->exact;   // count of exact TM matches
$result->matchStats->fuzzy;   // count of fuzzy TM matches
$result->matchStats->mt;      // count of MT-filled segments
$result->matchStats->unmatched; // count with no TM or MT fill
$result->xliffPath;           // path to written XLIFF (null if writeXliff=false)
$result->storeFileId;         // UUID used as key in SegmentStore/SkeletonStore
$result->timings;             // ['extract', 'segment', 'tm', 'terminology', 'mt', 'qa', 'xliff', 'store']
```

## FileFilterRegistry

Filters are selected by calling `supports()` on each registered filter in registration order. The first filter that returns `true` is used.

```php
$registry = new FileFilterRegistry();
$registry->register(new DocxFilter());
$registry->register(new HtmlFilter());
$registry->register(new PlainTextFilter());  // fallback for .txt

$filter = $registry->getFilter('report.docx');   // returns DocxFilter
```

`getFilter()` throws `WorkflowException` if no filter supports the file.

## MT fill threshold

`$mtFillThreshold` controls when MT kicks in:
- `0.0` (default) — MT never runs
- `0.75` — MT runs when the best TM match is below 75%
- `1.0` — MT fills any segment without an exact TM match

## Related packages

- [`opencat/core`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/core) — all shared models and contracts
- [`opencat/project`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/project) — `ProjectManifest`, `ProjectWorkflowBuilder`, segment/skeleton stores
- [`opencat/segmentation`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/segmentation) — sentence segmentation
- [`opencat/translation-memory`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/translation-memory) — TM lookup and storage
- [`opencat/terminology`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/terminology) — term recognition
- [`opencat/mt`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/mt) — machine translation adapters
- [`opencat/qa`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/qa) — quality checks
- [`opencat/xliff`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/xliff) — XLIFF output

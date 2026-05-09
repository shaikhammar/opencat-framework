# opencat/qa

Per-segment quality checks for the [OpenCAT Framework](https://github.com/shaikhammar/opencat-framework).

`QualityRunner` runs registered checks against a `BilingualDocument` and returns `QualityIssue` objects. Checks are small, independent classes — register only the ones you need.

## Installation

```bash
composer require opencat/qa
```

Requires `ext-intl` and `ext-mbstring`.

## Usage

```php
use CatFramework\Qa\QualityRunner;
use CatFramework\Qa\Check\TagConsistencyCheck;
use CatFramework\Qa\Check\NumberConsistencyCheck;
use CatFramework\Qa\Check\EmptyTranslationCheck;
use CatFramework\Qa\Check\WhitespaceCheck;
use CatFramework\Qa\Check\DoubleSpaceCheck;

$runner = new QualityRunner();
$runner->register(new TagConsistencyCheck());
$runner->register(new NumberConsistencyCheck());
$runner->register(new EmptyTranslationCheck());
$runner->register(new WhitespaceCheck());
$runner->register(new DoubleSpaceCheck());

// Run against a full document
$issues = $runner->run($doc);

foreach ($issues as $issue) {
    echo "[{$issue->severity->name}] {$issue->checkId}: {$issue->message}" . PHP_EOL;
    echo "  Segment: {$issue->segmentId}" . PHP_EOL;
}
```

## Built-in per-segment checks

These implement `QualityCheckInterface` and run on every `SegmentPair`:

| Class | Check ID | Severity | What it flags |
|---|---|---|---|
| `EmptyTranslationCheck` | `empty_translation` | ERROR | Target segment is empty or whitespace-only |
| `TagConsistencyCheck` | `tag_consistency` | ERROR | Target has different `InlineCode` count or types than source |
| `NumberConsistencyCheck` | `number_consistency` | WARNING | Numbers present in source are absent from target |
| `WhitespaceCheck` | `whitespace` | INFO | Leading or trailing whitespace mismatch between source and target |
| `DoubleSpaceCheck` | `double_space` | INFO | Target contains two or more consecutive spaces |
| `TerminologyConsistencyCheck` | `terminology_consistency` | WARNING | A forbidden term is used, or a known source term has no match in the target |

`TerminologyConsistencyCheck` requires a `TerminologyProviderInterface` instance:

```php
use CatFramework\Qa\Check\TerminologyConsistencyCheck;
use CatFramework\Terminology\Provider\SqliteTerminologyProvider;

$provider = new SqliteTerminologyProvider('glossary.db');
$runner->register(new TerminologyConsistencyCheck($provider));
```

## Built-in document-level checks

These implement `DocumentQualityCheckInterface` and scan the full document after per-segment checks:

| Class | Check ID | Severity | What it flags |
|---|---|---|---|
| `SegmentConsistencyCheck` | `segment_consistency` | WARNING | Identical source segments that have divergent translations |

```php
use CatFramework\Qa\Check\SegmentConsistencyCheck;

$runner->registerDocumentCheck(new SegmentConsistencyCheck());
$allIssues = array_merge($runner->run($doc), $runner->runOnDocument($doc));
```

## Running on a single segment pair

```php
$issues = $runner->runOnPair($pair, 'en-US', 'fr-FR');
```

Useful for incremental QA as the translator edits individual segments.

## Writing a custom check

```php
use CatFramework\Core\Contract\QualityCheckInterface;
use CatFramework\Core\Enum\QualitySeverity;
use CatFramework\Core\Model\QualityIssue;
use CatFramework\Core\Model\SegmentPair;

class NoCapsCheck implements QualityCheckInterface
{
    public function getId(): string { return 'no_all_caps'; }
    public function getName(): string { return 'No All-Caps Words'; }

    public function check(SegmentPair $pair, string $sourceLanguage, string $targetLanguage): array
    {
        if ($pair->target === null) {
            return [];
        }

        $text = $pair->target->getPlainText();

        if (preg_match('/\b[A-Z]{3,}\b/u', $text)) {
            return [new QualityIssue(
                checkId: $this->getId(),
                severity: QualitySeverity::WARNING,
                message: 'Target contains all-caps word.',
                segmentId: $pair->source->id,
            )];
        }

        return [];
    }
}

$runner->register(new NoCapsCheck());
```

## Severity levels

| `QualitySeverity` | Meaning |
|---|---|
| `INFO` | Style suggestion — informational only |
| `WARNING` | Probable error — should be reviewed |
| `ERROR` | Definite error — must be fixed before delivery |

The [`opencat/workflow`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/workflow) `WorkflowOptions::$qaFailOnSeverity` option throws `WorkflowException` if any issue reaches the configured severity level.

## Related packages

- [`opencat/core`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/core) — `QualityCheckInterface`, `DocumentQualityCheckInterface`, `QualityIssue`, `QualitySeverity`
- [`opencat/terminology`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/terminology) — provides `TerminologyProviderInterface` for `TerminologyConsistencyCheck`
- [`opencat/workflow`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/workflow) — runs QA as the fourth step in the pipeline; supports `qaFailOnSeverity` threshold

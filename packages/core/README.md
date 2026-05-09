# opencat/core

Shared data models, contracts, and enums for the [OpenCAT Framework](https://github.com/shaikhammar/opencat-framework).

Every other OpenCAT package depends on this one. It contains no business logic — only the shapes that the rest of the framework passes around.

## Installation

```bash
composer require opencat/core
```

Requires `ext-intl` and `ext-mbstring`.

## What's inside

### Models

| Class | Purpose |
|---|---|
| `Segment` | Ordered sequence of `string` and `InlineCode` elements — one translatable unit |
| `SegmentPair` | Source `Segment` + target `Segment` (null when untranslated), status, and lock flag |
| `BilingualDocument` | Ordered collection of `SegmentPair` objects plus filter skeleton data |
| `InlineCode` | A non-translatable formatting marker inside a `Segment` (bold tag, link, line break, etc.) |
| `TranslationUnit` | A stored source/target pair in a translation memory, with metadata |
| `MatchResult` | A TM lookup result — `TranslationUnit` plus similarity score and match type |
| `QualityIssue` | One issue raised by a QA check — check ID, severity, message, and character offset |
| `TermEntry` | A bilingual term pair from a glossary — source/target text, domain, and forbidden flag |
| `TermMatch` | A term found in running text — `TermEntry` plus the matched span |

### Contracts (interfaces)

| Interface | Implemented by |
|---|---|
| `FileFilterInterface` | [`filter-plaintext`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/filter-plaintext), [`filter-html`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/filter-html), [`filter-docx`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/filter-docx), others |
| `SegmentationEngineInterface` | [`segmentation`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/segmentation) |
| `TranslationMemoryInterface` | [`translation-memory`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/translation-memory) |
| `MachineTranslationInterface` | [`mt`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/mt) |
| `TerminologyProviderInterface` | [`terminology`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/terminology) |
| `QualityCheckInterface` | [`qa`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/qa) |
| `DocumentQualityCheckInterface` | [`qa`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/qa) |

### Enums

| Enum | Values |
|---|---|
| `SegmentStatus` | `Untranslated`, `Draft`, `Translated`, `Reviewed`, `Approved`, `Rejected` |
| `SegmentState` | States for external interchange formats |
| `InlineCodeType` | `OPENING`, `CLOSING`, `STANDALONE` |
| `MatchType` | `EXACT`, `EXACT_TEXT`, `FUZZY` |
| `QualitySeverity` | `INFO`, `WARNING`, `ERROR` |

### Exceptions

Each domain has its own exception class extending `\RuntimeException`:

`FilterException` · `MtException` · `SegmentationException` · `TerminologyException` · `TmException`

## Working with Segment

A `Segment` holds an ordered mix of plain strings and `InlineCode` objects:

```php
use CatFramework\Core\Model\Segment;
use CatFramework\Core\Model\InlineCode;
use CatFramework\Core\Enum\InlineCodeType;

$bold = new InlineCode('b1', InlineCodeType::OPENING, '<strong>');
$boldClose = new InlineCode('b1', InlineCodeType::CLOSING, '</strong>');

$segment = new Segment('seg-1', [
    'Hello ',
    $bold,
    'world',
    $boldClose,
    '!',
]);

$segment->getPlainText();    // "Hello world!"
$segment->isEmpty();         // false
$segment->getInlineCodes();  // [$bold, $boldClose]
```

## Working with BilingualDocument

```php
use CatFramework\Core\Model\BilingualDocument;
use CatFramework\Core\Model\SegmentPair;
use CatFramework\Core\Enum\SegmentStatus;

$doc = new BilingualDocument(
    sourceLanguage: 'en-US',
    targetLanguage: 'fr-FR',
    originalFile: 'report.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
);

foreach ($doc->getSegmentPairs() as $pair) {
    echo $pair->source->getPlainText();  // source text
    echo $pair->status->name;           // SegmentStatus enum name
    echo $pair->isLocked ? 'locked' : 'editable';
}
```

## Implementing a custom file filter

```php
use CatFramework\Core\Contract\FileFilterInterface;
use CatFramework\Core\Model\BilingualDocument;
use CatFramework\Core\Exception\FilterException;

class MyFilter implements FileFilterInterface
{
    public function supports(string $filePath, ?string $mimeType = null): bool
    {
        return str_ends_with(strtolower($filePath), '.myext');
    }

    public function extract(string $filePath, string $sourceLanguage, string $targetLanguage): BilingualDocument
    {
        // parse $filePath, create and return a BilingualDocument
    }

    public function rebuild(BilingualDocument $document, string $outputPath): void
    {
        // use $document->skeleton to reconstruct the file
    }

    public function getSupportedExtensions(): array
    {
        return ['.myext'];
    }
}
```

## Related packages

- [`opencat/segmentation`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/segmentation) — sentence segmentation using `SegmentationEngineInterface`
- [`opencat/translation-memory`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/translation-memory) — TM using `TranslationMemoryInterface`
- [`opencat/mt`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/mt) — machine translation using `MachineTranslationInterface`
- [`opencat/qa`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/qa) — QA checks using `QualityCheckInterface`
- [`opencat/workflow`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/workflow) — wires all of the above into one call

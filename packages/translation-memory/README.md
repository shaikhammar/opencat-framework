# opencat/translation-memory

SQLite-backed translation memory with exact and fuzzy matching for the [OpenCAT Framework](https://github.com/shaikhammar/opencat-framework).

Stores `TranslationUnit` objects, looks them up by similarity against a source `Segment`, and imports/exports via TMX. A PostgreSQL backend is also available for multi-user deployments.

## Installation

```bash
composer require opencat/translation-memory
```

Requires `ext-pdo`, `ext-pdo_sqlite`, `ext-intl`, and `ext-mbstring`.

For PostgreSQL: install `ext-pdo_pgsql` and enable the `pg_trgm` extension in the database.

## SQLite TM

```php
use CatFramework\TranslationMemory\SqliteTranslationMemory;

$pdo = new PDO('sqlite:project.db');
$tm  = new SqliteTranslationMemory($pdo);
// Schema is created automatically on first instantiation
```

## Storing translation units

```php
use CatFramework\Core\Model\TranslationUnit;

$tm->store(new TranslationUnit(
    source: $sourceSegment,
    target: $targetSegment,
    sourceLanguage: 'en-US',
    targetLanguage: 'fr-FR',
    createdAt: new DateTimeImmutable(),
    createdBy: 'translator@example.com',
));
```

Duplicate entries (same language pair and normalised source text) are silently overwritten with the new translation.

## Looking up matches

```php
$matches = $tm->lookup(
    source: $segment,
    sourceLanguage: 'en-US',
    targetLanguage: 'fr-FR',
    minScore: 0.7,    // 0.0–1.0, default 0.7
    maxResults: 5,    // default 5
);

foreach ($matches as $match) {
    echo round($match->score * 100) . '%  ' . $match->type->name . PHP_EOL;
    echo $match->translationUnit->target->getPlainText() . PHP_EOL;
}
```

Results are sorted by score descending. `$match->type` is one of:

| Score | Type | Meaning |
|---|---|---|
| 1.0 | `EXACT` | Identical text and identical inline codes |
| 1.0 | `EXACT_TEXT` | Identical plain text, but inline codes differ |
| < 1.0 | `FUZZY` | Character-level similarity above `$minScore` |

## Importing and exporting TMX

```php
$count = $tm->import('memory.tmx');   // returns number of units imported
$count = $tm->export('backup.tmx');   // returns number of units exported
```

Import uses the streaming TMX reader, so large files are processed without loading everything into memory.

## How fuzzy matching works

1. **Normalisation** — source text is normalised through a pipeline before storage and again at lookup: NFC Unicode → lowercase → collapse whitespace → trim. This makes matching robust to capitalisation and whitespace differences.
2. **Length pre-filter** — only candidates whose character count falls within `[sourceLen × minScore, sourceLen ÷ minScore]` are retrieved from the database. This is a fast index scan that avoids running Levenshtein on the entire TM.
3. **Levenshtein similarity** — for ASCII text, PHP's native `levenshtein()` is used. For multibyte text (Hindi, Urdu, Arabic, CJK), `ext-intl` grapheme-cluster arrays are used so that multi-byte characters count as single edit operations.

## Custom normaliser pipeline

```php
use CatFramework\TranslationMemory\Normalizer\NormalizerInterface;

class MyNormalizer implements NormalizerInterface
{
    public function normalize(string $text): string
    {
        return mb_strtolower($text);  // custom logic
    }
}

$tm->setNormalizers([new MyNormalizer()]);
```

## PostgreSQL TM

For multi-user or large-scale deployments:

```php
use CatFramework\TranslationMemory\PostgresTranslationMemory;

$pdo = new PDO('pgsql:host=localhost;dbname=catdb', 'user', 'pass');
$tm  = new PostgresTranslationMemory($pdo);
```

Requires the `pg_trgm` extension enabled in PostgreSQL (`CREATE EXTENSION IF NOT EXISTS pg_trgm`). The PostgreSQL backend uses trigram similarity for fuzzy matching instead of Levenshtein, which scales better for large TMs.

## Related packages

- [`opencat/core`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/core) — `TranslationUnit`, `Segment`, `MatchResult`, `TranslationMemoryInterface`
- [`opencat/tmx`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/tmx) — `TmxReader` used by `import()`, `TmxWriter` used by `export()`
- [`opencat/workflow`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/workflow) — uses `SqliteTranslationMemory` in the processing pipeline

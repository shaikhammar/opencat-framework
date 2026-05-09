# opencat/terminology

Term recognition and TBX import for the [OpenCAT Framework](https://github.com/shaikhammar/opencat-framework).

Parses TBX v2 (ISO 30042) glossary files and stores terms in SQLite. At translation time, scans source text for known terms and returns their target-language equivalents so the translator sees glossary matches alongside TM matches.

## Installation

```bash
composer require opencat/terminology
```

Requires `ext-dom`, `ext-intl`, `ext-mbstring`, `ext-pdo`, and `ext-pdo_sqlite`.

## Usage

```php
use CatFramework\Terminology\Provider\SqliteTerminologyProvider;

$provider = new SqliteTerminologyProvider('glossary.db');
// SQLite schema is created automatically

// Import a TBX file
$count = $provider->import('legal-terms.tbx');
echo "Imported {$count} term entries";

// Recognise terms in source text
$matches = $provider->recognize(
    text: 'Please review the translation memory for consistency.',
    sourceLanguage: 'en',
    targetLanguage: 'fr',
);

foreach ($matches as $match) {
    echo $match->entry->sourceTerm . ' → ' . $match->entry->targetTerm . PHP_EOL;
    echo "Found at offset {$match->offset}, length {$match->length}" . PHP_EOL;
}
```

## TBX parser

The `TbxParser` handles both TBX v2 (`<martif>` root, `<langSet>`, `<tig>`) and TBX-Basic (`<tbx>` root, `<langSec>`, `<termSec>`):

```php
use CatFramework\Terminology\Parser\TbxParser;

$parser = new TbxParser();
$entries = $parser->parseFile('glossary.tbx');   // returns TermEntry[]
// or from a string:
$entries = $parser->parseString($xmlString);
```

Each `TermEntry` carries:
- `$sourceTerm` / `$targetTerm` — the term text
- `$sourceLanguage` / `$targetLanguage` — BCP 47 codes
- `$definition` — extracted from `<descrip type="definition">`
- `$domain` — extracted from `<descrip type="subjectField">`
- `$forbidden` — `true` when `administrativeStatus` is `deprecatedTerm` or `supersededTerm`

If a concept has multiple terms per language, all source × target combinations are generated as individual `TermEntry` objects.

## TBX file example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<martif type="TBX" xml:lang="en">
  <text>
    <body>
      <termEntry>
        <langSet xml:lang="en">
          <tig>
            <term>translation memory</term>
            <descrip type="definition">A database of previously translated segments.</descrip>
          </tig>
        </langSet>
        <langSet xml:lang="fr">
          <tig>
            <term>mémoire de traduction</term>
          </tig>
        </langSet>
      </termEntry>
    </body>
  </text>
</martif>
```

## Term recognition

`recognize()` uses Unicode-aware word-boundary detection rather than regex `\b` — which is byte-level and breaks for Arabic and Devanagari. Boundaries are detected using space and punctuation characters, making it safe for Hindi, Urdu, and Arabic terms.

Longer terms are matched preferentially over shorter ones when they overlap (greedy left-to-right scan).

## Forbidden terms

Terms imported with `administrativeStatus = deprecatedTerm` or `supersededTerm` are stored as forbidden. The [`opencat/qa`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/qa) `TerminologyConsistencyCheck` flags target segments that use a forbidden term instead of its approved equivalent.

## Related packages

- [`opencat/core`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/core) — `TermEntry`, `TermMatch`, `TerminologyProviderInterface`, `TerminologyException`
- [`opencat/qa`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/qa) — `TerminologyConsistencyCheck` uses `TerminologyProviderInterface`
- [`opencat/workflow`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/workflow) — wires `SqliteTerminologyProvider` into the pipeline

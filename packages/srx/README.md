# opencat/srx

SRX 2.0 segmentation rule parser for the [OpenCAT Framework](https://github.com/shaikhammar/opencat-framework).

Parses `.srx` files into a `SegmentationRuleSet` that the [`opencat/segmentation`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/segmentation) engine uses to split text into sentences. You only need this package directly if you want to load custom SRX files; the segmentation engine loads the bundled default automatically.

## Installation

```bash
composer require opencat/srx
```

Requires `ext-dom` and `ext-libxml`.

## Usage

```php
use CatFramework\Srx\SrxParser;

$parser = new SrxParser();
$ruleSet = $parser->parse('/path/to/rules.srx');

// Look up rules for a given BCP 47 language code
$languageRule = $ruleSet->rulesFor('en-US');

foreach ($languageRule->rules as $rule) {
    echo $rule->break ? 'break' : 'no-break';
    echo '  before: ' . $rule->before;
    echo '  after: '  . $rule->after;
}
```

## Bundled default SRX

The package ships a `data/default.srx` file covering:

- English (`EN.*`)
- Hindi (`HI.*`) — Devanagari Purna Viram `।`
- Urdu (`UR.*`) — Arabic Full Stop `۔`
- Arabic (`AR.*`)
- French (`FR.*`)
- German (`DE.*`)
- Spanish (`ES.*`)
- Chinese / Japanese (`ZH.*`, `JA.*`)
- `default` fallback rule (period followed by space and uppercase)

Get its path via the static helper:

```php
$path = SrxParser::defaultSrxPath();
```

## SRX format overview

SRX 2.0 is an XML format. A rule set contains:

1. **`<languagerule>`** blocks — named sets of break/no-break rules for a language
2. **`<languagemap>`** entries — BCP 47 regex patterns mapped to rule names

The parser resolves a language code by scanning `<languagemap>` entries in document order and returning the first match. If no rule matches, an empty `LanguageRule` is returned (no segmentation).

```xml
<languagemap languagepattern="EN.*" languagerulename="English"/>
```

Each `<rule>` inside a `<languagerule>` has:
- `break="yes|no"` — whether this position is a sentence boundary
- `<beforebreak>` — regex that must match text _before_ the candidate break position
- `<afterbreak>` — regex that must match text _after_

Rules are evaluated in order — the first matching rule wins.

## Classes

| Class | Purpose |
|---|---|
| `SrxParser` | Parses an SRX file into a `SegmentationRuleSet` |
| `SegmentationRuleSet` | Holds all language rules and maps a BCP 47 code to a `LanguageRule` |
| `LanguageRule` | A named list of `SegmentationRule` objects for one language |
| `SegmentationRule` | A single break/no-break rule with `before` and `after` patterns |

## Writing custom SRX rules

```xml
<?xml version="1.0" encoding="UTF-8"?>
<srx version="2.0" xmlns="http://www.lisa.org/srx20">
  <header segmentsubflows="yes" cascade="yes"/>
  <body>
    <languagerules>
      <languagerule languagerulename="English">
        <!-- No break: abbreviations -->
        <rule break="no">
          <beforebreak>\b(Mr|Mrs|Dr|Prof)\.</beforebreak>
          <afterbreak>\s</afterbreak>
        </rule>
        <!-- Break: sentence end -->
        <rule break="yes">
          <beforebreak>[.!?]</beforebreak>
          <afterbreak>\s+[A-Z]</afterbreak>
        </rule>
      </languagerule>
    </languagerules>
    <maprules>
      <languagemap languagepattern="EN.*" languagerulename="English"/>
    </maprules>
  </body>
</srx>
```

## Related packages

- [`opencat/core`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/core) — `SegmentationException` thrown on parse failure
- [`opencat/segmentation`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/segmentation) — consumes `SegmentationRuleSet` to split `Segment` objects

# opencat/tmx

TMX 1.4b parser and writer for the [OpenCAT Framework](https://github.com/shaikhammar/opencat-framework).

Converts between TMX files and `TranslationUnit` objects. Used by [`opencat/translation-memory`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/translation-memory) for import and export. You can also use it standalone for TMX manipulation.

## Installation

```bash
composer require opencat/tmx
```

Requires `ext-dom`, `ext-libxml`, and `ext-xmlreader`.

## Reading TMX files

### DOM mode — small files (up to ~10,000 TUs)

```php
use CatFramework\Tmx\TmxReader;

$reader = new TmxReader();
$units = $reader->read('memory.tmx');  // returns TranslationUnit[]

foreach ($units as $unit) {
    echo $unit->sourceLanguage . ' → ' . $unit->targetLanguage . PHP_EOL;
    echo $unit->source->getPlainText() . PHP_EOL;
    echo $unit->target->getPlainText() . PHP_EOL;
}
```

### Streaming mode — large files (100k+ TUs)

Uses `XMLReader` internally; yields one `TranslationUnit` at a time without loading the full document into memory.

```php
foreach ($reader->stream('large-memory.tmx') as $unit) {
    // process $unit — only one TU is in memory at a time
    $tm->store($unit);
}
```

## Writing TMX files

```php
use CatFramework\Tmx\TmxWriter;
use CatFramework\Core\Model\TranslationUnit;

$writer = new TmxWriter();
$writer->write($units, 'exported.tmx');  // $units is TranslationUnit[]
```

## Inline code support

TMX inline elements are mapped to `InlineCode` objects:

| TMX element | InlineCode type | Notes |
|---|---|---|
| `<bpt>` | `OPENING` | Begin paired tag (bold open, link open, etc.) |
| `<ept>` | `CLOSING` | End paired tag |
| `<ph>` | `STANDALONE` | Standalone placeholder (line break, etc.) |
| `<it pos="begin">` | `OPENING`, isolated | Isolated tag (tag boundary crossed a TU) |
| `<it pos="end">` | `CLOSING`, isolated | Isolated tag |

The `i` attribute is used as the `InlineCode::$id` pairing key (equivalent to XLIFF's `rid`).

## Language matching

The `srclang` attribute on the `<header>` determines which `<tuv>` is the source. Matching is:
1. Exact case-insensitive match (`"en-US"` == `"EN-US"`)
2. Prefix match (`srclang="en"` matches `xml:lang="en-US"`)
3. First `<tuv>` if no match

## TMX file structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE tmx SYSTEM "tmx14.dtd">
<tmx version="1.4">
  <header srclang="en-US" .../>
  <body>
    <tu tuid="1" creationid="translator@example.com" creationdate="20240101T120000Z">
      <prop type="x-domain">Legal</prop>
      <tuv xml:lang="en-US"><seg>Source text.</seg></tuv>
      <tuv xml:lang="fr-FR"><seg>Texte cible.</seg></tuv>
    </tu>
  </body>
</tmx>
```

`<prop>` elements are stored in `TranslationUnit::$metadata`. The `creationid` attribute maps to `TranslationUnit::$createdBy`.

## Related packages

- [`opencat/core`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/core) — `TranslationUnit`, `Segment`, `InlineCode`
- [`opencat/translation-memory`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/translation-memory) — uses `TmxReader::stream()` for `import()` and `TmxWriter` for `export()`

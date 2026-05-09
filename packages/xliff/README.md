# opencat/xliff

XLIFF 1.2 writer and reader for the [OpenCAT Framework](https://github.com/shaikhammar/opencat-framework).

Serialises a `BilingualDocument` to XLIFF 1.2 (plus a companion `.skl` skeleton file) and reads it back. XLIFF is the interchange format between the extraction/segmentation phase and the translation phase — it can be sent to a translator or a TMS and then read back to rebuild the translated file.

## Installation

```bash
composer require opencat/xliff
```

Requires `ext-dom` and `ext-libxml`.

## Writing XLIFF

```php
use CatFramework\Xliff\XliffWriter;

$writer = new XliffWriter();
$writer->write($doc, 'project.xlf');
// Also writes project.xlf.skl (JSON skeleton — required for rebuild)
```

## Reading XLIFF

```php
use CatFramework\Xliff\XliffReader;

$reader = new XliffReader();
$doc = $reader->read('project.xlf');
// Loads the .skl file automatically (expects project.xlf.skl alongside)

// Rebuild the original file format
$filter->rebuild($doc, 'translated-output.docx');
```

## XLIFF output format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2" xmlns:catfw="urn:catframework">
  <file original="report.docx" source-language="en-US" target-language="fr-FR" datatype="x-unknown">
    <header>
      <skl><external-file href="project.xlf.skl"/></skl>
    </header>
    <body>
      <trans-unit id="seg-1" translate="yes">
        <source>Hello <bpt id="1" rid="b1">&lt;strong&gt;</bpt>world<ept id="2" rid="b1">&lt;/strong&gt;</ept>!</source>
        <target state="translated">Bonjour <bpt id="1" rid="b1">&lt;strong&gt;</bpt>monde<ept id="2" rid="b1">&lt;/strong&gt;</ept>!</target>
      </trans-unit>
    </body>
  </file>
</xliff>
```

## Inline code mapping

`InlineCode` objects are serialised as XLIFF inline elements:

| `InlineCode` | `isIsolated` | XLIFF element |
|---|---|---|
| `OPENING` | false | `<bpt rid="…">` |
| `CLOSING` | false | `<ept rid="…">` |
| `STANDALONE` | false | `<ph rid="…">` |
| `OPENING` | true | `<it pos="open" rid="…">` |
| `CLOSING` | true | `<it pos="close" rid="…">` |

The `catfw:equiv-text` attribute carries `InlineCode::$displayText` when set, giving CAT tools a human-readable hint (e.g. `<b>` instead of the raw `<strong>` tag).

## Segment status mapping

| `SegmentStatus` | XLIFF `state` |
|---|---|
| `Untranslated` | `new` |
| `Draft` | `new` |
| `Translated` | `translated` |
| `Reviewed` | `signed-off` |
| `Approved` | `final` |
| `Rejected` | `needs-translation` |

Locked segments (`SegmentPair::$isLocked = true`) are written with `translate="no"`.

## Skeleton file

The `.skl` file is a JSON-encoded copy of `BilingualDocument::$skeleton` — the filter-specific data needed to rebuild the original file. It is written alongside the XLIFF and must remain with it. The reader looks for `{xliffPath}.skl` automatically.

## Related packages

- [`opencat/core`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/core) — `BilingualDocument`, `SegmentPair`, `Segment`, `InlineCode`
- [`opencat/workflow`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/workflow) — calls `XliffWriter` as the final step in the processing pipeline

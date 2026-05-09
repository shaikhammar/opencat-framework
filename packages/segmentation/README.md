# opencat/segmentation

SRX-based sentence segmentation engine for the [OpenCAT Framework](https://github.com/shaikhammar/opencat-framework).

Takes a `Segment` (one structural unit from a file filter — a paragraph, cell, or node) and splits it into individual sentences according to SRX 2.0 rules. `InlineCode` elements inside the segment are distributed correctly across the resulting sentences, with spanning codes automatically repaired.

## Installation

```bash
composer require opencat/segmentation
```

Requires `ext-mbstring`.

## Usage

```php
use CatFramework\Segmentation\SrxSegmentationEngine;

$engine = new SrxSegmentationEngine();
// Auto-loads the bundled default SRX rules on first call to segment()

$sentences = $engine->segment($segment, 'en-US');
// Returns Segment[] — one item if no sentence boundary was found
```

### Loading custom SRX rules

```php
$engine->loadRules('/path/to/custom.srx');
$sentences = $engine->segment($segment, 'de-DE');
```

## How segmentation works

1. **Plain text extraction** — `Segment::getPlainText()` strips all `InlineCode` elements, leaving only text characters.
2. **Rule matching** — the engine iterates every character position in the plain text. At each position it applies `LanguageRule` rules in order; the first matching rule decides break or no-break. First match wins.
3. **Break position adjustment** — break positions advance past any inter-sentence whitespace so trailing spaces stay with the preceding sentence.
4. **Element distribution** — text strings are sliced at break boundaries; `InlineCode` objects (zero-width) are assigned to the segment whose range contains them.
5. **Spanning code repair** — if a `<bold>` open tag lands in segment A and its close tag in segment B, both are marked `isIsolated = true`, a synthetic closing tag is appended to segment A, and a synthetic opening tag is prepended to segment B. This maps to XLIFF `<it pos="open|close">`.

## Segment IDs

Sub-segment IDs are derived from the parent: `"para-3"` → `"para-3:1"`, `"para-3:2"`, etc. This preserves the origin segment in all downstream IDs.

## Inline code example

Given a segment `"Hello **world**. Next sentence."`:

```
Elements: ["Hello ", <bpt id="b1">, "world", <ept id="b1">, ". Next sentence."]
```

After segmentation into two sentences:

```
Sentence 1: ["Hello ", <bpt id="b1" isolated>, "world", <ept id="b1" isolated>, ". "]
Sentence 2: ["Next sentence."]
```

The bold span did not cross the boundary in this case, so no synthetic codes are needed. If it had:

```
Elements: ["Hello ", <bpt id="b1">, "world. Next", <ept id="b1">, " sentence."]
```

```
Sentence 1: ["Hello ", <bpt id="b1" isolated>, "world. ", <synthetic </b> isolated>]
Sentence 2: [<synthetic <b> isolated>, "Next", <ept id="b1" isolated>, " sentence."]
```

## Language codes

Pass BCP 47 codes. The bundled SRX uses prefix patterns (`EN.*`, `HI.*`, etc.) so `"en-US"`, `"en-GB"`, and `"en"` all match the English rules. If no rule matches, the segment is returned unchanged.

## Related packages

- [`opencat/core`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/core) — `Segment`, `InlineCode`, `SegmentationEngineInterface`
- [`opencat/srx`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/srx) — SRX parser and bundled default rules
- [`opencat/workflow`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/workflow) — uses `SrxSegmentationEngine` as part of the full pipeline

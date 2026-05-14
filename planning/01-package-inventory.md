# Package Inventory

Vendor namespace: `opencat` (placeholder, will change before publishing).

All packages target PHP 8.2+ and have zero framework dependencies (no Laravel, no Symfony in `require`).

---

## Tier 1: Foundation

### opencat/core

- **Purpose:** Shared data models (Segment, SegmentPair, BilingualDocument, InlineCode, TranslationUnit, MatchResult, QualityIssue) and contract interfaces (FileFilterInterface, SegmentationEngineInterface, etc.).
- **Internal deps:** None (root of the dependency tree).
- **External deps:**
  - `ext-intl` (ICU-based Unicode operations: normalization, grapheme handling, locale-aware collation)
  - `ext-mbstring` (multibyte string length, substr, encoding detection)

---

## Tier 2: Format Parsers

These packages read and write standard translation interchange formats. They convert between XML-on-disk and the core data models. No business logic beyond parsing.

### opencat/xliff

- **Purpose:** Read/write XLIFF 1.2 and 2.0 (bilingual document exchange format). Converts between XLIFF XML and BilingualDocument/SegmentPair models.
- **Internal deps:** `opencat/core`
- **External deps:**
  - `ext-dom` (DOM-based XML parsing and generation)
  - `ext-libxml` (XML error handling)

### opencat/tmx

- **Purpose:** Read/write TMX 1.4b (Translation Memory eXchange). Converts between TMX XML and TranslationUnit collections. Supports streaming for large files (100k+ TUs).
- **Internal deps:** `opencat/core`
- **External deps:**
  - `ext-dom` (small/medium files)
  - `ext-xmlreader` (streaming large files without loading full DOM into memory)

### opencat/srx

- **Purpose:** Parse SRX 2.0 (Segmentation Rules eXchange) files into rule objects. SRX defines language-specific break/no-break regex rules for sentence segmentation.
- **Internal deps:** `opencat/core` (uses the Segment model)
- **External deps:**
  - `ext-dom` (XML parsing)

---

## Tier 3: Engines

These implement the contract interfaces from core with real business logic.

### opencat/segmentation

- **Purpose:** Sentence segmentation engine implementing SegmentationEngineInterface. Applies SRX rules to split text into segments. Handles abbreviations, numbers, and non-Latin scripts.
- **Internal deps:** `opencat/core`, `opencat/srx`
- **External deps:**
  - `ext-intl` (Unicode-aware regex via ICU, Unicode character property access)
  - `ext-mbstring` (multibyte-safe string operations)

### opencat/translation-memory

- **Purpose:** Translation memory storage and lookup implementing TranslationMemoryInterface. Supports exact match, TMX import/export. Storage is pluggable via a simple adapter interface, with a default PDO/SQLite backend.
- **Internal deps:** `opencat/core`, `opencat/tmx`
- **External deps:**
  - `ext-pdo` + `ext-pdo_sqlite` (default storage backend)
  - `ext-intl` (Unicode normalization for match comparison)

### opencat/terminology

- **Purpose:** Terminology lookup engine implementing TerminologyProviderInterface. Stores term entries, supports TBX import, provides source-text term recognition.
- **Internal deps:** `opencat/core`
- **External deps:**
  - `ext-pdo` + `ext-pdo_sqlite` (default storage)
  - `ext-intl` (Unicode-aware term matching)
  - `ext-dom` (TBX parsing, built into this package rather than a separate tbx package since TBX is only consumed here)

### opencat/qa

- **Purpose:** Translation quality checks implementing QualityCheckInterface. Individual checks are pluggable classes. Built-in checks: tag consistency, number consistency, empty translations, leading/trailing whitespace, double spaces.
- **Internal deps:** `opencat/core`
- **External deps:**
  - `ext-intl` (Unicode-aware comparison for number formatting, bidirectional text checks)
  - `ext-mbstring` (multibyte whitespace handling)

### opencat/mt

- **Purpose:** Machine translation adapter implementing MachineTranslationInterface. Ships with adapters for DeepL and Google Cloud Translation v3. New providers added via a simple adapter class.
- **Internal deps:** `opencat/core`
- **External deps:**
  - [`psr/http-client`](https://packagist.org/packages/psr/http-client) (PSR-18, HTTP client interface, no concrete implementation bundled)
  - [`psr/http-message`](https://packagist.org/packages/psr/http-message) (PSR-7, HTTP message interfaces)
  - [`psr/http-factory`](https://packagist.org/packages/psr/http-factory) (PSR-17, HTTP factory interfaces for creating request/response objects)

---

## Tier 4: File Filters

Each filter implements FileFilterInterface from core. Filters extract translatable text from a source file format, produce a BilingualDocument, and can rebuild the original file with translations injected.

### opencat/filter-plaintext

- **Purpose:** Plain text file filter. Splits text by paragraph (double newline), preserves non-translatable whitespace structure.
- **Internal deps:** `opencat/core`
- **External deps:**
  - `ext-mbstring` (encoding detection and conversion)

### opencat/filter-html

- **Purpose:** HTML file filter. Extracts translatable text from HTML, preserving inline tags (bold, italic, links, spans) as InlineCode objects. Handles block vs. inline element distinction.
- **Internal deps:** `opencat/core`
- **External deps:**
  - `ext-dom` (HTML parsing)
  - `ext-mbstring`

### opencat/filter-docx

- **Purpose:** DOCX file filter. Extracts translatable text from Word documents, preserving inline formatting (bold, italic, underline, font changes) as InlineCode objects. Handles the OOXML `w:r` / `w:t` structure. Rebuilds the DOCX with translations while preserving all non-text content (images, styles, headers/footers).
- **Internal deps:** `opencat/core`
- **External deps:**
  - `ext-zip` (DOCX files are ZIP archives)
  - `ext-dom` (OOXML is XML)

### opencat/filter-xlsx

- **Purpose:** XLSX file filter. Extracts translatable strings from spreadsheet cells (shared strings table). Preserves cell formatting and structure.
- **Internal deps:** `opencat/core`
- **External deps:**
  - `ext-zip`
  - `ext-dom`

### opencat/filter-pptx

- **Purpose:** PPTX file filter. Extracts translatable text from slide text boxes and notes. Preserves inline formatting as InlineCode objects.
- **Internal deps:** `opencat/core`
- **External deps:**
  - `ext-zip`
  - `ext-dom`

---

## Dependency Graph (simplified)

```
core
├── xliff
├── tmx
├── srx
├── segmentation ──> srx
├── translation-memory ──> tmx
├── terminology
├── qa
├── mt
├── filter-plaintext
├── filter-html
├── filter-docx
├── filter-xlsx
└── filter-pptx
```

---

## Notes and Decisions

**TBX merged into terminology:** Unlike TMX (which is useful independently for TM import/export), TBX has no use case outside the terminology engine in this framework. Keeping it as a separate package would add maintenance overhead with no practical benefit. If demand emerges, it can be extracted later.

**No `psr/log` in core:** Logging is an application concern. Framework packages should throw exceptions on errors and return typed results on success. The reference Laravel app can add logging around these calls. Individual packages can optionally accept a `Psr\Log\LoggerInterface` via setter injection if needed, but it will not be a hard dependency.

**No `psr/event-dispatcher` in core:** Events are useful (e.g., "segment translated," "QA check failed") but adding PSR-14 to core forces all consumers to install an event dispatcher. Deferred to Phase 2 as an optional integration. Packages will use simple callback hooks or return values instead.

**Filter packages are separate:** Each filter is its own package because a developer building a DOCX-only tool should not need to pull in HTML parsing code. The tradeoff is more packages to maintain, but each is small and self-contained.

**Total package count: 15** (1 core + 3 format parsers + 4 engines + 5 filters + the reference Laravel app, which is not a Composer package).

# opencat/project

Project manifest and catpack archive format for the [OpenCAT Framework](https://github.com/shaikhammar/opencat-framework).

Defines `catproject.json` (the project configuration file) and `.catpack` (a portable ZIP archive that bundles source files, TM databases, glossaries, and XLIFF). Also provides pluggable stores for persisting segments and skeletons during long-running translation sessions.

## Installation

```bash
composer require opencat/project
```

Requires `ext-zip`. For PostgreSQL stores, install `ext-pdo_pgsql`.

## Project manifest

A `catproject.json` file describes a translation project:

```json
{
    "name": "Annual Report 2024",
    "sourceLang": "en-US",
    "targetLangs": ["fr-FR", "de-DE"],
    "tm": [
        { "path": "tm/main.db", "readOnly": false }
    ],
    "glossaries": [
        { "path": "glossaries/legal.db", "readOnly": true }
    ],
    "mt": {
        "adapter": "deepl",
        "apiKey": "your-key-here",
        "fillThreshold": 0.75
    },
    "qa": {
        "checks": ["TagConsistencyCheck", "EmptyTranslationCheck", "NumberConsistencyCheck"],
        "failOnSeverity": "error"
    },
    "filters": {
        "docx": {},
        "xlsx": {}
    }
}
```

Load it with `ProjectLoader`:

```php
use CatFramework\Project\ProjectLoader;

$manifest = ProjectLoader::load('/path/to/catproject.json');
echo $manifest->name;          // "Annual Report 2024"
echo $manifest->sourceLang;    // "en-US"
```

## Catpack archive

A `.catpack` file is a ZIP containing:

```
catproject.json       — project manifest
source/               — original source files
tm/                   — SQLite TM databases (stored uncompressed)
glossaries/           — SQLite glossary databases (stored uncompressed)
xliff/                — generated XLIFF files
```

### Creating a catpack

```php
use CatFramework\Project\CatpackArchive;

$archive = CatpackArchive::create('project.catpack', $manifest);
$archive->addSourceFile('report.docx');
$archive->addTm('tm/main.db', 'main.db');
$archive->addGlossary('glossaries/legal.db', 'legal.db');
$archive->addXliff('report.docx.xlf', 'report.docx.xlf');
$archive->save();
```

### Opening a catpack

```php
$archive = CatpackArchive::open('project.catpack');
$manifest = $archive->getManifest();

$archive->extractTo('/tmp/working-dir');
```

## Segment stores

Segment stores persist `SegmentPair` objects during processing, so a long-running workflow can be resumed after interruption.

| Class | Backend | Use case |
|---|---|---|
| `InMemorySegmentStore` | PHP array | Tests and single-request processing |
| `SqliteSegmentStore` | SQLite file | Single-user, no server required |
| `PostgresSegmentStore` | PostgreSQL | Multi-user deployments |

```php
use CatFramework\Project\Store\SqliteSegmentStore;

$store = new SqliteSegmentStore('session.db');
$store->persistSegment($pair, $index, $fileId);

$storedPairs = $store->loadSegments($fileId);
```

All three implement `SegmentStoreInterface`.

## Skeleton stores

Skeleton stores persist the filter skeleton (needed to rebuild the translated file) separately from segments.

| Class | Backend |
|---|---|
| `FilesystemSkeletonStore` | Files on disk |
| `DatabaseSkeletonStore` | SQLite or PostgreSQL |

Both implement `SkeletonStoreInterface`.

## MT fill threshold

`MtConfig::$fillThreshold` controls when MT kicks in. When `WorkflowRunner` finds a TM match below this score (or no match at all) it calls the MT adapter. Set to `0.0` to disable MT entirely; `0.75` means "use MT when the best TM match is below 75%".

## Related packages

- [`opencat/core`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/core) — `BilingualDocument`, `SegmentPair`
- [`opencat/workflow`](https://github.com/shaikhammar/opencat-framework/tree/main/packages/workflow) — `ProjectWorkflowBuilder` takes a `ProjectManifest` and constructs a fully wired `WorkflowRunner`

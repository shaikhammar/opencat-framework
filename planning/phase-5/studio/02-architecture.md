# OpenCAT â€” Technical Architecture

**Version:** 1.0 (Phase 5 Track D)
**Repository:** `opencat-studio` (separate repo from `cat-framework`)

---

## Decision Log Override

The Phase 5 overview (`planning/phase-5/overview.md`) originally specified that the studio calls `opencat-api` over HTTP. **This decision is reversed.** The studio integrates `opencat/*` packages directly via Composer.

**Rationale:**
- No HTTP overhead on every segment save and TM lookup
- Single deployment unit: one Laravel app, one database
- No token-passing complexity between two apps
- The `opencat-api` repo remains valid for headless/programmatic use by third parties
- For the open-source self-hosted use case, running two apps is unnecessary friction

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| PHP | 8.3 | Matches project PHP target; enum support (D29) |
| Framework | Laravel 13 | Established, excellent ecosystem, Inertia starter kit built-in |
| SPA bridge | Inertia.js v2 | Server-side routing + React components; no separate REST API needed for page data |
| Frontend | React 19 + TypeScript | Strong ecosystem; you already know this stack |
| Styles | Tailwind CSS v4 | Pairs with shadcn/ui; Inertia starter ships it |
| Components | shadcn/ui | Accessible, unstyled-then-styled; avoids building table/dialog/dropdown from scratch |
| Database | PostgreSQL 16 | Required for `PostgresSegmentStore` (D30) and `pg_trgm` TM (D32); scales to multi-tenant |
| Cache + Queues | Redis | Laravel Queue driver for async file processing; also used for session cache |
| File Storage | Laravel Storage (local disk) | Source uploads and exported files stored on local filesystem; S3-compatible swap later |
| Auth | Laravel Breeze (Inertia + React) | Ships with the Laravel 13 Inertia starter; handles login, register, password reset |
| Roles | Spatie Laravel Permission | Installed from day 1, single role in V1. Role checks are in place so V2 requires no refactor |
| opencat/* | Composer path repositories â†’ Packagist | During development: path repos. On release: Packagist |

---

## Repository Structure

```
opencat-studio/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ Http/
â”‚   â”‚   â”œâ”€â”€ Controllers/
â”‚   â”‚   â”‚   â”œâ”€â”€ Auth/                  # Breeze controllers (login, register, password)
â”‚   â”‚   â”‚   â”œâ”€â”€ DashboardController.php
â”‚   â”‚   â”‚   â”œâ”€â”€ ProjectController.php
â”‚   â”‚   â”‚   â”œâ”€â”€ FileController.php     # upload, delete, status polling
â”‚   â”‚   â”‚   â”œâ”€â”€ EditorController.php   # load editor page (Inertia)
â”‚   â”‚   â”‚   â”œâ”€â”€ SegmentController.php  # JSON API: CRUD for segments in editor
â”‚   â”‚   â”‚   â”œâ”€â”€ TmController.php       # TM management + concordance
â”‚   â”‚   â”‚   â”œâ”€â”€ GlossaryController.php
â”‚   â”‚   â”‚   â”œâ”€â”€ ExportController.php   # trigger export, serve file download
â”‚   â”‚   â”‚   â”œâ”€â”€ QaController.php       # run QA job, get results
â”‚   â”‚   â”‚   â””â”€â”€ SettingsController.php
â”‚   â”‚   â””â”€â”€ Middleware/
â”‚   â”‚       â””â”€â”€ EnsureProjectBelongsToUser.php
â”‚   â”œâ”€â”€ Jobs/
â”‚   â”‚   â”œâ”€â”€ ProcessUploadedFile.php    # extract â†’ segment â†’ TM â†’ optional MT â†’ store
â”‚   â”‚   â”œâ”€â”€ RunQaOnFile.php
â”‚   â”‚   â””â”€â”€ PopulateMtSuggestions.php  # optional MT pre-fill after processing
â”‚   â”œâ”€â”€ Models/
â”‚   â”‚   â”œâ”€â”€ User.php
â”‚   â”‚   â”œâ”€â”€ Project.php
â”‚   â”‚   â”œâ”€â”€ ProjectFile.php
â”‚   â”‚   â”œâ”€â”€ TranslationMemory.php      # metadata record; actual TM in Postgres via opencat
â”‚   â”‚   â””â”€â”€ Glossary.php               # metadata record; actual terms via opencat
â”‚   â”œâ”€â”€ Services/
â”‚   â”‚   â”œâ”€â”€ ProjectService.php         # create project, attach TM/glossary
â”‚   â”‚   â”œâ”€â”€ FileProcessingService.php  # dispatch ProcessUploadedFile, poll status
â”‚   â”‚   â”œâ”€â”€ EditorService.php          # wraps PostgresSegmentStore (D30)
â”‚   â”‚   â”œâ”€â”€ TmService.php              # wraps PostgresTranslationMemoryProvider (D32)
â”‚   â”‚   â”œâ”€â”€ GlossaryService.php        # wraps SqliteTerminologyProvider
â”‚   â”‚   â”œâ”€â”€ ExportService.php          # hydrate BilingualDocument â†’ filter.rebuild â†’ file
â”‚   â”‚   â””â”€â”€ MtService.php              # wraps DeepLAdapter / GoogleTranslateAdapter
â”‚   â””â”€â”€ Support/
â”‚       â””â”€â”€ FrameworkBridge.php        # wires opencat/* objects from Laravel config
â”œâ”€â”€ config/
â”‚   â””â”€â”€ opencat.php               # TM provider config, MT adapters, QA defaults
â”œâ”€â”€ database/
â”‚   â”œâ”€â”€ migrations/                    # Laravel migrations (see 03-database-schema.md)
â”‚   â””â”€â”€ seeders/
â”œâ”€â”€ resources/
â”‚   â”œâ”€â”€ js/
â”‚   â”‚   â”œâ”€â”€ Pages/
â”‚   â”‚   â”‚   â”œâ”€â”€ Auth/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ Login.tsx
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ Register.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Dashboard.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Projects/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ Index.tsx          # redirects to Dashboard
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ Create.tsx         # project creation wizard
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ Show.tsx           # project overview (file list)
â”‚   â”‚   â”‚   â”œâ”€â”€ Editor/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ Index.tsx          # translation editor (main screen)
â”‚   â”‚   â”‚   â”œâ”€â”€ Tm/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ Index.tsx          # TM manager (project-level)
â”‚   â”‚   â”‚   â”œâ”€â”€ Glossary/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ Index.tsx          # glossary manager (project-level)
â”‚   â”‚   â”‚   â””â”€â”€ Settings/
â”‚   â”‚   â”‚       â””â”€â”€ Index.tsx
â”‚   â”‚   â”œâ”€â”€ Components/
â”‚   â”‚   â”‚   â”œâ”€â”€ Editor/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ SegmentTable.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ SegmentRow.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ TargetEditor.tsx   # contenteditable with tag chip support
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ TagChip.tsx        # inline tag badge ({1}, {/1}, {2/})
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ TmPanel.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ MtPanel.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ QaPanel.tsx
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ GlossaryPanel.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Projects/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ ProjectCard.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ FileList.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ ProgressBar.tsx
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ FileStatusBadge.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Wizard/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ WizardLayout.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ StepIndicator.tsx
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ WizardStep.tsx
â”‚   â”‚   â”‚   â””â”€â”€ Layout/
â”‚   â”‚   â”‚       â”œâ”€â”€ AppLayout.tsx      # sidebar nav + main content
â”‚   â”‚   â”‚       â””â”€â”€ EditorLayout.tsx   # full-screen editor (no sidebar)
â”‚   â”‚   â””â”€â”€ types/
â”‚   â”‚       â”œâ”€â”€ segment.ts
â”‚   â”‚       â”œâ”€â”€ project.ts
â”‚   â”‚       â””â”€â”€ tm.ts
â”‚   â””â”€â”€ css/
â”‚       â””â”€â”€ app.css
â”œâ”€â”€ routes/
â”‚   â”œâ”€â”€ web.php                        # Inertia page routes + auth
â”‚   â””â”€â”€ api.php                        # Editor JSON API (segment CRUD, TM lookup)
â”œâ”€â”€ composer.json
â””â”€â”€ package.json
```

---

## opencat/* Integration

### Composer configuration

During development (before packages are published to Packagist):

```json
{
  "repositories": [
    { "type": "path", "url": "../cat-framework/packages/core" },
    { "type": "path", "url": "../cat-framework/packages/project" },
    { "type": "path", "url": "../cat-framework/packages/workflow" },
    { "type": "path", "url": "../cat-framework/packages/translation-memory" },
    { "type": "path", "url": "../cat-framework/packages/terminology" },
    { "type": "path", "url": "../cat-framework/packages/qa" },
    { "type": "path", "url": "../cat-framework/packages/mt" },
    { "type": "path", "url": "../cat-framework/packages/filter-docx" },
    { "type": "path", "url": "../cat-framework/packages/filter-html" },
    { "type": "path", "url": "../cat-framework/packages/filter-pptx" },
    { "type": "path", "url": "../cat-framework/packages/filter-xlsx" },
    { "type": "path", "url": "../cat-framework/packages/filter-plaintext" },
    { "type": "path", "url": "../cat-framework/packages/filter-po" },
    { "type": "path", "url": "../cat-framework/packages/filter-xml" },
    { "type": "path", "url": "../cat-framework/packages/xliff" },
    { "type": "path", "url": "../cat-framework/packages/srx" },
    { "type": "path", "url": "../cat-framework/packages/segmentation" }
  ]
}
```

### Wire-up via FrameworkBridge

`FrameworkBridge` is a Laravel service that constructs opencat objects from Laravel config and injects them where needed. It is registered as a singleton in `AppServiceProvider`.

```php
// app/Support/FrameworkBridge.php (sketch â€” interfaces only)

class FrameworkBridge
{
    public function makeProjectLoader(Project $project): ProjectLoader;
    public function makeWorkflowRunner(Project $project, ProjectFile $file): WorkflowRunner;
    public function makeSegmentStore(): PostgresSegmentStore;  // uses Laravel's DB connection
    public function makeSkeletonStore(): SkeletonStoreInterface;  // filesystem or database per config
    public function makeTmProvider(Project $project): TranslationMemoryInterface;
    public function makeGlossaryProvider(Project $project): TerminologyProviderInterface;
    public function makeMtAdapter(User $user): ?MachineTranslationInterface;
    public function makeFileFilter(string $format): FileFilterInterface;
    public function makeSegmentationEngine(): SegmentationEngineInterface;
}
```

---

## Data Flow

### Upload â†’ Process flow

```
User uploads file via FileController::store()
    â†’ Validates file type and size
    â†’ Stores raw file to storage/app/uploads/{projectId}/{fileId}/source.{ext}
    â†’ Creates ProjectFile record (status = pending)
    â†’ Dispatches ProcessUploadedFile job
    â†’ Returns Inertia redirect to project overview with "processing" state

ProcessUploadedFile job (queue worker):
    â†’ Instantiates WorkflowRunner via FrameworkBridge
    â†’ WorkflowRunner runs:
         filter.extract()          â†’ BilingualDocument + skeleton bytes
         segmentation.segment()    â†’ segments all segment pairs
         tm.lookupBatch()          â†’ finds TM matches, sets tm_match_percent
         terminology.recognize()   â†’ identifies terms in source
         (optional) mt.translate() â†’ pre-fills target_text for untranslated segments
         segmentStore.persist()    â†’ writes all SegmentPairs to PostgreSQL (D30)
         skeletonStore.store()     â†’ persists skeleton bytes
    â†’ Updates ProjectFile: status = ready, word_count, segment_count
    â†’ (If MT pre-fill enabled) dispatches PopulateMtSuggestions job
```

### Editor â†’ Save flow

```
Translator edits target text in SegmentRow
    â†’ React auto-saves after 500ms debounce (blur or pause)
    â†’ PATCH /api/editor/segments/{segmentId}
         body: { target_text, status }
    â†’ SegmentController validates and calls EditorService::updateSegment()
    â†’ EditorService calls PostgresSegmentStore::updateSegment() (D30)
         validates status transition (D29)
         writes target_text with tag placeholders
    â†’ If status = Translated: TmService::addEntry() writes to project TM
    â†’ Returns updated segment JSON
    â†’ React updates local segment state (no full page reload)
```

### Export flow

```
User clicks "Export" on project overview
    â†’ POST /projects/{project}/files/{fileId}/export
    â†’ ExportController dispatches (or runs inline if fast enough)
    â†’ ExportService:
         segmentStore.hydrate(fileId) â†’ BilingualDocument
         skeletonStore.retrieve(fileId) â†’ skeleton bytes
         filter.rebuild(document, skeleton) â†’ target file bytes
         Stores to storage/app/exports/{projectId}/{fileId}/target.{ext}
    â†’ Returns download response
```

---

## Authentication & Authorization

### V1 (strictly single user â€” D-S1)
- Laravel Breeze with Inertia + React starter
- Email + password, remember me, password reset via email
- **One user only.** Registration creates the account on first visit. A `RegistrationEnabled` middleware returns HTTP 403 on any subsequent `GET /register` or `POST /register` request
- `spatie/laravel-permission` is installed and the `translator` role is assigned to the first user on registration â€” V2 additions require no auth refactor

### V2+ hooks (do not implement in V1, but schema supports)
- `Role` model via Spatie: `translator`, `reviewer`, `manager`, `admin`
- `teams` table (stub, single team in V1 â€” created automatically on registration)
- `team_user` pivot with role per membership
- All project/file queries filtered by `user_id` in V1 â†’ filtered by `team_id` in V4

---

## Queue Configuration

Use Redis as the queue driver. Configure two queues:

| Queue | Priority | Used for |
|---|---|---|
| `critical` | High | Segment saves, TM lookups (real-time editor actions) |
| `default` | Normal | File processing, QA runs, MT pre-fill |
| `exports` | Low | Export file generation |

Workers:
```bash
# Start worker (processes all queues in priority order)
php artisan queue:work redis --queue=critical,default,exports
```

For local development, `QUEUE_CONNECTION=sync` runs jobs inline (no worker needed).

---

## File Storage

```
storage/app/
â”œâ”€â”€ uploads/
â”‚   â””â”€â”€ {project_id}/
â”‚       â””â”€â”€ {file_id}/
â”‚           â””â”€â”€ source.{ext}      â† uploaded source file
â”œâ”€â”€ skeletons/
â”‚   â””â”€â”€ {project_id}/
â”‚       â””â”€â”€ {file_id}/
â”‚           â””â”€â”€ skeleton.bin      â† skeleton bytes (FilesystemSkeletonStore)
â””â”€â”€ exports/
    â””â”€â”€ {project_id}/
        â””â”€â”€ {file_id}/
            â””â”€â”€ target.{ext}      â† generated target file (ephemeral, deleted after download or TTL)
```

File size limits:
- Source file upload: 50 MB max (configurable in `config/opencat.php`)
- Files > 5 MB are processed asynchronously without a timeout warning (they always go through the queue)
- Files â‰¤ 1 MB MAY be processed synchronously with an optimistic timeout (optional, controlled by config flag)

---

## Configuration File

`config/opencat.php` is the single place to configure all opencat integration:

```php
return [
    'tm' => [
        'provider' => 'postgres',   // 'postgres' or 'sqlite'
        'fuzzy_threshold' => 75,    // minimum match percentage
    ],

    'segmentation' => [
        'engine' => 'srx',
        'srx_file' => null,         // null = use opencat/srx bundled default
    ],

    'skeleton' => [
        // D-S4: filesystem chosen over database BYTEA.
        // Avoids TOAST bloat + memory pressure for large PPTX/DOCX with embedded media.
        // V4 SaaS upgrade to S3: change FILESYSTEM_DISK=s3 â€” zero code change.
        // 'database' option retained in code but unused in V1.
        'store' => 'filesystem',
    ],

    'file_processing' => [
        'max_sync_size_bytes' => 1_048_576,  // 1 MB â€” larger files always go through queue
        'upload_max_size_bytes' => 52_428_800, // 50 MB
        'supported_formats' => ['docx', 'pptx', 'xlsx', 'html', 'txt', 'xliff', 'po', 'xml'],
    ],

    'tm' => [
        // D-S2: global TM is on by default for every new project.
        // User can deselect during project creation (Step 2 of wizard) or in project settings.
        'use_global_by_default' => true,
        'provider' => 'postgres',
        'fuzzy_threshold' => 75,
    ],

    'mt' => [
        // D-S3: MT pre-fill is opt-in per file upload (off by default).
        // Future V2 "Project Templates" will expose this (and QA config, MT provider) as
        // saveable defaults the user can apply when creating new projects.
        'default_provider' => env('CAT_MT_PROVIDER', null),  // 'deepl' or 'google'
        'prefill_on_upload' => false,   // user overrides this per upload
    ],

    'qa' => [
        'default_checks' => [
            'tag_consistency'     => true,
            'length_ratio'        => true,
            'trailing_spaces'     => true,
            'double_spaces'       => true,
            'terminology'         => true,
            'number_consistency'  => true,
        ],
    ],
];
```

---

## Environment Variables

Key additions to `.env`:

```dotenv
# Database (PostgreSQL required)
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=cat_studio
DB_USERNAME=cat_user
DB_PASSWORD=secret

# Redis (queue + cache)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
QUEUE_CONNECTION=redis
CACHE_DRIVER=redis

# File storage
FILESYSTEM_DISK=local

# MT providers (user-level keys are stored in DB, these are fallback/admin defaults)
CAT_DEEPL_API_KEY=
CAT_GOOGLE_TRANSLATE_KEY=

# Registration: true only on first run (auto-set to false after first user is created)
# Do not set this to true in production after initial setup â€” it reopens 
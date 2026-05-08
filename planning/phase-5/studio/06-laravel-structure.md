# OpenCAT â€” Laravel Structure

**Version:** 1.0 (Phase 5 Track D)
**Framework:** Laravel 13 with Inertia.js v2 + React 19 starter kit

This document defines the complete server-side structure: routes, controllers, service classes, queue jobs, and the Inertia page map. It is the implementation reference for the backend.

---

## Routes

Two route files: `web.php` for Inertia page routes, `api.php` for the JSON editor API.

### `routes/web.php`

```php
<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\EditorController;
use App\Http\Controllers\TmController;
use App\Http\Controllers\GlossaryController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\QaController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

// â”€â”€ Auth routes (Breeze) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisteredUserController::class, 'create'])
        ->name('register')
        ->middleware('registration.enabled');   // 403 if user already exists

    Route::post('/register', [RegisteredUserController::class, 'store'])
        ->middleware('registration.enabled');

    Route::get('/login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('/login', [AuthenticatedSessionController::class, 'store']);

    Route::get('/forgot-password', [PasswordResetController::class, 'create'])
        ->name('password.request');

    Route::post('/forgot-password', [PasswordResetController::class, 'store'])
        ->name('password.email');

    Route::get('/reset-password/{token}', [PasswordResetController::class, 'edit'])
        ->name('password.reset');

    Route::post('/reset-password', [PasswordResetController::class, 'update'])
        ->name('password.update');
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

// â”€â”€ Authenticated routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Route::middleware('auth')->group(function () {

    // Dashboard
    Route::get('/', fn () => redirect()->route('dashboard'));
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    // Projects
    Route::get('/projects/create', [ProjectController::class, 'create'])
        ->name('projects.create');
    Route::post('/projects', [ProjectController::class, 'store'])
        ->name('projects.store');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])
        ->name('projects.show')
        ->middleware('can:view,project');
    Route::patch('/projects/{project}', [ProjectController::class, 'update'])
        ->name('projects.update')
        ->middleware('can:update,project');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])
        ->name('projects.destroy')
        ->middleware('can:delete,project');

    // Files (within a project)
    Route::post('/projects/{project}/files', [FileController::class, 'store'])
        ->name('files.store')
        ->middleware('can:update,project');
    Route::delete('/projects/{project}/files/{file}', [FileController::class, 'destroy'])
        ->name('files.destroy')
        ->middleware('can:update,project');
    Route::get('/projects/{project}/files/{file}/status', [FileController::class, 'status'])
        ->name('files.status');  // JSON â€” polled by frontend for processing status

    // Editor (Inertia page)
    Route::get('/projects/{project}/files/{file}/editor', [EditorController::class, 'show'])
        ->name('editor.show')
        ->middleware('can:view,project');

    // Export
    Route::post('/projects/{project}/files/{file}/export', [ExportController::class, 'store'])
        ->name('export.store')
        ->middleware('can:view,project');
    Route::get('/projects/{project}/files/{file}/export/download', [ExportController::class, 'download'])
        ->name('export.download')
        ->middleware('can:view,project');

    // Project-level TM
    Route::get('/projects/{project}/tm', [TmController::class, 'show'])
        ->name('tm.show')
        ->middleware('can:view,project');
    Route::post('/projects/{project}/tm/import', [TmController::class, 'import'])
        ->name('tm.import')
        ->middleware('can:update,project');
    Route::get('/projects/{project}/tm/export', [TmController::class, 'export'])
        ->name('tm.export')
        ->middleware('can:view,project');
    Route::delete('/projects/{project}/tm/entries/{entry}', [TmController::class, 'destroyEntry'])
        ->name('tm.entries.destroy')
        ->middleware('can:update,project');

    // Global TM
    Route::get('/tm', [TmController::class, 'global'])->name('tm.global');
    Route::post('/tm/import', [TmController::class, 'importGlobal'])->name('tm.global.import');
    Route::get('/tm/export', [TmController::class, 'exportGlobal'])->name('tm.global.export');

    // Project-level Glossary
    Route::get('/projects/{project}/glossary', [GlossaryController::class, 'show'])
        ->name('glossary.show')
        ->middleware('can:view,project');
    Route::post('/projects/{project}/glossary/import', [GlossaryController::class, 'import'])
        ->name('glossary.import')
        ->middleware('can:update,project');
    Route::post('/projects/{project}/glossary/terms', [GlossaryController::class, 'storeTerm'])
        ->name('glossary.terms.store')
        ->middleware('can:update,project');
    Route::delete('/projects/{project}/glossary/terms/{termId}', [GlossaryController::class, 'destroyTerm'])
        ->name('glossary.terms.destroy')
        ->middleware('can:update,project');

    // Global Glossary
    Route::get('/glossary', [GlossaryController::class, 'global'])->name('glossary.global');

    // Settings
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::patch('/settings/profile', [SettingsController::class, 'updateProfile'])->name('settings.profile');
    Route::patch('/settings/mt', [SettingsController::class, 'updateMt'])->name('settings.mt');
    Route::patch('/settings/qa', [SettingsController::class, 'updateQa'])->name('settings.qa');
});
```

### `routes/api.php` â€” Editor JSON API

All routes require `auth:sanctum` (or the default `web` guard â€” same session cookie works via Inertia). These are consumed by the React editor via `fetch`, not Inertia.

```php
<?php

use App\Http\Controllers\Api\SegmentController;
use App\Http\Controllers\Api\TmLookupController;
use App\Http\Controllers\Api\MtController;
use App\Http\Controllers\Api\QaRunController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // Segment list (paginated, filterable)
    Route::get(
        '/projects/{project}/files/{file}/segments',
        [SegmentController::class, 'index']
    );

    // Single segment detail
    Route::get(
        '/projects/{project}/files/{file}/segments/{segment}',
        [SegmentController::class, 'show']
    );

    // Update segment target text + status (the hot path â€” called on every save)
    Route::patch(
        '/projects/{project}/files/{file}/segments/{segment}',
        [SegmentController::class, 'update']
    );

    // TM lookup for active segment
    Route::get(
        '/projects/{project}/files/{file}/segments/{segment}/tm',
        [TmLookupController::class, 'lookup']
    );

    // TM concordance search
    Route::get(
        '/projects/{project}/tm/search',
        [TmLookupController::class, 'concordance']
    );

    // MT suggestion for active segment
    Route::post(
        '/projects/{project}/files/{file}/segments/{segment}/mt',
        [MtController::class, 'suggest']
    );

    // Run QA on file (dispatches job; returns job ID for polling)
    Route::post(
        '/projects/{project}/files/{file}/qa',
        [QaRunController::class, 'store']
    );

    // Poll QA job status + results
    Route::get(
        '/projects/{project}/files/{file}/qa/results',
        [QaRunController::class, 'results']
    );
});
```

---

## Controllers

### Web Controllers

#### `DashboardController`

```php
// GET /dashboard
public function index(): Response
// Returns Inertia 'Dashboard' with:
//   projects: Project[] (with file counts, progress, last activity)
//   globalTm: TranslationMemory|null
//   globalGlossary: Glossary|null
```

#### `ProjectController`

```php
public function create(): Response
// GET /projects/create â€” returns Inertia 'Projects/Create'
// Passes: languageOptions (sorted list of BCP 47 codes + names)
//         globalTm: TranslationMemory|null  (D-S2: pre-selected in wizard Step 2 if exists)
//         useGlobalTmDefault: true          (D-S2: wizard Step 2 checkbox pre-checked)

public function store(StoreProjectRequest $request): RedirectResponse
// POST /projects
// 1. Creates Project record
// 2. Creates TranslationMemory record if requested
// 3. Creates Glossary record if requested
// 4. Handles uploaded files: stores each, creates ProjectFile, dispatches ProcessUploadedFile
// 5. Redirects to projects.show

public function show(Project $project): Response
// GET /projects/{project}
// Returns Inertia 'Projects/Show' with:
//   project: Project (with files, TM, glossary)
//   files: ProjectFile[] (with segment counts, word counts, status)

public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
// PATCH /projects/{project} â€” name, description, status, qa_config, mt_provider

public function destroy(Project $project): RedirectResponse
// DELETE /projects/{project} â€” soft archive or hard delete
```

#### `FileController`

```php
public function store(StoreFileRequest $request, Project $project): JsonResponse
// POST /projects/{project}/files
// Stores uploaded file, creates ProjectFile (status=pending),
// dispatches ProcessUploadedFile job
// Returns: { fileId, status: 'pending' }

public function status(Project $project, ProjectFile $file): JsonResponse
// GET /projects/{project}/files/{file}/status
// Returns: { id, status, wordCount, segmentCount, translatedCount, errorMessage }
// Polled by the frontend every 3s while status = processing

public function destroy(Project $project, ProjectFile $file): RedirectResponse
// DELETE â€” removes file, segments, skeleton, export
```

#### `EditorController`

```php
public function show(Project $project, ProjectFile $file): Response
// GET /projects/{project}/files/{file}/editor
// Returns Inertia 'Editor/Index' with first page of segments (100),
// project TM reference, active glossary, user settings (dir, autoMt, etc.)
// This is the only full Inertia load for the editor â€” subsequent data is JSON API
```

#### `ExportController`

```php
public function store(Project $project, ProjectFile $file): JsonResponse
// POST â€” dispatches export job (or runs inline for small files)
// Returns: { exportPath, status: 'ready'|'exporting' }

public function download(Project $project, ProjectFile $file): BinaryFileResponse
// GET â€” serves the exported file as a download
// Checks export_path is set and file exists
// Content-Disposition: attachment; filename="translated_original.docx"
```

#### `TmController`

```php
public function show(Project $project): Response
// GET /projects/{project}/tm â€” Inertia 'Tm/Index'
// Passes: tm metadata, first page of entries (paginated)

public function import(Request $request, Project $project): RedirectResponse
// POST /projects/{project}/tm/import
// Validates TMX file, dispatches ImportTmxJob
// Redirects back with flash: "Import started"

public function export(Project $project): BinaryFileResponse
// GET â€” generates TMX and streams download

public function destroyEntry(Project $project, int $entry): RedirectResponse
// DELETE /projects/{project}/tm/entries/{entry}
// Calls TmService::deleteEntry(), decrements entry_count
```

#### `SettingsController`

```php
public function index(): Response
// GET /settings â€” Inertia 'Settings/Index'
// Passes: user profile, mt configs (keys redacted), qa defaults

public function updateProfile(UpdateProfileRequest $request): RedirectResponse
// PATCH /settings/profile â€” name, email, locale

public function updateMt(UpdateMtRequest $request): RedirectResponse
// PATCH /settings/mt
// Validates provider, encrypts API key, saves to mt_configs
// Optionally tests the key against the provider's validation endpoint

public function updateQa(UpdateQaRequest $request): RedirectResponse
// PATCH /settings/qa â€” updates user settings keys for QA defaults
```

### API Controllers (JSON, no Inertia)

#### `Api\SegmentController`

```php
public function index(Request $request, Project $project, ProjectFile $file): JsonResponse
// GET /api/projects/{project}/files/{file}/segments
// Query params: page (default 1), limit (default 100, max 200), status (filter)
// Returns: { data: Segment[], meta: { page, limit, total, hasMore } }

public function show(Project $project, ProjectFile $file, Segment $segment): JsonResponse
// Returns single segment with source_tags, target_tags fully expanded

public function update(UpdateSegmentRequest $request, Project $project, ProjectFile $file, Segment $segment): JsonResponse
// PATCH â€” the hot path; must be fast
// Validates: target_text (string|null), target_tags (array), status (SegmentStatus)
// Calls EditorService::updateSegment()
// If status transitions to Translated: TmService::addEntry() in background (queued, not inline)
// Returns updated segment
// Target: < 50ms p95 response time
```

#### `Api\TmLookupController`

```php
public function lookup(Project $project, ProjectFile $file, Segment $segment): JsonResponse
// GET â€” returns top 4 TM matches for the segment's source_text
// Calls TmService::lookup(sourceText, sourceLang, targetLang, threshold)
// Returns: TmMatch[] with source, target, percent, origin, diffTokens

public function concordance(Request $request, Project $project): JsonResponse
// GET â€” free-text search across TM entries
// Query: q (search string), limit (default 20)
// Returns: TmEntry[]
```

#### `Api\MtController`

```php
public function suggest(Project $project, ProjectFile $file, Segment $segment): JsonResponse
// POST â€” requests MT suggestion for this segment
// Resolves MT adapter via MtService (uses project.mt_provider or user default)
// Calls adapter->translate(segment)
// Returns: { suggestion: string, provider: string, tagWarning: bool }
// tagWarning = true when Google strips tags (D18)
```

#### `Api\QaRunController`

```php
public function store(Project $project, ProjectFile $file): JsonResponse
// POST â€” dispatches RunQaOnFile job
// Returns: { jobId, status: 'queued' }

public function results(Project $project, ProjectFile $file): JsonResponse
// GET â€” returns current QA results for the file (cached after each run)
// Returns: { issues: QaIssue[], ranAt: timestamp|null, status: 'pending'|'ready' }
```

---

## Request Validation Classes

```
App\Http\Requests\
â”œâ”€â”€ StoreProjectRequest        name, source_lang, target_lang, description?, use_global_tm (bool, default true)
â”œâ”€â”€ UpdateProjectRequest       name?, description?, status?, qa_config?, mt_provider?
â”œâ”€â”€ StoreFileRequest           file (UploadedFile, max 50MB, mime validated)
â”œâ”€â”€ UpdateSegmentRequest       target_text (string|null), target_tags (array), status (enum)
â”œâ”€â”€ UpdateProfileRequest       name, email (unique), locale
â”œâ”€â”€ UpdateMtRequest            provider (in: deepl,google), api_key (string, min 10)
â””â”€â”€ UpdateQaRequest            checks (array of bool), length_ratio_max (numeric 1â€“10)
```

---

## Service Classes

### `ProjectService`

```php
// Creates a project with optional TM and glossary in one transaction
public function create(array $data, User $user): Project

// Returns project with eager-loaded files + aggregate counts
public function getWithStats(Project $project): Project

// Archives a project and its files (sets status = archived)
public function archive(Project $project): void
```

### `FileProcessingService`

```php
// Stores uploaded file, creates ProjectFile, dispatches ProcessUploadedFile
public function accept(UploadedFile $file, Project $project, User $user, array $options): ProjectFile

// Returns current status of a file (for polling)
public function getStatus(ProjectFile $file): array  // { status, wordCount, ... }
```

### `EditorService`

Wraps `PostgresSegmentStore` (D30). Handles status transitions and denormalization.

```php
// Fetch segments paginated (returns StoredSegment[])
public function getSegments(ProjectFile $file, ?SegmentStatus $filter, int $page, int $limit): array

// Update target text + status. Enforces D29 transitions. Updates translated_count denorm.
// Throws InvalidStatusTransitionException on illegal transition.
public function updateSegment(Segment $segment, ?string $targetText, array $targetTags, SegmentStatus $status): Segment

// Hydrate full BilingualDocument from stored segments (used by ExportService)
public function hydrateDocument(ProjectFile $file): BilingualDocument
```

### `TmService`

Wraps `PostgresTranslationMemoryProvider` (D32).

```php
// Lookup TM matches for a source text
public function lookup(string $sourceText, string $sourceLang, string $targetLang, int $threshold, ?TranslationMemory $tm): array

// Add a segment pair to TM (called after status â†’ Translated)
public function addEntry(string $source, string $target, string $sourceLang, string $targetLang, TranslationMemory $tm): void

// Import a TMX file (queued â€” called from ImportTmxJob)
public function importTmx(string $tmxPath, TranslationMemory $tm): int  // returns entry count added

// Export TM as TMX
public function exportTmx(TranslationMemory $tm): string  // returns file path

// Concordance search
public function search(string $query, TranslationMemory $tm, int $limit): array
```

### `GlossaryService`

Wraps `SqliteTerminologyProvider` from `opencat/terminology`.

```php
// Recognise terms in a source segment (for Glossary panel)
public function recognize(string $sourceText, string $sourceLang, Glossary $glossary): array

// Import TBX file
public function importTbx(string $tbxPath, Glossary $glossary): int

// Export as TBX
public function exportTbx(Glossary $glossary): string

// Add/remove individual terms
public function addTerm(string $source, string $target, string $domain, Glossary $glossary): void
public function deleteTerm(int $termId, Glossary $glossary): void
```

### `ExportService`

```php
// Generate target file from stored segments + skeleton. Returns export file path.
public function export(ProjectFile $file): string

// Steps:
// 1. EditorService::hydrateDocument($file) â†’ BilingualDocument
// 2. SkeletonStoreInterface::retrieve($file->id) â†’ skeleton bytes
// 3. FrameworkBridge::makeFileFilter($file->file_format) â†’ FilterInterface
// 4. filter->rebuild($document, $skeleton) â†’ target file bytes
// 5. Store to storage/app/exports/{projectId}/{fileId}/target.{ext}
// 6. Update $file->export_path, $file->status = 'exported'
```

### `MtService`

```php
// Resolve MT adapter for a user + project (project preference overrides user default)
public function resolveAdapter(User $user, Project $project): ?MachineTranslationInterface

// Translate a single segment. Handles D17 (DeepL tag mode) and D18 (Google tag strip).
public function translate(Segment $segment, MachineTranslationInterface $adapter): array
// Returns: { suggestion, provider, tagWarning }
```

### `FrameworkBridge`

```php
// Singleton â€” wires opencat objects from Laravel config + DB state
public function makeWorkflowRunner(Project $project, ProjectFile $file): WorkflowRunner
public function makeSegmentStore(): PostgresSegmentStore
public function makeSkeletonStore(): SkeletonStoreInterface
public function makeTmProvider(TranslationMemory $tm): TranslationMemoryInterface
public function makeGlossaryProvider(Glossary $glossary): TerminologyProviderInterface
public function makeMtAdapter(string $provider, string $apiKey): MachineTranslationInterface
public function makeFileFilter(string $format): FileFilterInterface
public function makeSegmentationEngine(): SegmentationEngineInterface
```

---

## Queue Jobs

### `ProcessUploadedFile`

```
Queue: default
Timeout: 300s (5 minutes)
Tries: 2

Constructor: ProjectFile $file, array $options (mtPrefill: bool)

handle():
  1. Update $file->status = 'processing'
  2. Resolve FileFilter from format
  3. filter->extract(sourceFileContents) â†’ BilingualDocument + skeleton
  4. SkeletonStore::store($file->id, skeleton)
  5. SegmentationEngine::segment(document)
  6. TmProvider::lookupBatch(segments) â€” sets tm_match_percent on each SegmentPair
  7. TerminologyProvider::recognize(segments) â€” for glossary pre-population
  8. PostgresSegmentStore::persist(document, $file->id)
  9. Update $file: status='ready', word_count, segment_count, processed_at
 10. If $options['mtPrefill']: dispatch PopulateMtSuggestions

failed(Throwable $e):
  Update $file: status='error', error_message=$e->getMessage()
```

### `RunQaOnFile`

```
Queue: default
Timeout: 120s

handle():
  1. EditorService::hydrateDocument($file) â†’ BilingualDocument
  2. QualityRunner::run(document, qaConfig) â†’ QaIssue[]
  3. Cache::put("qa_results_{$file->id}", $issues, 3600)
  4. Cache::put("qa_status_{$file->id}", 'ready', 3600)
```

### `PopulateMtSuggestions`

```
Queue: default
Timeout: 600s (MT API can be slow for large files)
Tries: 1  (MT failure should not retry automatically â€” costs API credits)

handle():
  1. Load all untranslated segments for file
  2. Resolve MT adapter from project settings
  3. For each segment (in batches of 10):
     a. MtService::translate(segment, adapter)
     b. EditorService::updateSegment(segment, suggestion, status=Draft)
  4. Update file progress counts
```

### `ImportTmxJob`

```
Queue: default
Timeout: 300s

handle():
  1. TmService::importTmx($tmxPath, $tm)
  2. Update translation_memories.entry_count
  3. Delete temp TMX file
```

---

## Inertia Page â†’ Controller Map

| Page component | Route | Controller method | Inertia props |
|---|---|---|---|
| `Auth/Login` | `GET /login` | `AuthenticatedSessionController::create` | â€” |
| `Auth/Register` | `GET /register` | `RegisteredUserController::create` | â€” |
| `Dashboard` | `GET /dashboard` | `DashboardController::index` | `projects[]`, `globalTm?`, `globalGlossary?` |
| `Projects/Create` | `GET /projects/create` | `ProjectController::create` | `languageOptions[]`, `globalTmExists: bool` |
| `Projects/Show` | `GET /projects/{id}` | `ProjectController::show` | `project`, `files[]`, `tm?`, `glossary?` |
| `Editor/Index` | `GET /projects/{id}/files/{fileId}/editor` | `EditorController::show` | `project`, `file`, `segments[]` (page 1), `userSettings` |
| `Tm/Index` | `GET /projects/{id}/tm` | `TmController::show` | `project`, `tm`, `entries[]` (paginated) |
| `Glossary/Index` | `GET /projects/{id}/glossary` | `GlossaryController::show` | `project`, `glossary`, `terms[]` (paginated) |
| `Settings/Index` | `GET /settings` | `SettingsController::index` | `user`, `mtConfigs[]`, `qaDefaults` |

---

## Middleware

### `EnsureRegistrationEnabled`

```php
// Blocks /register GET and POST if any user row exists in the database.
// D-S1: single-user is a V1 invariant â€” this is NOT configurable via .env.
// Returns 403 with an Inertia "Setup complete" page explaining the tool is already set up.
// To reset for a fresh install: truncate the users table (documented in README).
```

### `EnsureProjectBelongsToUser` (replaced by Laravel Policies)

In V1, use Laravel Policies instead of custom middleware:

```php
// App\Policies\ProjectPolicy
public function view(User $user, Project $project): bool
{
    return $project->user_id === $user->id;
    // V4: return $project->team_id === $user->currentTeam->id;
}

public function update(User $user, Project $project): bool
{
    return $project->user_id === $user->id;
}
```

---

## TypeScript Types (resources/js/types)

### `segment.ts`

```typescript
export type SegmentStatus =
  | 'untranslated'
  | 'draft'
  | 'translated'
  | 'reviewed'
  | 'approved'
  | 'rejected';

export interface TagMap {
  id: number;
  type: 'open' | 'close' | 'self';
  data: string;
  displayText: string;
}

export interface Segment {
  id: string;
  segmentNumber: number;
  sourceText: string;
  targetText: string | null;
  sourceTags: TagMap[];
  targetTags: TagMap[];
  status: SegmentStatus;
  wordCount: number;
  tmMatchPercent: number | null;
  tmMatchOrigin: 'tm' | 'mt' | 'human' | 'exact' | null;
  note: string | null;
  locked: boolean;
}

export interface TmMatch {
  sourceText: string;
  targetText: string;
  percent: number;
  origin: 'tm' | 'mt' | 'exact';
  diffTokens: DiffToken[];  // for source diff highlighting
}

export interface DiffToken {
  text: string;
  type: 'match' | 'insert' | 'delete';
}

export interface QaIssue {
  segmentId: string;
  segmentNumber: number;
  severity: 'error' | 'warning' | 'info';
  checkName: string;
  message: string;
}
```

### `project.ts`

```typescript
export interface Project {
  id: string;
  name: string;
  sourceLang: string;
  targetLang: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  originalName: string;
  fileFormat: string;
  wordCount: number;
  segmentCount: number;
  translatedCount: number;
  status: 'pending' | 'processing' | 'ready' | 'exporting' | 'exported' | 'error';
  errorMessage: string | null;
  processedAt: string | null;
  exportPath: string | null;
}
```

---

## Composer Dependencies

Key packages to add to `composer.json`:

```json
{
  "require": {
    "php": "^8.3",
    "laravel/framework": "^13.0",
    "laravel/breeze": "^2.0",
    "inertiajs/inertia-laravel": "^2.0",
    "spatie/laravel-permission": "^6.0",
    "opencat/core": "*@dev",
    "opencat/project": "*@dev",
    "opencat/workflow": "*@dev",
    "opencat/translation-memory": "*@dev",
    "opencat/terminology": "*@dev",
    "opencat/qa": "*@dev",
    "opencat/mt": "*@dev",
    "opencat/filter-docx": "*@dev",
    "opencat/filter-html": "*@dev",
    "opencat/filter-pptx": "*@dev",
    "opencat/filter-xlsx": "*@dev",
    "opencat/filter-plaintext": "*@dev",
    "opencat/filter-po": "*@dev",
    "opencat/filter-xml": "*@dev",
    "opencat/xliff": "*@dev",
    "opencat/srx": "*@dev",
    "opencat/segmentation": "*@dev"
  }
}
```

## NPM Dependencies

Key packages to add to `package.json`:

```json
{
  "dependencies": {
    "@inertiajs/react": "^2.0",
    "@tanstack/react-virtual": "^3.0",
    "react": "^19.0",
    "react-dom": "^19.0"
  },
  "devDependencies": {
    "@types/react": "^19.0",
    "@types/react-dom": "^19.0",
    "typescript": "^5.0",
  
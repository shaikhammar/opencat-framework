# Phase 4 â€” API Service (`opencat-api`)

## Purpose

A standalone, deployable REST API that exposes every capability of the CAT framework over HTTP. Any tech stack (Python, Node, Ruby, Go, Java, etc.) can run translation pipelines by calling this API.

This is a **separate repository** and a **separate Composer project**. It is a consumer of `opencat/*` packages â€” not a framework package itself.

---

## Repository

```
github.com/opencat/opencat-api
```

Not part of the main `cat-framework` monorepo.

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| HTTP framework | Laravel 11 | Ammar's primary stack; routing, validation, queues, auth all built in |
| Auth | Laravel Sanctum (API tokens) | Simple per-token auth, no OAuth complexity for v1 |
| Queue | Laravel Queue + database driver | Async file processing without Redis dependency for self-hosters |
| Storage | Laravel Filesystem (local disk, S3-compatible optional) | Uploaded files, TM SQLite files, generated XLIFF |
| API spec | Scribe (auto-generates OpenAPI 3.1 from route annotations) | Doc stays in sync with code |
| Container | Docker + docker-compose | Standard self-hosted deployment |

---

## Architecture decisions (DA1â€“DA5)

### DA1 â€” Authentication

**Decision:** Sanctum personal access tokens. No OAuth2 for v1.

Clients register, receive a token, include it as `Authorization: Bearer {token}` on every request.

```
POST /auth/tokens          â†’ create token (name, abilities[])
DELETE /auth/tokens/{id}   â†’ revoke token
GET  /auth/tokens          â†’ list tokens
```

**Why not OAuth2:** adds a full auth server (Passport + client registration) for zero benefit when the primary consumers are server-to-server scripts and developer tools. Can add OAuth2 in a future version.

**Abilities (scopes):**

| Ability | Grants |
|---|---|
| `process` | File extraction, segmentation, workflow |
| `tm:read` | TM lookup |
| `tm:write` | TM import, segment update |
| `mt` | MT translate calls |
| `qa` | QA run |
| `terminology:read` | Term recognition |
| `terminology:write` | TBX import |
| `projects` | Project manifest CRUD |
| `*` | All abilities |

---

### DA2 â€” File handling

**Decision:** Multipart form-data for upload. File IDs for subsequent operations. Download via signed URLs or direct binary response.

**Upload flow:**

```
POST /files              multipart/form-data; file=@document.docx
â†’ { "fileId": "abc123", "name": "document.docx", "size": 45231, "mimeType": "..." }
```

Files are stored server-side. Clients reference them by `fileId` in subsequent calls.

**Download:**

```
GET /files/{fileId}/download        â†’ binary response (Content-Disposition: attachment)
GET /files/{fileId}/download-url    â†’ { "url": "...", "expiresAt": "..." }  (if S3 storage)
```

**Retention:** Files are soft-deleted after 24 hours by default (configurable via `FILE_RETENTION_HOURS` env). Clients must download outputs before expiry.

**Size limits:**

| Limit | Default | Config key |
|---|---|---|
| Max upload size | 50 MB | `MAX_UPLOAD_MB` |
| Async threshold | 5 MB | `ASYNC_THRESHOLD_MB` |

---

### DA3 â€” Sync vs async processing

**Decision:** Files below `ASYNC_THRESHOLD_MB` (default 5 MB) are processed synchronously and return the result in the response. Larger files return `202 Accepted` with a job ID.

**Sync response (< 5 MB):**

```json
HTTP 200 OK
{
  "data": {
    "xliffFileId": "xyz789",
    "matchStats": { "exact": 12, "fuzzy": 4, "mt": 8, "unmatched": 2 },
    "qaIssues": [],
    "timings": { "extract": 0.12, "segment": 0.03, "tm": 0.18, "total": 0.41 }
  }
}
```

**Async response (>= 5 MB):**

```json
HTTP 202 Accepted
{
  "data": {
    "jobId": "job_abc123",
    "statusUrl": "/jobs/job_abc123"
  }
}
```

**Job polling:**

```
GET /jobs/{jobId}
â†’ { "status": "pending|processing|completed|failed", "progress": 42, "result": {...} }
```

`progress` is 0â€“100, updated via the `WorkflowRunner::onSegmentProcessed` callback.

**Why no WebSocket/SSE for v1:** polling is simpler to implement and consume. Can add SSE in Phase 5.

---

### DA4 â€” TM and glossary storage

**Decision:** Each project owns its TM and glossary SQLite files, stored on the server filesystem (or S3-compatible storage). The API abstracts path management entirely.

Clients never upload or manage `.db` files directly. Instead:

- Import a `.tmx` file â†’ server creates/updates the project's TM SQLite.
- Import a `.tbx` file â†’ server creates/updates the project's glossary SQLite.
- Server resolves SQLite file paths from the project manifest internally.

**Why not per-user shared TMs:** project-scoped TMs are simpler to reason about, back up, and delete. Sharing TMs across projects is a Phase 5 concern.

---

### DA5 â€” Response envelope and errors

**Decision:** All responses use a consistent JSON envelope. Errors follow RFC 7807 (Problem Details).

**Success:**

```json
{
  "data": { ... },
  "meta": {
    "requestId": "req_abc",
    "duration": 0.041
  }
}
```

**Paginated list:**

```json
{
  "data": [ ... ],
  "meta": {
    "total": 42,
    "page": 1,
    "perPage": 20,
    "requestId": "req_abc"
  }
}
```

**Error (RFC 7807):**

```json
HTTP 422 Unprocessable Entity
Content-Type: application/problem+json

{
  "type": "https://opencat-api.dev/errors/validation",
  "title": "Validation failed",
  "status": 422,
  "detail": "The sourceLang field is required.",
  "errors": {
    "sourceLang": ["The sourceLang field is required."]
  }
}
```

---

## Endpoint map

### Auth

```
POST   /auth/tokens              Create API token
GET    /auth/tokens              List tokens
DELETE /auth/tokens/{id}         Revoke token
```

### Files

```
POST   /files                    Upload file â†’ fileId
GET    /files/{id}               File metadata
GET    /files/{id}/download      Download file
DELETE /files/{id}               Delete file
```

### Projects

```
POST   /projects                 Create project (from catproject.json body or form fields)
GET    /projects                 List projects
GET    /projects/{id}            Get project
PATCH  /projects/{id}            Update project config
DELETE /projects/{id}            Delete project
GET    /projects/{id}/export     Download .catpack archive
POST   /projects/import          Create project from .catpack upload
```

### Processing (workflow)

```
POST   /projects/{id}/process    Run full workflow on uploaded file
                                 Body: { fileId, targetLang, options? }
                                 â†’ WorkflowResult (sync) or { jobId } (async)
```

### Individual pipeline steps (fine-grained)

```
POST   /extract                  Extract segments from a file
                                 Body: { fileId, sourceLang, targetLang }
                                 â†’ { segments: [...] }

POST   /segment                  Segment plain text
                                 Body: { text, lang }
                                 â†’ { sentences: [...] }

POST   /tm/lookup                TM lookup
                                 Body: { projectId, text, sourceLang, targetLang, limit? }
                                 â†’ { matches: [{ score, targetText, origin }] }

POST   /tm/import                Import TMX into project TM
                                 Body: multipart; tmxFile, projectId, targetLang

POST   /tm/segments              Add/update individual TM segment
                                 Body: { projectId, sourceLang, targetLang, sourceText, targetText }

POST   /mt/translate             MT translate
                                 Body: { projectId, segments: [{ sourceText }], sourceLang, targetLang }
                                 â†’ { translations: [{ sourceText, targetText, adapter }] }

POST   /qa/run                   Run QA on a bilingual document (XLIFF file)
                                 Body: { fileId, checks?: [...] }
                                 â†’ { issues: [{ segmentId, severity, check, message }] }

POST   /terminology/recognize    Find terms in text
                                 Body: { projectId, text, sourceLang, targetLang }
                                 â†’ { matches: [{ term, translation, position }] }

POST   /terminology/import       Import TBX into project glossary
                                 Body: multipart; tbxFile, projectId
```

### Jobs

```
GET    /jobs/{id}                Poll async job status + result
DELETE /jobs/{id}                Cancel pending job
```

---

## Directory structure (API repo)

```
opencat-api/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ Http/
â”‚   â”‚   â”œâ”€â”€ Controllers/
â”‚   â”‚   â”‚   â”œâ”€â”€ Auth/TokenController.php
â”‚   â”‚   â”‚   â”œâ”€â”€ FileController.php
â”‚   â”‚   â”‚   â”œâ”€â”€ ProjectController.php
â”‚   â”‚   â”‚   â”œâ”€â”€ ProcessController.php
â”‚   â”‚   â”‚   â”œâ”€â”€ TmController.php
â”‚   â”‚   â”‚   â”œâ”€â”€ MtController.php
â”‚   â”‚   â”‚   â”œâ”€â”€ QaController.php
â”‚   â”‚   â”‚   â”œâ”€â”€ TerminologyController.php
â”‚   â”‚   â”‚   â””â”€â”€ JobController.php
â”‚   â”‚   â”œâ”€â”€ Requests/           â† Form Request validation classes
â”‚   â”‚   â””â”€â”€ Resources/          â† API Resource transformers
â”‚   â”œâ”€â”€ Jobs/
â”‚   â”‚   â””â”€â”€ ProcessFileJob.php  â† dispatched for async processing
â”‚   â”œâ”€â”€ Models/
â”‚   â”‚   â”œâ”€â”€ ApiToken.php
â”‚   â”‚   â”œâ”€â”€ Project.php
â”‚   â”‚   â”œâ”€â”€ UploadedFile.php
â”‚   â”‚   â””â”€â”€ ProcessingJob.php
â”‚   â””â”€â”€ Services/
â”‚       â”œâ”€â”€ ProjectService.php      â† hydrates WorkflowRunner from Project model
â”‚       â”œâ”€â”€ FileStorageService.php
â”‚       â””â”€â”€ JobProgressService.php
â”œâ”€â”€ config/
â”‚   â””â”€â”€ opencat.php        â† max upload size, retention, async threshold
â”œâ”€â”€ database/
â”‚   â””â”€â”€ migrations/
â”œâ”€â”€ routes/
â”‚   â””â”€â”€ api.php
â”œâ”€â”€ docker/
â”‚   â”œâ”€â”€ Dockerfile
â”‚   â””â”€â”€ supervisord.conf        â† runs php-fpm + queue worker
â”œâ”€â”€ docker-compose.yml
â”œâ”€â”€ .env.example
â””â”€â”€ README.md
```

---

## Environment variables

```env
APP_KEY=
APP_URL=http://localhost:8000

# Storage
FILESYSTEM_DISK=local           # or 's3'
AWS_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=

# Processing limits
MAX_UPLOAD_MB=50
ASYNC_THRESHOLD_MB=5
FILE_RETENTION_HOURS=24

# MT adapters (used as fallback if project doesn't override)
DEEPL_API_KEY=
GOOGLE_TRANSLATE_API_KEY=

# Queue
QUEUE_CONNECTION=database       # 'redis' for production
```

---

## Build order

```
1. Repo scaffold (Laravel 11 new project, Sanctum, Scribe, config)
2. Auth: TokenController + middleware
3. FileController (upload, download, delete)
4. ProjectController (CRUD + catpack import/export)
5. ProcessController + ProcessFileJob (sync + async paths)
6. TmController (lookup, import, add segment)
7. MtController
8. QaController
9. TerminologyController
10. JobController (poll, cancel)
11. Scribe OpenAPI spec generation + review
12. Docker + docker-compose
13. README (setup, docker, auth, quickstart examples)
```

---

## What Phase 5 adds to this API

- SSE (Server-Sent Events) for real-time job progress instead of polling
- Shared TM across projects
- Webhook callbacks on job completion
- Filter-xml and filter-po support (once those packages exist)
- `cat-framework-studio` Laravel/Inertia/React app using this API

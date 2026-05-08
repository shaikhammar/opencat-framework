# Phase 4 Overview

## Goal

Phase 4 has two independent tracks. They share a dependency direction (Track B consumes Track A) but are built in separate repositories and can be worked on sequentially.

- **Track A — Framework packages** (main repo): two new packages that complete the framework's "glue" layer — a project model and a workflow orchestrator.
- **Track B — API service** (separate repo `opencat-api`): a deployable Laravel REST API that wraps the framework and makes every capability available over HTTP to any tech stack.

**Phase 5** (pushed from Phase 4): Laravel + Inertia + React CAT studio application (`cat-framework-studio`), additional filters (XML, PO).

---

## Track A — Framework packages

### Deliverables

| # | Package | Decision(s) | Depends on |
|---|---|---|---|
| A1 | `opencat/project` | D21, D22 | core |
| A2 | `opencat/workflow` | D23 | project, segmentation, translation-memory, mt, qa, terminology, xliff |

### Build order

```
A1 opencat/project
  └── A2 opencat/workflow
```

### What each package does

**opencat/project**

Introduces a standard project format so any consumer (CLI, API, UI) can describe a translation job portably:

- `catproject.json` manifest: name, source language, target languages, TM paths, glossary paths, MT adapter config, QA config, file filter overrides.
- `CatpackArchive` class: reads and writes a `.catpack` zip containing `catproject.json` + `tm/`, `glossaries/`, `source/` directories.
- `ProjectLoader` resolves manifest paths, hydrates framework objects (SqliteTranslationMemory, SqliteTerminologyProvider, MtAdapter, QualityRunner).

**opencat/workflow**

Eliminates the boilerplate of wiring five packages together for every new consumer:

- `WorkflowRunner::process(ProjectManifest, string $filePath): WorkflowResult`
- Internally: FileFilterRegistry selects filter → SrxSegmentationEngine segments → TM lookup → MT fill (optional, skips if score ≥ threshold) → QA → XliffWriter writes output.
- `WorkflowResult`: carries `BilingualDocument`, `QAIssueCollection`, `TmMatchStats` (exact/fuzzy/mt/no-match counts), per-step timing.
- Hooks: `WorkflowRunner::onSegmentProcessed(callable $cb)` for progress reporting.
- No PSR-14 event dispatcher dependency — simple callbacks keep the package dependency-free.

---

## Track B — API service (separate repo)

See `api-service.md` for full architecture and endpoint design.

### Summary

- Repo: `opencat-api` (separate Composer project, separate repo)
- Stack: Laravel 11, Sanctum token auth, Laravel Queue for async jobs
- Wraps all framework packages via `opencat/workflow` (and individual packages where fine-grained control is needed)
- Returns JSON; accepts multipart/form-data file uploads
- Ships with OpenAPI 3.1 spec and `docker-compose.yml`
- Does NOT share a codebase with the framework — it is a consumer, not a package

### What it enables

Any tech stack (Python, Node, Ruby, Go, etc.) can call a running `opencat-api` instance to:
- Extract translatable content from DOCX/XLSX/PPTX/HTML/TXT files
- Run segmentation
- Query translation memory
- Get MT suggestions
- Run QA on a bilingual document
- Manage project manifests

---

## What is NOT in Phase 4

These are pushed to **Phase 5**:

| Item | Reason |
|---|---|
| `cat-framework-studio` (Laravel + Inertia + React) | Requires a working API (Track B) and is substantially larger in scope |
| `opencat/filter-xml` | No immediate blocker; useful but not required by API v1 |
| `opencat/filter-po` | Same — Phase 5 filter expansion |

---

## Time estimate

| Track | Estimate |
|---|---|
| A1 `opencat/project` | 2–3 weeks |
| A2 `opencat/workflow` | 2–3 weeks |
| B `opencat-api` | 6–10 weeks |
| **Total Phase 4** | **~3–4 months at 5–10 hrs/week** |

---

## Build order summary

```
[README Phase 3 update]  ← immediate, done in this planning session
        │
        ▼
A1 opencat/project  (D21–D22)
        │
        ▼
A2 opencat/workflow  (D23)
        │
        ▼
B  opencat-api setup + auth
        │
        ▼
B  file processing endpoints
        │
        ▼
B  TM / MT / QA / terminology endpoints
        │
        ▼
B  OpenAPI spec + Docker + README
```

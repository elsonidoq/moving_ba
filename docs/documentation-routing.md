# Documentation routing

## Authoritative owners

Owners describe implemented current state. Immutable approved feature artifacts retain
requirements/design/approval provenance; historical PENDING/UNRUN labels describe their
producing stage, not current execution status. Do not silently rewrite their contracts.

| Material change | Authoritative owner | Implemented evidence |
| --- | --- | --- |
| Client structure, guarded routes, practice integrity, profile-isolated state, derived dates/rules and visual composition | [Architecture](architecture.md) | src/App.tsx, src/content, src/state, src/screens, src/styles.css; actual helper/browser tests |
| Required content fields/IDs/references, editor examples, fixtures/reset/snapshots and local-vs-published JSON changes | [Content configuration](CONTENT_CONFIGURATION.md) | public/config/app-content.json; src/content/types.ts and validate.ts; real-file edit/failure tests |
| Run/build/test/reset/presenter commands and delivery/provenance limitations | [Root README](../README.md) | package.json, lockfile, Playwright built-app tests and timed/screenshot observations |
| Static host/start/PORT contract, hosting configuration, live deployment and redeployment | [Deployment](deployment.md) | .github/workflows/pages.yml; scripts/serve.mjs; local build/subpath checks; exact Pages workflow success and Railway deployment SUCCESS; live HTTPS/browser checks |
| Documentation direct files/child directories | [Documentation index](README.md), README.md in each child documentation directory | Approved index convention in AGENTS.md |
| Conceptual visual source | [Existing photographic mockup](mockup_ba_te_mueve/index.html), interpreted by architecture | Standalone conceptual presentation; not a service or behavioral contract |
| Approved source/design/tasks/approval and task-local execution status | [Feature index](../specs/001-ba-movement-demo/README.md), [tasks](../specs/001-ba-movement-demo/tasks.md) | Approved source c31871b; corrected plan/tasks d8e14bc; focused task checkpoints |
| Coherence runtime/package contracts/project-local memory association | [Project instructions](../AGENTS.md) and [memory index](../memory/MEMORY.md) | Existing suite contract; no STATE or global-store substitution |
| Verified unresolved defect/risk/actionable investigation | [Canonical open issues](open_issues.md), through installed track-open-issue | Retain only verified findings, never invented conceptual-data issues |

## Boundaries

No backend/API, authentication or persistent database exists in this implementation;
no schema owner was initialized. Introducing a database requires explicit ownership
and documentation of tables/collections, fields/types, keys/relationships, constraints
and indexes before readiness can be claimed. Deployment operations remain separately
authorized, never inferred from Railway-capable local serving.

Non-obvious verified trigger-first gotchas belong in project-local memory under
memory-handling, not duplicated current-state summaries/task ledgers. Explicit
future-directed feedback alone authorizes bounded coordination guidance storage.
Routine documentation/execution does not authorize memory, STATE or guideline writes.

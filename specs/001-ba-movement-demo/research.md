# Research and design decisions

Date: 2026-10-14. Scope: approved [specification](spec.md), not SDD or inferred
mockup behavior. Source review found no required changes. The draft/status and old
approval-needed statements in the immutable spec are historical; the separate
[approval record](README.md) at the current baseline establishes permission.

## Dependency research

Canonical reusable version decisions, source spans and recommendation → constraint
→ observable chains are in [architecture](../../docs/architecture.md#planned-demo-architecture-not-implemented).
Read-only Python urllib fetched official npm metadata, Vite 7 docs, version-tagged
serve sources, Playwright browser guidance and Railway common-errors guidance.
Public fetching was usable; no credentials, installs or infrastructure calls occurred.
The Railway public-networking page gave no useful host span; attempted `.md` and
GitHub paths returned 404. The inspected common-errors page supplies the required
host/port evidence instead. No decision relies on those failed fetches.

Exact bounded versions, rather than latest tags, constrain the initial top-level
selection; the generated lockfile will make subsequent dependency installs reproducible. Node 22.23.3/npm 10.9.9 are local observations, not a package install
proof. React primitive usage is settled/trivial; no additional tutorial research.
Browser availability, installation resolution and platform behavior remain checks,
not unresolved design choices or fabricated successful tests.

## Local design decisions and alternatives

| Decision | Rationale and evidence | Alternatives not selected | Validation |
| --- | --- | --- | --- |
| One runtime JSON and lightweight validator | FR-013/TC-002 editor autonomy; Vite public-copy behavior | Bundled imports fail reload editing; CMS/backend excluded; schema package unnecessary | R1/R2 in plan |
| Hash route + guarded reducer/context | FR-015, no existing router; static server can return genuine missing-file errors | Router dependency adds little to six concepts; numeric stage-only state lacks prerequisites | R3/R4 |
| Attempt ID, ordered step cursor, one durable completion keyed by attempt | FR-008 replay risks; refresh may abandon unfinished work | Persisting active timers/session progress is unnecessary; effect-based reward writes invite duplication | R4/R5 |
| History snapshots and pure derivations | FR-011/012/014; mockup's independent totals conflict with approved behavior | Mutable counters, seed balances, interest-derived awards rejected | R5/R6 |
| Dry-land default plus explicit swim/pool acknowledgments | FR-006; profile is not swim ability | Fine-print-only gate and water beginner exercises rejected | R3 |
| serve static dependency, no API | TC-004 and inspected endpoint options; bounded serving surface | Vite preview is explicitly not production serving; custom server adds avoidable security/path work | R1 |
| Reuse actual environment SVGs, improve scale/readability | FR-002; actual HTML `scene()` has park bars, mat/blocks/plant, pool lanes/goggles | Stick figures and six simultaneous phone frames rejected | R7 |

## Risk reduction and applicability

Configuration/reference validation and completion/persistence are the highest-leverage
bounded seams. Schedule negative then corrected/valid cases against the actual loader,
reducer/storage adapter and date/rule helpers inside their delivery outcomes. Their
small deterministic oracles justify tests, not speculative prototype work. Swimming
checks use the actual start guard, including a forged/deep-linked start action.
Build/start/public-JSON behavior needs the actual composed static build, not a mocked
server proof. Browser UI, mobile visuals and presenter timing need real browser/manual
checks at the earliest functioning seam. No implementation/runtime checks have run
at plan production; only planning-artifact validation has run.

Retain permanent focused tests through consumers; reuse unchanged applicable output
with all mapped acceptance IDs, rerun when content/schema/state/dependency changes
invalidate it. A failed or unrun required check blocks reliance on that seam; repair
and rerun, or return material design/spec changes through approval renewal. No separate
prototype, report chain or cleanup task is justified. Live Railway verification is a
permission gate, not a prerequisite to local demo delivery. No live operation authorized.

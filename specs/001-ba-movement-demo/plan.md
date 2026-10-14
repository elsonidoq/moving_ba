# Implementation Plan: BA en movimiento sustained-practice demo

**Feature**: `001-ba-movement-demo` | **Date**: 2026-10-14 | **Git branch**: `main`
**Input**: [Approved specification](spec.md), immutable source at
`c31871bad4f71aa8185088138f4d8343f3ec69bb`; [approval evidence](README.md).
**Status**: Produced and self-reviewed; plan approval NOT YET GIVEN. Parent inspection,
tasks production, independent overall review and final owner approval remain. No
standalone plan approval gate is required before authorized task preparation. No
implementation authorized here.

## Summary

One React/Vite/TypeScript mobile-first demo makes sustained practice tangible across
three relationship profiles, Calistenia/Yoga/Natación and both solo/class routes.
Reuse the actual v2 mockup's attractive park-bars, yoga-mat and pool SVGs, hierarchy,
rounded cards and white/yellow `#FFD500`/sky `#29BDEF`/mint `#A7D5C2` palette, not its
invented history, unsafe implicit water flow or independent reward totals. One
runtime JSON owns editable product content; guarded transitions own session integrity;
localStorage holds isolated histories from which incentives derive. Serve a static
`dist` build, not a backend. See [research](research.md), [data model](data-model.md),
[content contract](contracts/content.md), [validation guide](quickstart.md) and canonical
[planned technical guidance](../../docs/architecture.md#planned-demo-architecture-not-implemented).

## Technical Context

**Language/Version**: TypeScript 5.9.3; Node 22.x >=22.12 (observed 22.23.3), npm 10.9.9.
**Primary Dependencies**: React/react-dom 19.2.0, Vite 7.2.2,
@vitejs/plugin-react 5.1.1; types 19.2.2; runtime serve 14.2.5. Exact initial pins,
lockfile and `npm ci`; compatibility evidence/provenance in canonical guidance.
**Storage**: One versioned localStorage key; no database, account, server state or auth.
**Testing**: @playwright/test 1.56.1, matching Chromium; its runner also executes
focused actual-helper assertions without a second unit framework. Build/typecheck,
HTTP smoke and focused manual visual/accessibility/presenter verification.
**Target Platform**: Modern browser; representative 360px phone and 1280px desktop;
Linux static host compatible with Railway `0.0.0.0:$PORT`.
**Project Type**: Single client web app, plain CSS, hooks/simple context.
**Performance Goals**: No timers/waits; selected eligible solo session under about
90 seconds; principal presenter story about 3–5 minutes. No invented SLA/load target.
**Constraints**: Spanish visible/a11y/errors; English engineering. No Redux/Zustand,
Next.js, Tailwind, containers, monorepo, API/backend/DB/auth, maps/geolocation, payments,
notifications, analytics, AI, real booking/integrations, official GCBA status or real offers.
**Scale/Scope**: Three profiles × three sports × two routes; six conceptual stages,
at least six fictional classes; safe dry-land plus gated water swimming plans;
modest local records. No production multi-user/concurrent transaction guarantee.

## Constitution Check

Pre-research: PASS by inspection. I/II: settled minimal stack and one incremental demo,
not production architecture. III: required focused browser/core checks retained, no
quota or test-first mandate. IV: canonical guidance plus concise design artifacts.
V: actual mockup art and responsive rehearsal explicitly accepted. VI: all metrics,
classes and benefits simulated, no live operations. VII: language boundary explicit.
Post-design: PASS by inspection; same constraints preserved in checks R1–R9 below.
No exception or complexity justification needed. PASS refers to design compliance,
not implemented behavior: all runtime/browser/manual acceptance remains **UNRUN**.

## Project Structure

Existing planning artifacts: plan.md, research.md, data-model.md, quickstart.md,
contracts/README.md and contracts/content.md in this feature directory. `tasks.md`
is intentionally not generated in this pass.

Intended implementation layout (not existing files or writes authorized now):

```text
package.json, package-lock.json, index.html, tsconfig.json, vite.config.ts
src/
  main.tsx, App.tsx, styles.css
  content/       # types, runtime loader and validation
  state/         # context/reducer, route guards, storage, history/date/rule helpers
  components/    # shared shell, sport artwork, accessible cards/actions
  screens/       # home, sport choice, plan/catalog, session/detail, journey, challenges
public/
  config/app-content.json
  assets/        # extracted actual mockup environment SVGs
tests/
  core.spec.ts, content.spec.ts, smoke.spec.ts
playwright.config.ts
README.md
docs/
  CONTENT_CONFIGURATION.md, architecture.md, deployment.md, README.md
```

Use one project, no repository/service abstractions. Keep validator and selectors
independent of React rendering for focused tests; context integrates them. Hash
navigation supports browser history while preserving static file 404s. Avoid a router
dependency, schema framework and separately built server. Layout may use smaller
cohesive files but must retain these clear content/state/render/verification seams.

## Architecture and invariants

Content bootstrap fetches and validates the public file before mounting dependent
screens; built-in Spanish error/retry shell survives missing labels. Use stable IDs
and text rendering only; allow local artwork references, not executable configuration.
Load selected profile and validated isolated history envelope after content validation.
Navigation never grants permission to start or complete a workout; actions go through
one guarded transition owner. Pure selectors combine labeled baseline and user
completions, never interests or independently stored totals. Detailed dates, snapshots,
reset, navigation and attempt semantics are in [data model](data-model.md).

The following source wording is binding in implementation checks and tasks handoff:

- **Only explicit completion of all required steps of a started solo session MUST add one simulated completion** (FR-008 → R4).
- **Preview, stage jumps, partial sessions, and class interest MUST never earn completion credit** (FR-008 → R4/R5).
- **In-water sets are available ONLY to already-swimmers who affirm a permitted supervised pool with guardavidas and venue rules** (FR-006 → R3).
- **A populated human-editable runtime-fetched public/config/app-content.json, served at stable public path /config/app-content.json** (FR-013 → R1/R2).

The last bullet preserves the source content/path requirement in plain text; the
spec formats these two paths with backticks. A changed class name/schedule, exercise
sequence and reward copy must render after reload **WITHOUT React edits**. Missing,
malformed and reference-invalid configuration must show useful Spanish errors.

## Coherent delivery outcomes and necessary sequence

These are internal outcomes of this ONE feature, not a task list or independent specs.
Task producer chooses independently verifiable units, keeps tests/docs/evidence with
their outcomes, and assigns stable task-local REQUIRED references to R1–R9.

**A — A configured, navigable demo served end to end.** Establish build/static start,
runtime content contract/validator, real populated three-sport/profile JSON, artwork,
Spanish shell/Home/sport choices and valid configured plan/class previews. Validate
loader/reference negative cases against the actual helper before consumers rely on it;
prove public JSON served from dist early. Profile selection and guarded navigation
must make both branches meaningful rather than placeholder clicks. A owns the shared
schema, ID vocabulary, route guards and dependency lock decisions.

**B — Complete safe participation.** Build on A's validated content and routes:
full ordered sessions, explicit swim/pool guards, exact free/paid class details,
interest feedback, back/refresh recovery and profile-isolated storage/reset. Implement
completion upsert/history envelope and prove actual-helper idempotence BEFORE the
success view or any incentives consume it; do not postpone correctness until C.
Test content edits as soon as these views exist. A B-complete solo can already yield
one durable completion; class interest never does. No dependency on finished rewards UI.

**C — Humane continuity and convincing delivery.** Consume verified B history via
pure configured rules/date selectors, complete Mi camino/challenges/badges/benefits,
first-time emptiness, returning pause, regular progression and rest-friendly next
steps. Then focused polish, safe optional presenter controls, required composed
Playwright flows, responsive/a11y/timed rehearsal, and documentation checked against
actual commands. Carry early browser smokes forward; do not defer all integration
verification until the end. Verify selectors before UI relies on their totals.

Only necessary dependencies: A content/build/route seams → B participation; B verified
history/identity → C derived continuity. Artwork/copy and independent view styling can
proceed after contract agreement but shared JSON, reducer, CSS and package manifest
have one writer/integration owner at a time; do not claim parallel-safe overlapping
edits. Later task coordinator owns scheduling and profile selection.

## Acceptance and task handoff

Every row is REQUIRED, currently UNRUN. Carry IDs, objective pass conditions, smallest
adequate evidence and gates into task-local checks, not just links. Reuse one valid
check for multiple mappings. No broad coverage quota or mandatory test-first workflow;
for bounded helper behavior run adversarial/failing-input then valid/corrected cases
inside delivery before reliance. No standalone speculative prototype task.

| Check | Source mapping | Smallest adequate observable/evidence and gate |
| --- | --- | --- |
| R1 Build/runtime | SC-009; FR-013/017; TC-001, TC-004, TC-006 | Actual install/lock/typecheck/build/start output with selected versions; nondefault PORT listener on 0.0.0.0; HTTP root/assets/JSON success and absent-file failure; hash reload works. Inspect dependencies for excluded infrastructure. Local execution permission at implementation; Railway live smoke separately authorized, never inferred from local pass. |
| R2 Editor/failure | SC-007; FR-013; TC-002/003/005 | Focused actual-validator cases for missing fields, duplicate/unknown/wrong-sport refs, empty steps/classes, invalid dates/rules; browser edit class name AND schedule, reverse plan steps, change reward copy in served JSON → corresponding reload views match without React diff. Browser missing, malformed and reference-invalid config each produce useful Spanish recovery. Restore fixture; capture commands/assertions and actual served-file evidence. |
| R3 Participation/safety | SC-002; FR-003–007; TC-002/005 | Inspect all nine profile/sport plans plus both routes: appropriate quantities/technique/environment/prerequisites, beginner Calistenia trio, gentle Yoga and genuinely distinct returning/regular progression. Focused real start-guard test plus Natación browser flow proves unknown/no ability, unsafe/no pool and regular profile alone cannot start water; both affirmations enable water, dry-land remains possible. Switching sport/profile/path abandons incompatible state; direct/jump start obeys guards. No live training proof. |
| R4 Exactly once/navigation | SC-004/011; FR-005/007/008/015; TC-001/005 | Actual transition/storage helper asserts current step IDs/order, rejects replay and partial/jump credit. Playwright Calistenia explicit complete → Mi camino/rewards → refresh, repeated final click, rerender/navigation back/forward/success revisit: exactly one completion and one rule contribution; new explicit attempt can add another. Partial/preview/jump remains zero. Record stored attempt IDs plus displayed totals, not only a green suite. |
| R5 Class/isolation/reset | SC-003, SC-008; FR-004/009/010/014/015; TC-005 | Fixture/detail check all six distinct free/paid classes; Yoga free and paid browser selections show exact selected schedule/price/venue/level/requirements/receiver and fictional notice. Interest survives reload, never changes history/points/challenges/badges. Switch all three profiles, refresh, reset all demo scenarios; sentinel unrelated localStorage remains. Invalid storage and unavailable storage show Spanish recovery/limitation, no crash. No booking or sent request. |
| R6 History/rules/dates | SC-005, SC-006; FR-001/011/012/014; TC-002 | Focused real selectors with fixed Buenos Aires clock and Monday/month boundary cases independently recompute points, active weeks, weekly/monthly goals and lifetime badges from baseline + unique completions. First-time empty, returning labeled prior practice/pause, regular progression; history snapshots survive harmless content edits. Browser new completion immediately agrees across journey/rewards; rest/window rollover preserves lifetime achievements; benefit says sin convenio vigente, illustrative/nonredeemable. |
| R7 Visual/accessibility/language | SC-001; FR-001/002/003/004/015/016 | Manual actual-browser 360px and 1280px review/screenshots against actual HTML scene artwork and six-stage composition; no stick figures or mandatory strip. Keyboard/focus, semantic names, tap targets, contrast/readability, scrolling, reduced motion and all Spanish visible/a11y/error text. Record viewport/observations and fixes; inspection alone is not rendered evidence. Browser capability required, no extra approval ceremony. |
| R8 Presenter | SC-011; FR-007/008/015/017 | Timed manual rehearsal in actual built demo: selected eligible session under ~90s, main story ~3–5 min, no accounts/waits. Exercise every retained visible affordance; quick inspection neither skips credit nor fabricates class details. Record time and route/profile/viewport. Unsupported decorative actions removed. |
| R9 Handoff evidence | SC-010/009; FR-017; TC-003/004/005/006 | Required Playwright smokes cover Calistenia completion→journey/rewards→refresh, Yoga free/paid interest-no-points, Natación guards, profile/reset, config edits/invalid failures. Record actual commands/results and explicit UNRUN gaps; compare root README, content guide, architecture, deployment and presenter instructions to implementation. No live deployment success claim without authorized observed platform evidence. |

The matrix covers FR-001–017, TC-001–006 and SC-001–011; detailed scenario/edge-case
checks remain binding, not replaced by row labels. Required browser binaries/tools
are not installed or proven here. Later preparation must resolve capability/install
permissions; missing required evidence is NOT VERIFIED and blocks affected acceptance.
No permission to weaken these checks, change the approved spec or perform live exercise.

## Security, reversibility and documentation ownership

No personal data, credentials, real contacts, network submissions or integrations.
Config is public: never include secrets; localStorage is demo convenience, not auth or
physical-activity verification. No remote content HTML execution. Browser storage
failure has honest Spanish limitations; storage reset is only demo-owned key.
Rollback is a reversible focused Git change/rebuild and, only if separately authorized,
redeployment of a previously verified static artifact; no DB migration or data deletion
required. Preserve snapshots/version guards; incompatible storage offers explicit reset.

Implementation updates canonical `docs/architecture.md` from planned to observed only
with evidence; `docs/deployment.md` owns build/start/host/port and unknown/live status.
Create `docs/CONTENT_CONFIGURATION.md` at delivery and index it in `docs/README.md`;
root README owns run/build/test/reset/presenter commands and links those owners.
Update documentation routing if implemented categories warrant it under delivery
scope. No new schema owner (no database), STATE, Epic, new spec or coordination memory.

## Managed pass provenance and review

Installed SpecKit planning **AVAILABLE**: `specify --version` returned 1.0.12;
read `.pi/prompts/speckit.plan.md`, applied its workflow, ran actual
`.specify/scripts/bash/setup-plan.sh --json` once. It copied the CLI-resolved template
here and returned FEATURE_SPEC/IMPL_PLAN/FEATURE_DIR under this feature and BRANCH
`001-ba-movement-demo` (feature pointer, not a Git branch change). No extension hooks
file existed before or after. Template structure informed this document.

Same fresh-session order: (1) approved-source review, no edits required or made;
(2) one plan-create pass including bounded Phase 0 research/canonical guidance;
(3) Phase 1 data model/contracts/quickstart; (4) producer review/fix for source,
constitution, traceability, links, versions and gates. No additional agents dispatched.
Owner-selected `openai-codex/gpt-6-astra:medium` applies throughout under explicit
feature override; observed PI_PROVIDER/PI_MODEL/PI_REASONING_LEVEL match. Provider-side
internal effort is unknown. Suite readiness supplied by parent; this child does not
probe providers or delegate. Memory index read, empty; no coordination guidelines.

No material source fixes, unresolved product decisions or research deferrals. Browser,
installation, build, rehearsal and live deployment are unrun future verification;
static planning review cannot release those gates. Parent must inspect actual artifacts
before tasks production; final overall review/approval still precedes implementation.

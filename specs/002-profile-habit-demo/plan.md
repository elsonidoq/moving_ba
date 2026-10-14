# Implementation Plan: One-person profile and habit-support demo

**Feature**: `002-profile-habit-demo` (no new branch required) | **Date**: 2026-10-14 | **Spec**: [spec.md](spec.md)

**Input**: Approved specification at `9c7835f832709bd51a196c88e1ff70ba6ca6635d`. The manager's current-session instruction attests owner approval for planning only. The source's Draft/preapproval wording is historical; no specification or checklist bytes are changed. This plan is derived design, not implementation authorization.

## Summary

Evolve the existing browser-only demo into `Buenos Aires te mueve`: one actual journey, explicit recommendation preference, separate class intention, and four ephemeral same-person previews with scripted support. Retain plain hooks/context, guarded hash navigation, runtime validated JSON, safety and derived rewards. Replace fixture-producing actual initialization with empty unchosen state; read legacy three-profile history losslessly through a content-independent compatibility boundary. All durable actions go through an actual-mode command boundary; URLs and preview state cannot supply consent or identity.

Details: [research](research.md), [state and migration](data-model.md), [content interface](contracts/content.md), [navigation and command interface](contracts/interaction.md), [later validation](quickstart.md).

## Technical Context

**Language/Version**: TypeScript 5.9.3; React/react-dom 19.2.0; existing Node 22.x >=22.12 tooling.

**Primary Dependencies**: Existing Vite 7.2.2, plain CSS/hooks/context, serve-handler 6.1.6; no additions, upgrades, installs or new service.

**Storage**: Only `ba-en-movimiento:demo:v1`, schemaVersion 1; discriminated one-person layout plus preserved legacy source archive. Preview, attempts, affirmations and answers are memory-only.

**Testing**: Existing Playwright 1.56.1 core actual-helper and Chromium browser projects. Build/typecheck and relevant tests are later implementation checks, NOT RUN during planning.

**Target Platform**: Existing static browser demo, representative 360px/1280px widths, keyboard and reduced motion. No universal device/browser claim.

**Project Type**: Single frontend, no backend/database.

**Performance Goals**: Maintain responsive ordinary document scrolling and immediate local transitions; no invented latency/load target or benchmark programme.

**Constraints**: Spanish app, English engineering; exact configured practices; no free text, AI/provider calls, push, geolocation, attendance, booking, payments or live operations. Photos require separately permitted, matching, verified bundled-local assets; acceptance is NOT VERIFIED until then.

**Scale/Scope**: One browser-local subject; three recommendation situations, three sports, four previews, five missed-class and four inactivity choices. No multi-tab transaction guarantee.

## Constitution Check

Pre-research gate: PASS on design review. I–II: reuse the delivered app, prove the actual storage seam early and deliver a coherent actual flow before preview polish. III: focused existing helpers plus minimum composed browser flows, no broad infrastructure or prototype chain. IV: five compact design/contract categories and later updates only to affected documentation owners. V: yellow narrative identity, honest locations, responsive accessible navigation. VI: no operational/rights claims, explicit destructive confirmation and unmet-photo gate. VII: exact Spanish user copy, English engineering.

Post-design gate: PASS on artifact inspection; no exceptions. This is design conformance, not working-app proof. The photo-delivery criterion remains unmet, not waived. No product ambiguity requiring a new owner ruling was found. A future incompatible loss of valid legacy data or relaxation of safety/photo boundaries must return `NEEDS_OWNER_DECISION` and renew affected approvals.

## Project Structure

### Documentation (this feature)

```text
specs/002-profile-habit-demo/
  spec.md                         # unchanged requirements truth
  checklists/requirements.md      # unchanged source checklist
  plan.md
  research.md
  data-model.md
  contracts/content.md
  contracts/interaction.md
  quickstart.md
```

No tasks.md is produced; only a separately authorized later SpecKit tasks producer decomposes implementation.

### Source Code (repository root; future changes only)

```text
src/content/{types,validate,load}.ts
src/state/{storage,context,session,navigation,selectors,dates}.ts[x]
src/App.tsx
src/components/AppShell.tsx
src/screens/                     # existing screens plus onboarding/profile/sports/notice/chat
src/styles.css
public/config/app-content.json
public/assets/                   # later gated assets only
 tests/{core,content,smoke}.spec.ts
```

**Structure Decision**: Extend existing owners, not a second app/state store/router. A small legacy validator/importer may live beside storage if separation makes its frozen contract clear. `context.tsx` remains the single synchronous command owner; selectors accept an actual journey or an explicit preview projection. Do not pass a profile ID as durable person identity. Existing plan `profileId` values can remain recommendation-category IDs to avoid unnecessary content-ID churn.

Later implementation documentation owners: root README.md for run/reset/presenter instructions; docs/architecture.md for implemented architecture; docs/CONTENT_CONFIGURATION.md for editing/validation and changed reset semantics; docs/README.md only if discovery links actually change. No writes to these owners are authorized in this planning stage. No canonical research-document or external-document writes are authorized or needed: existing dependency evidence is reused in place.

## Architecture and sequencing

These are dependency-bearing outcomes, not implementation tasks or dispatch batches.

1. **Contract and durable seam**: agree types/validator extensions and implement actual storage normalization, scoped confirmed reset, selectors and command guards with permanent actual-helper losslessness/nonmutation proof before dependent UI relies on them. Content and storage work can progress independently once shared IDs/interfaces are fixed; freeze the legacy contract independently of new JSON. No automatic compatibility write is necessary on read.
2. **Actual end-to-end experience**: integrate onboarding, preference edit, circular profile/AppShell, bottom destinations, cross-sport classes and upcoming intention; retain profile journey/challenges. Practice review uses separate accepted-prefix and review cursor state, exact snapshots and guarded completion. Browser evidence must inspect storage AND rendered effects, not merely helper output.
3. **Preview/support integration**: consume the proven actual-mode boundary and validated scenarios/destinations to add all four profile-entered previews, notice→chat, answer destinations and explicit exit. No previews may be made writable while waiting for storage integration. Screen/style work can be parallel only with agreed contracts; shared context/AppShell/navigation edits need a single integration owner or serialized merges.
4. **Acceptance and documentation convergence**: run focused composed, served-file/retry, dates and accessibility checks, update existing documentation owners to actual behavior, and evaluate the separately permitted photo gate. This convergence belongs with coherent delivery; it is not a separate test/prototype/cleanup chain. No deployment stage.

The hardest seam is legacy collision preservation coupled to nonmutation. It is bounded known code, cheaply observed by permanent tests of the real helpers, so no disposable prototype is justified. Easy types/IDs resolve by inspection. Photos cannot be proven by a synthetic probe: actual local rights and subject evidence is required before use. Unrun/failed proof cannot release dependent UI reliance; preserve disproof, correct the seam and renew affected design/source approval if scope changes.

## Acceptance and source traceability

Repository supporting spans below refer to the approved baseline, not future line numbers. Requirements remain [spec.md](spec.md) FR/SC identifiers. Research classifies these as repository-derived decisions, not uninspected external recommendations.

| Source evidence → constraint | Required later observable check |
| --- | --- |
| storage.ts:7–66 accepts retired snapshots but binds legacy validation to current content; materialize creates three fixture ledgers → freeze legacy validation and normalize one person without reseeding (FR-002/013/014) | Actual-helper adversarial legacy fixtures retain all source-scoped collisions, provenance, dates, steps and retired snapshots; repeated legacy and canonical loads produce equal logical output; writes touch one key only (SC-005). |
| context.tsx:24–29 currently persists hash-selected profile → remove hash persistence; explicit actual commands alone choose preference, with onboarding priority (FR-002/009/015) | Helper plus browser old/forged hash, reload, preview navigation and storage-event checks show no preference/history/interest/intention mutation (SC-001/004/005). |
| session.ts:4–31 snapshots ordered exercises and identity-checks final upsert → retain snapshots/UUID, split review position from accepted prefix, preserve water action gate (FR-005/006/007) | Wrong/stale/repeated acceptance and review/next cannot advance accepted prefix; final produces exactly one completion; four affirmation combinations, dry alternative and actual rendered steps (SC-003). |
| selectors.ts:6–31 and dates.ts:1–14 derive history, BA weeks/months → scope dedup to source identity, derive one-person lifetime values, preference only affects recommendation/goal, never history (FR-008) | Independent numeric oracle after preference changes/rest, BA midnight/Monday/month boundaries and future-date exclusion; uncapped numbers versus capped bars (SC-001/003/005). |
| load.ts:4–20, validate.ts:71–180 and App.tsx bootstrap → no-store full validation, text rendering, built-in Spanish retry independent of JSON (FR-011/012) | Real served JSON edits affect new copy/IDs/destinations/image assignments; missing/malformed/reference-invalid files block and retry restores; unsafe URLs reject before image loads (SC-006). |
| navigation.ts:20–61, AppShell.tsx:9–54 → stable typed routes, explicit contextual parents, focus and mode guards; no identity-changing dropdown (FR-003/015) | Browser direct sport/cross-sport catalog, detail back, profile journeys, notice/chat tab hiding, 360/1280px focus/keyboard/44px/overflow checks (SC-002/004/006). |
| spec FR-004/009/010 and Stories 2–4 → intention is distinct; preview projection hides actual upcoming card; exact scripted choices route within preview | Composed actual interest+intention reload with zero credit; every scenario/answer reaches a valid destination with unchanged actual bytes, no stored answers, explicit exit restores actual upcoming card (SC-002/004). |
| spec FR-012 and supplied prior license GET 403/absent verified photos → only separately approved bundled matching photos | Pre-use rights/provenance and visual matching review, actual local served bytes, Spanish alt and path allowlist. Safe unavailable-image UI is required but cannot pass matching-photo SC-003. |

Existing helper/browser proof for unchanged date/safety/reference behavior may be retained if revision, runtime and scope remain applicable. Update obsolete global combobox, isolated-profile ledgers and fixture-restoring reset assertions; do not delete relevant safety/storage/content coverage. Capture fail-then-pass evidence for changed behavior when implementation begins; no checks of the app were executed here. Shared checks may satisfy multiple SCs with explicit mappings; later tasks must express smallest sufficient REQUIRED checks, permissions and evidence, not just link this table.

## Security, rollback and gates

No secrets, sensitive/free-text answers, executable HTML or remote photo fallback. Invalid raw storage is never overwritten by ordinary action; all recovery reset entry points confirm, and cancellation is a total no-op. Unavailable storage is explicitly tab-only. Storage events abandon attempts/affirmations/preview before reloading actual state. See [data-model.md](data-model.md) for migration and rollback limits: do not claim that an old binary can read the new layout.

Later capability gates: existing Node/npm/build tools; pinned Playwright and matching Chromium for browser proof, local filesystem restoration for served-file checks, and human visual/keyboard review. Missing binaries/permission are NOT VERIFIED; no implicit install. Rights/download approval and actual matching local assets are separately gated; no download is scheduled by this plan. Future implementation needs reviewed plan/tasks and owner authorization; current planning-only approval grants none. No unresolved product ruling; unmet execution/photo evidence remains explicit.

## Complexity Tracking

No constitution violations or speculative abstractions. No task breakdown, dependency change, backend, new schema owner, infrastructure, prototype or deployment is introduced.

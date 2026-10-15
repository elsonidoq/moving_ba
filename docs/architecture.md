# Architecture

## Current implemented demo

React 19.2.0/TypeScript 5.9.3/Vite 7.2.2, plain hooks/context and CSS. No new
state/router/schema library, backend, database, account or live integration.
`src/App.tsx` fetches `/config/app-content.json` through `content/load.ts` with
no-store and complete validation before mounting consumers. Built-in Spanish
loading/error/retry works without product JSON. Text renders as text, never HTML.
The [content guide](CONTENT_CONFIGURATION.md) owns the editor contract.

### Actual custody and projections

`state/storage.ts` writes only `ba-en-movimiento:demo:v1`, schemaVersion 1,
layout `one-person`: `preference`, source-keyed `journey`, `interests`, `intention`,
optional `legacySource`. New/reset envelopes are empty and unchosen. Frozen
`legacy.ts` validation is independent of current catalog/fixtures. Normalization
preserves every original source-profile baseline/completion/interest and snapshot,
with deterministic collision-safe tuple keys and original archive. The archive is
not counted again; legacy selection is not confirmed preference. Reads never write.
Retired snapshots remain history; no content edit/reload reseeds it.

`state/context.tsx` is the single synchronous command owner reading current state.
Durable actions require actual mode, valid/nonblocked storage and explicit choice;
reset is the confirmed recovery exception. Cancel is a complete no-op. Edit changes
preference only; interest is idempotent; intention is one exact class snapshot,
separate from attendance/history. Invalid data remains byte-identical pending reset.
Denied reads prevent ordinary overwrite of unknown history; failed writes/reset
produce warning-labeled tab-only state, explicitly allowing old data to return after
reload. Only this key is replaced, never global storage clear.

Attempts, swim affirmations, preview scenario/answer and contextual parent are
memory-only. Storage events for the demo key or clear invalidate all transients
before reread and guarded actual landing. No multi-tab transaction promise.
`selectors.ts` derives actual lifetime sessions/points/weeks/badges and BA current
Monday-week/calendar-month progress without mutable counters. Interest/intention/chat
never credit. Only bars cap. Explicit `selectPreviewJourney` instead builds a
scenario-only projection at its configured reference date; profile subviews use it
only in preview. Canonical actual records/envelope remain untouched. Profile combines that projection's
metrics with weekly progress and seven Monday–Sunday activity buckets. Buckets count
unique source records by activityDate only through that projection's BA today, sum to
weeklySessions, and have full Spanish weekday/date/count text equivalents. Empty weeks
remain zero; only the progress fill caps, never the raw count.

### Navigation, practice and support

`navigation.ts` guards stable-ID hashes: `#/home`, `#/sports`, `#/classes` (optional
sport filter), `#/profile`, `#/profile/journey`, `#/profile/challenges`,
`#/sports/:sportId`, `#/sports/:sportId/solo/:planId`,
`#/sports/:sportId/classes` and `#/sports/:sportId/classes/:classId`.
`#/session/:attemptUUID` requires an active attempt; `#/success/:encodedCompletionKey`
requires an actual stored completion. Configuration, recovery, onboarding then
mode/target guards take precedence. Old profile-prefixed URLs are navigation hints,
never preference/identity writes. Preview mode rejects canonical and legacy session/success
routes, including genuine actual completion IDs. Canonical Success accepts only a renderable
actual completion source key; imported legacy completion keys return meaningful actual home
without changing their records. Wrong/retired IDs return safe lists, never array items.

`session.ts` snapshots ordered exercise/image/plan content at explicit start with a
fresh UUID. `acceptedCount` is a monotonic prefix, `viewIndex` a review cursor;
Previous/Next cannot accept/skip. Matching UUID/current unaccepted step is mandatory;
final acceptance alone atomically upserts one completion. Replay/double activation,
partial exit/reload or forged success grants no extra credit. Water start rechecks
both separate swimming ability and permitted supervised-pool/guardavidas affirmations;
preference/history/hash cannot supply either. Leaving clears them.

Unchosen entry is a memory-only photographic welcome, then `Contanos sobre vos`
with three unselected situation radios and explicit confirmation. Selection/back/reload
never writes or chooses a preference. Confirmed saved users skip both stages; successful
or tab-only reset returns welcome, with recovery taking priority. Profile editing opens
the preference form directly and preserves history.

Estimated duration is presentation-only: validated plan durationOptions are 15/30 minutes
for yoga/calisthenics, 45/60 for water swimming and a separate 15-minute dry preparation.
Plan-local semantic selectors default to the shorter estimate; leaving/changing plan or
reload resets selection. SportChoice summarizes both swimming paths distinctly. No
exercise, command, attempt snapshot, Session duration, timer or credit rule changes.

Profile-entered scenarios are one person's transient demonstrations. Journey scenarios
show sustained progress/supportive return; notice scenarios open
`#/notice/:scenarioId` with an image-backed translucent activation card, then `#/chat/:chatId` directly, with matching active context.
Forged notice/chat hashes never activate preview. Exactly five missed-class/four
inactivity answers show configured supportive response and stable class/dry-plan/sport
destination. Leaving chat clears answer, destination remains preview. No free text,
provider call, push, absence record, penalty or persisted answer. Explicit exit restores
actual home/card without pending action; reload cannot restore preview.

`AppShell` provides circular profile, contextual back, skip link, heading/exercise
focus and bottom Inicio/Deportes/Clases (hidden on onboarding/recovery/notice/chat).
The navigational header stays pinned during document scrolling. Positive breadcrumb
spacing and scroll/focus offsets keep the back control and outline below its divider.
There is no repeated disclaimer header/footer; actionable safety remains at practice
decisions. Every preview surface uses the same shell badge and normal-flow bottom exit after
content, with tab clearance and visible keyboard focus. Durable controls are disabled
and independently guarded. Rounded yellow mobile-first pages use ordinary document
scroll, Spanish labels/alts/status/errors, 44px targets and reduced-motion rules.
Representative 360/1280 keyboard/visual checks are not universal accessibility proof.

### Images, serving and verification

All 29 approved mockup photos are bundled local JPEGs. The 15 unique exercise photos use
runtime JSON assignments bounded by the developer-controlled path/subject allowlist in
`content/images.ts`, not JSON self-approval. The 14 original mockup-role photos use the
small static `content/mockupPhotos.ts` map; a separately approved local Obelisk JPEG
is used only on the welcome screen. Shared components reuse stable paths in actual
and preview destinations. Plans show exercise thumbnails before
Start and sessions retain snapshot images. The three legacy SVGs remain available only as
general environment art and are not used on photo-required surfaces. The
[provenance record](../public/assets/photos/provenance.json) retains owner-satisfied
permission, original Pexels/license metadata for the mockup set, byte hashes and
visual correspondence; its separate `welcomePhoto` entry records the owner-approved
GetYourGuide image source and hash without implying a Pexels license.
Home uses the documented Buenos Aires park photo (Pexels 31414914) with a separate
readable yellow copy panel, including saved-user and preview homes. Failed Home photos
show a Spanish unavailable status without remote fallback.
Unsafe exercise paths/subjects reject; missing/unverified assignment or failed session
load preserves instructions with Spanish unavailable status, never a remote fallback.
Runtime never fetches provenance source URLs.

`scripts/serve.mjs` serves only built dist via pinned serve-handler 6.1.6 on 0.0.0.0,
validated PORT (default 3000), no port switching/catch-all/listing/symlinks. JSON fetch
and response are no-store. Dependencies and serving configuration are unchanged; [deployment](deployment.md) owns
the verified production release of this feature and its bounded live checks.
[Root README](../README.md) owns commands/reset/presenter limits. Core tests import real
helpers; serial Chromium tests own built port 4173 and compare actual raw bytes/rendered
outcomes. Served JSON/photo recovery restores exact bytes in finally. Required evidence
and implementation checkpoints are returned for independent review, not self-awarded
acceptance or live-service claims. All training/classes/contact/rewards remain fictional,
nonofficial, professional-review/no-booking/nonredeemable demonstrations.

## Historical initialization and planning provenance

The sections below retain the original inspected baseline and planned source/version
research. Their **PLANNED**, **UNRUN** and **UNVERIFIED** labels apply to that stage
only; they do not override the current implemented behavior and execution evidence
above. The historical heading/anchors remain stable for immutable approved-plan links.

## Verified repository baseline

At initialization, the conceptual v2 mockup (retained in Git history) was a single HTML
file with inline CSS and JavaScript. It declares conceptual/non-official status and
fictitious class data in its visible header and notices. Its JavaScript contains
example sport/profile data, an in-memory `state` object, rendering functions, and
click handlers for simulated flows. These observations describe the file, not a
production architecture or approved product specification.

At initialization the repository contains no backend, package/build configuration,
migrations, or persistent-database schema evidence. This does not establish the
absence of systems outside the repository.

## Evidence boundaries

The source file is the evidence for the demo's structure and disclaimers. Runtime
behavior was not tested during documentation initialization. Future production
architecture, integrations, authentication, persistence, and service contracts are
not established here. Define substantive product requirements through the installed
planner and explicitly select TinySpec or Standard before such work; initialization
authorizes neither path nor implementation.

## PLANNED demo architecture (not implemented)

Planning source: [approved feature](../specs/001-ba-movement-demo/README.md),
[design](../specs/001-ba-movement-demo/plan.md). This section records authorized
planning only; the verified baseline above remains unchanged. Research inspected
2026-10-14 through read-only public HTTPS using Python urllib; no packages installed.
No existing package manifest or lockfile was found. Local Node **22.23.3**, npm
**10.9.9** were observed, not inferred hosting versions.

### Dependency decisions and inspected provenance

Use exact initial versions below and commit npm's generated lockfile during authorized
implementation; subsequent installs use `npm ci`. These are compatible bounded
selections, not a claim of latest releases, security audit, or tested installation.

| Planned dependency | Inspected official package metadata / applicable constraint |
| --- | --- |
| Vite 7.2.2 | [metadata](https://registry.npmjs.org/vite/7.2.2): `engines.node` is `^20.19.0 || >=22.12.0` |
| @vitejs/plugin-react 5.1.1 | [metadata](https://registry.npmjs.org/@vitejs/plugin-react/5.1.1): same Node range; Vite peer includes `^7.0.0` |
| React / react-dom 19.2.0 | [React metadata](https://registry.npmjs.org/react/19.2.0), [DOM metadata](https://registry.npmjs.org/react-dom/19.2.0): DOM peer is `react: ^19.2.0` |
| TypeScript 5.9.3 | [metadata](https://registry.npmjs.org/typescript/5.9.3): Node `>=14.17` |
| @types/react / @types/react-dom 19.2.2 | [React types](https://registry.npmjs.org/@types/react/19.2.2), [DOM types](https://registry.npmjs.org/@types/react-dom/19.2.2): DOM types peer `@types/react: ^19.2.0` |
| @playwright/test 1.56.1 | [metadata](https://registry.npmjs.org/@playwright/test/1.56.1): Node `>=18` |
| serve-handler 6.1.6 (direct runtime dependency; replaces serve CLI) | [metadata](https://registry.npmjs.org/serve-handler/6.1.6): CommonJS entry `src/index.js`, no declared Node engine; Node 22 runtime compatibility must be exercised |

Repository decision: use Node 22.x, at least 22.12, with observed 22.23.3 as the
local validation target; declare this requirement and verify hosting runtime during
any later authorized deployment. No router, schema framework, state library or unit
framework is needed. React hooks/context and plain CSS are settled owner constraints;
trivial component/hook use needs no fresh tutorial research. Metadata inspection is
compatibility evidence only: install/typecheck/build/browser execution remain UNRUN.

### Source recommendation → constraint → observable check

- **Documented:** Vite 7 [assets / The public Directory](https://v7.vite.dev/guide/assets)
  says public assets are served at `/` in dev and copied unchanged to dist root;
  root-absolute references are required. **Decision:** runtime fetch
  `/config/app-content.json` with `cache: no-store`, never a bundled JSON import;
  validate before rendering any dependent view. **Check:** served build returns JSON
  at that exact path; editing class title/schedule, exercise order and reward copy
  then reloading changes all three views without React edits. Missing file must not
  become plausible HTML/config fallback.
- **Documented:** Vite 7 [static deploy](https://v7.vite.dev/guide/static-deploy)
  states output defaults to `dist` and `vite preview` is not a production server.
  **Decision:** build/typecheck with Vite, run a minimal Node HTTP listener with `serve-handler` for static hosting, use hash
  navigation (no server-side route rewriting needed). **Check:** production start
  serves root, assets and JSON, including reload on a hash route.
- **Disproved:** serve 14.2.5 accepts `--no-port-switching` syntactically, but the
  actual occupied-port readiness check switched ports. Installed `build/main.js`
  lines 250–255 unconditionally call `startServer({ port: 0 }, ...)` after a positive
  reachability check, ignoring that flag. [Feature evidence](../specs/001-ba-movement-demo/research.md#static-serving-correction)
  retains the observed listeners and failure provenance. The earlier CLI-option
  inspection was not behavioral proof; do not reuse its serving-readiness claim.
- **Documented, version-specific:** serve-handler 6.1.6
  [README](https://raw.githubusercontent.com/vercel/serve-handler/6.1.6/README.md)
  Usage/Options describes an async request/response handler with third-argument
  configuration; `public` accepts an absolute root, `headers` overrides response
  headers, directory listing can be disabled, and symlinks default to disabled.
  [Source](https://raw.githubusercontent.com/vercel/serve-handler/6.1.6/src/index.js)
  `getHeaders` (lines 194–256) uses MIME, Last-Modified by default and custom headers;
  exported handler (548–620) resolves the root, decodes paths and checks containment;
  `findRelated` (281–311) resolves directory index HTML with default clean URLs;
  missing files/disabled listings/symlinks return 404 (676–713). No listener or
  automatic port selection is part of this handler. Official tag README/source
  bytes matched the installed 6.1.6 package during read-only correction research.
  **Derived decision (PLANNED):** direct runtime pin 6.1.6; `npm start` runs
  `node scripts/serve.mjs`. This minimal ESM adapter uses `node:http` and the
  CommonJS handler's default import, serves only an absolute project `dist` root,
  and listens explicitly on `0.0.0.0` and validated `PORT` (unset defaults to 3000;
  supplied value must be decimal integer 1–65535, not empty or zero). Startup
  errors exit nonzero, with no reachability precheck, retry or fallback port.
  Delegate MIME, file paths, streaming and errors to the dependency, not custom
  static routing. Keep default clean URLs for root index resolution, no rewrites/
  catch-all, `directoryListing: false`, `renderSingle: false`, `symlinks: false`.
  Set `Cache-Control: no-store` for `/config/app-content.json` through handler
  headers; keep client fetch no-store. No API/backend or separately built server.
  Simple SIGTERM listener close is sufficient; no process manager/shutdown subsystem.
  **Checks/assumptions:** ESM interoperability and actual composed behavior remain
  UNVERIFIED for this replacement. T001/V1–V2 must prove install/build, default and
  nondefault host/port, invalid-port rejection and occupied-port nonzero exit with
  no second listener; root/JS/absent-file responses and no directory listing.
  T002/V2 proves JSON/SVG/hash reload and JSON no-store; T006 retains actual edited
  file/recovery proof. Inspect config/root boundaries; no broad security-audit claim.
- **Documented:** Railway [common errors / Application not listening on the correct host or port](https://docs.railway.com/guides/fixing-common-errors)
  requires `0.0.0.0` and injected `PORT`. **Decision:** same local and Railway-capable
  static command. **Check:** local nondefault-port HTTP smoke; live platform check
  requires separate permission and configured service. Deployment remains unknown.
- **Documented:** Playwright [Browsers / Introduction](https://playwright.dev/docs/browsers)
  states each version requires matching browser binaries and updates may require
  rerunning its install CLI. **Decision:** pinned test package and matching Chromium
  first; no automatic OS/dependency installation. **Check:** report actual CLI/browser
  versions and core smoke output. Current generic docs support lifecycle guidance,
  not a claim that 1.56.1 browser binaries are present here.

### Planned state and validation practices

Keep content validation, navigation guards, session completion and incentive derivation
as small real TypeScript helpers under one context. Store only versioned demo profile
selection and isolated histories/interests in one namespaced localStorage envelope;
no database or independent mutable point totals. Render configuration as text, never
HTML/executable templates; allow only local artwork references. Fetch/parse/reference
failures and storage limitations get Spanish recovery UI. A minimal built-in Spanish
error shell must work even when editable labels cannot load.

Known bounded risks use focused tests of these actual helpers before dependent UI
relies on them, then required Playwright composed flows. No disposable prototype or
blanket coverage target is justified. Pure helper assertions can use Playwright's
runner without launching a browser, avoiding a second test framework. Details of
profile isolation, date semantics and attempt deduplication belong to the feature's
[data model](../specs/001-ba-movement-demo/data-model.md); public editor interface to
its [content contract](../specs/001-ba-movement-demo/contracts/content.md).

# Architecture

## Current implemented demo

The delivered app is React 19.2.0/TypeScript 5.9.3/Vite 7.2.2, plain CSS and hooks/simple
context. `src/App.tsx` bootstraps a no-store runtime fetch of
`/config/app-content.json` through `src/content/load.ts` and `validate.ts`; no product
JSON is bundled into JavaScript. Complete validation precedes mounting consumers;
a built-in Spanish blocking/retry shell works without editable content. Strings
render as text, assets are restricted to three local extracted v2 environment SVGs.
The [content guide](CONTENT_CONFIGURATION.md) owns required fields and editing steps.

`src/state/navigation.ts` guards stable-ID hash routes (no server rewrite), rejecting
wrong-sport, stale class/plan and forged session/success targets. `context.tsx` owns
synchronous transitions; `session.ts` permits explicit START, current-step acceptance,
then one upsert keyed by attempt UUID before success. Navigation, partial attempts,
interest and presentation inspection never credit completion. Water START always
requires both separate ability and supervised permitted-pool/guardavidas affirmations;
profile history is not eligibility. There are no timer waits or real activity checks.

`storage.ts` validates/materializes a schema 1 envelope at only
`ba-en-movimiento:demo:v1`: selected profile, fixed reference date, isolated seed
snapshots, completed attempts and interests. No counters are stored. First creation
or deliberate reset materializes fixtures; reload does not reseed. Retired plan/class
snapshots remain valid with known profile/sport identity. Invalid data offers scoped
recovery; denied reads/writes permit warning-labeled in-tab use without persistence
promises. Storage events reload the envelope and abandon active work, not a multi-tab
transaction system. Reset replaces only the one key and selects first-time.

`dates.ts` and `selectors.ts` derive one history's lifetime points/weeks/badges and
current Monday-start week/calendar-month progress using Buenos Aires local dates.
Interests are not input. Only progress bars cap numerators. Fixtures reference
2026-10-14, not a frozen app clock; current/new dates use actual time. Rest never
deletes lifetime achievements. Seed origins and user-simulated completions are labeled.
Root [README](../README.md) owns run/test/reset/presenter commands and date examples.

`src/screens/` provides Home, sport choice, plan/catalog, session/exact class detail,
success, journey and challenges. `AppShell` provides profile/back/home/journey/logs,
scoped recovery/reset and keyboard skip/focus; no separate unsafe stage shortcuts.
One centered mobile-first app uses actual unchanged v2 scene art, approved palette,
rounded hierarchy and regular page scrolling. All visible/a11y/error copy is Spanish.
Classes/contacts/prices and interests are fictional, never booking/attendance;
rewards are illustrative/nonredeemable/sin convenio vigente, no partner transactions.

### Runtime, serving and checks

Direct exact pins in package/lock: react/react-dom 19.2.0, TypeScript 5.9.3, Vite 7.2.2,
@vitejs/plugin-react 5.1.1, @types/react/@types/react-dom 19.2.2, @playwright/test 1.56.1,
serve-handler 6.1.6. Actual local Node 22.23.3/npm 10.9.9; engines 22.x >=22.12.
No new dependency was added in final integration; three high audit warnings remain
unassessed, not remediated by an unapproved upgrade.

Vite copies public files unchanged to `dist`. `scripts/serve.mjs` is a minimal ESM
Node HTTP listener delegating static MIME/path/streaming/errors to serve-handler;
not a backend/API or Vite preview production server. Only absolute dist is served,
0.0.0.0 plus validated PORT (unset: 3000, supplied decimal 1–65535), nonzero startup
failure without fallback. Default root index, no SPA catch-all/directory listing/
symlinks; configuration response and fetch are no-store. See [deployment](deployment.md)
for the serving boundary and separately verified Railway deployment.

Playwright core imports actual validator/transition/storage/date/rule helpers;
Chromium uses a built app through the same production start command. Composed tests
compare stored UUIDs and independently calculated rendered totals; real served-file
mutation/failure tests restore original bytes in finally blocks. Tests are serial
within their single browser file; don't run another client against its mutable dist
fixture. Representative 360/1280px screenshots were actually viewed, with keyboard/
focus/44px targets/reduced-motion/Spanish error checks and agent-led timed rehearsal.
These are focused local checks, not universal accessibility/security/browser claims.
Task-local commands and observations are retained in [tasks](../specs/001-ba-movement-demo/tasks.md).

No backend/database/schema owner, authentication, real booking, payment, maps,
notification or external integration is implemented. The first authorized Railway
release uses this unchanged Node listener; [deployment](deployment.md) owns verified
resource IDs, runtime, public URL and live checks. The conceptual HTML remains visual
authority and historical artifact, not operational behavior truth.

## Historical initialization and planning provenance

The sections below retain the original inspected baseline and planned source/version
research. Their **PLANNED**, **UNRUN** and **UNVERIFIED** labels apply to that stage
only; they do not override the current implemented behavior and execution evidence
above. The historical heading/anchors remain stable for immutable approved-plan links.

## Verified repository baseline

The existing [conceptual mockup](mockup_ba_en_movimiento_v2.html) is a single HTML
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

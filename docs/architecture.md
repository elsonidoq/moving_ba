# Architecture

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
| serve 14.2.5 (runtime dependency) | [metadata](https://registry.npmjs.org/serve/14.2.5): Node `>=14`; CLI `build/main.js` |

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
  **Decision:** build/typecheck with Vite, run `serve` for static hosting, use hash
  navigation (no server-side route rewriting needed). **Check:** production start
  serves root, assets and JSON, including reload on a hash route.
- **Documented:** serve v14.2.5 [CLI source, ENDPOINTS and options](https://raw.githubusercontent.com/vercel/serve/v14.2.5/source/utilities/cli.ts)
  supports `-l tcp://hostname:port`, `--no-clipboard`, `--no-port-switching`;
  [main source](https://raw.githubusercontent.com/vercel/serve/v14.2.5/source/main.ts)
  reads `PORT` when defaulting a listener and `--single` rewrites all paths to HTML.
  **Decision:** explicit `tcp://0.0.0.0:${PORT:-3000}`, no `--single`, fail on occupied
  port; disable update checking with `NO_UPDATE_CHECK=1` (the same CLI source's
  `checkForUpdates` returns immediately when that variable is set). **Check:** chosen nondefault port binds
  all interfaces, missing config is 404/error rather than HTML; startup has no need
  for service integration. Shell expansion targets Railway/Linux, not Windows cmd.
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

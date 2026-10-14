# BA en movimiento

A conceptual Spanish-language demo, not an official service. No live deployment or integrations.

## Local development

Use Node 22.x (>=22.12) and npm. Install the locked dependencies:

```sh
npm ci
npm run dev -- --host 0.0.0.0
npm run typecheck
npm run build
PORT=4173 npm start
```

`start` serves only built `dist` on `0.0.0.0`. PORT defaults to 3000 only when unset;
supplied PORT must be a decimal integer 1–65535. Occupied ports fail, never switch.
Missing files return 404; no directory listings or SPA catch-all.

## Configured practice

Choose `Primera vez`, `Retomando` or `Ya entreno` with `Tu momento con el movimiento`.
Each sport opens its own introduction. `Entrenar por mi cuenta` opens that profile's
ordered safe plan; `Sumarme a una clase` shows the sport's distinct fictional free/paid
examples. Start a simulated practice and explicitly complete each ordered step; only
the final accepted step stores one completion. Leaving or refreshing an unfinished
practice abandons it without credit. A new explicit start makes a new attempt.
Swimming defaults to dry land: the water variant requires both swimming ability and
a permitted supervised pool with guardavidas and venue rules. Profiles never grant ability.
Class interest, normal reset and derived journey screens are not delivered yet.

Product copy, all twelve plans, six classes, rules and seed scenarios live in the
human-editable `public/config/app-content.json`. The app fetches
`/config/app-content.json` at runtime with no-store and blocks invalid configuration
with Spanish hints/retry. No product dataset is imported into the JS bundle.
To preview a local file edit in production mode, rebuild and restart/reload the newly
served build. There is no CMS or live deployment editing promise.
Hash routes reload without server rewrites, e.g. `/#/returning/yoga/solo/yoga-returning`.
Unknown/mismatched identities return to a valid selection, never a positional substitute.

## Local session persistence

Only `ba-en-movimiento:demo:v1` is written (schema 1). Profile selection, materialized
seed snapshots and completed attempts persist; active cursors and swim affirmations do
not. Returning has two demonstration records (August 17/24); regular has four across
four weeks (September 23 through October 12), anchored to 2026-10-14. Seeds materialize
once, not on every reload. Historical titles survive renamed/retired plans.
Invalid storage offers scoped recovery; denied writes warn in Spanish and retain
in-memory dedup only, without a reload-persistence promise. Storage events reload the
envelope and abandon active work; concurrent multi-tab transactions are not guaranteed.
All exercise/completion actions are simulations, not verified training.

## Checks

```sh
npm run test:core
npm run test:e2e
```

The Playwright core project runs helpers without a browser; the Chromium project uses
built `dist` through the same production start command on port 4173 (must be free).
Build first. Matching Playwright Chromium is required; set `PLAYWRIGHT_BROWSERS_PATH`
when using a separately installed browser cache. No automatic OS installation.
Validated locally with Node 22.23.3/npm 10.9.9, Playwright 1.56.1 and Chromium
141.0.7390.37 (revision 1194). Focused checks:

```sh
npm run test:core -- --grep 'content validation'
npm run test:e2e -- --grep 'configured navigation'
```

The latter covers all 18 profile/sport/branch selections, guarded hash/history/reload,
HTTP public-file identity and early 360px/1280px visual/keyboard checks. Tests are added
with their delivered functionality; later participation/persistence/rewards checks
are not claimed by these previews. Dependency audit reported three high-severity
warnings, not assessed or fixed; exact approved pins are retained.

[Architecture](docs/architecture.md) · [Deployment status](docs/deployment.md) ·
[Approved feature](specs/001-ba-movement-demo/README.md)

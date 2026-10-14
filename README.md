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
Open `Ver esta clase` for its exact fictional details. `Me interesa esta clase`
records one simulated interest per profile/class; it sends nothing, reserves nothing
and never changes completion history or rewards. `Mi camino` is available throughout
the app, with history, weekly goal, a concrete next practice and `Desafíos y logros`.

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

Use `Restablecer demostración` and accept the confirmation to restore all three
fixtures, select `Primera vez`, discard active sessions/affirmations, and remove
app-added completions/interests. Only the demo key is replaced; unrelated storage is
untouched. A failed write resets this tab only and warns that durable data remains.

## Journey rules and dates

One history per profile combines materialized seed records with unique completed
attempts, never class interests. Lifetime points are record count × configured
`pointsPerCompletion` (currently 10). Active weeks count distinct Monday-start BA
weeks. Weekly goals count current-week sessions; challenges count sessions or active
weeks within their configured current week/calendar month. Numerators remain honest
(e.g. 2 / 1); only progress bars are capped. Badges use lifetime configured thresholds,
so rest/window rollover does not erase history, points or earned badges. Benefits are
illustrative, nonredeemable and `sin convenio vigente`, not partner offers.

Dates use `America/Argentina/Buenos_Aires`, not UTC or rolling windows. The fixture
reference `2026-10-14` is not a frozen app clock: new completions and current windows
use the actual current time. At that reference date the reset profiles have 0/2/4
sessions, 0/20/40 points, 0/2/4 active weeks and weekly progress 0/1, 0/1, 1/2.
Seeds display `Datos de demostración`; explicit app completions display
`Práctica simulada por vos`. Historical Spanish snapshots survive content renames or
retired plans. Rule edits recompute views after reload; fixture edits take effect only
on deliberate reset, not every reload. Content-edit/failure browser acceptance and
final presenter/visual rehearsal remain later tasks.

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
with their delivered functionality; these navigation checks alone do not prove
participation/persistence/rewards. Batch B separately validates actual transition,
storage and date/rule helpers and the composed production-browser boundaries.
Dependency audit reported three high-severity
warnings, not assessed or fixed; exact approved pins are retained.

```sh
npm run test:core -- --grep 'session integrity|swimming start guard|storage envelope|class identity|history rules dates'
npm run test:e2e -- --grep 'solo durable completion|swimming safety|yoga interest|profile reset|calisthenics journey rewards'
```

The rewards/profile tests freeze the browser clock to the fixture reference and
compare stored record IDs with independently calculated rendered totals. App time
is not frozen. No live deployment, request submission or real exercise is tested.

[Architecture](docs/architecture.md) · [Deployment status](docs/deployment.md) ·
[Approved feature](specs/001-ba-movement-demo/README.md)

## Presenter route (no real exercise)

Use a built local app on a 360px phone viewport or centered desktop. Start with
**Restablecer demostración** and accept. Narrate the story rather than performing
exercise or waiting for a workout timer; the controls remain immediately usable.

1. **Primera vez** → **Calistenia** → **Entrenar por mi cuenta**: explain the park
   illustration, supported movements, quantities and qualified-review disclaimer.
2. **Empezar práctica simulada** → **Completé este paso** for each of three steps.
   Success → **Mi camino** shows that one attempt; **Desafíos y logros** shows the
   same history's points, flexible targets and illustrative, nonredeemable benefit.
   Reload to show durability. A partial practice or direct URL earns nothing.
3. **Inicio** → **Yoga** → **Sumarme a una clase** → **Ver esta clase**: compare
   free/paid fictional details, register **Me interesa esta clase**, reload and
   show interest feedback. No booking, sent request, attendance or reward.
4. **Inicio** → **Natación** → solo: dry-land default; swimming ability alone is
   insufficient. Both separate affirmations are required for the water variant.
   For learning, use the instructor/class redirect; never simulate real permission.
5. Select **Retomando**, then **Ya entreno** and open **Mi camino** for each:
   labeled historical fixtures, pause without shame, control and recovery.
   Current-week progress depends on today's Buenos Aires clock, not the fixture date.
6. **Restablecer demostración**, accept, inspect first-time empty history again.

Aim for a narrated 3–5 minute story; a selected eligible practice has no forced waits
and should take well under 90 seconds to tap through. Header profile, back/home and
journey/log links are the inspection controls: no stage shortcut can fabricate a
class or complete a skipped session. All routes remain subject to identity/safety guards.

[Content editing guide](docs/CONTENT_CONFIGURATION.md) documents independent JSON
editing, real-file failure/retry checks, fixtures and the rebuild/redeploy boundary.

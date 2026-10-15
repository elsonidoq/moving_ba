# Buenos Aires te mueve

Spanish-language conceptual demo for one person's movement journey, not an official
service. Practices, classes, contacts, intentions and rewards are simulations. No
booking, attendance verification, AI, push, backend, account or live integration.
[Deployment](docs/deployment.md) owns the verified Railway production release at
commit `d6ca077`, including its public URL and bounded live checks.

## Run locally

Use Node 22.x (>=22.12) and npm with the locked dependencies:

```sh
npm ci
npm run dev -- --host 0.0.0.0
```

Stop dev with Ctrl-C. For a built local demonstration, separately run:

```sh
npm run typecheck
npm run build
PORT=4173 npm start
```

Open `http://localhost:4173`. Stop with Ctrl-C. Start serves only `dist` on
`0.0.0.0`; PORT defaults to 3000 when unset, otherwise decimal 1–65535. Occupied
ports fail without switching. Missing files return 404, with no SPA catch-all or
file listing. Hash navigation needs no server rewrite.

## Presenter path and reset

1. On a fresh origin activate **Comenzar**, then **Contanos sobre vos**: choose one
   of the three unselected situation radios and continue. Back/reload before confirmation
   returns welcome without saving; confirmed saved preferences skip both stages.
   This is a recommendation preference, not a separate identity or swim permission.
   Inicio recommends practices; Deportes opens all three sports; Clases explores all
   fictional free/paid ARS examples. The circular top-right control opens Perfil.
2. In exact class detail, interest and **Voy a ir** are distinct. The latter saves one
   simulated upcoming card on actual home; another choice replaces it without credit.
3. Plan offers **Duración estimada**: 15/30 min for yoga/calisthenics and 45/60 min
   for swimming water, with separate 15 min dry preparation. The shorter estimate is
   default; selection is display-only and resets on leave/change/reload. Exercises,
   quantities, photos and credit never change with the estimate. Start a dry practice and explicitly accept each ordered step. Anterior/Siguiente
   review only; acceptance cannot skip steps or re-credit review. Only final acceptance
   stores one UUID completion. Leaving/reload abandons incomplete work. Swimming water
   start requires both autonomous ability and a permitted supervised pool with
   guardavidas/rules, rechecked at the command boundary. Dry/instructor options remain.
4. Perfil groups genuine metrics, weekly progress and Monday–Sunday activity bars,
   plus situation editing, history, challenges, achievements and illustrative
   nonredeemable benefits. Editing preference preserves earned history and intention.
   Four named scenarios are deliberate **same-person previews**. Sustained/return
   examples use configured dates/history, never actual records. The two notice scenarios
   open photo-backed translucent notice cards, then matching scripted chats with exactly five/four answers.
   Each supportive response links to a configured class, dry plan or sport preview.
5. Every preview destination shows a simulation badge and **Volver a hoy** after the
   page content in normal document flow. Scroll down or use the keyboard. Edit/reset,
   interest/intention/start are unavailable until explicit exit; exit performs no pending
   action. Actual intention is hidden in preview. Leaving chat loses its answer;
   exit/reload/storage events discard preview. No free text or provider request occurs.
6. In actual Perfil choose **Restablecer mis datos**, then confirm (cancel is a no-op).
   Recovery for invalid storage also confirms. Reset creates **empty**, unchosen state,
   not seeded fixtures, returns welcome and clears all transients. Only `ba-en-movimiento:demo:v1` on
   this origin is replaced; unrelated keys/origins are untouched. Failed persistence
   is tab-only and explicitly warns that old saved data may return after reload.

## State, dates and editable content

One schema-1 `one-person` envelope persists preference, source-scoped history,
interests, one intention and optional preserved legacy archive. Valid old three-profile
records merge losslessly with provenance/collision-safe source keys; the old selection
is not onboarding consent. Reading does not write or reseed. Invalid data stays intact
until confirmed reset. Denied reads block overwriting unknown history; unavailable
storage supports warning-labeled in-tab use, not durable-save guarantees.

Lifetime sessions/points/active weeks and badges derive from history, not interest,
intention, chat or time. Points = sessions × configured pointsPerCompletion (10 now).
Current goals use Buenos Aires dates, Monday weeks and calendar months; only progress
bars cap. Profile weekday buckets count the same eligible source records through the
projection's BA today; empty history stays zero. Rest never erases lifetime achievements. New/reset history starts at zero;
preview examples may show 4 sessions/40 points/4 active weeks without changing today.
No multi-tab transaction guarantee, actual exercise verification or universal
accessibility/browser certification is implied.

Edit UTF-8 `public/config/app-content.json` following the
[content guide](docs/CONTENT_CONFIGURATION.md). Full validation precedes dependent
screens; runtime fetch and HTTP response are no-store. Missing/malformed/invalid JSON
blocks with Spanish error/retry, never plausible fallback. Dev serves public directly;
built serving requires rebuilding after source edits. There is no CMS/live editor.
All 29 approved mockup photos are bundled JPEGs. Exercise assignments remain in runtime
JSON and are restricted by the developer allowlist; onboarding, Home, notice, sport and class
photos use the static `src/content/mockupPhotos.ts` mapping. Plans show exercise thumbnails
before Start and sessions retain snapshot images. Source/license/correspondence evidence is
in [photo provenance](public/assets/photos/provenance.json). Source URLs are metadata,
never remote fallbacks. Home shows the documented Buenos Aires park photo (31414914)
on actual and preview entry. The app header stays pinned with clear back/focus spacing;
there is no repeated disclaimer footer, while local safety and simulation context remain. Missing/unverified exercise photos preserve instructions with
honest unavailable feedback. No photo reacquisition is needed.

## Checks

Matching Playwright 1.56.1 Chromium revision 1194 must already be available (set
`PLAYWRIGHT_BROWSERS_PATH` for a separate cache). Missing capability must be reported;
no implicit package/browser/OS install. Stop other port-4173 clients before testing:

```sh
npm run typecheck
npm run build
npm run test:core
npm run test:e2e
# Focused checks, build first:
npm run test:e2e -- --grep 'ephemeral same-person scenarios'
npm run test:e2e -- --grep 'scripted support alternatives'
npm run test:e2e -- --grep 'served profile content recovery'
```

Playwright owns/tears down the built server on 4173. Run browser tests serially:
served-content recovery temporarily changes actual dist JSON/photo bytes and restores
originals in finally; do not share that mutable fixture with another client. Core
imports actual validators/state/date/safety helpers. Browser checks compare exact raw
storage with rendered outcomes, local JPEG bytes, recovery and keyboard/360/1280
presentation measurements. Screenshots require actual viewing, not just generation.
Fresh independent implementation review passed at `d6ca077`; owner acceptance and any
future release remain separate decisions.

[Architecture](docs/architecture.md) explains custody/routes; [docs index](docs/README.md)
provides other owners. The dependency investigation and non-blocking plan-thumbnail load-failure gap are tracked
in [open issues](docs/open_issues.md). Current deployment evidence is maintained separately
in the [deployment runbook](docs/deployment.md).

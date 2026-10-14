# Content configuration

Edit UTF-8 `public/config/app-content.json`; React controls presentation, JSON controls
content. It is public: never add secrets, personal data, real contacts, executable HTML
or remote assets. The app fetches `/config/app-content.json` with no-store on reload,
validates the whole document and blocks with Spanish hints and **Intentar de nuevo**
on missing files, malformed JSON or invalid references. There is no silent fallback.

## Required fields and identities

Keep `schemaVersion: 1`. All fields below are required; copy a complete existing record.
Human text must be nonempty Spanish, without HTML. IDs match `[a-z][a-z0-9-]*`, unique
within each collection; keep IDs stable when editing copy, never use array positions.

| Section | Fields / constraints |
| --- | --- |
| branding | name, tagline, demoNotice |
| ui | All named labels in `src/content/types.ts` (`uiKeys`); retain every key, including accessible, error, empty and success labels |
| legal | illustrativeTraining, professionalReview, fictionalClasses, noOfficialStatus, nonredeemable, noAgreement, locationNotice |
| profiles | Exactly first/returning/regular: id, title, subtitle, welcome, hero, cta, nextPrompt, defaultSportId, defaultPlanId, scenarioId, weeklyGoal (positive integer) |
| sports | Exactly calisthenics/yoga/swimming: id, name, summary, heroAsset, heroAlt, environment, facilities, tips (nonempty strings), modes (solo/classes), safetyCopy |
| exercises | id, sportId, title, quantity, technique, imageAsset, imageAlt, medium (dry-land/water) |
| plans | id, sportId, profileId, level, name, description, duration, environment, prerequisites (nonempty strings), safetyCopy, medium, steps (nonempty ordered objects: id, exerciseId) |
| classes | id, sportId, title, schedule, venue, locality, level, requirements (nonempty strings), description, receiver, contactCopy, price (kind free/paid, amount, currency ARS), fictional true |
| rules | pointsPerCompletion (nonnegative integer); challenges (id,title,description,metric sessions/activeWeeks,period week/month,target positive integer); badges (id,title,description,metric,threshold positive integer); benefits (id,title,description,disclaimer,pointsThreshold nonnegative integer,redeemable false) |
| scenarios | referenceDate (valid YYYY-MM-DD), defaultProfileId first, profiles (id,profileId,history entries with id,sportId,planId,activityDate) |

References must exist and match sport/profile. Default plans must be safe dry-land plans
for their profile/default sport; scenarioId must refer to that profile's scenario.
Every profile/sport needs a dry-land plan; swimming also needs a water variant per
profile. Water exercises only belong in swimming water plans. Both runtime swimming
and supervised-permitted-pool/guardavidas affirmations always gate water start; editing
copy cannot grant eligibility. Assets are only `/assets/calisthenics.svg`,
`/assets/yoga.svg`, `/assets/swimming.svg`, with Spanish alternative text.

## Concrete local edit and preview

1. Run `npm ci`, then `npm run dev`; open the printed local URL. For production-like
   preview instead run `npm run build` and `PORT=4173 npm start`, open
   `http://localhost:4173`. Stop the previous server before reusing its port.
2. Find class `yoga-free`: set title to `Yoga: encuentro editorial de ejemplo` and
   schedule to `Viernes 16:45 · horario ficticio`. Keep the ID. Reload
   `/#/first/yoga/classes/yoga-free`; both exact values must appear.
3. Find plan `cal-first`, reverse its `steps` array without changing the step IDs or
   exerciseId pairs. Edit the referenced exercise's technique to
   `Ejemplo editorial: usá un apoyo estable y un recorrido cómodo.` Reload
   `/#/first/calisthenics/solo/cal-first`; the new sequence and technique must appear.
4. Set `rules.benefits[0].description` to
   `Una pausa editorial de demostración, sin oferta real.` Reload
   `/#/first/challenges`; the copy must appear, still nonredeemable/sin convenio vigente.
5. For a built preview, repeat `npm run build` **after each repository edit** before
   reloading: the server reads `dist`, not `public`. Dev serves public directly.
   No React edits are needed. `npm run test:core -- --grep 'content validation'`
   checks repository content; `npm run build` alone only typechecks/bundles, it does
   not validate JSON. A browser reload validates the file actually being served.
6. Restore your example edits. Use **Restablecer demostración**, accept its confirmation,
   and inspect each profile under **Mi camino**. This replaces only
   `ba-en-movimiento:demo:v1` on the current browser origin; other origins and unrelated
   storage keys are untouched. It restores all fixtures, clears added completions and
   interests, selects first-time and abandons transient practice/affirmations.

Automated reproduction against the actual built file (serial tests, finally restoration):
`npm run test:e2e -- --grep 'content edits'` and separately
`npm run test:e2e -- --grep 'content failures'`. Build first and install matching Chromium
as described in the root README. These tests temporarily edit/remove **dist** JSON,
verify actual HTTP responses and rendered reload/retry, then restore exact original bytes.
Do not run other browsers against that same fixture concurrently.

## Add classes, exercises or plans

Duplicate a complete class, give it a new stable ID and existing sportId, and keep all
fictional notices/receiver (`A confirmar` or explicitly fictional)/contact copy honest.
Each sport still needs at least one free (amount 0) and paid (finite amount >0) ARS
example. Adding interest never means booking, attendance, sent request or incentive credit.

Duplicate an exercise with a new ID, same sport and safe medium; supply quantity,
technique and local artwork/alt. Reference it in a plan step with a unique step ID.
The same exercise may recur, but each occurrence needs its own step ID. Duplicate a
plan with a new ID and appropriate profileId/sportId; preserve all metadata and valid
ordered references. To select it as that profile's default, update defaultPlanId and
matching defaultSportId. Keep every required safe combination and swimming variant.
Retiring a referenced plan also requires repairing defaults and scenario references.
Removed selected IDs return to valid choice/catalog, never the item now at that position.

## Fixtures, snapshots and derived rules

`scenarios.referenceDate` is **2026-10-14**, not the running clock. First-time history
is empty; returning has two seeded practices on August 17/24 and a pause; regular has
four seeded weeks through October 12. Fixture IDs must be unique across scenarios,
dates valid and on/before referenceDate, sport/plan/profile consistent. Returning
must precede referenceDate; regular spans multiple weeks. Fixture edits apply only
on initial storage creation or explicit reset, not every reload.

New completions and current windows use the actual Buenos Aires clock
(`America/Argentina/Buenos_Aires`), Monday-start weeks and calendar months. Seeded
history is labeled **Datos de demostración**, app completions **Práctica simulada por vos**.
Older seeds may be outside current windows. Lifetime points = unique eligible record
count × pointsPerCompletion; goals/challenges/badges derive from the same history.
Only visual bars cap progress. Rest never deletes lifetime achievements. Rule edits
recompute on reload, but stored history/interest titles remain historical snapshots;
renaming or retiring current plans/classes does not reinterpret them. Unfinished
sessions are transient and abandoned on reload, without credit. Storage denial permits
in-tab use with a visible persistence warning; invalid envelopes offer scoped recovery.

## Published builds

Editing repository public JSON does not mutate a deployed build. Rebuild and, only
with separate authorization, redeploy that static artifact. Reload fetches the newly
served bytes; there is no CMS, account, hot deployed editor or remote-edit promise.
Current hosting/deployment status is unknown; see [deployment](deployment.md).

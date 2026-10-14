# Public runtime content contract (planned v1)

**External interface:** human-edited UTF-8 JSON at repository
`public/config/app-content.json`, HTTP GET `/config/app-content.json` in dev and
built hosting. Required populated delivery file, not a TS import or generated-only
artifact. This document specifies its concise schema; it is not the production dataset.
No network API or backend is introduced. Fetch on startup/reload with no-store;
check HTTP success, parse JSON, validate shape and references before use. No silent
mock fallback. Changes to repository JSON require serving the changed file (build/
redeploy where applicable); no CMS or hot remote editing promise.

## Required schema

All objects/arrays below are required. Human-facing strings are nonempty es-AR;
engineering keys/enums are English. IDs match `[a-z][a-z0-9-]*`, unique within each
entity collection. Unknown schema versions fail clearly. Numeric values must be
finite and correctly bounded; no code expressions or executable HTML in strings.

| Top-level field | Shape and required fields |
| --- | --- |
| `schemaVersion` | integer exactly 1 |
| `branding` | name, tagline, demoNotice; palette may expose approved colors, not arbitrary CSS |
| `ui` | named Spanish labels for navigation, profile selector, actions, empty/success/interest states, validation/recovery, accessible names; validate every label key used by views |
| `legal` | illustrativeTraining, professionalReview, fictionalClasses, noOfficialStatus, nonredeemable, noAgreement (must communicate `sin convenio vigente`), locationNotice |
| `profiles` | exactly first/returning/regular records: id, title, subtitle, welcome, hero, cta, nextPrompt, defaultSportId, defaultPlanId, scenarioId, weeklyGoal integer > 0 |
| `sports` | exactly calisthenics/yoga/swimming: id, name, summary, heroAsset, heroAlt, environment, facilities, tips[], modes containing solo/classes, safetyCopy |
| `exercises` | id, sportId, title, quantity, technique, imageAsset, imageAlt, medium dry-land/water |
| `plans` | id, sportId, profileId, level, name, description, duration, environment, prerequisites[], safetyCopy, medium dry-land/water, steps[{id, exerciseId}] |
| `classes` | id, sportId, title, schedule, venue, locality, level, requirements[], description, receiver, contactCopy, price {kind: free/paid, amount, currency: ARS}, fictional: true |
| `rules` | pointsPerCompletion integer >= 0; challenges[{id,title,description,metric:sessions/activeWeeks,period:week/month,target integer > 0}]; badges[{id,title,description,metric:sessions/activeWeeks,threshold integer > 0}]; benefits[{id,title,description,disclaimer,pointsThreshold integer >= 0,redeemable:false}] |
| `scenarios` | referenceDate YYYY-MM-DD, defaultProfileId:first, profiles[{id,profileId,history:[{id,sportId,planId,activityDate}]}] |

Stable ordering example (fragment, not a loadable configuration):

```json
{"id":"cal-first","sportId":"calisthenics","profileId":"first","steps":[{"id":"warmup","exerciseId":"shoulder-mobility"},{"id":"row","exerciseId":"inverted-row"},{"id":"squat","exerciseId":"supported-squat"}]}
```

Editors reorder steps, not identity; inserting a repeated exercise uses a new step ID.
Asset references allow only known local `/assets/...svg` paths for the extracted
mockup artwork (no arbitrary remote URL, inline markup or script). Content is rendered
as text; React presentation must not use dangerous HTML injection.

## Semantic validation and recovery

Validate all references and collection duplicates, including step IDs within a plan;
reject unknown IDs, wrong-sport exercises/classes/defaults, empty step lists, missing
sport/profile coverage, invalid dates, inconsistent fixtures, and invalid rule values.
Every sport/profile must have an appropriate safe plan. Water exercise inclusion
requires a water plan belonging to swimming; all water plans require both runtime
affirmations regardless of configurable copy. JSON cannot disable the safety guard.
For swimming every profile has a dry-land fallback plus water variant available only
after eligibility; relationship profile never grants ability. Required beginner
Calistenia/Yoga content is additionally checked against approved spec in delivery review.

At least one free (amount 0) and paid (amount > 0) class per sport; receivers are
`A confirmar` or clearly fictional; all class/venue/contact/price data conspicuously
simulated. Profiles reference their own scenario; baseline first-time history empty,
other seeds explicitly labeled and consistent, not stored point totals. UI copy/legal
review checks meaning, not just schema shape.

Use a blocking useful Spanish configuration-error panel with retry and a concise
field/reference hint, e.g. `No pudimos cargar el contenido. Revisá la configuración e
intentá de nuevo.` and `El plan «cal-first» menciona un ejercicio que no existe.`
Never show raw English exceptions or continue with partially computed rewards.
A small built-in error shell is the necessary exception to editable labels when the
file itself cannot load. HTTP missing, malformed syntax and invalid references must
all be browser-tested, not only validator-unit-tested.

After valid edits, reload discards transient selections and validates saved state.
History snapshots remain historical; removed class/plan selections return to a valid
screen. Editing fixture content takes effect on explicit reset; editing rules/copy
recomputes current views immediately after reload. See [state model](../data-model.md).

## Acceptance boundary

Change a class name AND schedule, reverse a selected plan's ordered exercises, and
change benefit copy in the served JSON; reload and observe all changes without React
edits. Restore the fixture after tests. Check the actual dist JSON route as well as
dev behavior. The eventual `docs/CONTENT_CONFIGURATION.md` must teach these edits,
field/reference validation, adding classes/exercises/plans, fixture dates/reset and
local-versus-deployed behavior; it is a delivery output, not created during planning.

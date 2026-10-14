# Planned content and state model

All types/paths are design targets, not implemented artifacts. See
[content contract](contracts/content.md) for the external JSON boundary.

## Content entities

Stable string IDs identify profiles (`first`, `returning`, `regular`), sports
(`calisthenics`, `yoga`, `swimming`), exercises, plans, classes, challenges, badges,
benefits and fixture records. IDs are immutable identity, never array positions.
Profiles link to default sport/plan and scenario; plans link to sport, profile,
level and nonempty ordered steps; steps have a stable `id` and `exerciseId` so the
same exercise may recur without ambiguous step identity. Exercises belong to one
sport and include title, quantity, technique and local image reference. Water/dry
classification is structural, not guessed from Spanish text. Class selection is
an exact ID plus sport consistency guard. Every profile/sport has a dry/safe plan;
swimming can additionally resolve an eligible water variant for each profile.

## Runtime state

- Content: loading → validated ready OR Spanish blocking error with retry.
- Selection: chosen profile; nullable sport, mode, plan/class IDs; hash route.
- Eligibility: `canSwim` and `safePool` booleans, default false, session-local;
  safePool explicitly acknowledges permitted pool, guardavidas and venue rules.
  Never derive from relationship profile, class interest or past completion.
- Attempt: unique random `attemptId`, immutable profile/sport/plan IDs, ordered
  step ID snapshot, cursor, and status active/completed/abandoned. Transient only.
- Storage state: ready, unavailable, or invalid; in-memory continuation with
  conspicuous Spanish persistence warning if unavailable. Invalid data offers
  scoped recovery, never global clearing or silent claim of durable success.

## Transition rules

Home → sport introduction → solo plan OR class list → active session OR exact class
detail → Mi camino → challenges. Hash routes record only safe navigation identity,
not proof of step completion; hash changes and browser back/forward go through the
same guards as in-app navigation. Missing/stale class or plan IDs return to matching
list/selection; mismatched sport references cannot render. Mi camino/challenges are
always readable for the chosen profile. Optional inspection cannot create an attempt.

`START` requires ready content, matching selection, safe plan and all water gates;
it creates a fresh ID explicitly. `COMPLETE_STEP(attemptId, stepId)` must match the
active attempt and current step. A repeated event carrying the old step ID is a no-op,
not a second advancement. Each accepted event advances exactly one step. Final-step
acceptance atomically constructs one completion and upserts by attempt ID before
showing success. Completion writes occur only on that action, never on mount,
render, navigation, effects, success view or interest. Repeated final events are no-ops.

Changing profile/sport/mode or leaving the active flow abandons incompatible attempts
without credit, clears class/exercise selection and water affirmations. Returning to
a plan requires explicit new start. Refresh discards unfinished transient attempts
and returns to a valid plan/selection without credit. Success refresh may instead
show Mi camino; durable completion identity prevents replay credit. Browser history
never restores an active cursor from URL state. In a mounted app update context state
synchronously through one transition owner; persist the resulting whole envelope.
On storage failure retain in-memory dedup and explain loss of reload persistence;
do not promise exactly-once durability when the browser forbids storage. Concurrent
multi-tab editing is outside the presentation guarantee: storage events reload the
envelope and abandon active transient work to avoid stale overwrites; no distributed
transaction architecture is claimed.

## Durable envelope

One key: `ba-en-movimiento:demo:v1`. Fields: `schemaVersion: 1`, `selectedProfileId`,
`scenarioReferenceDate`, `profiles` keyed by known profile ID. Each profile holds
`baselineHistory`, `completions` keyed by attempt ID, and `interests` keyed by class ID.
No points, badge flags, active-week counts or progress totals are stored.

- Baseline record: fixture ID, profile/sport/plan identity, Spanish display snapshots,
  `activityDate`, origin `seed`. Materialized from validated configuration on initial
  load/reset, not reimported on every render. First-time baseline is empty.
- App completion: attempt ID, originating profile/sport/plan IDs, plan/sport title
  snapshots, dry-land/water classification, completed ordered step IDs, ISO timestamp,
  Buenos Aires `activityDate`, origin `user-simulated`. Complete records remain
  intelligible after content renaming/removal; never remap by position. Stored record
  validation accepts historical retired plan IDs only with valid snapshots and known
  sport/profile identity; unknown sport/profile corruption requires recovery.
- Interest: class ID, originating profile ID, class title/sport snapshots, timestamp,
  origin `simulated-interest`. Upsert gives one visible state per profile/class;
  no incentive selector reads this collection. Removed classes show historical
  interest only, never a substitute class or booking.

Reset is one deliberate labeled action clearing ONLY this key, all app-added data
and transient selections, then rematerializing fixtures for all profiles and selecting
first-time. Leave unrelated localStorage and browser data untouched. If reset write
fails report the persistence limitation. No automatic incompatible-version migration:
show recovery/reset, preserve unrelated data. Git/static rollback needs no DB migration;
if an older build cannot read a future envelope, offer explicit scoped reset.

## Dates, fixtures and incentive derivation

Fixed scenario reference date: **2026-10-14** in `America/Argentina/Buenos_Aires`.
Config fixtures use explicit valid `YYYY-MM-DD` activity dates on/before this date.
Returning seeds end before a visible pause; regular seeds span active weeks; exact
modest records belong to delivery JSON. Label seeded entries `Datos de demostración`.
The reference date anchors reproducible fixtures only, NOT a frozen current clock.
New completions use actual time converted to Buenos Aires. Current weekly/monthly
windows use that same clock; Playwright freezes clock to reference day for presenter
fixture assertions and tests an additional boundary date. Document that older seeded
history can fall outside current windows without disappearing or losing lifetime awards.

Use Monday-start week keys and calendar-month keys in Buenos Aires, not UTC dates
or rolling 7/30-day windows. One eligible history = baseline records union unique app
completions for selected profile. Lifetime points = record count × configured
nonnegative integer points per completion. Challenges declare metric `sessions` or
`activeWeeks`, scope `week` or `month`, and positive target; progress is count in
current window capped only for visual bar, with honest numerator text. Lifetime badges
use configured positive `sessions`/`activeWeeks` thresholds over all history, never
current-period streak loss. Weekly goals are positive configurable session targets
(first-time default one). Benefits are copy linked to optional point threshold,
illustrative, nonredeemable and `sin convenio vigente`; unlocking never enables payment.
Rule edits deliberately recompute display; no hidden duplicate balance. Rest and
window rollover never delete history or lifetime earned points/badges.

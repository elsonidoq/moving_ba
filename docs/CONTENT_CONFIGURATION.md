# Content configuration

Edit public UTF-8 `public/config/app-content.json`; React owns presentation, JSON
owns Spanish content. Never add secrets/personal data/real contacts/HTML. Runtime
`/config/app-content.json` fetch and HTTP response are no-store. Whole-document
validation precedes dependent screens; missing/malformed/reference-invalid content
shows built-in Spanish error and **Intentar de nuevo**, never plausible fallback.

## Schema and stable identities

Keep `schemaVersion: 1`. Copy complete records. Text is nonempty Spanish without
HTML. IDs match `[a-z][a-z0-9-]*`, unique within collection, never labels/positions.
`src/content/types.ts` and `validate.ts` are the executable field/reference contract.

| Collection | Required fields / constraints |
| --- | --- |
| branding | name (`Buenos Aires te mueve`), tagline, demoNotice |
| ui | Every `uiKeys` entry in types.ts, including accessibility/error/unavailable/preview/exit/review labels |
| legal | illustrativeTraining, professionalReview, fictionalClasses, noOfficialStatus, nonredeemable, noAgreement, locationNotice |
| onboarding | startLabel, title, instructions, continueLabel, validationLabel, editTitle, editInstructions; exactly three choices `{id,label}` |
| profiles | Exactly first/returning/regular recommendation categories: id,title,subtitle,welcome,hero,cta,nextPrompt,defaultSportId,defaultPlanId,scenarioId,weeklyGoal (positive integer) |
| sports | Exactly calisthenics/yoga/swimming: id,name,summary,heroAsset,heroAlt,environment,facilities,tips,modes (solo/classes),safetyCopy |
| exercises | id,sportId,title,quantity,technique,medium (dry-land/water),imageAsset (empty),imageAlt,imageId (null or image ID),imageStatus (unavailable/verified) |
| plans | id,sportId,profileId,level,name,description,duration,durationOptions,environment,prerequisites,safetyCopy,medium,ordered steps `{id,exerciseId}` |
| classes | id,sportId,title,schedule,venue,locality,level,requirements,description,receiver,contactCopy,price `{kind:free/paid,amount,currency:ARS}`,fictional:true |
| rules | pointsPerCompletion nonnegative integer; challenges `{id,title,description,metric:sessions/activeWeeks,period:week/month,target}`; badges `{id,title,description,metric,threshold}`; benefits `{id,title,description,disclaimer,pointsThreshold,redeemable:false}`; targets/thresholds positive except pointsThreshold nonnegative |
| scenarios | Retained legacy content fixtures: referenceDate, defaultProfileId:first, profiles `{id,profileId,history:[{id,sportId,planId,activityDate}]}`; not actual initialization/reset data |
| previewScenarios | Exactly sustained/return/inactive/missed-class: id,title,disclosure,guidance,referenceDate,recommendationSituationId,kind (journey/notice),history; notice additionally chatId,notice,activationLabel |
| chats | Exactly missed-class-chat/inactive-chat: id,scenarioId,introduction,disclosure,answers `{id,label,response,destinationId}` |
| destinations | id,label,kind (class/plan/sport),sportId; class requires classId only, plan requires planId only, sport neither |
| images | id,path (null or approved canonical local path),alt,subject `{kind:exercise/sport,id}`,sourceUrl (null or metadata URL),attribution,provenance,licenseStatus (unverified/verified),evidence (null or registry evidence) |

Profile IDs are recommendation categories, never people or swim eligibility. Keep
all nine category/sport dry plans and three swimming-water variants. Default and
chat plans must be safe dry plans in the correct category/sport. Water exercises
only enter swimming-water plans; dry warmups may enter water plans. Both runtime
swimming affirmations remain mandatory regardless of copy. Each sport needs free
(amount 0) and paid (finite positive amount) ARS fictional examples. Receiver/contact
must stay explicitly fictional or `A confirmar`, never booking/contact integration.

Plan `durationOptions` is a display-only ordered numeric list: exactly `[15,30]` for
yoga/calisthenics, `[45,60]` for swimming water and `[15]` for separate dry preparation.
Missing, duplicate, reversed or unsupported options block configuration. `ui.duration`
labels the selector (`Duración estimada`); `ui.durationOption` formats each estimate
with `{minutes}` (currently `{minutes} min`). Keep numeric options and dry/water meaning;
these estimates never change exercises, quantities, photos, start commands or credit.
Selection is local to the Plan view and resets on leave/change/reload, not saved.

Profile headings/empty/count copy use `ui.recentActivity`, `activityEmpty`,
`weeklyCount` (`{count}` and `{goal}`) and `activityCount` (`{count}`). Bars derive from
the selected actual/preview projection, never editable fictional counters. Keep placeholders.

Welcome uses branding name/tagline and onboarding.startLabel; selection title is
`Contanos sobre vos`. Selection instructions and direct profile-edit title/instructions
explain recommendation personalization/history preservation, not a daily mood check.
Legacy nonempty disclaimer fields stay validated but are not rendered as boilerplate.

Exact onboarding labels (not freely replaceable):
- `No estoy entrenando y quiero empezar.`
- `Entrenaba antes y quiero volver.`
- `Ya estoy entrenando.`

Exact scenario titles: `Entrenamiento sostenido`, `Volver después de una pausa`,
`Dejó de entrenar y de usar la app`, `Pensaba asistir a una clase, pero no fue`.
Dates are valid YYYY-MM-DD and history cannot exceed referenceDate; sustained spans
multiple weeks, return precedes its reference. Guidance/notice/disclosure are editable.

Missed-class answer IDs/labels: interruption / `Me surgió algo`; schedule /
`El horario o el lugar no me sirven`; dislike / `No me gustó la actividad`;
discomfort / `No me sentí cómodo/a con el docente o la clase`; skip /
`Prefiero no responder`. Inactive: class / `Volver con una clase`; short-solo /
`Entrenar algo corto por mi cuenta`; other-sport / `Probar otra actividad`; skip /
`Prefiero no responder`. Keep these exact labels/IDs and no Other/free-text case.
Introduction, supportive response and destination label/reference are editable.
Each answer needs its own destination. Interruption/schedule offer exact classes,
dislike another sport, discomfort class or solo, skip a low-pressure plan/sport;
inactive choices map to class/short solo/other sport/low-pressure respectively.
Full validation rejects contradictory/wrong-sport/wrong-category/water/retired references.
Retiring a target requires repairing references, never selecting the next array item.

## Exact local photos

All 29 approved mockup photos are bundled under `/assets/photos/`. Exercise assignments
remain editor-controlled through the JSON `images` collection; `src/content/images.ts`
owns their exact approved JPEG path/subject/evidence allowlist, and JSON cannot grant
approval. Reusing an exercise JPEG is permitted only for explicitly listed equivalent
subjects. Do not infer correspondence from filenames/IDs: visible text matches actual
posture/equipment and stable IDs remain unchanged.

Welcome, Home, notice, sport-card/hero and class photos are deliberately not JSON fields.
`src/content/mockupPhotos.ts` retains the original 14 mockup-role assets and separately maps
an owner-permitted Obelisk welcome JPEG. Home still uses the documented Buenos Aires
city_park photo (31414914), with readable yellow text and local unavailable feedback.
Add or rename those product records only with a matching code-map change; an unknown
class shows honest unavailable feedback rather than a different photo. The three SVGs remain general environment assets and cannot substitute
on a photo-required surface.

The [photo provenance](../public/assets/photos/provenance.json) records owner-satisfied
permission for the complete set, original Pexels URLs, exact license label
`Pexels License (consultar términos)`, acquisition/bytes/hashes/decoding/serving and
visual correspondence observations. Its separate `welcomePhoto` entry records the
GetYourGuide source, owner-confirmed public-use permission and exact bytes; the Pexels
license label applies only to the original mockup set. Consume that evidence; no
reacquisition or renewed rights gate is required for unchanged assets.

A verified assignment needs canonical allowlisted local path, exact subject,
licenseStatus:verified, matching evidence and exercise imageStatus:verified. Spanish
`alt` describes the actual image. Source URLs/attribution are provenance metadata,
never runtime loaders. HTTP/HTTPS/protocol-relative/data/script runtime paths,
backslashes/traversal/encoding/query/fragment tricks and unapproved paths reject.
For pending images use path:null, licenseStatus:unverified, evidence:null and exercise
imageStatus:unavailable (imageId may reference that pending exact subject or be null).
Missing local bytes also render Spanish unavailable feedback while retaining
instructions, without fallback. Safe unavailable feedback is not matching-photo proof.
Adding new subjects/assets requires separate developer authorization/review, not an
editor's self-declared verified flag.

## Local editing and recovery

1. Follow [run commands](../README.md). Dev reads public; built server reads **dist**.
   Rebuild after each repository edit for production-like preview. Build typechecks
   and bundles; it does not validate JSON. Reload/retry validates actual served bytes.
2. Edit branding.tagline, onboarding.startLabel/title/instructions and
   onboarding.editTitle/editInstructions; reload through welcome → selection and Perfil → edit. Keep exact choice labels. Edit a profile hero and
   inspect its actual home recommendation after explicit selection.
3. Edit inactive guidance/notice and inactive-chat introduction/answer response.
   For short-solo, keep its ID/label and select a valid returning dry plan destination
   with matching sportId, e.g. yoga-returning/yoga; edit its destination label.
   Enter inactive from Perfil, activate notice, choose the predefined answer, then
   follow the exact configured destination. It stays preview and cannot start.
4. For `cal-first-shoulders`, copy its verified image record with a new unique ID,
   same path/subject/evidence and updated truthful Spanish alt; reference that ID.
   Actual practice renders that local JPEG. To test unavailable state instead set
   imageId:null/imageStatus:unavailable; instructions remain visible.
5. For a class edit, retain `yoga-free` ID and change title/schedule, then inspect
   `/#/sports/yoga/classes/yoga-free`. For step order edits retain each unique step
   ID/exercise pair. Active attempts keep snapshots until abandoned/new explicit start.
6. Inspect Plan estimates and SportChoice summaries; estimate choice changes display only.
   Restore edits. **Restablecer mis datos** in actual Perfil confirms then writes
   empty unchosen state and returns welcome, never fixtures. Cancel changes nothing. Invalid storage uses
   confirmed recovery. Failed save/reset is tab-only, with honest old-data-may-return
   warning. Only this origin's demo key changes; unrelated keys survive.

Serial reproduction (build first, no other clients sharing mutable dist):

```sh
npm run test:core -- --grep 'content validation'
npm run test:e2e -- --grep 'served profile content recovery'
```

The browser test edits actual dist JSON, observes no-store request/response and
rendered welcome/selection/edit copy, duration formatter, reference/image changes; missing/malformed/reference-invalid content
blocks, restoring bytes and retry recovers. It exercises unsafe paths, pending
assignments and an actually missing local JPEG without remote fallback, restores
exact original JSON/photo bytes in finally, and tears down its owned server.

## History, dates and published boundary

Actual initialization/reset is empty; retained scenarios fixtures never manufacture
history. Explicit preview projections use their own reference dates/history, not
actual state or clock. Actual completions/current goals use Buenos Aires local time,
Monday weeks and calendar months; preference/intention/interest/chat never credit.
Legacy archive records and retired snapshots survive content/preference changes.
Rule edits recompute derived values; only bars cap; rest retains lifetime badges.
Reload/exit/storage events discard attempt/affirmation/preview/chat transients.
No multi-tab transaction guarantee or verified exercise activity is implied.

Repository edits do not change deployed bytes. [Deployment](deployment.md) owns the
current verified production release and authorization boundary; rebuild and separately
authorize any future release.
No CMS, account, remote editor, provider call or automatic Git-push deployment is added.

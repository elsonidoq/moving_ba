# Feature Specification: One-person profile and habit-support demo

**Feature Branch**: No new branch required; feature identity `002-profile-habit-demo`.

**Created**: 2026-10-14

**Status**: Draft — Standard preparation only; specification approval required before planning. No implementation authorization.

**Input**: Owner-selected Standard scope: evolve the existing demo into `Buenos Aires te mueve`, one person's durable journey, editable recommendation preference, ephemeral same-person scenarios, and scripted habit support. The photographic mockup is reference only, not an approved operational contract. Withdrawn TinySpec content/approval is not reused.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose today's starting point without losing my journey (Priority: P1)

As one person, I choose my current situation once and can revise recommendations without becoming a different person or losing what I have done.

**Why this priority**: Establishes the single-person experience and protects existing browser history before other flows rely on it.

**Independent Test**: In fresh and legacy-data browsers, choose a situation, reload, edit it in the profile, and compare actual records before/after.

**Acceptance Scenarios**:

1. **Given** no explicit onboarding choice, **When** I open the app, including an old profile hash, **Then** onboarding asks exactly: `No estoy entrenando y quiero empezar.`, `Entrenaba antes y quiero volver.`, and `Ya estoy entrenando.`; nothing is preselected, continuation requires a choice, and there is no separate welcome screen.
2. **Given** I choose and continue, **When** I reload, **Then** my choice persists if storage works and the narrative home recommends suitable existing practices; denied storage instead clearly warns that the choice lasts only in this tab.
3. **Given** actual history, achievements, interests and an intended class, **When** I edit my situation in the profile, **Then** recommendations change but those records and earned achievements remain unchanged; time, inactivity, completions and hashes never silently change my preference.
4. **Given** a valid legacy envelope containing all three profiles, **When** it is first opened and opened again, **Then** all valid legacy records and their provenance survive deterministic one-person compatibility handling, no records are reseeded, and legacy selected-profile identity does not count as completed onboarding.
5. **Given** actual and transient demo state plus unrelated browser storage, **When** I cancel reset, **Then** nothing changes; **When** I confirm reset, **Then** only this demo's actual state is cleared, attempts/previews/answers/affirmations are discarded, and unchosen onboarding returns without fixture history being reintroduced. A failed durable reset is visibly reported, not claimed successful.

### User Story 2 - Find a practice or declare a class intention (Priority: P1)

As that person, I navigate directly to sports or classes, follow a safe illustrated practice, or save a simulated plan to attend a class without confusing it with attendance.

**Why this priority**: Delivers the core usable demonstration while retaining its completion and swimming safeguards.

**Independent Test**: Browse each sport's solo/class branches, declare an intention, and complete one ordered practice with back/replay/reload checks.

**Acceptance Scenarios**:

1. **Given** completed onboarding, **When** I use `Inicio`, `Deportes`, `Clases`, or the top-right circular profile control, **Then** each opens its named destination; sports are directly accessible, classes can be explored across sports without first entering a sport, and back returns to the relevant prior list/detail/plan rather than an unrelated landing page. Global profile-dropdown, journey, challenge and achievement controls are absent; journey/rewards remain available inside the profile.
2. **Given** home/sport/class cards, **When** I inspect them, **Then** the yellow narrative hierarchy and normal document scrolling remain, nearby locations/distances are explicitly illustrative, and no geolocation permission or verified-proximity claim appears.
3. **Given** an exact class detail, **When** I choose `Voy a ir`, **Then** a separately labeled simulated intention is saved and home shows its upcoming-class card; repeating the same action does not duplicate it. Existing class interest remains distinct and neither action creates a reservation, place, attendance record, session, points or achievement.
4. **Given** a configured plan, **When** I preview it and start a simulated attempt, **Then** its ordered steps show the exact exercise's name, quantity, instructions and corresponding image, not a generic sport photo presented as that exercise. Previous permits review; next cannot bypass explicit ordered acceptance of any step or accept an already accepted step twice. Only explicit final acceptance after all steps gives one completion for that attempt UUID.
5. **Given** swimming, **When** either ability or permitted supervised-pool affirmation is missing, **Then** water start is blocked regardless of preference/history/hash; dry preparation and instructor-led class exploration remain available. Both separate affirmations are necessary, are not saved as enduring eligibility, and are cleared on leaving/reload/reset.

### User Story 3 - Explore another moment without changing today (Priority: P2)

As a presenter or participant, I explore four named moments of the same person from the profile while my actual journey remains intact.

**Why this priority**: Makes the habit narrative demonstrable without destructive profile switching or invented real progress.

**Independent Test**: Capture actual state, enter every scenario, inspect profile/home or notification/chat as appropriate, exit/reload, and compare the actual state.

**Acceptance Scenarios**:

1. **Given** the profile, **When** I choose `Entrenamiento sostenido` or `Volver después de una pausa`, **Then** a visibly simulated same-person view shows sustained progress or supportive return guidance, respectively; neither creates another durable person or replaces actual history.
2. **Given** any scenario, **When** I browse its available destinations, **Then** a simulation label and `Volver a hoy` remain available, the actual upcoming-class card is hidden, and no actual preference/history/interest/intention/reward/storage mutation occurs. Preview does not persist across reload.
3. **Given** a preview class or plan, **When** I want a durable action (including situation edit/reset, interest, intention or session start), **Then** I must explicitly exit preview before that action is available; exit itself does not perform the action. Hash changes and browser history cannot evade this boundary.
4. **Given** any preview, **When** I choose `Volver a hoy`, **Then** actual recommendations, history and upcoming intention reappear unchanged, with preview and scripted answers removed.

### User Story 4 - Receive supportive scripted alternatives (Priority: P2)

As that person in a simulated inactivity or missed-class moment, I open a simulated notification and choose a predefined answer that leads to a useful next step without judgment or a fake AI interaction.

**Why this priority**: Demonstrates the proposed support interaction honestly without building notifications, inference or sensitive-data collection.

**Independent Test**: Enter both notification scenarios, select every answer including skip, and follow each offered destination.

**Acceptance Scenarios**:

1. **Given** `Dejó de entrenar y de usar la app` or `Pensaba asistir a una clase, pero no fue`, **When** I select it, **Then** an in-app simulated notice opens, not home; activating the notice opens the corresponding scripted chat, with bottom tabs hidden on notice and chat.
2. **Given** missed-class chat, **When** its choices appear, **Then** exactly the five cases are supported: an interruption (`Me surgió algo`), inconvenient schedule/location (`El horario o el lugar no me sirven`), disliked activity (`No me gustó la actividad`), discomfort with instructor/class (`No me sentí cómodo/a con el docente o la clase`), and skip (`Prefiero no responder`). Every response acknowledges the choice supportively without requesting an explanation.
3. **Given** inactivity chat, **When** its choices appear, **Then** predefined choices offer `Volver con una clase`, `Entrenar algo corto por mi cuenta`, `Probar otra actividad`, and `Prefiero no responder`.
4. **Given** any answer or skip, **When** I continue, **Then** I can open a valid configured existing class, solo plan or sport destination: interruption offers another class opportunity, schedule/location offers an alternative class, dislike offers another sport/activity, discomfort offers another group or solo practice, and skip offers a low-pressure next step. The destination remains preview-only until explicit exit.
5. **Given** either chat, **When** I inspect/leave/reload it, **Then** it is visibly a scripted demonstration, future AI is described only as future, there is no free-text input, `Otra cosa`, fake AI handoff or network/provider request, answers are not stored, and no attendance/absence/penalty is inferred or recorded.

### Edge Cases

- Missing, malformed or reference-invalid configuration blocks dependent views with Spanish retry/error feedback, never plausible fallback content.
- Duplicate/unknown scenario, chat, answer, image or destination IDs fail validation; retired destinations offer a safe existing destination or unavailable feedback, never a different item occupying the old array position.
- An invalid stored envelope is preserved untouched pending confirmed scoped reset; demo actions cannot overwrite it. Denied reads/writes allow clearly labeled in-tab use without durability promises.
- Cross-profile legacy record IDs and class-interest keys may collide. Distinct source records must survive; identical text/IDs alone never prove they are duplicates. Retired plan/class snapshots remain readable without forcing current references to exist.
- Repeated migration/reload, changed fixtures or preference, duplicate final activation, stale attempt/success hashes, back/forward, partial exit and storage events cannot reseed, manufacture or double-credit history.
- A storage event invalidates active attempts/affirmations and transient previews safely; it cannot be treated as onboarding consent or a scenario transition. No multi-tab transaction guarantee is introduced.
- Buenos Aires midnight, Monday week boundaries and calendar-month changes alter current-window progress only, never preference or lifetime earned history. An illustrative upcoming card is not an attendance detector when its time passes.
- Missing/unapproved photos are not silently replaced by remote images or misleading exact-exercise claims. A safe Spanish unavailable-image state preserves instructions; photo readiness remains an explicit unmet criterion until permitted matching local assets exist.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001 — Identity and honesty**: Use `Buenos Aires te mueve` for user-facing branding. All UI, alternative text, accessible names, loading/error/empty/success copy is Spanish. Engineering artifacts remain English. Preserve visible fictional/nonofficial, illustrative-training/professional-review, no-real-booking/contact and nonredeemable/no-agreement disclosures. Do not adopt the mockup's official-looking `Buenos Aires Ciudad` logo, navy device frame, lock-screen impersonation or fixed-height nested-scroll styling.
- **FR-002 — One person**: Onboarding and profile editing use exactly the three situations in Story 1 as recommendation preferences, not separate identities or swim eligibility. Store explicit choice/confirmation independently from legacy selection. New/reset state has no selected situation and no manufactured completed history; saved valid history is never replaced by selecting a situation. No automatic time/inactivity transition or separate welcome stage.
- **FR-003 — Navigation and home**: Provide the circular top-right profile, bottom `Inicio`/`Deportes`/`Clases`, direct sport access, cross-sport class exploration and contextual back. Hide bottom tabs on onboarding, notice and chat. Move journey/challenges/achievements inside the profile; preserve their useful views and next-step links. Keep yellow narrative home/cards, rounded hierarchy and regular page scrolling; illustrative locations/distances must say demo, with no geolocation or maps integration.
- **FR-004 — Class contracts**: Preserve stable exact-class identity, title, schedule, fictional venue/locality, level, requirements, description, receiver/contact simulation and free/paid ARS examples for every sport. Keep interest registration idempotent and distinct from one current simulated intended class. Choosing a different `Voy a ir` replaces the upcoming intention, not prior interests/history. Show the intended class snapshot on actual home, not in previews; removed offerings retain the snapshot with honest unavailability and no misrouting. Intention is not booking, reserved capacity, attendance, completion or reward input.
- **FR-005 — Configurable practice**: Plan metadata, ordered step IDs, exact exercise references, instructions/quantity, safety and image assignments remain configurable. Preserve safe dry plans for all three situations and Calistenia/Yoga/Natación, plus guarded swimming-water variants. Do not import the mockup's five-step counts, higher loads or fixed reward counters as requirements. An active attempt retains its selected ordered exercise snapshots.
- **FR-006 — Completion integrity**: Only explicit start creates a fresh attempt UUID. Credit requires explicit acceptance of every step in order with matching active attempt/current step identity. Previous/review never changes accepted history; next cannot skip acceptance, and revisiting accepted steps cannot add credit. Final acceptance atomically creates at most one completion per attempt, including ordered step IDs, plan/sport snapshots, date/time and user-simulated provenance. Double clicks, replay, navigation, inspection, interest/intention, partial/abandoned work and forged URLs never grant credit. Reload/exit abandons unfinished work; success is available only for a genuine stored completion.
- **FR-007 — Safety**: Preserve stop-on-pain, stable supports, adaptations, rest and professional-review guidance. Water start requires BOTH autonomous swimming ability AND a permitted pool supervised by guardavidas with local rules respected, checked at the action boundary, not merely by disabling a button. Neither preference, history, scenario, content nor hash grants eligibility. Keep a safe dry default/alternative and instructor route for learning; a water plan may contain dry warmup but dry plans cannot contain water exercises.
- **FR-008 — Profile and derived progress**: Actual profile exposes history, original seed versus user-simulated labels, lifetime sessions/points/active weeks, current goals/challenges, achievements and illustrative benefits. Derive these from unique eligible completion history, never independent mutable counters or interests/intention/chat. Preserve Buenos Aires local dates (`America/Argentina/Buenos_Aires`), Monday-start weeks and calendar months; exclude later-than-today dates from current windows, retain uncapped numeric progress (only visual bars cap), and never erase lifetime achievements because of rest.
- **FR-009 — Ephemeral scenarios**: Provide exactly the four named same-person scenarios in Stories 3–4, entered deliberately through profile. Scenario examples/reference dates remain labeled, configurable and separate from actual history/clock. Preview, its navigation and chat are nonmutating; actual upcoming card is hidden; explicit `Volver a hoy` restores actual state. Durable actions require exit first and a separate actual action. Reload drops preview, never restores it as actual state.
- **FR-010 — Scripted support**: Notification scenarios open notice then selectable scripted chat, never home as an intermediate replacement. Implement exactly the missed-class cases and inactivity choices in Story 4, including skip. Each has supportive Spanish response and a validated usable existing destination. No free text, `Otra cosa`, genuine/pseudo AI handoff, real push, provider, attendance detection, absence record, penalty or persisted sensitive response. Future AI is only an explicitly future possibility.
- **FR-011 — Runtime content boundary**: Retain runtime JSON fetch with no-store and complete validation before rendering dependent views. All new Spanish copy, image assignments/provenance, scenario/chat/answer/destination IDs and references are configurable; built-in Spanish loading/retry/error feedback must still work when configuration is unavailable. Render content as text, never executable HTML. Stable IDs, not array positions or translated labels, determine identity. Preserve existing reference/sport/medium/date/numeric/fictional-content guards while extending validation for the new contracts.
- **FR-012 — Safe photo boundary**: Only approved bundled-local photos may be configured for runtime display, with an explicit allowed local path, source/provenance, license verification status, Spanish alt and matching subject. Reject remote/protocol-relative/data/script URLs, traversal and unapproved paths; do not copy the mockup's CDN fallback or downloader into runtime. A general sport image must not masquerade as an exact exercise. Pexels licensing/download remains **NOT VERIFIED**: supplied evidence reports a prior license GET 403 and no bundled photos; manifest/CSV titles are references, not proof of rights or visual correspondence. No download, redistribution or reuse claim is authorized by this spec. Required photo delivery needs separately permitted verified assets; otherwise report the photo criterion unmet.
- **FR-013 — Lossless compatibility**: Continue using only schema-1 demo key `ba-en-movimiento:demo:v1` for actual persisted state. Recognize previously valid three-profile data against its legacy contract, independent of new content structure. Deterministically expose its valid baseline histories, completions and interests as one person's preserved legacy journey, retaining original profile provenance, origins, attempt IDs, dates and retired title/plan/class snapshots. Preserve all distinct colliding records using their source identity; deduplicate only the same originating completion/attempt, not equal bare IDs across legacy profiles. Repeated compatibility handling must have identical logical output and cannot multiply credit, discard data, reseed or overwrite unrelated browser keys. Technical representation is for the plan, but these preservation outcomes are mandatory.
- **FR-014 — Storage safety and reset**: Persist explicit preference/intention independently of preview/hash identity. A legacy selected profile supplies neither consent nor a chosen onboarding answer. Invalid data remains unmodified and blocks durable mutations until confirmed demo-only reset. Unavailable storage supports warning-labeled in-tab state, including choice/reset, without claiming save or durable deletion; old durable data may return after reload if reset could not be saved, and the message must say so. Reset confirmation and cancellation apply to every reset/recovery entry point; confirmed reset clears only this demo's actual state and returns to unchosen onboarding, preserving unrelated browser data and never reseeding legacy examples.
- **FR-015 — Routing and accessibility**: Preserve guarded stable-ID hash navigation and safe reload/back/forward. Unknown, retired, wrong-sport, forged attempt/success and scenario URLs cannot grant completion, eligibility, onboarding proof or a preference write. Onboarding wins over deep links until an explicit choice. Maintain keyboard operation, visible focus, meaningful heading/focus transitions, skip-to-content, semantic status/error feedback, Spanish image alternatives, at least 44px interactive targets, reduced-motion support and no horizontal overflow at representative 360px and 1280px widths. Bottom navigation must not cover content or focused actions.

### Key Entities *(include if feature involves data)*

- **Person journey**: One durable demo subject; actual valid completion history, preserved legacy provenance and derived progress. Not an account or three switchable people.
- **Situation preference**: Explicitly confirmed one-of-three recommendation choice; editable independently of journey, interest and intention.
- **Completion / attempt**: Transient uniquely identified ordered practice; one immutable completion snapshot after final acceptance, source identity and seed/user-simulated origin preserved.
- **Class interest / intention**: Distinct simulated signals; interests may cover multiple classes, intention identifies one current upcoming class snapshot; neither proves attendance.
- **Content and image assignment**: Validated configurable copy, sport/plan/exercise/class/rule identities and safe local image/provenance references.
- **Scenario / scripted exchange / destination**: Four transient same-person demonstrations; predefined answer/response and valid existing destination, never durable personal responses or actual history.

### Scope and Exclusions

Included: onboarding/profile/navigation/home refinements, distinct class intention, exact-exercise imagery contract, safe practice review, ephemeral scenarios/scripted chats, runtime content extension and lossless browser-state compatibility.

Excluded: backend, database/schema owner, authentication, new dependencies, deployment/redeployment, real geolocation/maps, push/OS notifications, AI/provider services, free-text/sensitive response storage, real attendance or bookings, capacity/payments/contacts/partner integrations, exercise prescriptions or automatic progression. This preparation does not change app, tests, content, assets, photos, downloads, documentation, deployment, dependency, STATE, guidelines or memory files.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Each of the three unselected onboarding choices can lead to a distinct suitable recommendation and survive reload when saving works; editing any choice changes recommendations with zero changes to actual records/intention/earned history.
- **SC-002**: From actual home, all three sports and both solo/class paths are reachable; bottom classes explores all sports directly. Each exact class's intention survives reload with one upcoming card and zero completion/reward changes; interest remains separately observable.
- **SC-003**: In a representative practice, every configured step's exact instructions/image assignment is shown; previous/review/repeated final activation yields exactly one completed session only after ordered explicit acceptance. All four swimming-affirmation combinations allow water only for both true.
- **SC-004**: All four scenarios can be entered and explicitly exited; every preview action leaves actual state unchanged and hides its upcoming card. Both notice activations open chat, and all five missed-class plus all four inactivity answers, including skip, reach valid useful destinations without storing answers.
- **SC-005**: Representative valid legacy data retains every distinct record/provenance/snapshot and yields identical one-person logical results on repeated loading, including colliding IDs and retired offerings. No reseed, unrelated-key change or hash-driven preference write occurs. Cancelled reset changes nothing; confirmed reset returns to empty unchosen onboarding, with honest failure feedback if saving is unavailable.
- **SC-006**: Invalid/unavailable content/storage and unsafe image/destination references produce Spanish blocking/recovery or warning behavior as appropriate, never unapproved remote image loads, fabricated saved state or credited activity. The required new journeys remain keyboard-usable and readable at 360px and 1280px with visible focus, 44px targets and no horizontal overflow.

## Assumptions

- The existing browser-only demo and origin-local storage remain the environment; no dependency or service change is needed. Current yellow presentation and safety/date/completion behavior, not mockup counters or branding devices, are the baseline to retain.
- A singular upcoming intention is sufficient: a new choice replaces that intention only. Passing time does not confirm attendance or automatically choose a scenario.
- New/reset actual history starts empty. Existing valid seeded history survives compatibility with its demo provenance; new illustrative scenario history lives only in previews.
- Exact exercise photos are a delivery constraint, not proof that the reference manifest's photos are available, licensed or correct. Verified permitted local assets are a prerequisite to claiming photo acceptance; safe unavailable-image feedback alone does not satisfy SC-003's matching-image outcome.
- No material product conflict is currently unresolved. Any discovery requiring loss of valid legacy data, weakened guards, remote/unverified photo use or a different product flow is `NEEDS_OWNER_DECISION`, not an implementation default.

### Source Evidence and Required Later Verification

- Behavioral reference: [mockup](../../docs/mockup_ba_te_mueve/index.html), [reference notes](../../docs/mockup_ba_te_mueve/LEEME.md), [image manifest](../../docs/mockup_ba_te_mueve/assets/image_manifest.json), [source CSV](../../docs/mockup_ba_te_mueve/fuentes_fotos.csv), and [downloader](../../docs/mockup_ba_te_mueve/descargar_fotos.py) were inspected read-only. Reference wording/situations/scenarios inform this scope; its welcome, remote fallbacks, direct counters, booking language and unsafe shortcuts do not.
- Existing contracts inspected: [architecture](../../docs/architecture.md), [content guide](../../docs/CONTENT_CONFIGURATION.md), actual [storage](../../src/state/storage.ts), [transitions](../../src/state/session.ts), [navigation](../../src/state/navigation.ts), [selectors](../../src/state/selectors.ts), [validator](../../src/content/validate.ts), app/screens/styles, runtime content and [core](../../tests/core.spec.ts), [content](../../tests/content.spec.ts), [browser](../../tests/smoke.spec.ts) tests. Existing tests encode three isolated profiles and will need scoped adaptation, not blind reuse as new acceptance proof.
- Dependency evidence reuse: local package/version declarations and architecture guidance cover React 19.2.0, TypeScript 5.9.3, Vite 7.2.2 and Playwright 1.56.1. No new dependency or internet research is needed for this behavioral specification; no research-document write is authorized. Existing audit issue [OI-1](../../docs/open_issues.md#oi-1--assess-reported-dependency-audit-warnings) remains separate and unchanged.
- **REQUIRED later, NOT RUN here**: focused tests of the actual compatibility/storage helpers must prove losslessness, collisions, retired snapshots, repeated loads/no reseed, unrelated-key preservation, invalid/unavailable/reset behavior and preference/preview/hash nonmutation before dependent UI relies on migration. This bounded known seam warrants permanent actual-helper proof, not a separate disposable prototype chain.
- **REQUIRED later, NOT RUN here**: the smallest composed browser checks must observe persisted state plus rendered outcomes across onboarding/edit/reload, intention versus interest/completion, preview/notice/chat/destination/explicit exit, reset, ordered previous/next/double-final acceptance and swimming guards. Include actual served-content edits/retry for new configurable copy/IDs/image assignments, safe-path rejection, Buenos Aires date regression and representative responsive/keyboard checks. Helper-only green results cannot establish these composed boundaries; no broad coverage quota, provider/live deployment or exhaustive browser matrix is required.

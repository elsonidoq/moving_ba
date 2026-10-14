# Feature Specification: BA en movimiento — sustained-practice demo

**Feature Branch**: `main` (unchanged; feature directories are branch-independent)

**Created**: 2026-10-14

**Status**: Draft — source prepared; owner specification approval required before planning

**Input**: Owner's single-spec implementation request, retained in parent Pi session `01a13b78-0816-761c-b365-b0f6a1626d51`, supplied in full scope to this specification producer. This document consolidates the entire demo, not separate sport or increment specifications.

## User Scenarios & Testing *(mandatory)*

BA en movimiento proposes sustained, enjoyable physical practice: help people start, continue, return, and progress. It is not primarily a class or facility directory. First-time, returning, and regular describe a relationship with exercise, not demographic categories. Calistenia, Yoga, and Natación are all meaningful experiences.

The [actual v2 HTML](../../docs/mockup_ba_en_movimiento_v2.html) is the approved visual authority for composition, six conceptual stages, and environment artwork, not an operational behavior contract. Its invented first-time history, independent point totals, and illustrative swimming flow must not override the requirements below. GCBA is only a possible partner, never a confirmed sponsor, integration, or official identity. Fabri is a prospective contributor, not a prerequisite for each session. Prescriptions are illustrative and require qualified review before real training use.

### User Story 1 - Choose a suitable practice and complete a solo session (Priority: P1)

As someone starting, returning, or already training, I can choose my sport and a suitable practice, understand its prerequisites, and walk through a simulated session without pressure or waiting.

**Why this priority**: The visual narrative and a concrete training journey establish the product's value beyond a directory.

**Independent Test**: From a reset scenario, inspect each profile and sport, choose solo practice, and explicitly advance its steps; verify suitable content, safety, and one completion.

**Acceptance Scenarios**:

1. **Given** any selected profile on Home, **When** I tap any of the three sport cards, **Then** I immediately reach that sport's introduction and both participation choices; a picture-only update does not qualify.
2. **Given** a selected sport, **When** I choose `Entrenar por mi cuenta`, **Then** I see its profile-appropriate ordered plan, duration, level, environment, prerequisites, quantities, technique hints, and illustrative disclaimer.
3. **Given** beginner Calistenia, **When** I inspect the plan, **Then** shoulder mobility, inverted rows, and supported squats are available with no pull-up prerequisite; regular practice offers credible control/progression instead.
4. **Given** Yoga, **When** I compare first-time/returning and regular practice, **Then** breathing, mobility, and gentle postures support starting or returning, while regular practice offers distinct controlled progression.
5. **Given** Natación and no affirmative swimming ability, **When** I choose solo practice or try to start an in-water session, **Then** I can only use dry-land preparation or an instructor redirect; in-water sets require already knowing how to swim and a permitted supervised pool with guardavidas.
6. **Given** an eligible started session, **When** I explicitly complete each configured step, **Then** the current exercise, quantities, technique, and progress advance without timers or waits, ending in humane congratulations and a concrete next step.
7. **Given** a finished session, **When** I tap repeatedly, rerender, refresh, go back/forward, or revisit success, **Then** its completion contributes to history and incentives exactly once; no physical activity verification is implied.

### User Story 2 - Explore a class and express simulated interest (Priority: P1)

As a participant seeking accompaniment, I can compare meaningful free and paid examples for my sport and inspect the exact class I selected without mistaking a demo interaction for a booking.

**Why this priority**: Both paths must work for all three sports, rather than making classes or one sport a placeholder.

**Independent Test**: Open both class examples for each sport and register interest; compare detail identity and confirm that training history and incentives do not change.

**Acceptance Scenarios**:

1. **Given** any sport, **When** I choose `Sumarme a una clase`, **Then** I immediately see at least one free and one paid configured class for that sport, with distinct stable identities and meaningful information.
2. **Given** either class, **When** I open it, **Then** its own title, schedule, venue/locality, price, level, requirements, description/what to expect, and receiver appear, with receiver `A confirmar` or explicitly fictional.
3. **Given** a class detail, **When** I select `Me interesa esta clase`, **Then** visible feedback records only simulated interest and offers a useful onward path; no request is sent, booking/capacity is promised, attendance/completion is recorded, or points, streaks, badges, or rewards are granted.
4. **Given** a selected class or active solo step, **When** I switch sport, path, or profile and return, **Then** no prior-sport exercises or wrong-class details leak into the new context.

### User Story 3 - Find continuity, progress, and honest incentives (Priority: P2)

As a participant, I can see a consistent personal journey, a gentle weekly goal, and a relevant next action; my progress survives reload and does not punish rest.

**Why this priority**: Adherence and progression are central, while rewards support rather than replace the practice narrative.

**Independent Test**: Compare reset profiles, finish a solo session, inspect Mi camino and challenges, reload, switch profiles, and reset; independently recompute all displayed outcomes from history and rules.

**Acceptance Scenarios**:

1. **Given** the first-time reset scenario, **When** I open Mi camino, **Then** I see no invented past sessions or years, an attainable first-session goal, and a relevant next practice.
2. **Given** returning or regular scenarios, **When** I view the journey, **Then** returning recognizes seeded past progress and a pause without shame, while regular emphasizes consistency, new skills, progression, and recovery; seeded history is explicitly labeled demonstration data.
3. **Given** an eligible solo completion, **When** I visit Mi camino and challenges, **Then** history, stats, active weeks, weekly progress, points, challenge progress, and earned badges immediately agree with the same history and configured rules and remain consistent after refresh.
4. **Given** days of rest or a missed goal, **When** I view progress, **Then** prior achievements are not punitively erased, no competitive pressure is introduced, and a concrete next step remains available.
5. **Given** a potential benefit, **When** I inspect it, **Then** it is clearly illustrative, `sin convenio vigente`, and nonredeemable, with no payment or real partner offer.
6. **Given** profile-isolated histories and interests, **When** I switch profile and then deliberately reset the demo, **Then** profile data never blends and reset restores reproducible fixtures while leaving unrelated browser data untouched.

### User Story 4 - Edit and present a reliable configured demo (Priority: P2)

As a content editor or presenter, I can change meaningful content independently of presentation code and show a short, coherent demo on a phone or desktop.

**Why this priority**: External editable content and a fast deployable build are explicit delivery requirements; no CMS or production service is needed.

**Independent Test**: Edit the public configuration's class name/schedule, plan order, and reward text, reload, and inspect those changes; test missing/malformed content, then rehearse the presenter story and local start.

**Acceptance Scenarios**:

1. **Given** valid edited configuration, **When** the demo reloads with that file served, **Then** the changed class title/schedule, plan sequence, and reward copy appear without presentation-code edits.
2. **Given** missing or malformed configuration, **When** the demo loads, **Then** a useful Spanish error replaces the affected experience rather than a crash, blank screen, or silently misleading fallback.
3. **Given** narrow-phone or desktop presentation, **When** I traverse the six concepts using keyboard or taps, **Then** the approved style remains coherent in a single app viewport, controls work, and content is readable.
4. **Given** a selected sport and eligible session, **When** I tap through the demo, **Then** simulated completion takes under approximately 90 seconds without real exercise waits; the principal presenter story takes approximately 3–5 minutes without accounts.
5. **Given** optional stage-inspection controls, **When** I jump ahead, **Then** no skipped workout receives credit and no class detail can render without a valid selected class.

### Edge Cases

- Repeated final-step activation, refresh at success, revisited success, and navigation replay must not create another completion. A deliberately started new session is a separate opportunity, even for the same plan.
- Switching profile/sport/path abandons incompatible active exercise/class selection without credit; completed records remain with their originating profile.
- Refresh or a deep navigation target without prerequisites returns to a sensible valid selection screen, never invented details. In-app back is required; browser back/forward should be supported and must never duplicate credit.
- Unknown IDs, duplicate IDs, broken references, empty exercise sequences, missing required classes/content, and invalid rule values must produce useful Spanish validation feedback rather than wrong-sport data or partial incentives.
- An unknown/negative swimming-ability answer is not permission for in-water practice. Exercise-relationship profile is not evidence of swimming ability, including for regular exercisers.
- Interrupted sessions receive no completion credit. Interest-only records remain separate even if the same person later completes a solo session.
- Missing browser storage or invalid stored demo data must not crash the app: explain any persistence limitation in Spanish and offer a scoped reset/recovery without clearing other applications' data.
- Editing content cannot turn a stale selected class or removed exercise into a different item by position. Invalid saved selections return to a valid choice; persisted earned history is not silently reinterpreted as another sport.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001 — Purpose and honesty**: The app MUST foreground enjoyable ongoing practice, not tourism or facility browsing; identify training, metrics, classes, and benefits as simulations conspicuously but unobtrusively. It MUST NOT claim validated behavior/health outcomes, official GCBA status, confirmed sponsors/integrations, real municipal courses, or required Fabri attendance.
- **FR-002 — Visual authority**: The six conceptual stages MUST retain the mockup's composition, rounded cards, hierarchy, white/yellow `#FFD500`/sky `#29BDEF`/mint `#A7D5C2`/dark-neutral palette, and one primary action per view. Reuse the attractive sport-specific park-bars, yoga-mat, and pool SVG environment artwork; do not introduce rejected human stick figures. Use a mobile-first coherent single app viewport, centered on desktop, with optional presentation controls rather than a mandatory six-phone strip.
- **FR-003 — Home/profile**: Home MUST have a profile-adaptive welcome/hero, prominent training/continuity, and three immediately navigable sport cards. An accessible, login-free selector MUST expose `Es mi primera vez`, `Estoy retomando`, and `Ya entreno regularmente`, with distinct content/defaults/next prompts.
- **FR-004 — Sport choice**: Each selected sport MUST show matching art, context, and safety information plus both explicit choices `Entrenar por mi cuenta` and `Sumarme a una clase`; each choice immediately opens its matching branch. Back and sport/path/profile changes MUST clear incompatible transient selection.
- **FR-005 — Personal plans**: Every sport/profile combination MUST resolve to a concrete suitable plan with stable identity, name, description, duration, level, environment, prerequisites/safety, ordered exercise references, quantities, and technique hints. Starting/returning Calistenia includes shoulder mobility, inverted rows, supported squats, and no pull-up prerequisite; regular Calistenia emphasizes controlled progression. Starting/returning Yoga includes breathing, mobility, and gentle adapted postures; regular Yoga has distinct progression. Returning content reduces pressure after a pause, not just changes a heading.
- **FR-006 — Swimming eligibility**: Solo Natación MUST remain visible, with an enforced safe dry-land preparation or instructor-directed state for non-swimmers. In-water sets are available ONLY to already-swimmers who affirm a permitted supervised pool with guardavidas and venue rules. No app-taught swimming alone is allowed. Safety conditions MUST gate start, not appear only as fine print.
- **FR-007 — Guided practice**: Eligible plans MUST offer `Empezar sesión`, current exercise quantities/technique/progress, explicit complete-step advancement, illustrative qualified-review disclaimer, and completion congratulations plus a concrete next action. No timer wait, pain-through instruction, GPS, sensor, or verification of physical activity is permitted.
- **FR-008 — Completion integrity**: Only explicit completion of all required steps of a started solo session MUST add one simulated completion. Each attempt's completion MUST be idempotent across repeated taps, rerenders, refresh, back/forward, and success revisits. Preview, stage jumps, partial sessions, and class interest MUST never earn completion credit. Starting a new attempt is explicit.
- **FR-009 — Class catalog**: Each sport MUST have at least one free and one paid configured class (six minimum), each with a stable ID, sport reference, title, venue/locality, schedule, level, requirements, price, description, and host/receiver `A confirmar` or explicitly fictional. Paid examples MUST have an explicit illustrative price, not an ambiguous real offer. All venues, contacts, instructors, costs, and availability MUST be identified as invented/demo; no confirmed municipal course is implied.
- **FR-010 — Class detail/interest**: Selecting a class MUST show that exact class's schedule, price, level, requirements, what to expect, and receiver. `Me interesa esta clase` MUST persist only simulated interest with visible feedback and an onward path, never a sent request, booking, capacity guarantee, attendance, training completion, points, streaks, badges, or reward.
- **FR-011 — Mi camino**: Mi camino MUST be a central destination with consistent history/stats, humane weekly goal, activity over weeks, concrete profile-appropriate next step, and links to challenges and another relevant session. First-time starts without fabricated history; returning recognizes past progress and gentle restart without shame; regular supports consistency and skills/progression. New completions MUST be immediately reflected. Rest is normal, not punitive streak loss or aggressive competition. Any reminders are in-app only.
- **FR-012 — Derived incentives**: Points, flexible weekly/monthly challenge progress, badge unlocks, and displayed achievement state MUST be deterministic derivations of configured rules and the profile's explicitly seeded history plus genuine user-triggered simulated solo completions. No unrelated mutable totals are permitted. Potential discounts MUST state `sin convenio vigente`, be illustrative/nonredeemable, and involve no real partner, payment, or offer. Rest MUST remain compatible with goals.
- **FR-013 — External content**: A populated human-editable runtime-fetched `public/config/app-content.json`, served at stable public path `/config/app-content.json`, MUST control the content contract below. Bundled-import-only data or hardcoded TypeScript product content does not satisfy this requirement. Stable IDs, not numeric array positions, MUST establish references and selections. Lightweight validation MUST catch missing/malformed content and invalid references with useful Spanish errors.
- **FR-014 — Persistence/reset**: Modest local state MUST persist chosen profile and profile-isolated completion and interest histories across reload. A deliberate reset MUST clear only this demo's state and restore consistent documented scenario fixtures. Seeded historical baseline MUST be distinguished from app-created completions in both documentation and displayed history; no seed totals may contradict their records.
- **FR-015 — Navigation/presentation**: Home → sport choice → plan/classes → guided session/class detail → journey → challenges MUST form a coherent navigable experience with in-app back and sensible refresh. Browser back/forward is preferred. Optional quick inspection MUST respect selection/safety/credit prerequisites. Every affordance MUST act meaningfully or be removed; unsupported screens/actions cannot be decorative promises.
- **FR-016 — Accessibility/language**: All visible app text, errors, and accessible labels MUST be natural es-AR. Controls MUST be semantic, keyboard-operable, visibly focused, comfortably tappable, and readable with adequate contrast/responsive typography; reduced-motion preferences MUST be respected. Code, comments, tests, documentation, and planning artifacts remain English except actual Spanish UI strings.
- **FR-017 — Delivery evidence**: Delivery MUST include the working app, this one specification and later approved plan/tasks with task-correctness evidence, external content and its guide, reset/persistence behavior, focused required browser smokes, and README/local/deployment/presenter instructions. Final reporting MUST state actual commands/results, deployment status, assumptions, gaps, and planner invocation/artifacts, never unrun success claims.

### Settled Owner Constraints and Content Contract

These are explicit owner inputs, retained despite upstream WHAT-not-HOW scaffolding; they are not new speculative design decisions or an implementation plan.

- **TC-001 — Stack/state**: React, Vite, TypeScript, plain CSS, hooks/simple context; no Redux/Zustand. React owns presentation; JSON owns WHAT/text; small TypeScript hooks/context own selected profile/sport/mode/class/exercise and histories, with unlocks computed. Use a minimal navigation machine or router and modest localStorage. Small convenience dependencies require justification; versions are not selected in this specification.
- **TC-002 — Content surface**: Prefer one JSON file. It must expose branding/global presentation, reasonably editable UI labels, legal/disclaimer/location copy; profile stable IDs, titles/subtitles, CTAs, next prompts, defaults and seed scenarios; sport IDs, names, summaries, hero asset references, environments/facilities, tips, supported modes and safety; exercise IDs, display titles, quantities, technique/image references; plan IDs and sport/profile/level references, names/descriptions/duration/environment/prerequisites/safety and editable ordered exercise references; class IDs and free/paid sport-specific schedule/fictional venue/locality/price/level/requirements/description/receiver/contact data; point rules, challenge targets, badge unlock conditions, visible reward copy; and internally consistent resettable scenario-history fixtures. No need for a CMS, arbitrary executable configuration, or every CSS property to become editable.
- **TC-003 — Editor guide**: Delivery MUST create `docs/CONTENT_CONFIGURATION.md`, documenting fields, references, adding/editing classes and exercises/plans, validation/preview, fixtures/reset, and local versus deployed changes. Editing repository JSON may require rebuilding/redeploying the served artifact; do not promise hot deployed editing or a CMS. Configuration edit acceptance concerns the newly served file after reload, not magical remote mutation.
- **TC-004 — Serving**: Supply local build/start scripts and README/docs for a minimal Railway-capable static server serving `dist`, bound to `0.0.0.0:$PORT`. No backend/API/database/authentication or third-party integration is required. Actual deployment happens only with permission and capability; deployability is not evidence of deployment.
- **TC-005 — Required verification**: Playwright smoke coverage MUST include Calistenia solo completion → Mi camino/rewards → refresh; Yoga free and paid selection → interest without points; Natación choice and beginner safety guardrail; profile switch/reset; and configuration edits plus validation failure. Include actual command evidence at implementation delivery. Focused checks and visual/manual QA are proportional: no heavyweight testing framework beyond the required browser tool, coverage quota, or test-first mandate.
- **TC-006 — Boundaries**: No containers, Next.js, Tailwind, monorepo, database, accounts, payments, geolocation, maps, push/browser notifications, AI, or scheduling service. Exclude commercial rollout, analytics, longitudinal validation, community backend, real booking, redeemable discounts, municipal feeds, and tourism. Configured illustrative class schedules and in-app-only prompts are not scheduling/notification services.

### Key Entities *(include if feature involves data)*

- **Profile/scenario**: Stable exercise-relationship ID with adaptive copy/defaults, goals, and explicitly labeled baseline history; chosen without an account. Swimming eligibility is a separate safety condition.
- **Sport**: Stable ID with identity/art, environment, safety, and both supported participation modes.
- **Exercise and plan**: Reusable stable exercise IDs with quantities and hints; a plan identifies sport/profile/level and ordered steps, duration, environment and prerequisites. Reference order is editor-controlled.
- **Class**: Stable sport-linked free/paid demonstration offering with its own details; identity persists independently of listing position.
- **Session attempt/completion**: A started solo plan attempt and its explicit step progression; at most one completion record per attempt, associated with the originating profile/sport/plan and completion date. Retained historical display must remain intelligible after harmless content edits.
- **Interest**: Profile/class-linked simulated expression of interest, separate from attendance/completion and incentive inputs.
- **History fixture**: Resettable seeded activity records with dates and origin labels; source of historical baseline, not an unexplained point balance.
- **Incentive rule/challenge/badge/benefit**: Configured point awards, weekly/monthly targets, unlock conditions, and illustrative reward copy; displayed progress derives from eligible history, never interest.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 — Visual narrative**: All six concepts are demonstrable in one coherent app viewport on a narrow phone and desktop, matching the mockup's palette, hierarchy, rounded composition, and sport environment art, with no stick figures. Keyboard/focus, readable contrast/type, tap targets, and reduced motion receive a focused manual check. Covers FR-001–004, FR-015–016.
- **SC-002 — Complete participation matrix**: All three sports expose both selected-specific branches for all three profiles; plan content and next steps are appropriate to first-time/returning/regular state, and swimming cannot expose eligible in-water start to a non-swimmer or unsafe pool context. Covers FR-003–007.
- **SC-003 — Six honest classes**: At least six distinct class records exist: one free and one paid per sport. Opening each yields matching detail; simulated interest remains visible after reload and changes neither completed-training metrics nor incentives. Covers FR-009–010, FR-014.
- **SC-004 — Exactly-once practice**: Each configured solo step advances in order; one fully completed attempt yields exactly one history record and one rule-derived contribution, including after repeated taps, rerender, refresh, browser navigation, and success revisit. Partial or skipped attempts yield none. Covers FR-005, FR-007–008, FR-015.
- **SC-005 — Humane continuity**: Reset first-time history is empty and offers an attainable first session; returning shows a clearly seeded past and non-shaming restart; regular shows consistency and skills/progression. Completing a session updates the visible weekly goal, active weeks, and next-step journey immediately; rest does not delete achievements. Covers FR-011, FR-014.
- **SC-006 — Consistent motivation**: Displayed points, week/month challenge progress, and badge states can be recomputed from documented configured rules and eligible history for every profile. Benefits are conspicuously illustrative, nonredeemable, and without a current agreement. Covers FR-001, FR-012.
- **SC-007 — Editor autonomy/failure**: Changing a class name and schedule, a plan's exercise sequence, and visible reward copy in the served content file changes the corresponding views after reload without presentation-code edits. Missing, malformed, or referentially invalid content shows useful Spanish feedback rather than a blank/crash. Covers FR-013, TC-002–003.
- **SC-008 — Persistence/isolation/reset**: Refresh preserves selected profile and its completions/interests; switching among all profiles does not blend records. Reset restores documented reproducible scenarios, does not retain app-added completion/interest records, and leaves unrelated browser storage untouched. Covers FR-014–015.
- **SC-009 — Runnable handoff**: Documented local build and start commands produce a served demo; documented hosting instructions support the required host/port contract without third-party integrations. Final status distinguishes local validation, deployability, and any actually authorized deployment. Covers FR-017, TC-001, TC-004, TC-006.
- **SC-010 — Verified core journeys**: The required automated browser smoke set in TC-005 is delivered and its actual commands/results reported, supplemented by proportional visual/manual checks; failures and unrun checks are explicit rather than claimed as passes. Covers FR-017 and TC-005.
- **SC-011 — Presenter usability**: A rehearsed principal story takes approximately 3–5 minutes; once a sport is selected, an eligible solo session can be tapped through in under approximately 90 seconds without real waits or accounts. All visible navigation/inspection actions behave meaningfully and never credit skipped activity or fabricate class selection. Covers FR-007–008, FR-015, FR-017.

## Assumptions

- **Scope and precedence**: The owner request governs behavior and constraints; actual v2 HTML governs visual composition/art, not its hardcoded metrics or simulated operational promises. All stories are required within one feature; priority controls emphasis, not permission to drop lower-priority requirements. Priority order is visual/narrative → three sports/two paths → external JSON → consistent incentives → fast deployable build.
- **Bounded defaults**: First-time fixtures have zero prior completions; returning fixtures represent prior practice followed by a pause; regular fixtures represent ongoing practice. Exact counts, quantities, sample prices, and rule values will be modest human-editable demo content, not medical advice or validated prescriptions. First-time weekly default is one achievable session; other profile goals remain humane and configurable.
- **Swimming default**: Unknown ability is treated as unable to swim; choose a dry-land-only beginner plan plus a class/instructor redirect. Affirmative swimming ability and pool safety acknowledgment are needed for water sets; self-report is a safety gate, not verification. A completed configured dry-land solo plan can earn normal simulated completion credit, clearly described as dry-land activity.
- **Time and reset**: Calendar grouping uses Buenos Aires local dates, Monday-start weeks and calendar months. Document a fixed scenario reference date for reproducible fixtures/presenter checks and distinguish seeded from app-added dates. Rest never removes lifetime earned points/badges; period challenge progress may naturally change with its declared window. Reset is one deliberate action restoring all demo profiles and the default first-time selection, not a browser-wide clear.
- **State continuity**: Only chosen profile and completed/interest histories require durable persistence; sensible refresh may return an unfinished session to its plan without credit. A finished attempt must remain deduplicated. Repeated interest records for the same profile/class are treated as one visible interested state. Browsers/storage limitations receive honest feedback, not silent persistence promises.
- **Presentation bounds**: Validate at a representative narrow phone viewport (approximately 360 px wide) and desktop (approximately 1280 px wide); do not infer universal device support. The main app is one viewport with sensible internal/page scrolling, not a requirement to squeeze all content above the fold.
- **Delivery sequence provenance**: Owner suggested one internal progression: A skeleton/content loader/validation/navigation/profiles/sport/screens 1–2/configured branches/static serving early; B full plans/session/classes/interest/swimming/back/reset/content edits; C stored history/derived incentives/polish/presenter controls/e2e/QA/docs. This records intent, not plan/tasks or independent projects. No implementation is authorized at specification production.
- **Planning governance and provenance**: Owner selected **Standard**, authorizing bounded source preparation and focused commits. Assessment: **NO_BRAINSTORM_NEEDED** because product direction is settled and remaining engineering choices are bounded. Exact selected profile throughout planning: `openai-codex/gpt-6-astra:medium`; owner explicitly overrides planner's fixed Sol/medium `plan_create` profile for this feature. Producer observed `PI_PROVIDER=openai-codex`, `PI_MODEL=gpt-6-astra`, `PI_REASONING_LEVEL=medium`; provider-side actual internal effort is not independently observable. Parent owns dialogue and subsequent spec approval, plan, tasks, analysis/review, and implementation gates. This draft does not claim those gates passed.
- **Sources/dependencies/research**: Prepared using the installed [specify prompt](../../.pi/prompts/speckit.specify.md), CLI-resolved core template, [constitution](../../.specify/memory/constitution.md), [tooling index](../../.specify/README.md), [Pi map](../../.pi/README.md), and actual local mockup. Runtime/tool readiness was supplied by parent (Pi 0.87.1, subagents 0.73.1, ask-user 0.15.1). No external services, version selection, or new library behavior claims are needed for source authoring; dependency research here is limited to settled owner constraints and inspected local evidence. Version-specific research belongs to authorized planning if consequential choices arise; none is fabricated here.
- **Risk reduction boundary**: Highest integration risks are runtime configuration/reference failures, exactly-once persisted completion/derived incentives, swimming eligibility, and static serving. Their observable acceptance oracles are SC-004/006/007/009 and TC-005. No disposable prototype is justified during source authoring: these bounded behaviors can be checked against the eventual real loader/state/serving seams early in authorized execution. This is neither proof already run nor authorization to execute one. No implementation/browser/build/deployment tests have run at this specification-only stage.
- **Current gate**: No material product clarification remains. Owner specification approval is still required before plan production; no plan/tasks, Epic, STATE, coordination persistence, or app changes are part of this artifact preparation.

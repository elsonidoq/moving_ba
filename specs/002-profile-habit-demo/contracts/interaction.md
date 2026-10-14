# Navigation and command interface

User-facing application contract, not a backend API. Implements [spec.md](../spec.md) FR-002–010/014/015 through the existing navigation/context/AppShell owners.

## Routes and context

Canonical typed hashes omit durable person identity: `#/home`, `#/sports`, `#/classes`, `#/profile`, `#/profile/journey`, `#/profile/challenges`, `#/sports/:sportId`, `#/sports/:sportId/solo/:planId`, `#/sports/:sportId/classes/:classId`, `#/session/:attemptUUID`, `#/success/:completionKey`. Encode opaque completion keys safely and reject malformed decoding. Optional class sport filters use stable validated sport IDs. No route supplies preference, water permission, consent, completion or scenario activation.

Guard order: configuration valid → storage recovery if invalid → onboarding if no explicit confirmed preference → mode/target guard. Onboarding wins over any old or new deep link. Old `#/:profileId/...` URLs may resolve their valid sport/plan/class/journey destinations after onboarding, but the profile segment is only a legacy navigation hint, never a write or recommendation switch. Reject incompatible plan category by returning the selected category's safe sport choice/plan, never mutate preference to satisfy a URL. Unknown/wrong-sport/retired current targets lead to valid list/unavailable feedback; never select by index.

Preview activation is only a deliberate profile command, not a hash. While preview is active, the same browse routes read the scenario projection; notice/chat routes additionally require matching active scenario/chat context. A forged scenario/chat hash in actual mode returns safely to profile without activation. Reload drops preview before guarding any saved hash. Actual success requires a genuine matching completion; session requires matching active attempt and immutable plan/sport snapshots. Back/forward cannot recreate abandoned attempts, restore affirmations or promote previews to actual. Navigation does not save actual state.

## AppShell and screens

- Onboarding has exactly three radio choices, none selected, one continue action and no separate welcome. Disabled continuation plus Spanish validation does not replace command validation.
- AppShell replaces global profile combobox and journey/challenge links with an accessible circular top-right profile control and bottom Inicio/Deportes/Clases. Tabs hidden on onboarding/notice/chat. Profile owns situation edit, history, journey, challenges/achievements/illustrative benefits and four scenario entries.
- Deportes lists all three sports directly; Clases lists all sports without sport prerequisite. Class detail retains exact ID and source catalog/filter as contextual return target. Plan returns to its sport/solo list; session previous reviews exercises, while leaving session returns to its plan and abandons the attempt. Profile subviews return to profile. Notice opens corresponding chat directly; back from chat returns to notice, not substituted home.
- Contextual parent metadata is memory-only, validated against actual current IDs/mode; direct reload uses deterministic list/plan/profile parents rather than unrelated landing pages. Explicit preview exit always returns actual home with unchanged actual upcoming intention and recommendations.
- Actual home shows recommendation narrative plus exactly one saved intention snapshot if present; preview never shows the actual intention. Illustrative nearby distance/location copy is clearly demo. Passing scheduled time does not infer attendance or trigger a scenario.
- Preview badge and `Volver a hoy` remain available on every preview destination including notice/chat; durable controls (edit/reset/interest/intention/start) are unavailable until explicit exit. Explain that exit is required; exiting does not execute the pending action.
- Practice screen renders exact snapshot instructions/quantity/image or honest unavailable-image state; Previous/Next are review-only, distinct from explicit step acceptance. See [data model](../data-model.md) for accepted-prefix invariant.

## Command boundary

One synchronous actual-mode reducer/transition owner uses current runtime refs, not stale render closures. `chooseSituation`, `editSituation`, `registerInterest`, `setIntention`, `startAttempt`, `acceptStep`, `requestReset/confirmReset`, `enterScenario`, `chooseScriptedAnswer`, `exitPreview`, `reviewPrevious/reviewNext` are the conceptual interface; no command names need be public URLs. Every durable command checks actual mode, noninvalid storage, required onboarding and exact referenced identity. Reset is the explicit exception that can recover invalid/unchosen actual state after confirmation. Cancel is a no-op everywhere. No persist-on-navigation effect; serialization selects actual envelope fields only.

`startAttempt` rechecks both separate transient affirmations for water regardless of disabled controls. Preference/history/config/hash cannot substitute. Leaving/reload/reset/storage event clears both. Dry preparation and instructor-led class routes remain accessible without affirmations. Final explicit acceptance updates one actual completion and status synchronously before success; no other command credits.

## Accessibility and honesty

Regular document scroll; yellow narrative cards, not navy framed/fixed-height lockscreen. Use meaningful h1/focus transitions after route and exercise changes, skip-to-main, visible focus, keyboard-operable tabs/radios/chat choices/reset, semantic alerts/statuses and Spanish alt/accessibility text. At least 44px targets, reduced-motion support, no horizontal overflow at 360/1280px; pad document bottom so tabs do not obscure content/focused actions. Exiting preview restores meaningful focus; confirmation cancellation keeps context. Notices are in-app scripted demonstrations, not OS push or real messages. No free text, pseudo-AI, geolocation prompt, provider network, booking, contact, attendance or penalty behavior.

Required later composed checks pair rendered outcomes with actual persisted bytes at onboarding/edit/reload, intention versus credit, preview/chat/exit, reset and practice acceptance boundaries. Browser storage events must abandon all transients before safe actual routing. Keyboard/visual review is a required local presentation check, not a universal accessibility certification.

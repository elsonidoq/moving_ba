# Data model and transition contract

Derived from [spec.md](spec.md) FR-002/004–014; implementation remains unauthorized.

## Durable actual envelope

Use the existing key `ba-en-movimiento:demo:v1` and `schemaVersion: 1`, with explicit `layout: 'one-person'` discrimination. Do not pretend this is readable by the old strict legacy validator. Proposed fields:

- `preference`: null or `{ situationId: first|returning|regular, confirmed: true }`. Null means unchosen; legacy selectedProfileId never initializes it. Only explicit continue/edit commands write it.
- `journey`: immutable completion/history records indexed by canonical source key; no independent counters. Each record retains the full legacy snapshot or new completion snapshot, origin, original ID, original attemptId when present, date/timestamp, ordered accepted step IDs, plan/sport title and medium. New records retain recommendation situation as context, not person identity.
- `interests`: records indexed by source identity. Retain every legacy interest even when class IDs collide; a new actual interest is idempotent for the stable exact class ID. Already imported interest in that class means no duplicate new interest is needed; do not merge or delete imported records.
- `intention`: null or one `{ classId, sportId, classSnapshot, chosenAt, origin: 'simulated-intention' }`. Snapshot includes title, schedule, venue/locality, level, requirements, description, receiver/contact, price/currency and fictional status. Selecting same current class is a no-op; different class replaces only intention. Retirement shows snapshot plus unavailable status, not another array element. No inferred attendance or expiry transition.
- `legacySource`: absent for new/reset state, otherwise the validated original legacy envelope retained without reinterpretation, including selectedProfileId, reference date and each source profile. It is an archival source, not a second active ledger or restoration seed. Canonical entries retain source pointers; selectors count only canonical journey entries, never the archive again.

Validation forbids unknown durable fields such as preview/answers/affirmations/counters. Use explicit checks for records/IDs/origins/timestamps/date consistency, sports/media and unique canonical keys. Retired plan/class IDs need not exist in today's content. Preserve all fields valid under the frozen legacy contract. Invalid new-layout input is not retried as legacy to discard unrecognized state.

## Compatibility algorithm

1. Read only the one key. Null yields empty actual envelope with null preference/intention and no fixtures or legacySource; read denial yields that in memory with unavailable status. Do not materialize configured scenarios into actual history.
2. Parse, discriminate and validate. For absent layout, use a frozen legacy schema-1 validator equivalent to baseline storage.ts:27–59 with fixed legacy profile and sport IDs, not new content collections/defaults. Validate reference date, allowed fields, per-profile IDs, origins, attempt-map key equality, ordered unique step IDs, BA timestamp/date agreement, media and interest snapshots. Preserve legacy retired references. Malformed/invalid bytes remain untouched; expose invalid recovery state with durable commands blocked.
3. Normalize valid legacy data in fixed `first, returning, regular` order, then stable source-key order. Seeds use canonical tuple `['legacy', profileId, 'baseline', id]`; completions use `['legacy', profileId, 'completion', attemptId]`; interests use `['legacy', profileId, 'interest', classId]`. Encode the tuple unambiguously (JSON tuple string is sufficient), never concatenate ambiguous delimiters. Preserve original bare IDs and snapshot values. Across profiles, identical IDs/text/attempt IDs are distinct origins and ALL survive. Within one source completion map, the same originating attempt has one key. Never deduplicate different origin tuples by matching titles or dates.
4. Produce the canonical actual projection plus original validated legacySource, null preference/intention. Merely reading/migrating does not setItem: original bytes survive reload unchanged and normalization is deterministic. A canonical layout read validates and uses stored canonical records; it does NOT reimport legacySource. Repeated load/import cannot multiply credit. Fixture edits do not affect either path.
5. First explicit actual mutation writes the entire canonical envelope plus retained legacySource in one setItem to the existing key. A failed write retains the logical in-tab result with unavailable warning; never claim it saved. New completions use `['actual','completion',attemptUUID]`; no collision with imported records. New actual interests use `['actual','interest',classId]`. Upsert compares canonical keys, not bare legacy UUIDs. No multi-tab transactional claim.

Permanent actual-helper tests of these exact paths must pass before migration consumers rely on them: collide seeds, completions and class keys in all profiles; preserve origin, attempt IDs/steps, reference date and retired snapshots; compare repeated logical results and all source payloads; mutate fixture content and verify no reseed; include malformed/denied storage and unrelated sentinel key. Tests should verify source tuple preservation, not merely aggregate totals.

## Transient runtime

Single context owns `{actual, storageStatus, mode, route, attempt, canSwim, safePool}`. `mode` is actual or `{ kind: preview, scenarioId, referenceDate, projection, answerId? }`; it never enters persisted serialization. Preview selectors use explicit scenario data/reference date, never actual clock/history/intention. Actual selectors ignore preview. All action functions recheck mode/status/choice at execution, not only button visibility.

Attempt: fresh crypto UUID at explicit start; stable sport/plan/situation and exact ordered exercise snapshots; `acceptedCount` monotonic prefix, `viewIndex` review position, status active/completed/abandoned. Previous changes only viewIndex. Next may review an already accepted step up to the first unaccepted step but cannot accept or skip it. Accept requires matching active UUID and current viewed step equal to the first unaccepted step. Duplicate/review acceptance is a no-op. Final acceptance synchronously closes attempt and upserts one canonical actual completion before success; storage failure still permits honest tab-only success for that actual in-memory completion. It never claims physical exercise or durable save. A stale hash alone cannot display success without its genuine canonical completion.

## Transition matrix

| Event | Allowed effect / rejection |
| --- | --- |
| Continue onboarding | Actual, valid or unavailable storage, explicit one-of-three selected; confirms choice only, history untouched. Invalid storage blocks until confirmed recovery. |
| Edit situation | Actual chosen mode only; changes preference, recommendations/weekly goal, not records/interests/intention/lifetime earnings. |
| Interest / Voy a ir | Actual, chosen, exact validated class only; separate idempotent interest and single intention commands; zero credit. |
| Start / step accept | Actual chosen, noninvalid only; start additionally revalidates plan/media and BOTH current water affirmations. Final alone credits. |
| Enter preview | Deliberate profile action with known scenario; abandon unfinished attempt, clear affirmations; snapshot projection is read-only. Notification scenarios open notice, others scenario home. |
| Preview navigation/answer | Mode-local route and scripted answer only; class/plan/sport destinations stay preview. Durable commands reject even through hashes/back/forward. |
| Volver a hoy | Clear preview/answer/attempt/affirmations, return actual home unchanged; does not replay a blocked action. |
| Leave practice/reload | Abandon unfinished attempt, clear affirmations; reload discards all preview/answers. Hash cannot restart work. |
| Storage event for demo key or clear | Clear attempt/affirmations/preview/answers first; reload and validate actual envelope, route to onboarding if unchosen, otherwise actual home. No consent/scenario inference. |
| Cancel reset | No state, navigation or storage changes at any reset/recovery entry. |
| Confirm reset | Actual only (preview requires exit first); write empty canonical tombstone envelope, null preference/intention, no archive/fixtures, clear transient state and return unchosen onboarding. Only this key changes. |

Reset uses setItem(empty envelope), not localStorage.clear/remove-and-reseed. If unavailable, tab resets but Spanish feedback states durable deletion was not confirmed and old data may return on reload. Invalid storage may be replaced only after confirmed reset. If read is denied, keep ordinary commands in-tab only: do not overwrite unknown durable history even if a later setItem might succeed. Resume ordinary persistence only after a successful re-read/reconciliation of the existing envelope; do not silently replace it with tab state. Explicit confirmed reset may attempt the scoped empty-envelope write because deletion was authorized, and must report its actual result.

## Derived progress, rollback and privacy

One canonical journey supplies eligible history; exclude duplicate identical source keys, never cross-source collisions. Preserve seed versus user-simulated labels and original profile provenance. BA timezone, Monday weeks and calendar months remain in dates.ts; future dates do not enter current windows, lifetime retained. No chat/interest/intention/recommendation/time input earns rewards. Preference may change weekly goal/recommendations but cannot erase lifetime badges or history.

Rollback before an actual mutation is code-only: legacy bytes have not changed. After canonical writes, an old binary will reject the layout; do NOT automatically restore legacySource (it would lose new actual data or resurrect reset history). Keep the reader/compatibility fix forward-compatible, or restore a separately user-approved exact backup with explicit acknowledgement of later-write loss. This plan creates no backup key, export service or destructive rollback authority. Confirmed reset intentionally discards archived journey; cancellation preserves it. No personal/sensitive data is added; scripted answers are never logged or persisted.

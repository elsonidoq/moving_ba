# BA en movimiento demo

## Direct files

- [Specification](spec.md): consolidated Standard source, acceptance criteria, settled constraints, assumptions, and provenance.
- [Plan](plan.md): approved serving-corrected architecture, delivery outcomes and provenance.
- [Tasks](tasks.md): approved serving-corrected outcomes and retained REQUIRED checks; execution evidence pending.
- [Research](research.md): bounded decisions and canonical research pointer.
- [Data model](data-model.md): state, history, dates, persistence and transitions.
- [Quickstart](quickstart.md): intended validation/run guide; commands not executed.

## Child directories

- [Checklists](checklists/README.md): source-quality validation.
- [Contracts](contracts/README.md): public runtime content interface.

## Specification approval

Owner answer through `ask_user`: **“Approve specification and start planning”**.
Approved source: `spec.md` as retained at commit
`c31871bad4f71aa8185088138f4d8343f3ec69bb`. Approval authorizes architectural
planning from this source, not implementation. Standard remains selected.
Exact owner-selected planning profile: `openai-codex/gpt-6-astra:medium`, including
the explicit feature-scoped override of the installed Sol/medium `plan_create` rule.
This specification-stage approval was followed by the overall approval below.

## Current correction gate

At baseline `a6fb956881ad4ff135572739b529b160f931084a`, actual readiness disproved
serve CLI occupied-port failure behavior. Owner authorized bounded Astra/medium
planning correction to a minimal Node HTTP listener with direct serve-handler 6.1.6,
not coding. [Evidence and replacement constraints](research.md#static-serving-correction)
retain the disproof. Current plan/tasks now differ from the approved revision below:
fresh independent review and **renewed final approval PENDING**. Do not relabel the
prior approval as covering these changes. Specification bytes/hash remain unchanged;
TC-004 still describes a minimal static file server, no API/backend or scope expansion.
No specification renewal is needed for this unchanged source. Correction validation
counts 24 REQUIRED IDs in both baseline and corrected tasks; the historical review's
25-item claim below is retained as reported provenance, not a reason to add an item.

## Renewed approval and execution selection

Owner answer through `ask_user`: **“Approve revision and bounded readiness exception”**.
This renews implementation authorization for `spec.md`, `plan.md`, and `tasks.md`
at `d8e14bcf53f9b05f547d30e4ab8458d988ca9574`, preserving all eight tasks and 24
REQUIRED items. Fresh targeted review `d0811d78-d3fe-4466-885e-7fc9e438436c` found
no issues; report `/tmp/ba-movement-demo-serving-review.md`. Plan hash:
`5b096ad19b31921d793ff98b0078e6991a043b0d8bce4ad067dfa2f97923bc03`; tasks hash:
`364d0eace6ddd0657d7a3f28c9cdebbe39f9c504bf08f2f1346d230acfd47612`.

Approved sequential delegated coding batches: A T001–T002, B T003–T005, C T006–T008;
exact coding profile `openai-codex/gpt-6.1-sol:medium`, never Astra. Fresh independent
final reviewer: `openai-codex/gpt-6-astra:medium`, read-only. Local pinned npm
installation, matching Chromium, build/server/browser checks and scratch readiness
are authorized; OS installs, credential/settings changes, push and live deployment
are not. Scratch proof `/tmp/ba-movement-demo-serving-readiness.md` passed replacement
serving/build/browser checks; it is capability proof, not product acceptance.

Explicit feature-scoped routing exception: successful exact Sol model/configured-medium
runs may establish dispatch readiness despite unavailable exact supported-effort
metadata. Provider-internal effort remains unknown. No product verification or other
permission gate is waived. Dependency audit warnings remain unassessed.

## Overall approval

Owner answer through `ask_user`: **“Approve implementation scope”**, after the
initial withholding and subsequent explicit approval. Approved current artifacts:
`spec.md`, `plan.md`, and `tasks.md` at
`ebedc84913ef1aefbfe2fdb9661c53ce71819c8f`. Scope: T001–T008 and all mapped REQUIRED
checks; no live deployment or real integrations. Approval starts coordinator
preflight; execution batch/profile selection and local install/browser permissions
remain separate gates.

Independent fresh Astra/medium analysis (run
`71f99fdf-48e4-4cad-841e-7691a609473c`) found no blocking issues, with 34/34 planned
requirements covered and all 25 task-local REQUIRED items retained. Its report is
retained in the parent Pi session and runtime output
`/tmp/ba-movement-demo-planning-analysis.md`. Artifact hashes reviewed:

- spec: `99c08a0c49f86d7364fb07579757002b23a33163a44f0317cd8b98dc49e8fe47`
- plan: `97528145d415f6fa3a0bd1f4771949ee3e09441f42d9df722ca18d234694d4f4`
- tasks: `8fdda4a27638184ae5997a6dd465a08daa02e9ff6e100972359208ac3b2e584c`

Planning validation is not implementation acceptance. Runtime/build/browser/manual
checks are unrun at this approval; deployment is unknown/not performed.

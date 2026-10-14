# BA en movimiento demo

## Direct files

- [Specification](spec.md): consolidated Standard source, acceptance criteria, settled constraints, assumptions, and provenance.
- [Plan](plan.md): approved architecture, delivery outcomes, acceptance mapping and managed-pass provenance.
- [Tasks](tasks.md): approved implementation outcomes and REQUIRED checks; execution evidence remains pending.
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

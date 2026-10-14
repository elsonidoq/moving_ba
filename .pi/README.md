# Pi command map

This file indexes the `prompts/` command directory. There is deliberately no
`README.md` inside `prompts/`: Pi would load it as an unintended `/README` command.
No project Pi settings or executable extensions are installed by this setup.

## Installed prompts

| Command | Source | Purpose |
| --- | --- | --- |
| `/speckit.constitution` | [Prompt](prompts/speckit.constitution.md) | Maintain project principles; do not reinitialize the ratified constitution. |
| `/speckit.specify` | [Prompt](prompts/speckit.specify.md) | Produce a feature specification. |
| `/speckit.clarify` | [Prompt](prompts/speckit.clarify.md) | Resolve specification uncertainties. |
| `/speckit.plan` | [Prompt](prompts/speckit.plan.md) | Produce implementation design/planning artifacts. |
| `/speckit.tasks` | [Prompt](prompts/speckit.tasks.md) | Generate tasks from approved source/plan. |
| `/speckit.analyze` | [Prompt](prompts/speckit.analyze.md) | Analyze consistency across planning artifacts. |
| `/speckit.checklist` | [Prompt](prompts/speckit.checklist.md) | Generate requirement-quality checklists. |
| `/speckit.implement` | [Prompt](prompts/speckit.implement.md) | Upstream execution instructions; not a bypass of Coherence authorization/coordination. |
| `/speckit.converge` | [Prompt](prompts/speckit.converge.md) | Assess remaining work; not automatic scope expansion. |
| `/speckit.taskstoissues` | [Prompt](prompts/speckit.taskstoissues.md) | Upstream external issue conversion; not the canonical local unresolved-work register. |

## Loading and managed use

Run `/reload` in an active Pi session after setup. Project prompt loading requires
project trust; review the prompts and use `/trust` if trust is not already granted.
The filenames become slash commands and `$ARGUMENTS` supplies user input. Pi prompt
handoff metadata is not proof that a downstream stage has run or been authorized.

Use `/skill:planner` for the managed TinySpec/Standard choice and approval-driven
workflow. Installed stage prompts support that workflow; model/profile readiness,
independent review, and implementation approvals are checked at invocation time.
No live model invocation or actual feature planning was part of setup validation.

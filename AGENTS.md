# Project instructions

<!-- coherence-contract:start -->
## Coherence suite contract

### Runtime requirements

Suite configuration: [/home/dev/projects/skills/REQUIREMENTS.md](/home/dev/projects/skills/REQUIREMENTS.md).
Required: pi 0.87.x (tested 0.87.1), `npm:pi-subagents@0.73.1`, and
`npm:pi-ask-user@0.15.1`, with registered usable delegation and question tools.
Report missing requirements and stop the affected stage; do not install implicitly.
SpecKit is required in this project only for applicable Standard planning stages;
TinySpec does not require it. Jev triage is optional, with manual routing fallback.

### Installed workflow owners

- [Planning](/home/dev/.agents/skills/planner/SKILL.md)
- [Execution](/home/dev/.agents/skills/coordinate-implementation/SKILL.md)
- [Task mechanics](/home/dev/.agents/skills/task-generation/SKILL.md)
- [Approval/recovery and bounded mechanical corrections](/home/dev/.agents/skills/planner/references/approval-and-recovery.md)
- [Retained task checkpoints](/home/dev/.agents/skills/memory-handling/references/task-commit-contract.md)

These package contracts do not supersede local product policy, authorize work, or
automatically create an Epic. Initialization is not substantive implementation approval.

### Project memory

The associated store is project-local `memory/`, indexed by [memory/MEMORY.md](memory/MEMORY.md).
Follow [memory-handling](/home/dev/.agents/skills/memory-handling/SKILL.md): read the
whole index first, then trigger-matching entries in full; recheck after any memory write.
No global-store substitution. Documentation describes current state; memory contains
only verified, non-obvious, trigger-first gotchas, not summaries or task ledgers.
Consult this index before suite work and at closeout. Preserve existing entries on refresh.

### Coordination and recovery

Consult relevant existing compact project guidance; a missing coordination store is
nonblocking. Only explicit future-directed user feedback authorizes bounded guideline
storage, never initialization, routine summaries, reflection, or inferred lessons.
Preserve local path/symlink, sensitive-data, dirty-target, and concurrent-edit safeguards.
No STATE exists at adoption; do not initialize or maintain one. Preserve any future
custom STATE and use installed execution/approval-recovery contracts for recovery.
Pi sessions retain conversation records; Git retains focused task checkpoints.
Unresolved work uses the canonical register below, via
[track-open-issue](/home/dev/.agents/skills/track-open-issue/SKILL.md).

### Documentation ownership

Documentation root: `docs/`; index mechanism: `README.md` in every documentation
directory, listing direct files and direct child documentation directories.

- [Index and initialization approval record](docs/README.md)
- [Architecture](docs/architecture.md)
- [Deployment](docs/deployment.md)
- [Documentation routing](docs/documentation-routing.md)
- [Canonical unresolved-work register](docs/open_issues.md)

The existing HTML mockup remains the conceptual demonstration, not an operational
service contract. No persistent database evidence was found at adoption; no schema
owner is initialized. If a persistent database is introduced, obtain explicit schema
ownership and document tables/collections, fields/types, keys/relationships,
constraints, and indexes as applicable before claiming documentation readiness.
Never infer live services, confirmed offers, deployment state, or product approval
from conceptual mockup content.
<!-- coherence-contract:end -->

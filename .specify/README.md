# SpecKit tooling and policy index

## Direct files

- [.gitignore](.gitignore): excludes machine-local feature pointers and extension overrides.
- [init-options.json](init-options.json): scaffold provenance/options (Pi, Bash, sequential feature numbering, CLI 1.0.12).
- [integration.json](integration.json): active Pi integration and invocation format.

## Child directories

- [Memory/policy artifacts](memory/README.md): ratified constitution; not the Coherence gotcha-memory store.
- [Templates](templates/README.md): upstream feature, plan, tasks, checklist, and constitution templates.
- [Scripts](scripts/README.md): Bash setup, prerequisite, and template-resolution helpers.
- [Integrations](integrations/README.md): CLI-generated asset manifests and hashes.
- [Workflows](workflows/README.md): bundled upstream workflow definition/registry.

## Use with Coherence

Start managed work through `/skill:planner`, provide a requirement, and explicitly
choose TinySpec or Standard. Standard delegates use the installed
[Pi prompts](../.pi/README.md) and scripts; invocation-time model, permission,
reviewer, and approval checks still apply. Raw upstream workflow/implement commands
are not substitutes for Coherence coordination or implementation authorization.

Assets were scaffolded with installed `specify-cli` 1.0.12 using
`specify init <temporary-directory> --integration pi --script sh --non-interactive`.
No optional preset or extension was installed. The ratified constitution was
preserved rather than replaced by the generated placeholder. Upstream sample tasks,
phases, test-first notes, and research examples are not additional product
requirements; actual output must follow the constitution and installed planner/task
contracts. Do not inflate demo scope merely to fill a template.

The associated Coherence gotcha-memory index remains
[memory/MEMORY.md](../memory/MEMORY.md). No active feature or specification is
initialized by this tooling setup. Feature pointers are local and ignored by Git;
feature directories and Git branch names are independent in this CLI version.

## Setup approval

Owner response through `ask_user`: **“Approve recommended setup”**. Baseline:
`0f82fc7822e152ade2cc53bde7e75896468f3fde`, initially clean. Approval covers native
Pi/Bash scaffolding from installed assets, missing tooling files, minimal indexes,
discovery-document updates, focused validation, and a scoped commit. No feature
work, application changes, upgrades, optional extensions, or push is authorized.
Comparable upstream contents are recorded by the integration manifests; project
setup/docs are retained by the Git commit introducing this setup. The executive
brief and owner answer remain in the Pi session.

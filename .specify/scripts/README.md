# Script index

No direct scripts in this directory.

## Bash helpers

The `bash/` child directory is indexed here:

- [common.sh](bash/common.sh): shared project/feature resolution and template composition.
- [create-new-feature.sh](bash/create-new-feature.sh): initialize a feature directory/spec scaffold; supports read-only `--dry-run`.
- [setup-plan.sh](bash/setup-plan.sh): resolve feature context and initialize the plan template.
- [setup-tasks.sh](bash/setup-tasks.sh): validate source/plan and return task-template content.
- [check-prerequisites.sh](bash/check-prerequisites.sh): validate phase prerequisites; `--paths-only` resolves paths without persisting state.
- [resolve-template.sh](bash/resolve-template.sh): resolve named template content; supports JSON output.

Bash scripts are installed executable. Actual feature/setup commands can create
artifacts or persist ignored `.specify/feature.json`; run only within authorized
stage bounds. Setup verification used disposable feature fixtures outside the
repository. No real feature was initialized here.

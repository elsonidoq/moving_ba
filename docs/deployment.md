# Deployment

## Verification status

Deployment state: **unknown**. The initial repository contains a conceptual HTML
mockup, but no deployment configuration, runbook, or confirmed environment evidence.
A standalone HTML file is not proof of a deployed service.

No deployment commands, domains, environment requirements, rollback procedures, or
pending deployment prerequisites are verified here. No deployment operation was run
during initialization.

## Pending verified deployment actions

None recorded. Add only concrete, evidence-backed prerequisites when relevant;
record timing, environment, procedure provenance, verification/success condition,
and rollback or irreversibility. Mark unknown fields explicitly rather than infer
procedures. Choose and verify operational details before using this owner as a runbook.

## PLANNED static hosting contract (not executed)

The [feature plan](../specs/001-ba-movement-demo/plan.md) proposes a Vite `dist`
build served by `node scripts/serve.mjs`, a minimal Node HTTP listener using direct
runtime dependency `serve-handler` 6.1.6, with JSON at `/config/app-content.json`.
[Canonical dependency/source guidance](architecture.md#planned-demo-architecture-not-implemented)
records Vite's preview limitation, the disproved serve CLI occupied-port behavior,
the replacement handler API/path/cache policy and Railway's required `0.0.0.0` host
plus injected `PORT`. The planned adapter validates supplied PORT as a decimal integer
1–65535 (default 3000 only when unset), binds that explicit host/port and exits nonzero
on startup errors without fallback. It serves only `dist`, delegates file handling to
the dependency, disables directory listings and symlinks, and sets JSON no-store.
Actual replacement runtime/occupied-port proof is still required, not established by
source inspection. Intended scripts must serve JSON/assets unchanged;
hash navigation needs no catch-all HTML rewrite. Local build/start and HTTP tests
must precede any deployability claim. Intended commands and check conditions are in
the [planned quickstart](../specs/001-ba-movement-demo/quickstart.md), not verified here.

Hosting project/service/domain/runtime, credentials and actual deployment status
remain unknown. No Railway CLI/authentication/infrastructure operation was performed.
Later live deployment requires explicit permission and usable capability; retain
actual service/deployment evidence before claiming success. No database rollback is
needed: a verified previous static build can be redeployed only under that permission.
Changing repository JSON may require rebuild/redeploy; there is no deployed CMS.

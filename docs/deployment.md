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
build served by pinned `serve`, with runtime JSON at `/config/app-content.json`.
[Canonical dependency/source guidance](architecture.md#planned-demo-architecture-not-implemented)
records Vite's preview limitation, serve's explicit TCP listener and Railway's
required `0.0.0.0` host plus injected `PORT`. Intended scripts must bind that host/
port, fail rather than switch occupied ports, and serve JSON/assets unchanged;
hash navigation needs no catch-all HTML rewrite. Local build/start and HTTP tests
must precede any deployability claim. Intended commands and check conditions are in
the [planned quickstart](../specs/001-ba-movement-demo/quickstart.md), not verified here.

Hosting project/service/domain/runtime, credentials and actual deployment status
remain unknown. No Railway CLI/authentication/infrastructure operation was performed.
Later live deployment requires explicit permission and usable capability; retain
actual service/deployment evidence before claiming success. No database rollback is
needed: a verified previous static build can be redeployed only under that permission.
Changing repository JSON may require rebuild/redeploy; there is no deployed CMS.

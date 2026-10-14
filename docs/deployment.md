# Deployment

## Current status

**Local static delivery verified. Live deployment unknown / not performed.**
No Railway CLI/auth/account/project/service/domain operation has been authorized or
run. Hosting service, domain, credentials, deployed runtime and platform status remain
unknown. No URL, partner integration or operational service is claimed. Deployment is
not required for local acceptance; later operations need explicit permission and usable
capability. The use-railway skill was read only for documentation context, with no CLI
probe, installation or mutation.

## Verified local build/start boundary

Use Node 22.x >=22.12 (tested 22.23.3), npm (tested 10.9.9) and the retained lockfile:

```sh
npm ci
npm run typecheck
npm run build
PORT=4173 npm start
```

Open `http://localhost:4173`; stop with Ctrl-C before running browser tests (they own
4173). `build` typechecks then Vite builds to `dist`; `start` runs
`node scripts/serve.mjs`, not Vite preview or the disproved serve CLI.
The minimal Node HTTP listener delegates static handling to pinned serve-handler 6.1.6,
serves an absolute dist root, and binds `0.0.0.0:$PORT`. PORT is 3000 only when unset;
supplied values must be decimal integers 1–65535. Invalid/occupied ports exit nonzero,
without retry or another listener. SIGTERM closes the server.

Root/JS/assets/config return actual dist bytes. Public JSON at
`/config/app-content.json` is runtime-fetched with no-store (server header and client
fetch); it is not bundled. Hash route reload needs no server rewrites. Missing files
return real 404, not SPA HTML; directory listings and symlinks are disabled. Initial
T001/T002 actual default/nondefault/invalid/occupied-port and HTTP/hash checks remain
valid: this serving seam is unchanged; final integration rechecks nondefault/root/
JSON/hash behavior. [Tasks](../specs/001-ba-movement-demo/tasks.md) retain commands and
observations; [architecture](architecture.md) owns implementation/dependency rationale.

## Railway-capable, not deployed

A later authorized static service can build with `npm ci && npm run build`, start
with `npm start`, provide supported Node 22.x and inject `PORT`; the listener already
uses Railway's required 0.0.0.0 host and explicit port. This is a tested local command
contract, not a verified Railway project/runtime configuration or success record.
Do not invent a service ID, domain, credential state or platform rollback procedure.
No containers, backend, database, auth or integration is needed by this demo.

Repository public JSON edits require rebuilding the artifact and, for a published
service, a separately authorized redeployment. A reload fetches the newly served
file; there is no CMS or hot remote editing facility. Local changes do not mutate a
hosted build. Use the [content guide](CONTENT_CONFIGURATION.md) for validation/reset/
snapshot semantics. Configuration is public and must never contain secrets.

A source change/build is locally reversible with Git and a prior static artifact.
Any actual platform replacement/redeployment/rollback requires separate authorization
and observed service/deployment evidence; no database migration is involved. localStorage
is browser-origin-specific, not hosted state. If an old build cannot read a future
envelope, it offers scoped demo recovery rather than migration/global browser clearing.

## Historical provenance

Initialization found only a conceptual HTML file, no verified deployment commands or
service evidence; that absence never proved there were no outside systems. Subsequent
approved planning researched Vite public assets, static hosting, Railway host/PORT and
serve-handler 6.1.6. Readiness disproved serve 14.2.5 occupied-port behavior, and renewed
approval selected the minimal explicit listener instead. The immutable
[research correction](../specs/001-ba-movement-demo/research.md#static-serving-correction)
and historical [architecture research](architecture.md#planned-demo-architecture-not-implemented)
retain those observations. Current local proofs supersede planning's then-UNRUN labels,
not its source provenance or unknown live status. Three high npm audit warnings remain
unassessed; do not infer production hardening from local demo acceptance.

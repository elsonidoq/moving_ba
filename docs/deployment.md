# Deployment

## Current status

**Live demo verified on Railway, 2026-10-14.**
Public HTTPS: **https://movingba-production.up.railway.app** (desktop and phone browsers;
no tunnel needed). This is still a conceptual, non-official simulation, not a live
booking, training-verification or partner service.

| Resource | Verified value |
| --- | --- |
| Workspace | My Projects (`786dd741-cf10-4c08-b16e-8e47734be3c4`) |
| Project | moving_ba (`cc82d4e3-18c9-4bf6-93fc-f5cd9f58a05d`) |
| Environment | production (`75f39978-e9e1-4019-8b04-b60308632dcd`) |
| Service | moving_ba (`07c70e92-6e27-477f-a3e0-2264da1c8c9c`) |
| Deployment | `bf3b2bdd-858f-4b7f-8481-f46f0a74de52` — **SUCCESS**, status updated at 20:28:28Z |
| Source | Clean main revision `80361c0906235b2809dbf9c57c568f41f40b93bb`, uploaded from cwd |
| Region / replicas | us-east4-eqdc4a / 1 |
| Domain target | 8080; domain ID `abf3962f-0602-4ae1-8dbf-a1d9055dfb94` |

Railway CLI 5.63.1 was already installed at `/home/dev/.railway/bin/railway` but was
not on PATH. Existing authentication worked; no installation or login was necessary.
The installed use-railway skill and setup/deploy/configuration references were used.
CLI tooling-health suggestions to modify global Pi configuration were not applied;
the existing skill and hosted Railway MCP worked. No billing plan, database, volume,
custom domain purchase or unrelated service was changed.

The initial `railway up` created the project/service and submitted deployment
`6ee520e0-2164-4d16-bc0e-f27fd77a7f39` (observed SUCCESS). Detection chose the correct
Node listener but defaulted to `npm install`. One scoped environment configuration
patch selected locked installation and explicit build/start commands, automatically
creating the final deployment above from the same source snapshot. This was not a
second source upload or a retry of a failed build. Later documentation commits are
not part of that uploaded application snapshot.

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

## Access through SSH and a phone

With the built server running on the remote host at port 4173, use your usual SSH
account, hostname and identity options from your computer:

```sh
ssh -N -L 4173:127.0.0.1:4173 USER@HOST
```

Open `http://localhost:4173` on that computer and keep the tunnel running.
For a phone on the **same trusted Wi-Fi**, stop the first tunnel and use:

```sh
ssh -N -g -L 0.0.0.0:4173:127.0.0.1:4173 USER@HOST
```

Open `http://COMPUTER_WIFI_IP:4173` on the phone. If needed, allow TCP 4173 through
that computer's firewall on the private network only; no router port forwarding is
needed. The LAN-bound tunnel exposes the demo to other devices on that network,
so do not use it on untrusted/public Wi-Fi. Stop it with Ctrl-C when finished.
SSH/phone connectivity depends on your network and credentials and has not been
verified end to end. Each browser/origin has its own demo localStorage.

The remote static server itself binds all interfaces; tunneling does not restrict
its remote exposure. Use the remote firewall if access should be tunnel-only.

## Verified Railway configuration and redeployment

Service configuration is stored on Railway, not in a repository deployment file:

- Builder: **RAILPACK**, observed Railpack **0.41.0**, Node provider (not Caddy).
- `RAILPACK_NODE_VERSION=22.23.3` (within package engines `>=22.12.0 <23`).
- `RAILPACK_NODE_NPM_INSTALL=npm ci`.
- Build command: `npm run build` (includes TypeScript checking, creates `dist`).
- Start command: `npm start` → `node scripts/serve.mjs`.
- Railway injects `PORT`; runtime logs confirm **Listening on 0.0.0.0:8080**.
- Domain targets **8080**. No static/SPA-output override or catch-all was added.

Scoped configuration was read back through describe-service; exact-deployment build
logs confirmed Node 22.23.3/npm 10.9.9, `npm ci`, successful typecheck/Vite build and
`npm start`. Source/lockfile/public files/scripts were uploaded; Railway built dist,
not a local dist upload. No backend, database, auth or integration is required.

For a future **authorized** content release, edit `public/config/app-content.json`,
validate it and upload the source directory to these exact resources:

```sh
cd /home/dev/projects/moving_ba
npm run test:core -- --grep 'content validation'
git status --short
# Use railway on PATH, or the existing absolute CLI path on this host.
SESSION_ID="ba-content-$(date +%s)"
RAILWAY_CALLER=skill:use-railway@1.7.0 \
RAILWAY_AGENT_SESSION="$SESSION_ID" \
/home/dev/.railway/bin/railway up \
  --project cc82d4e3-18c9-4bf6-93fc-f5cd9f58a05d \
  --environment 75f39978-e9e1-4019-8b04-b60308632dcd \
  --service 07c70e92-6e27-477f-a3e0-2264da1c8c9c \
  --detach --json -m 'Update demo content'
```

Capture `deploymentId` from that upload and poll that **exact ID** using:

```sh
RAILWAY_CALLER=skill:use-railway@1.7.0 \
RAILWAY_AGENT_SESSION="$SESSION_ID" \
/home/dev/.railway/bin/railway deployment list \
  --project cc82d4e3-18c9-4bf6-93fc-f5cd9f58a05d \
  --environment 75f39978-e9e1-4019-8b04-b60308632dcd \
  --service 07c70e92-6e27-477f-a3e0-2264da1c8c9c --json
```

When operating through use-railway, prefix subsequent CLI commands with the same
caller/session values as the upload. Upload completion alone is not success: require
SUCCESS, then recheck HTTPS root, JSON/no-store, assets and a hash refresh. Inspect
bounded logs for the submitted ID before retrying any failure. The current service
has no GitHub source connection: Git pushes do **not** automatically redeploy it.
A plain `railway redeploy` rebuilds the existing snapshot, not edited local JSON.

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

## Live verification and limitations

After final-deployment SUCCESS, HTTPS checks and Playwright 1.56.1 with existing
Chromium 153.0.8010.12 passed against the public origin:

- Root application rendered at 1280px; JavaScript loaded with JavaScript MIME.
- JSON returned 200, JSON MIME, `Cache-Control: no-store`, populated bytes identical
  to repository JSON; all three sport SVGs returned exact repository bytes.
- Missing `/config/absent.json` and `/assets/absent.svg` returned real 404s.
- `/#/returning/yoga/solo/yoga-returning` survived refresh.
- At 360×900, Calistenia opened both solo and class paths without horizontal overflow.
- One explicit solo completion (including double final-step activation) persisted
  once after reload; Mi camino showed 1 practice/10 points and rewards agreed.
- Fictional Yoga class interest survived refresh without changing completions or
  reward output. Swimming blocked no/each single affirmation; both enabled water.
- No uncaught browser errors; desktop/mobile screenshots were viewed.

Disposable script/log/screenshots: `/tmp/ba-railway-deploy/` in the deployment session;
these are not required for a fresh checkout or redeploy. Live verification did not
mutate served content, mock responses or freeze the clock. Browser history created
by these checks belongs only to the disposable browser context, not other visitors.

Physical cellphone hardware, Safari/Firefox and universal device/accessibility support
were not tested. Previously verified 68 core/26 Chromium local tests were not rerun
as a full suite; app source and dependencies are unchanged. The existing local server
on port 4173 was preserved. New HTTPS-origin localStorage does not inherit localhost
or tunnel history; different browsers/devices have independent demo histories.

[OI-1](open_issues.md#oi-1--assess-reported-dependency-audit-warnings) remains open:
Railway `npm ci` also reported three high-severity warnings. Advisories and runtime/
development exposure are unassessed; no dependency remediation or production security
hardening is claimed. No audit fix was applied. Future deployments/rollback require
appropriate authorization; no platform rollback was exercised.

## Historical provenance

Initialization found only a conceptual HTML file, no verified deployment commands or
service evidence; that absence never proved there were no outside systems. Subsequent
approved planning researched Vite public assets, static hosting, Railway host/PORT and
serve-handler 6.1.6. Readiness disproved serve 14.2.5 occupied-port behavior, and renewed
approval selected the minimal explicit listener instead. The immutable
[research correction](../specs/001-ba-movement-demo/research.md#static-serving-correction)
and historical [architecture research](architecture.md#planned-demo-architecture-not-implemented)
retain those observations. Current local proofs supersede planning's then-UNRUN labels,
not its source provenance. Before the authorized first deployment recorded above, live
hosting state was unknown and no Railway operation had been performed. Three high npm
audit warnings remain unassessed; do not infer production hardening from local demo acceptance.

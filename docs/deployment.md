# Deployment

## Current status

**Live demo verified on Railway, 2026-10-15.**
Public HTTPS: **https://movingba-production.up.railway.app** (desktop and phone browsers;
no tunnel needed). This is still a conceptual, non-official simulation, not a live
booking, training-verification or partner service.

| Resource | Verified value |
| --- | --- |
| Workspace | My Projects (`786dd741-cf10-4c08-b16e-8e47734be3c4`) |
| Project | moving_ba (`cc82d4e3-18c9-4bf6-93fc-f5cd9f58a05d`) |
| Environment | production (`75f39978-e9e1-4019-8b04-b60308632dcd`) |
| Service | moving_ba (`07c70e92-6e27-477f-a3e0-2264da1c8c9c`) |
| Deployment | `f1c3c1e5-efd2-44b8-8c2a-d70160e6bfdb` — **SUCCESS**, observed terminal-success |
| Source | Clean main revision `80c0b1d84b62e9098d025130f58de28b3b2bc128`, uploaded from cwd |
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
creating prior deployment `bf3b2bdd-858f-4b7f-8481-f46f0a74de52` from that source
snapshot. The prior verified release `753afdf2-7033-4c22-94b1-6045f6ffcfa2`
at `d6ca077` included the one-person flow and all 29 bundled mockup photos. The
previous verified visual-refresh release `c8664af7-a748-4e92-a5fa-05e27609e75c`
at `cf08e056` added two-stage entry, profile charts and both notification-style
scenarios. The prior `0c8f94dc-3db2-45f3-bb2b-f630765ea235` release at `078f3be`
added the owner-permitted, locally bundled Obelisk welcome photo. The current
release adds mockup-inspired wallpaper notice scenes, photo-led challenges/benefits
and concrete app copy; in-app points are calculated, but no canje is enabled.
Documentation-only commits after `80c0b1d` are not part of its uploaded source snapshot.

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

The `80c0b1d` release's bounded checks after observed SUCCESS:

- A fresh 360px Chromium browser selected a situation and opened both notice scenes.
  Each had no top banner, kept its exit below the wallpaper and opened its matching
  structured chat: inactive (4 answer choices), missed class (5 answer choices).
- The Challenges screen showed 0 earned points, three benefit cards and no demo-style
  wording. Both new local JPEGs loaded/decoded and their served bytes matched the
  bundled coffee SHA-256 `223605ea58d7a623a0b5244f562c053121335d4adbea1e35e31fcf82547678f2`
  and Jardín Japonés SHA-256 `5d4034f530566ea7690af7f34a33e9f9907b412a4d31405700e125394fe71582`.
  The browser context was disposable; no rewards were issued or redeemed.
- Before upload, the clean commit passed typecheck/build, 134 core tests and 48
  Chromium tests. Local screenshots were inspected at 360 and 1280 widths. Live
  verification was bounded to the checks above, not the full test matrix.

The prior `078f3be` release's bounded checks after observed SUCCESS:

- A fresh 360px Chromium visit loaded and decoded the Obelisk welcome photo at
  `/assets/photos/welcome_obelisk.jpg` (1280×1280), with Spanish alt. Its live JPEG
  bytes matched the bundled SHA-256
  `f3c35a1561f07ed550991419b4feadaedb7fd1694d8dc498c08d830f423fccd2`.
  `Comenzar` still opened `Contanos sobre vos`. No remote image load is required.
- Before upload, the same commit passed typecheck/build, one focused core provenance
  test and three focused Chromium tests. The welcome photo and crop were inspected
  from local 360/1280 screenshots. A full suite or post-release cross-browser check
  was NOT RUN for this image-only change.

The prior `cf08e056` release had 132 core/42 Chromium checks and a clean independent
final review. Its live smoke confirmed matching JSON bytes, the Buenos Aires Home
photo and both notification→chat journeys. Those are prior-release observations, not
new live coverage claims for this release.

The earlier `d6ca077` release had 129 core and 33 Chromium checks; its live smoke
also verified the three Home sport-card JPEGs and a Calistenia class-detail JPEG.
Those historical checks are not claims about a full live matrix for this release.

Disposable closeout headers/config bytes and browser contexts under `/tmp` are not
required for a fresh checkout or redeploy. Live verification did not mutate served
content or mock responses. Browser history belongs only to the disposable context.

Physical cellphone hardware, Safari/Firefox, every production photo placement and
universal device/accessibility support were not manually tested. Current live browser
checks used one fresh 360px Chromium origin; local 360/1280 screenshots and the full
Chromium test suite are not universal live verification. Different browsers/devices
retain independent HTTPS-origin localStorage. [OI-1](open_issues.md#oi-1--assess-reported-dependency-audit-warnings)
tracks unassessed dependency warnings, and
[OI-2](open_issues.md#oi-2--add-explicit-load-failure-feedback-for-plan-thumbnails)
tracks the non-blocking plan-thumbnail load-failure feedback gap. No dependency fix or
platform rollback was applied; future deployments/rollback require authorization.

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

# Intended quickstart and validation

**NOT EXECUTED:** the app, package scripts and tests below do not exist yet. This is
the intended delivery guide for authorized implementation, not runnable baseline
instructions or permission to install/deploy now. See [plan checks R1–R9](plan.md#acceptance-and-task-handoff).

## Prerequisites and intended commands

Node 22.x >=22.12 (planning machine 22.23.3), npm (observed 10.9.9), approved package
manifest/lockfile and test fixtures from implementation. Initial dependency selection
and exact versions: [canonical guidance](../../docs/architecture.md#planned-demo-architecture-not-implemented).
First authorized setup generates and retains the lockfile with `npm install`; subsequent
fresh installations use `npm ci`. Browser download requires implementation permission
and network capability; OS package installation is not implicit.

```bash
npm ci
npm run dev -- --host 0.0.0.0
npm run typecheck
npm run build
PORT=4173 npm start
```

Intended script contracts: `dev` runs Vite; `typecheck` runs `tsc --noEmit` with an
appropriate project config; `build` typechecks then `vite build`. `start` runs
`node scripts/serve.mjs`, a planned minimal ESM Node HTTP listener using direct
runtime dependency `serve-handler` 6.1.6 (not the serve CLI). It serves only `dist`,
binds `0.0.0.0`, defaults to 3000 only when PORT is unset, and rejects supplied empty,
nondecimal, zero or out-of-range ports (valid range 1–65535). Startup errors must exit
nonzero without fallback. Handler defaults resolve the root index; no catch-all
rewrites, directory listing, render-single or symlink serving. Set JSON Cache-Control
no-store; hash navigation needs no fallback and missing JSON must stay a real error.
The adapter delegates static path/MIME/stream handling, not a custom API/file server.
These constraints are planned; the [CLI disproof and replacement evidence](research.md#static-serving-correction)
do not establish successful replacement execution.
In another terminal, with the server still running:

```bash
curl -f http://127.0.0.1:4173/
curl -f http://127.0.0.1:4173/config/app-content.json
npx playwright --version
npx playwright install chromium
npm run test:core
npm run test:e2e
```

`test:core` is intended to run real helper tests with the Playwright runner, no browser;
`test:e2e` runs required Chromium browser smokes against the built static server.
Reuse/start the documented test server with a known port; avoid claiming tests target
dist if they target dev. Matching browser binaries may not be installed: report exact
blocker instead of claiming pass. No blanket OS `--with-deps` install is authorized.
Capture node/npm/package/browser versions, command output, URL/port, build and source
revision. Actual Railway deployment requires separate owner permission and capability;
local success proves deployability only. No Railway command is part of this pass.

## Required validation scenarios

1. **Configured serving (R1/R2):** build/start, inspect actual listener and HTTP root,
   SVG asset and public JSON responses (JSON Cache-Control no-store). Confirm default
   PORT 3000 when unset and explicit nondefault host/port, invalid PORT nonzero exit,
   and no directory listing. Hold the chosen port with a test-owned listener, run the
   same npm start command: require nonzero exit and no second/fallback listener;
   capture exit status plus before/after listener output, then stop only owned processes.
   Reload a hash route. Confirm nonexistent
   config returns failure and not index HTML. In a test-owned served fixture edit a
   class title AND schedule, reorder a plan's steps, and change reward copy. Reload
   each relevant screen and assert the edited strings/order with no React changes.
   Test missing file, malformed JSON and broken reference separately; useful Spanish
   error/retry replaces the experience. Restore config in test cleanup; do not leave
   dirty presenter data. Test dev as an additional sanity check, not substitute for dist.
2. **Safe practice (R3/R4):** inspect nine sport/profile combinations and both routes;
   compare beginner/returning/regular content. Run Calistenia from explicit start
   through all configured steps, then Mi camino/rewards and refresh. Repeat final
   activation/back/forward/success visit: one ID/one contribution only. Preview,
   incomplete steps and stage jumps yield zero. New start creates a new attempt.
   Test Natación unknown/no ability, unsafe pool and regular profile alone: only
   dry-land or instructor redirect, never water start. Both explicit affirmations
   unlock eligible water sets; forged navigation/action cannot bypass.
3. **Honest classes and reset (R5):** open exact free and paid Yoga records; verify
   their own details and persistent simulated interest, no points/completion. Verify
   fixture/detail coverage for both classes in each sport. Switch among all profiles
   and sports/routes, confirm no stale exercises/classes. Reload preserves chosen
   profile and isolated histories. Put an unrelated sentinel key in localStorage,
   deliberately reset: first-time selected/empty, fixture profiles restored, all
   user completion/interest cleared, sentinel untouched. Corrupt or deny demo storage:
   Spanish recovery/limitation, no crash or persistence promise.
4. **Derived continuity (R6):** compare UI with independent recomputation from
   documented baseline + app records and configured rules. Fixed test clock
   2026-10-14 Buenos Aires; additionally test Monday/month boundaries. First-time
   has no invented years/history; other profiles' seeds labeled. App completions
   show real dates/origin, period changes do not erase lifetime achievements. Check
   immediate journey/reward consistency and benefit `sin convenio vigente` copy.
5. **Focused manual evidence (R7/R8):** use 360px and 1280px viewports; compare the
   actual mockup SVG art, palette, rounded hierarchy and centered single app view.
   Keyboard-only traverse, visible focus, semantic Spanish accessible names/errors,
   readable contrast/type, comfortable targets, scrolling and reduced motion.
   Record screenshots/observations, not universal accessibility/device certification.
   Time an eligible solo after sport selection (<~90s) and the main presenter story
   (~3–5 min): first-time Calistenia → journey/rewards → Yoga class interest →
   swimming guard → returning/regular continuity → reset. Remove inert actions.
6. **Handoff (R9):** report actual automated/manual outcomes and any UNRUN/failed checks,
   compare documented scripts/reset/config editing with implementation. README links
   content guide and deployment owner. Report deployment as unknown/not performed
   unless separately authorized and actually verified.

Keep permanent actual-helper tests and composed browser checks; failures block affected
reliance until corrected and rerun. No tests, browser runs, app build, installs or
presenter rehearsal have occurred at this planning stage.

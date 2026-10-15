# Open issues

Canonical register for verified unresolved work, maintained through installed
[track-open-issue](/home/dev/.agents/skills/track-open-issue/SKILL.md).

## Active issues

### OI-1 — Assess reported dependency audit warnings

- **Status**: open
- **Classification**: investigation
- **Problem**: The locked dependency installation reports three high-severity
  vulnerabilities. Affected packages, advisory applicability, runtime versus
  development exposure, and remediation have not been assessed. This is not a
  claim that three vulnerabilities are exploitable in the static demo.
- **Primary evidence**: `npm ci` output in `/tmp/ba-batch-c/t008-ci.log` reports
  “3 high severity vulnerabilities” for the [locked dependencies](../package-lock.json)
  at implementation commit `95d25478dd156be72fbc3724d7b476b82bb8abb2`.
- **Resumption condition**: Run `npm audit --json` against the retained lockfile,
  inspect affected advisories and production/development reachability, then obtain
  approval for any dependency changes and rerun affected build/browser checks.
  Do not apply `npm audit fix --force` blindly.

### OI-2 — Add explicit load-failure feedback for plan thumbnails

- **Status**: open
- **Classification**: bug
- **Problem**: Exercise thumbnails in the plan overview show the Spanish unavailable-image
  state only when no configured path exists. If a configured local JPEG fails to load,
  the browser displays a broken image instead of the explicit unavailable state used by
  the active-session screen. Exercise instructions remain visible and no remote fallback
  occurs.
- **Primary evidence**: `src/screens/Plan.tsx` renders step images without an `onError`
  state, while `src/screens/Session.tsx` handles image errors and renders
  `ui.imageUnavailable`. Final independent review at implementation commit
  `d6ca077011868ce4a9079d8a84a69cc4080ca45b` classified this as a non-blocking P2 finding.
- **Resumption condition**: Add bounded per-thumbnail load-failure state or a shared local
  image component, preserve the step instructions, and add a browser assertion that a
  failed local thumbnail request produces the Spanish unavailable message without a
  remote request or fallback.

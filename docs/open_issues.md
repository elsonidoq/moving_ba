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

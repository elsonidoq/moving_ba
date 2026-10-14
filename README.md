# BA en movimiento

A conceptual Spanish-language demo, not an official service. No live deployment or integrations.

## Local development

Use Node 22.x (>=22.12) and npm. Install the locked dependencies:

```sh
npm ci
npm run dev -- --host 0.0.0.0
npm run typecheck
npm run build
PORT=4173 npm start
```

`start` serves only built `dist` on `0.0.0.0`. PORT defaults to 3000 only when unset;
supplied PORT must be a decimal integer 1–65535. Occupied ports fail, never switch.
Missing files return 404; no directory listings or SPA catch-all.

## Checks

```sh
npm run test:core
npm run test:e2e
```

The Playwright core project runs helpers without a browser; the Chromium project uses
built `dist` through the same production start command on port 4173 (must be free).
Build first. Matching Playwright Chromium is required; set `PLAYWRIGHT_BROWSERS_PATH`
when using a separately installed browser cache. No automatic OS installation.
Tests are added with their delivered functionality.

[Architecture](docs/architecture.md) · [Deployment status](docs/deployment.md) ·
[Approved feature](specs/001-ba-movement-demo/README.md)

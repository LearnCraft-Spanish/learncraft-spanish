# Dependabot triage — 2026-11-09

Snapshot of the 155 open Dependabot alerts on `LearnCraft-Spanish/learncraft-spanish`, checked against the lockfiles on `staging` (`4ede66da`, identical to `main` for every manifest involved).

## Status

**Done on `chore/dependabot-triage`: root lockfile regenerated.** The root `pnpm-lock.yaml` is now a copy of `lockfiles/ci/pnpm-lock.yaml`, with the importer key changed from `../..` to `.`. On this branch:

- `pnpm install --frozen-lockfile` succeeds.
- Typecheck, lint (0 errors), `test:hexagon:ai` (3240 passed) and `build` all pass.

Rechecked against the new lockfile, **54 of the 155 alerts remain**. The other 101 close once this merges to `main`.

| Bucket                       | Still open after regen                                                                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| A (browser bundle)           | 7: react-router 4, zod 3                                                                                                                        |
| B (dev server / test runner) | 12: @vitest/mocker 4, tinypool 4, vitest 3, vite 1                                                                                              |
| C (build/lint/test tooling)  | 35: handlebars 10, serialize-javascript 6, tmp 4, glob 3, @faker-js/faker 3, @babel/core 2, deepmerge 2, follow-redirects 2, minimatch 2, ajv 1 |

**Drift prevention:** `install:ci:regenerate` now copies the CI lockfile to the root (`pnpm lockfile:sync`), and a `lockfile-sync` CI job fails any PR where the two differ.

The sections below describe the original snapshot, taken before the regen.

## Step 1 — Do the alerts match versions we actually install?

Each alert names one manifest. For every alert, the versions of that package resolved in that manifest's lockfile were checked against the advisory's vulnerable range (`semver.satisfies`).

**Result: all 155 alerts are real. None are already fixed by the current lockfiles.** Each one has at least one vulnerable version resolved in the lockfile it was raised against.

| Manifest                                | Alerts | Still vulnerable there | Already fixed in `lockfiles/ci` |
| --------------------------------------- | ------ | ---------------------- | ------------------------------- |
| `pnpm-lock.yaml` (root)                 | 120    | 120                    | **101**                         |
| `lockfiles/ci/pnpm-lock.yaml`           | 31     | 31                     | —                               |
| `package.json` (resolved via root lock) | 4      | 4                      | 0                               |

### The real finding: the root lockfile is badly out of date

`lockfiles/ci/pnpm-lock.yaml` is the lockfile CI and local installs use (`install:ci`, `install:local`, `install:published`). The root `pnpm-lock.yaml` only gets a plain `pnpm install` in `install:ci:regenerate`, which keeps its old resolutions, so it never picks up transitive bumps. Examples:

| Package          | Root lock              | CI lock                 |
| ---------------- | ---------------------- | ----------------------- |
| axios            | 1.15.2                 | 1.20.0                  |
| vite             | 6.4.2                  | 6.4.4                   |
| react-router-dom | 6.30.3                 | 6.30.6                  |
| brace-expansion  | 1.1.12 / 2.1.0 / 5.0.5 | 1.1.21 / 2.1.7 / 5.0.12 |
| fast-uri         | 3.0.6                  | 3.1.9                   |
| js-yaml          | 3.14.1 / 4.1.0         | 3.15.2 / 4.3.2          |

**This matters for production (confirmed).** Netlify's build command is just `pnpm build`, so Netlify's automatic dependency install runs first, from the root `pnpm-lock.yaml`. The deployed bundle was therefore built from the _stale_ lockfile, not the one CI tests against. Bringing the root lockfile in line with the CI lockfile would close 101 alerts with no `package.json` changes.

## Step 2 — Exploitability

Each package was traced from our app (`pnpm why`, imports in `src/`) and its advisory read. Dependabot's `runtime` / `development` scope isn't reliable here. `axios` is a devDependency but ships in the browser bundle (`src/hexagon/infrastructure/http/client.ts`). Meanwhile `eslint` tooling and `@sentry/vite-plugin` sit in `dependencies` but never reach the browser.

The app is a static SPA, so there is no server for us to compromise. The attack surfaces are (1) the JS bundle running in users' browsers and (2) developer and CI machines.

### Exploitable: none found

No alert has a realistic attack path against users of the deployed app as the code stands today.

### Bucket A — ships in the browser bundle, not exploitable in our usage (30 alerts)

These are the highest priority anyway, because they reach users' browsers.

- **axios (19 alerts).**
  - About half are Node-only: the HTTP / HTTP2 adapter, proxy, `NO_PROXY`, `Proxy-Authorization`, `createConnection` and FormData `getHeaders`. In the browser axios uses the XHR adapter, so those code paths never run.
  - The rest are "prototype-pollution gadgets". They only matter if an attacker can first pollute `Object.prototype` through some other bug, and we know of no such bug in our bundle.
  - Already 1.20.0 (fully patched) in the CI lock. The root lock has 1.15.2.
- **react-router / react-router-dom / @remix-run/router (7 alerts).**
  - `@remix-run/router` `redirect()` and `deserializeErrors()` are SSR / data-router features. We use declarative `<BrowserRouter>` and do no SSR.
  - The open-redirect advisories need an attacker-controlled path passed to `navigate()` or `<Link>`. We found two places where a path comes from the URL:
    - the Auth0 `targetUrl` in `Providers.tsx`
    - the `location.pathname` rebuild in `useEnableFilteringParam` / `FlashcardManagerV1` / `ReviewMyFlashcards*`
  - Both use `{ replace: true }`. `replaceState` with a cross-origin URL throws instead of navigating, so a URL like `https://app…//evil.com` can't send the user anywhere. **This is fragile:** with a plain `navigate(path)` (push), the router falls back to `window.location.assign()`, which _would_ redirect. Worth fixing as hardening.
  - 6.30.6 in the CI lock, where 4 of these alerts remain. Fully fixing them needs React Router 7.18+, which is a major upgrade.
- **zod (3 alerts).**
  - Memory exhaustion from validating huge arrays.
  - We only parse responses from our own API inside the user's own browser, so the worst case is a user crashing their own tab.
  - Zod 3.x has no patched release. The fix is in 4.6.6, so this is tied to the zod 4 migration (and to `@learncraft-spanish/shared`, which also pulls in zod 3).
- **uuid (1 alert).** Only affects `v3`/`v5`/`v6` with a caller-provided buffer. We only call `v4()`.

### Bucket B — dev machine / dev server, exploitable only in setups we don't use (20 alerts)

- **vite (8).**
  - Two `server.fs.deny` bypasses need the dev server exposed on the network (`--host`).
    - ⚠️ CLAUDE.md's Cursor Cloud instructions run `vite --host 0.0.0.0`. On a cloud VM with an open port, that could expose files.
  - The `launch-editor` advisories need Windows or Vim/Emacs plus attacker-planted filenames.
  - The custom-middleware one needs `appType: 'custom'`, which we don't use.
  - The CI lock has 6.4.4 (one alert left); the root lock has 6.4.2.
- **vitest / @vitest/mocker (8).** Need Vitest UI or browser mode, or the API server exposed to the network. We run headless jsdom only.
- **tinypool (4, critical).** Remote code execution only if something has already polluted `Object.prototype` inside the test process. Inputs to the test process are trusted. Needs Vitest 4.x to fix (3.2.x pins tinypool 1.x).

### Bucket C — build, lint and test tooling that only processes our own trusted inputs (105 alerts)

These run at lint, test or build time, on files we write ourselves. Every one is a DoS, ReDoS, prototype-pollution or parsing bug that needs attacker-controlled input to the tool. The worst realistic outcome is a slow or crashing build.

- **Glob and brace handling:** brace-expansion (20), minimatch (6), glob (3), picomatch (1).
- **Config, schema and URL parsing:** fast-uri (11), ajv (2), js-yaml (10). All of these come in through eslint or stryker.
- **Test runner and reporting:** handlebars (10), via istanbul / ts-jest coverage reports. These advisories need untrusted templates or ASTs.
- **Build pipeline:**
  - serialize-javascript (6), postcss (2), postcss-selector-parser (2), source-map-js (1), browserslist (2), @babel/core (2) and nanoid (1)
  - immutable (3), via sass
- **Node-side test and tooling deps:**
  - follow-redirects (4), form-data (1), qs (4) and ws (1)
  - tmp (4), deepmerge (2), flatted (2) and @humanfs/node (1)
- **@faker-js/faker (3).** Test-only. Needs attacker-controlled `helpers.fake()` templates.
- **jws (1), via `jsonwebtoken`.** `jsonwebtoken` is listed in `dependencies` but **nothing in the repo imports it**. Removing it closes the alert.

## What would close the most alerts with the least risk

1. **Regenerate the root lockfile to match `lockfiles/ci`.** Closes 101 alerts and also fixes the stale production build.
2. **Remove the unused `jsonwebtoken` dependency.** Closes 1.
3. **Use `pnpm.overrides` or targeted bumps for the patch-level transitive fixes still open in the CI lock.** Covers handlebars 4.7.8, glob, minimatch, zod 4 (via shared), follow-redirects, deepmerge, serialize-javascript and tmp.
4. **Major upgrades, as separate PRs:**
   - Vitest 3 → 4: tinypool criticals, vitest and mocker
   - React Router 6 → 7.18: the remaining router alerts
   - zod 3 → 4: the zod alerts, coordinated with `lcs-shared`
   - @faker-js/faker 9 → 10.5
5. **Hardening, independent of alerts:** validate `targetUrl` / rebuilt paths so they always start with a single `/`. Also drop `--host 0.0.0.0` from cloud-agent instructions unless it's required.

## Appendix — every alert

Buckets: **A** = ships in the browser bundle, not exploitable in our usage. **B** = dev server / test runner. **C** = build, lint and test tooling with trusted inputs.
"Fixed in CI lock?" = the CI lockfile already has no vulnerable version of this package for this advisory.

### Bucket A

| #   | Sev    | Package             | Manifest     | Vulnerable version installed | Fixed in CI lock? | Patched in | Summary                                                                                                                               |
| --- | ------ | ------------------- | ------------ | ---------------------------- | ----------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 325 | medium | `@remix-run/router` | root         | 1.23.2                       | yes               | 1.23.3     | React Router's same-origin redirect with path starting // causes open redirect via protocol-relative URL reinterpretation             |
| 256 | low    | `axios`             | root         | 1.15.2                       | yes               | 1.16.0     | Axios has a Patch Bypass: Proxy-Authorization Header Injection via Prototype Pollution — Incomplete Null-Prototype Fix                |
| 264 | high   | `axios`             | root         | 1.15.2                       | yes               | 1.16.0     | Axios: Proxy-Authorization Credential Leak to Origin Server Across HTTP-to-HTTPS Redirect in Axios Node.js HTTP Adapter               |
| 265 | high   | `axios`             | root         | 1.15.2                       | yes               | 1.16.0     | Axios: Proxy-Authorization header leaks to redirect target when proxy is re-evaluated to direct connection                            |
| 268 | medium | `axios`             | root         | 1.15.2                       | yes               | 1.16.0     | axios has DoS & Header Injection via Prototype Pollution Read-Side Gadgets in axios merge functions                                   |
| 270 | high   | `axios`             | root         | 1.15.2                       | yes               | 1.16.0     | axios Vulnerable to Full Man-in-the-Middle via Prototype Pollution Gadget in `config.proxy`                                           |
| 286 | high   | `axios`             | root         | 1.15.2                       | yes               | 1.16.0     | axios's shouldBypassProxy does not recognize IPv4-mapped IPv6 addresses, allowing NO_PROXY bypass (incomplete fix for CVE-2025-62718) |
| 288 | medium | `axios`             | root         | 1.15.2                       | yes               | 1.18.0     | Axios: Prototype pollution auth subfields can inject Basic auth                                                                       |
| 291 | medium | `axios`             | root         | 1.15.2                       | yes               | 1.18.0     | Axios: NO_PROXY bypass for 0.0.0.0 local addresses in axios                                                                           |
| 293 | high   | `axios`             | root         | 1.15.2                       | yes               | 1.18.0     | Axios Node HTTP adapter can use an inherited proxy after interceptor config cloning                                                   |
| 299 | medium | `axios`             | root         | 1.15.2                       | yes               | 1.18.0     | Axios: Prototype pollution gadgets can alter axios request construction                                                               |
| 301 | medium | `axios`             | root         | 1.15.2                       | yes               | 1.18.0     | Axios: Nested axios option objects can consume polluted prototype values                                                              |
| 367 | high   | `axios`             | root         | 1.15.2                       | yes               | 1.20.0     | Axios: HTTP/2 adapter bypasses configured DNS lookup and proxy controls                                                               |
| 368 | high   | `axios`             | root         | 1.15.2                       | yes               | 1.20.0     | Axios: Prototype Pollution Gadget in axios toFormData Options                                                                         |
| 370 | medium | `axios`             | root         | 1.15.2                       | yes               | 1.20.0     | Axios: Prototype-Pollution Gadget in the Default Instance Allows Inherited Object.prototype.method to Override HTTP Method            |
| 371 | medium | `axios`             | root         | 1.15.2                       | yes               | 1.20.0     | Axios: Prototype pollution gadget in fetch adapter can alter outbound requests                                                        |
| 372 | medium | `axios`             | root         | 1.15.2                       | yes               | 1.20.0     | Axios: CIDR-form NO_PROXY entries are ignored, causing proxy exclusion bypass for internal IP ranges                                  |
| 373 | high   | `axios`             | root         | 1.15.2                       | yes               | 1.20.0     | Axios: Node HTTP adapter prototype-pollution gadget allows request socket hijack via inherited createConnection                       |
| 374 | medium | `axios`             | root         | 1.15.2                       | yes               | 1.20.0     | Axios: Fetch Adapter Header Injection via Inherited FormData getHeaders                                                               |
| 375 | medium | `axios`             | root         | 1.15.2                       | yes               | 1.20.0     | Axios: Header Injection via Inherited headers After Minimal Interceptor                                                               |
| 261 | medium | `react-router`      | root         | 6.30.3                       | yes               | 6.30.4     | React Router's same-origin redirect with path starting // causes open redirect via protocol-relative URL reinterpretation             |
| 308 | medium | `react-router`      | root         | 6.30.3                       | no                | 7.18.0     | React Router: Arbitrary Constructor Injection via deserializeErrors() in React Router SSR Hydration                                   |
| 309 | medium | `react-router`      | root         | 6.30.3                       | no                | 7.18.0     | React Router: Open redirect via backslash in <Link> and useNavigate (CVE-2025-68470 bypass)                                           |
| 310 | medium | `react-router`      | ci           | 6.30.6                       | —                 | 7.18.0     | React Router: Arbitrary Constructor Injection via deserializeErrors() in React Router SSR Hydration                                   |
| 311 | medium | `react-router`      | ci           | 6.30.6                       | —                 | 7.18.0     | React Router: Open redirect via backslash in <Link> and useNavigate (CVE-2025-68470 bypass)                                           |
| 346 | medium | `react-router-dom`  | root         | 6.30.3                       | yes               | 6.30.6     | React Router: Open redirect leading to XSS                                                                                            |
| 253 | medium | `uuid`              | root         | 11.1.0                       | yes               | 11.1.1     | uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided                                                                    |
| 398 | high   | `zod`               | ci           | 3.25.76                      | —                 | 4.6.6      | Zod can exhaust memory while validating oversized constrained collections                                                             |
| 405 | high   | `zod`               | package.json | 3.25.76, 4.0.14              | no                | 4.6.6      | Zod can exhaust memory while validating oversized constrained collections                                                             |
| 412 | high   | `zod`               | root         | 3.25.76, 4.0.14              | no                | 4.6.6      | Zod can exhaust memory while validating oversized constrained collections                                                             |

### Bucket B

| #   | Sev      | Package          | Manifest     | Vulnerable version installed | Fixed in CI lock? | Patched in | Summary                                                                                                            |
| --- | -------- | ---------------- | ------------ | ---------------------------- | ----------------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| 347 | medium   | `@vitest/mocker` | root         | 3.2.4                        | no                | 4.1.11     | Vitest: Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock                                      |
| 350 | medium   | `@vitest/mocker` | ci           | 3.2.7                        | —                 | 4.1.11     | Vitest: Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock                                      |
| 392 | medium   | `@vitest/mocker` | root         | 3.2.4                        | no                | 4.1.12     | Vitest: Code injection via unauthenticated manual mock registration                                                |
| 393 | medium   | `@vitest/mocker` | ci           | 3.2.7                        | —                 | 4.1.12     | Vitest: Code injection via unauthenticated manual mock registration                                                |
| 377 | critical | `tinypool`       | ci           | 1.1.1                        | —                 | 2.1.2      | Tinypool: Prototype Pollution Gadget to RCE in run() options                                                       |
| 378 | critical | `tinypool`       | ci           | 1.1.1                        | —                 | 2.1.1      | Tinypool: Prototype Pollution gadget in worker options leads to Remote Code Execution                              |
| 385 | critical | `tinypool`       | root         | 1.1.1                        | no                | 2.1.2      | Tinypool: Prototype Pollution Gadget to RCE in run() options                                                       |
| 386 | critical | `tinypool`       | root         | 1.1.1                        | no                | 2.1.1      | Tinypool: Prototype Pollution gadget in worker options leads to Remote Code Execution                              |
| 282 | medium   | `vite`           | root         | 6.4.2                        | yes               | 6.4.3      | vite: `server.fs.deny` bypass on Windows alternate paths                                                           |
| 283 | medium   | `vite`           | root         | 6.4.2                        | yes               | 6.4.3      | launch-editor: NTLMv2 hash disclosure via UNC path handling on Windows                                             |
| 401 | medium   | `vite`           | ci           | 6.4.4                        | —                 | 6.4.5      | Vite: `server.fs.deny` bypassed with queries                                                                       |
| 407 | medium   | `vite`           | root         | 6.4.2                        | yes               | 6.4.4      | launch-editor: escapeCmdArgs() omits % escaping on Windows                                                         |
| 408 | high     | `vite`           | root         | 6.4.2                        | yes               | 6.4.4      | launch-editor: `fs.existsSync()` existence check can be bypassed on Windows                                        |
| 409 | medium   | `vite`           | root         | 6.4.2                        | yes               | 6.4.4      | launch-editor: Editor CLI flag misinterpretation causing arbitrary command execution for some editors              |
| 410 | medium   | `vite`           | root         | 6.4.2                        | yes               | 6.4.4      | Vite: Files outside `server.fs.allow` could be served when project paths match system paths on non-Windows machine |
| 411 | low      | `vite`           | root         | 6.4.2                        | yes               | 6.4.4      | Vite: Cross origin script execution through Vite custom middleware                                                 |
| 266 | critical | `vitest`         | root         | 3.2.4                        | yes               | 3.2.6      | When Vitest UI server is listening, arbitrary file can be read and executed                                        |
| 351 | medium   | `vitest`         | package.json | 3.2.4                        | no                | 4.1.11     | Vitest: Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock                                      |
| 352 | medium   | `vitest`         | root         | 3.2.4                        | no                | 4.1.11     | Vitest: Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock                                      |
| 354 | medium   | `vitest`         | ci           | 3.2.7                        | —                 | 4.1.11     | Vitest: Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock                                      |

### Bucket C

| #   | Sev      | Package                   | Manifest     | Vulnerable version installed  | Fixed in CI lock? | Patched in | Summary                                                                                                                                              |
| --- | -------- | ------------------------- | ------------ | ----------------------------- | ----------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 278 | low      | `@babel/core`             | root         | 7.25.9, 7.28.0                | no                | 7.29.6     | @babel/core: Arbitrary File Read via sourceMappingURL Comment                                                                                        |
| 279 | low      | `@babel/core`             | ci           | 7.25.9                        | —                 | 7.29.6     | @babel/core: Arbitrary File Read via sourceMappingURL Comment                                                                                        |
| 336 | high     | `@faker-js/faker`         | package.json | 9.9.0                         | no                | 10.5.0     | Faker: helpers.fake exploitable into arbritary code execution                                                                                        |
| 337 | high     | `@faker-js/faker`         | root         | 9.9.0                         | no                | 10.5.0     | Faker: helpers.fake exploitable into arbritary code execution                                                                                        |
| 338 | high     | `@faker-js/faker`         | ci           | 9.9.0                         | —                 | 10.5.0     | Faker: helpers.fake exploitable into arbritary code execution                                                                                        |
| 335 | medium   | `@humanfs/node`           | root         | 0.16.6                        | yes               | 0.16.8     | humanfs: Recursive copy follows symlinked files and copies data from outside the source tree                                                         |
| 151 | medium   | `ajv`                     | root         | 6.12.6                        | yes               | 6.14.0     | ajv has ReDoS when using `$data` option                                                                                                              |
| 154 | medium   | `ajv`                     | ci           | 8.17.1                        | —                 | 8.18.0     | ajv has ReDoS when using `$data` option                                                                                                              |
| 214 | medium   | `brace-expansion`         | root         | 1.1.12                        | yes               | 1.1.13     | brace-expansion: Zero-step sequence causes process hang and memory exhaustion                                                                        |
| 247 | medium   | `brace-expansion`         | root         | 5.0.5                         | yes               | 5.0.6      | brace-expansion: Large numeric range defeats documented `max` DoS protection                                                                         |
| 290 | high     | `brace-expansion`         | root         | 5.0.5                         | yes               | 5.0.7      | brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups                                                           |
| 297 | high     | `brace-expansion`         | root         | 1.1.12, 1.1.14                | yes               | 1.1.16     | brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups                                                           |
| 298 | high     | `brace-expansion`         | root         | 2.1.0                         | yes               | 2.1.2      | brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups                                                           |
| 314 | high     | `brace-expansion`         | root         | 5.0.5                         | yes               | 5.0.8      | brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash                                                           |
| 317 | high     | `brace-expansion`         | root         | 2.1.0                         | yes               | 2.1.3      | brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash                                                           |
| 319 | high     | `brace-expansion`         | root         | 5.0.5                         | yes               | 5.0.9      | brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation                                                      |
| 321 | high     | `brace-expansion`         | root         | 1.1.12, 1.1.14                | yes               | 1.1.17     | brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash                                                           |
| 322 | high     | `brace-expansion`         | root         | 1.1.12, 1.1.14                | yes               | 1.1.18     | brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation                                                      |
| 323 | high     | `brace-expansion`         | root         | 2.1.0                         | yes               | 2.1.4      | brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation                                                      |
| 356 | high     | `brace-expansion`         | root         | 5.0.5                         | yes               | 5.0.10     | brace-expansion: DoS via uncontrolled recursion in parseCommaParts causing stack exhaustion                                                          |
| 357 | high     | `brace-expansion`         | root         | 2.1.0                         | yes               | 2.1.5      | brace-expansion: DoS via uncontrolled recursion in parseCommaParts causing stack exhaustion                                                          |
| 358 | high     | `brace-expansion`         | root         | 1.1.12, 1.1.14                | yes               | 1.1.19     | brace-expansion: DoS via uncontrolled recursion in parseCommaParts causing stack exhaustion                                                          |
| 359 | high     | `brace-expansion`         | root         | 5.0.5                         | yes               | 5.0.11     | brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exhaustion                                                      |
| 360 | high     | `brace-expansion`         | root         | 2.1.0                         | yes               | 2.1.6      | brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exhaustion                                                      |
| 361 | high     | `brace-expansion`         | root         | 1.1.12, 1.1.14                | yes               | 1.1.20     | brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exhaustion                                                      |
| 362 | medium   | `brace-expansion`         | root         | 5.0.5                         | yes               | 5.0.12     | brace-expansion: Quadratic-time expansion of the `{a},b}` rewrite causes CPU denial of service                                                       |
| 363 | medium   | `brace-expansion`         | root         | 2.1.0                         | yes               | 2.1.7      | brace-expansion: Quadratic-time expansion of the `{a},b}` rewrite causes CPU denial of service                                                       |
| 364 | medium   | `brace-expansion`         | root         | 1.1.12, 1.1.14                | yes               | 1.1.21     | brace-expansion: Quadratic-time expansion of the `{a},b}` rewrite causes CPU denial of service                                                       |
| 343 | high     | `browserslist`            | root         | 4.25.1                        | yes               | 4.28.7     | Browserslist: Unbounded memory growth (no cache eviction) via distinct query results, leading to eventual OOM                                        |
| 344 | high     | `browserslist`            | root         | 4.25.1                        | yes               | 4.28.7     | Browserslist: Uncaught crash / prototype write via untrusted browserslist-stats.json custom stats (normalizeStats)                                   |
| 400 | low      | `deepmerge`               | ci           | 4.3.1                         | —                 | none       | deepmerge mergeObject() allows prototype poisoning of returned objects                                                                               |
| 416 | low      | `deepmerge`               | root         | 4.3.1                         | no                | none       | deepmerge mergeObject() allows prototype poisoning of returned objects                                                                               |
| 304 | high     | `fast-uri`                | root         | 3.0.6                         | yes               | 3.1.3      | fast-uri vulnerable to host confusion via failed IDN canonicalization                                                                                |
| 305 | high     | `fast-uri`                | root         | 3.0.6                         | yes               | 3.1.4      | fast-uri vulnerable to host confusion via literal backslash authority delimiter                                                                      |
| 320 | high     | `fast-uri`                | root         | 3.0.6                         | yes               | 3.1.5      | fast-uri vulnerable to host confusion via backslash authority introducer                                                                             |
| 330 | high     | `fast-uri`                | root         | 3.0.6                         | yes               | 3.1.2      | fast-uri vulnerable to host confusion via percent-encoded authority delimiters                                                                       |
| 331 | high     | `fast-uri`                | root         | 3.0.6                         | yes               | 3.1.1      | fast-uri vulnerable to path traversal via percent-encoded dot segments                                                                               |
| 339 | high     | `fast-uri`                | root         | 3.0.6                         | yes               | 3.1.6      | fast-uri vulnerable to server-side request forgery via malformed IPv6 normalization                                                                  |
| 340 | high     | `fast-uri`                | root         | 3.0.6                         | yes               | 3.1.6      | fast-uri vulnerable to host confusion via percent-encoded scheme normalization                                                                       |
| 355 | high     | `fast-uri`                | root         | 3.0.6                         | yes               | 3.1.7      | fast-uri vulnerable to authority injection via an unvalidated port in serialize                                                                      |
| 395 | medium   | `fast-uri`                | root         | 3.0.6                         | yes               | 3.1.9      | fast-uri vulnerable to URI scheme spoofing via percent-encoded scheme decoding                                                                       |
| 396 | low      | `fast-uri`                | root         | 3.0.6                         | yes               | 3.1.9      | fast-uri vulnerable to scheme injection via an unescaped first-segment colon in suffix references                                                    |
| 397 | low      | `fast-uri`                | root         | 3.0.6                         | yes               | 3.1.9      | fast-uri vulnerable to improper path equivalence in relative reference normalization                                                                 |
| 189 | high     | `flatted`                 | root         | 3.3.3                         | yes               | 3.4.0      | flatted vulnerable to unbounded recursion DoS in parse() revive phase                                                                                |
| 191 | high     | `flatted`                 | root         | 3.3.3                         | yes               | 3.4.2      | Prototype Pollution via parse() in NodeJS flatted                                                                                                    |
| 390 | high     | `follow-redirects`        | root         | 1.16.0                        | yes               | 1.16.1     | follow-redirects sensitiveHeaders regex escaping can expose credential headers                                                                       |
| 391 | high     | `follow-redirects`        | root         | 1.16.0                        | yes               | 1.16.1     | follow-redirects array-form headers bypass cross-origin credential stripping                                                                         |
| 402 | high     | `follow-redirects`        | ci           | 1.16.1                        | —                 | 1.16.2     | follow-redirects: Cross-realm sensitiveHeaders arrays are discarded and custom credentials can follow redirects                                      |
| 417 | high     | `follow-redirects`        | root         | 1.16.0                        | no                | 1.16.2     | follow-redirects: Cross-realm sensitiveHeaders arrays are discarded and custom credentials can follow redirects                                      |
| 276 | high     | `form-data`               | root         | 4.0.5                         | yes               | 4.0.6      | form-data: CRLF injection in form-data via unescaped multipart field names and filenames                                                             |
| 403 | medium   | `glob`                    | ci           | 10.5.0, 13.0.6, 9.3.5         | —                 | 14.0.2     | Glob: AbortSignal cancellation bypass allows post-timeout filesystem traversal                                                                       |
| 406 | medium   | `glob`                    | package.json | 10.5.0, 11.1.0, 13.0.6, 9.3.5 | no                | 14.0.2     | Glob: AbortSignal cancellation bypass allows post-timeout filesystem traversal                                                                       |
| 418 | medium   | `glob`                    | root         | 10.5.0, 11.1.0, 13.0.6, 9.3.5 | no                | 14.0.2     | Glob: AbortSignal cancellation bypass allows post-timeout filesystem traversal                                                                       |
| 202 | medium   | `handlebars`              | ci           | 4.7.8                         | —                 | 4.7.9      | Handlebars.js has Prototype Pollution Leading to XSS through Partial Template Injection                                                              |
| 209 | high     | `handlebars`              | ci           | 4.7.8                         | —                 | 4.7.9      | Handlebars.js has JavaScript Injection via AST Type Confusion by tampering @partial-block                                                            |
| 210 | high     | `handlebars`              | ci           | 4.7.8                         | —                 | 4.7.9      | Handlebars.js has Denial of Service via Malformed Decorator Syntax in Template Compilation                                                           |
| 211 | high     | `handlebars`              | ci           | 4.7.8                         | —                 | 4.7.9      | Handlebars.js has JavaScript Injection via AST Type Confusion when passing an object as dynamic partial                                              |
| 212 | high     | `handlebars`              | ci           | 4.7.8                         | —                 | 4.7.9      | Handlebars.js has JavaScript Injection in CLI Precompiler via Unescaped Names and Options                                                            |
| 216 | low      | `handlebars`              | ci           | 4.7.8                         | —                 | 4.7.9      | Handlebars.js has a Property Access Validation Bypass in container.lookup                                                                            |
| 217 | medium   | `handlebars`              | ci           | 4.7.8                         | —                 | 4.7.9      | Handlebars.js has a Prototype Method Access Control Gap via Missing **lookupSetter** Blocklist Entry                                                 |
| 381 | critical | `handlebars`              | ci           | 4.7.8                         | —                 | 4.7.10     | Handlebars: JavaScript Injection via AST Type Confusion in compile (bypass of CVE-2026-33937)                                                        |
| 382 | medium   | `handlebars`              | ci           | 4.7.8                         | —                 | 4.7.10     | Handlebars: JavaScript Injection via Unsafe Inline Embedding of Precompiled Templates                                                                |
| 383 | critical | `handlebars`              | ci           | 4.7.8                         | —                 | 4.7.10     | Handlebars: JavaScript Injection via Own Property Check Bypass                                                                                       |
| 187 | high     | `immutable`               | root         | 5.1.3                         | yes               | 5.1.5      | Immutable is vulnerable to Prototype Pollution                                                                                                       |
| 302 | high     | `immutable`               | root         | 5.1.3                         | yes               | 5.1.8      | Immutable.js `List` 32-bit trie overflow → unrecoverable DoS                                                                                         |
| 303 | high     | `immutable`               | root         | 5.1.3                         | yes               | 5.1.8      | Immutable: Hash-collision algorithmic complexity denial of service in Immutable.Map/Set                                                              |
| 116 | medium   | `js-yaml`                 | root         | 4.1.0                         | yes               | 4.1.1      | js-yaml has prototype pollution in merge (<<)                                                                                                        |
| 118 | medium   | `js-yaml`                 | root         | 3.14.1                        | yes               | 3.14.2     | js-yaml has prototype pollution in merge (<<)                                                                                                        |
| 284 | medium   | `js-yaml`                 | root         | 4.1.0                         | yes               | 4.2.0      | JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases                                                                         |
| 285 | medium   | `js-yaml`                 | root         | 3.14.1                        | yes               | 3.15.0     | JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases                                                                         |
| 294 | high     | `js-yaml`                 | root         | 4.1.0                         | yes               | 4.3.0      | js-yaml: YAML merge-key chains can force quadratic CPU consumption                                                                                   |
| 295 | high     | `js-yaml`                 | root         | 3.14.1                        | yes               | 3.15.0     | js-yaml: YAML merge-key chains can force quadratic CPU consumption                                                                                   |
| 326 | high     | `js-yaml`                 | root         | 4.1.0                         | yes               | 4.3.1      | JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported                                            |
| 327 | high     | `js-yaml`                 | root         | 3.14.1                        | yes               | 3.15.1     | JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported                                            |
| 349 | high     | `js-yaml`                 | root         | 4.1.0                         | yes               | 4.3.2      | js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources                                                                            |
| 353 | high     | `js-yaml`                 | root         | 3.14.1                        | yes               | 3.15.2     | js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources                                                                            |
| 126 | high     | `jws`                     | root         | 3.2.2                         | yes               | 3.2.3      | auth0/node-jws Improperly Verifies HMAC Signature                                                                                                    |
| 160 | high     | `minimatch`               | root         | 3.1.2                         | yes               | 3.1.3      | minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern                                                                    |
| 175 | high     | `minimatch`               | root         | 3.1.2                         | yes               | 3.1.3      | minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments                                               |
| 177 | high     | `minimatch`               | root         | 3.1.2                         | yes               | 3.1.4      | minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions                                                      |
| 180 | high     | `minimatch`               | root         | 9.0.5                         | yes               | 9.0.7      | minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments                                               |
| 420 | medium   | `minimatch`               | ci           | 10.2.6, 8.0.7, 9.0.9          | —                 | 11.0.1     | minimatch has potential denial of service via globparts amplification                                                                                |
| 421 | medium   | `minimatch`               | root         | 10.2.5, 8.0.7, 9.0.5, 9.0.9   | no                | 11.0.1     | minimatch has potential denial of service via globparts amplification                                                                                |
| 342 | high     | `nanoid`                  | root         | 3.3.11                        | yes               | 3.3.12     | nanoid: Integer Overflow or Wraparound                                                                                                               |
| 197 | medium   | `picomatch`               | root         | 4.0.3                         | yes               | 4.0.4      | Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching                                                                |
| 316 | high     | `postcss`                 | root         | 8.5.12                        | yes               | 8.5.18     | PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure                               |
| 324 | medium   | `postcss`                 | root         | 8.5.12                        | yes               | 8.5.23     | PostCSS: incomplete fix of GHSA-6g55-p6wh-862q — attacker-controlled sourceMappingURL reads arbitrary .map files when `from` is unset                |
| 334 | low      | `postcss-selector-parser` | root         | 6.1.2                         | yes               | 6.1.3      | postcss-selector-parser allows denial of service through uncontrolled AST recursion                                                                  |
| 414 | medium   | `postcss-selector-parser` | root         | 6.1.2                         | yes               | 6.1.5      | PostCSS: Quadratic complexity in flat selector parsing allows CPU exhaustion                                                                         |
| 128 | medium   | `qs`                      | root         | 6.14.0                        | yes               | 6.14.1     | qs's arrayLimit bypass in its bracket notation allows DoS via memory exhaustion                                                                      |
| 145 | low      | `qs`                      | root         | 6.14.0                        | yes               | 6.14.2     | qs's arrayLimit bypass in comma parsing allows denial of service                                                                                     |
| 251 | medium   | `qs`                      | root         | 6.14.0                        | yes               | 6.15.2     | qs has a remotely triggerable DoS: qs.stringify crashes with TypeError on null/undefined entries in comma-format arrays when encodeValuesOnly is set |
| 415 | medium   | `qs`                      | root         | 6.14.0                        | yes               | 6.16.1     | qs : qs.stringify with arrayFormat 'comma' throws an uncaught TypeError on array elements carrying a non-callable own toString (DoS)                 |
| 184 | high     | `serialize-javascript`    | root         | 6.0.2                         | no                | 7.0.3      | Serialize JavaScript is Vulnerable to RCE via RegExp.flags and Date.prototype.toISOString()                                                          |
| 185 | high     | `serialize-javascript`    | ci           | 6.0.2                         | —                 | 7.0.3      | Serialize JavaScript is Vulnerable to RCE via RegExp.flags and Date.prototype.toISOString()                                                          |
| 249 | medium   | `serialize-javascript`    | root         | 6.0.2                         | no                | 7.0.5      | Serialize JavaScript has CPU Exhaustion Denial of Service via crafted array-like objects                                                             |
| 250 | medium   | `serialize-javascript`    | ci           | 6.0.2                         | —                 | 7.0.5      | Serialize JavaScript has CPU Exhaustion Denial of Service via crafted array-like objects                                                             |
| 399 | low      | `serialize-javascript`    | ci           | 6.0.2                         | —                 | 7.1.3      | Serialize JavaScript: Cross-site scripting (XSS) via unescaped </script at the end of a serialized function body                                     |
| 413 | low      | `serialize-javascript`    | root         | 6.0.2                         | no                | 7.1.3      | Serialize JavaScript: Cross-site scripting (XSS) via unescaped </script at the end of a serialized function body                                     |
| 388 | high     | `source-map-js`           | root         | 1.2.1                         | yes               | 1.2.2      | source-map-js allows event-loop denial of service through indexed source-map section offsets                                                         |
| 103 | low      | `tmp`                     | root         | 0.0.33                        | no                | 0.2.4      | tmp allows arbitrary temporary file / directory write via symbolic link `dir` parameter                                                              |
| 104 | low      | `tmp`                     | ci           | 0.0.33                        | —                 | 0.2.4      | tmp allows arbitrary temporary file / directory write via symbolic link `dir` parameter                                                              |
| 254 | high     | `tmp`                     | root         | 0.0.33                        | no                | 0.2.6      | tmp has Path Traversal via unsanitized prefix/postfix that enables directory escape                                                                  |
| 255 | high     | `tmp`                     | ci           | 0.0.33                        | —                 | 0.2.6      | tmp has Path Traversal via unsanitized prefix/postfix that enables directory escape                                                                  |
| 277 | high     | `ws`                      | root         | 8.18.3                        | yes               | 8.21.0     | ws: Memory exhaustion DoS from tiny fragments and data chunks                                                                                        |

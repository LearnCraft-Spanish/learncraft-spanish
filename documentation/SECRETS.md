# Secrets and environment variables

_Doppler is the only source of env vars and secrets for this repo. There are no `.env` files._

---

## Where secrets live

Everything is in the `learncraft-spanish` Doppler project.

| Config         | Used by                                             | Synced to Netlify          |
| -------------- | --------------------------------------------------- | -------------------------- |
| `dev`          | `pnpm start`, local installs                        | No                         |
| `dev_personal` | Optional per-developer overrides; a branch of `dev` | No                         |
| `tst`          | GitHub Actions installs (only `GH_PACKAGE_KEY`)     | No                         |
| `stg`          | Netlify builds of `staging` (branch-deploy context) | Yes, branch-deploy context |
| `prd`          | Netlify builds of `main` (production context)       | Yes, production context    |

This is a static site: Netlify reads env vars while it builds, and nothing runs afterwards. So `stg` and `prd` hold build secrets (`GH_PACKAGE_KEY`, `SENTRY_AUTH_TOKEN`) as well as public values. The backend keeps build secrets out of `stg`/`prd` because its configs reach a running server; see [ADR 0001](./adr/0001-secrets-in-doppler-synced-to-netlify.md).

## The rule: only public values get a `VITE_` prefix

Vite inlines every `VITE_*` key into the JavaScript bundle that anyone can download. A secret must never have that prefix.

[`vite-plugins/env-guard.js`](../vite-plugins/env-guard.js) enforces it in every `vite` dev server and build (tests skip it):

- A `VITE_*` key that isn't in `PUBLIC_ENV_KEYS` stops the run.
- After a build, if the value of any key in `BUILD_SECRET_KEYS` appears anywhere in `build/` (source maps included), the build fails and Netlify publishes nothing.

## Getting set up

```bash
brew install dopplerhq/cli/doppler
doppler login
doppler setup              # accepts learncraft-spanish / dev from .doppler.yaml
pnpm setup:npm-auth        # writes the GitHub Packages token to ~/.npmrc
pnpm install:ci
pnpm start
```

`doppler setup` is per folder. Pick `dev_personal` instead of `dev` if you want overrides that only affect your runs.

Delete any old `.env`, `.env.development`, `.env.staging`, `.env.prod` and `.env.test` files. Vite still reads them, and keys from them that are no longer used (such as `VITE_LOCAL_DOMAIN`) make the env guard stop the dev server.

Tests, `pnpm typecheck`, `pnpm lint` and `pnpm gauntlet:preview` need no Doppler.

## How each environment gets its secrets

- **Local:** `pnpm start` runs `doppler run -- vite`. Installs use the token that `pnpm setup:npm-auth` wrote to `~/.npmrc`.
- **GitHub Actions:** one repository secret, `DOPPLER_TOKEN`, a read-only service token for `tst`. Every job fetches `tst` with `dopplerhq/secrets-fetch-action` and writes `GH_PACKAGE_KEY` to `~/.npmrc` before installing.
- **Netlify:** Doppler's Netlify integration syncs `prd` into the site's production context and `stg` into its branch-deploy context. Netlify installs using `PNPM_CONFIG__AUTH`, set in `stg` and `prd` to `{"https://npm.pkg.github.com":{"@learncraft-spanish":{"authToken":"${GH_PACKAGE_KEY}"}}}`. Doppler fills in the `${GH_PACKAGE_KEY}` reference before syncing; pnpm itself does not expand it. Deploy previews are off.
- **Redeploys:** Netlify doesn't rebuild when env vars change, so after saving `stg` or `prd`, trigger one by hand (Netlify → **Trigger deploy → Clear cache and deploy**). We tried a Doppler webhook calling a Netlify build hook; Netlify snapshots env vars when it queues the build, which happens before Doppler's sync writes the new value, so the triggered build always ran one change behind. There's no delay option on either side to fix that, so we dropped it.

pnpm 11 ignores `${...}` credentials in a project `.npmrc`, so the committed `.npmrc` holds only the registry line. Local installs and CI put the token in `~/.npmrc`. Netlify can't write files before it installs, so it gets the token from `PNPM_CONFIG__AUTH`.

## Adding or changing a value

1. Decide whether it is public. Only values that are safe for anyone to read in the browser get a `VITE_` prefix.
2. Add it to every config that needs it: public values in `dev`, `stg` and `prd`; build secrets in `stg` and `prd` (and `tst` only if CI needs it). Saving `stg` or `prd` syncs to Netlify; trigger a rebuild by hand to pick it up.
3. Public: add it to `PUBLIC_ENV_KEYS` in [`vite-plugins/env-guard.js`](../vite-plugins/env-guard.js), `ImportMetaEnv` in [`vite-env.d.ts`](../vite-env.d.ts), and [`src/hexagon/config.ts`](../src/hexagon/config.ts) if the app reads it. Secret: add it to `BUILD_SECRET_KEYS` in the same file.
4. Add it to the key list below.

Tests must not need real values.

## Keys

**Public, inlined into the bundle (`dev`, `stg`, `prd`)**

| Key                   | Configs             | Notes                                                                  |
| --------------------- | ------------------- | ---------------------------------------------------------------------- |
| `VITE_API_AUDIENCE`   | `dev`, `stg`, `prd` | Auth0 API audience                                                     |
| `VITE_AUTH0_DOMAIN`   | `dev`, `stg`, `prd` | Prod tenant in `prd` only; staging tenant in `dev` and `stg`           |
| `VITE_AUTH0_CLIENTID` | `dev`, `stg`, `prd` | Auth0 SPA client id, per tenant                                        |
| `VITE_BACKEND_DOMAIN` | `dev`, `stg`, `prd` | API base URL with a trailing slash; `lcs-api` on localhost in `dev`    |
| `VITE_ENVIRONMENT`    | `dev`, `stg`, `prd` | `development`, `staging` or `production`; Sentry environment, UI gates |
| `VITE_PORT`           | `dev`               | Dev server port; only read when `VITE_ENVIRONMENT` is dev or staging   |

**Build secrets (never `VITE_`)**

| Key                 | Configs                    | Notes                                                                    |
| ------------------- | -------------------------- | ------------------------------------------------------------------------ |
| `GH_PACKAGE_KEY`    | `dev`, `tst`, `stg`, `prd` | GitHub Packages token (`read:packages`) for `@learncraft-spanish/shared` |
| `SENTRY_AUTH_TOKEN` | `stg`, `prd`               | Uploads source maps to Sentry during the Netlify build                   |

## Netlify settings this depends on

- Deploy previews stay off. If they are turned on, set the sensitive variable policy for fork pull requests to require approval first: the repo is public, and a fork's build would otherwise run with `stg` secrets.
- No Netlify Functions. Synced keys would be readable at runtime by any function; adding functions means revisiting ADR 0001.
- Env vars are managed only by the Doppler sync. Don't edit them in the Netlify UI; the next sync overwrites them.

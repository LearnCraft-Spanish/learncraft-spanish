# 0001: Secrets live in Doppler and sync to Netlify, build secrets included

**Status:** Proposed (2026-11-04)

## Context

Env vars were spread across local `.env`, `.env.development`, `.env.staging`, `.env.prod` and `.env.test` files, GitHub Actions repository secrets, and the Netlify site's env vars, with nothing keeping them in sync. Switching environments locally meant copying a whole file over `.env`.

`lcs-api` moved to Doppler in its ADR 0002, keeping build secrets (`GH_PACKAGE_KEY`, `SENTRY_AUTH_TOKEN`) out of the configs synced to Digital Ocean because those reach a running server.

This repo is a static Vite site on one Netlify site: `main` deploys to production, `staging` is a branch deploy, and there are no deploy previews or Netlify Functions. Netlify installs and builds with the site's env vars, so it needs `GH_PACKAGE_KEY` before any build command runs. Vite inlines every `VITE_*` key into the public bundle. The repo is public.

## Decision

- **Doppler is the only source of env vars.** No `.env` files; `dotenv` is removed. `pnpm start` runs `doppler run -- vite`.
- **Same config split as `lcs-api`.** The `learncraft-spanish` project has `dev` (plus `dev_personal`), `tst`, `stg` and `prd`. There is no `tst_build`.
- **Netlify gets secrets through Doppler's native sync,** per deploy context on the one site: `prd` to production, `stg` to branch-deploy.
- **`stg` and `prd` hold build secrets.** On a static site there is no runtime for them to leak into; the only exposure is the bundle.
- **The bundle is guarded in code, not by convention.** `vite-plugins/env-guard.js` stops any dev server or build that sees a `VITE_*` key outside an allowlist, and fails any build whose output contains a build secret's value.
- **Redeploys after a secret change are manual.** Netlify doesn't rebuild when env vars change; trigger one by hand after saving `stg` or `prd`.
- **Tests need no Doppler.**

## Alternatives rejected

- **Copy the backend's `tst_build` split** (sync only public values; fetch build secrets with a Doppler token inside the Netlify build). Netlify installs before the build command, so this means disabling its install and running the Doppler CLI in the build, for no protection a static site needs.
- **Two Netlify sites** so each config syncs to a whole site. Doppler's sync already targets a deploy context.
- **Wrap tests in `doppler run --config tst`** like the backend. Tests read no real values, and the Cursor sandbox and Cloud Agent VMs have no Doppler CLI.
- **A Doppler webhook calling a Netlify build hook on secret changes.** We tried it. Netlify snapshots env vars when it queues the build, which happens before Doppler's sync writes the new value, so the triggered build always ran one change behind, with no visible failure. Neither side offers a delay to fix the ordering. A relay that deliberately delays the forwarded request would fix it, but means standing up and maintaining infrastructure outside Doppler, Netlify and GitHub for a rare event (a secret change) that a manual redeploy already handles.

## Consequences

- Every developer needs the Doppler CLI and workspace access. On the free plan anyone with access can read `prd`.
- Turning on deploy previews or adding Netlify Functions reopens this decision: the repo is public, and a fork's preview build or a function would see the synced secrets.
- The allowlist in `env-guard.js` must be edited to add a public key, and the build-secret list to add a secret. Forgetting the second only weakens the output scan; forgetting the first fails loudly.
- Netlify still authenticates installs through the `${GH_PACKAGE_KEY}` line in the committed `.npmrc`, which pnpm 11 ignores. Upgrading Netlify's pnpm means moving that auth.
- `GH_PACKAGE_KEY` is copied into `dev`, `tst`, `stg` and `prd`, since the free plan has no references.

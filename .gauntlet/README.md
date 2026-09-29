# Visual gauntlet harness

Auth0-free, network-isolated preview + Playwright capture so agents can
screenshot real UI and compare it to a design bar (HTML/PNG handoff), or
preview a feature with no handoff at all.

This folder is the **architecture** for spinning up a live preview. It does
not hold review artifacts between commits. An agent builds a specimen for a
review, captures it, then tears that review down. None of those files go in
a commit.

**Hard rules**

1. **Never Auth0** — preview omits `Auth0Provider`, aliases `@auth0/auth0-react`
   to a throw-on-import stub, and injects a plain AuthPort stub.
2. **Never real APIs** — fixture adapters + `networkGuard` + Playwright abort of
   non-specimen origins. No prod, live-dev, or local backend (`localhost:3010`,
   etc.).
3. **Fidelity claims** still need PNGs under both
   `.gauntlet/out/<specimen>/bar/` and `.../app/`. A preview-only run (no bar)
   is a **preview check**, not a fidelity win. Do not call a no-bar capture a
   fidelity comparison.

## What is committed vs local

| Path                                                                                                     | In git? | Role                                                                     |
| -------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| `preview/` shell (`vite.config.ts`, `index.html`, `main.tsx`, `PreviewProviders.tsx`, `networkGuard.ts`) | Yes     | Vite app that mounts specimens                                           |
| `preview/adapters/`                                                                                      | Yes     | AuthPort, useMyData, appUserAdapter stubs + Auth0 throw (no Vitest `vi`) |
| `preview/specimens/smoke.tsx` + `smoke.states.json`                                                      | Yes     | Self-test that proves preview + capture                                  |
| `bars/smoke/`                                                                                            | Yes     | Tiny bar for the smoke self-test                                         |
| `capture/`                                                                                               | Yes     | `capture-bar.mjs`, `capture-app.mjs`, `stop-preview.mjs`                 |
| `package.json` + `pnpm-lock.yaml`                                                                        | Yes     | Playwright for capture                                                   |
| Root `gauntlet:*` scripts                                                                                | Yes     | Install, preview, stop, capture                                          |
| `preview/specimens/<name>.*` other than smoke                                                            | No      | Review specimen (gitignored)                                             |
| `bars/<name>/` other than smoke                                                                          | No      | Review bar (gitignored); prefer `--bar` to an external handoff           |
| `out/`                                                                                                   | No      | Generated screenshots + `crop-manifest.json`                             |
| `browsers/`, `node_modules/`, `.vite-cache/`                                                             | No      | Installed harness (leave on disk)                                        |

Do not commit specimens, bars other than smoke, or anything under `out/`.
A new file under `preview/adapters/` or a new Vite alias is shell: commit it
only when that stub should stay for later reviews.

## Quick start (smoke self-test)

```bash
# One-time: Playwright + Chromium (vendored under .gauntlet/browsers)
pnpm gauntlet:install

# Terminal A — requires Shell required_permissions: ["all"] (sass-embedded)
# Before starting: lsof -iTCP:5273 -sTCP:LISTEN — reuse if already up
# (strictPort will fail a second start)
pnpm gauntlet:preview

# Terminal B — smoke has a bar; use both capture-bar and capture-app
pnpm gauntlet:capture-bar -- --specimen smoke
pnpm gauntlet:capture-app -- --specimen smoke
```

Smoke renders the stub auth email (`gauntlet-student@fake.not` by default) so
the self-test proves the auth alias loaded. Compare
`.gauntlet/out/smoke/bar/*-body.png` ↔ `.gauntlet/out/smoke/app/*.png`
(same pixel dimensions). Blind critic: `Read` both images with labels stripped.

Preview URL: <http://localhost:5273/?specimen=smoke>

## Preview only (no handoff)

When there is no design handoff, capture app screenshots without a bar:

```bash
pnpm gauntlet:capture-app -- --specimen <name> --no-bar
```

A missing `.gauntlet/out/<specimen>/bar/crop-manifest.json` automatically uses
this mode (same as `--no-bar`). Viewports come from optional
`viewport: { width, height }` on a state; otherwise desktop **1240×760** and
mobile **390×760**. The reference-dimension check is skipped. This is a
**preview**, not a fidelity comparison — report the result as a preview check,
never a fidelity win. Do not hand-write a fake bar.

## Query parameters

Preview URL: `http://localhost:5273/?specimen=<name>&role=<role>&flags=<off|0|false>`

| Param      | Values                                                           | Behavior                                                                                                                                                                                                                                                                                |
| ---------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `specimen` | filename under `preview/specimens/` (default `smoke`)            | Which specimen file to mount. Unknown names fall back to smoke.                                                                                                                                                                                                                         |
| `role`     | `student` (default) \| `coach` \| `admin` \| `limited` \| `free` | Unknown values fall back to `student`. Emails are `gauntlet-<role>@fake.not`. `free` is signed in with no app-user record (`myData: null`). `coach` and `admin` have `studentRole: 'none'`. `limited` has `studentRole: 'limited'`. `student` is a beta tester unless `flags` force v1. |
| `flags`    | `off`, `0`, or `false`                                           | Sets the student fixture `betaTester` to `false`. No effect on other roles.                                                                                                                                                                                                             |

## Stubbed modules

Exact stub aliases **MUST** be listed before the `@application` prefix alias in
`preview/vite.config.ts`, because Vite uses the first match.

| Module id                              | File                                 | What it returns                                                                                                             |
| -------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `@application/adapters/authAdapter`    | `preview/adapters/authPort.ts`       | Signed-in AuthPort for `?role=`; exports `GAUNTLET_STUB`                                                                    |
| `@application/queries/useMyData`       | `preview/adapters/myDataQuery.ts`    | Fixture for `?role=` (`null` for `free`)                                                                                    |
| `@application/adapters/appUserAdapter` | `preview/adapters/appUserAdapter.ts` | `getMyData` for current role; `getAppUserByEmail` / `getAllAppStudents` over four fixtures (student, limited, coach, admin) |
| `@auth0/auth0-react`                   | `preview/adapters/auth0Forbidden.ts` | Throws on import                                                                                                            |

Every other adapter is the **real** module. `networkGuard` blocks its HTTP
calls (console error + `window.__SPECIMEN__.blocked++`). Capture fails on
blocked calls unless the state sets `allowBlocked: true`.

### Adding a stub

1. Add `preview/adapters/<file>.ts` (plain functions, no Vitest `vi`, no
   infrastructure calls).
2. Add an **exact** regex alias in `preview/vite.config.ts` **ahead of** the
   `@application` prefix alias.
3. Export fixtures from `fixtures.ts` / `previewRole.ts` when role-aware.
4. Do not call infrastructure.

## Providers and CSS

`PreviewProviders` mounts the real `MainProvider` (no Auth0). Global CSS is
`@interface/styles/tokens.css` plus `src/index.css`, `src/App.css`, and
`src/contextual.scss` (loaded in `preview/main.tsx`).

`main.tsx` also tripwires: it throws if the auth stub did not load
(`GAUNTLET_STUB !== true`).

## `states.json`

Each entry needs `label`, `formFactor` (`desktop` \| `mobile`), and `query`
(URL search string, including `specimen=…`). Optional fields:

| Field          | Purpose                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `viewport`     | `{ width, height }` override. Used in bar-less mode; with a bar, crop-manifest viewports still win when no override is set.           |
| `allowBlocked` | `true` lets that state finish even if `networkGuard` blocked calls. Otherwise capture exits non-zero when `__SPECIMEN__.blocked > 0`. |
| `actions`      | Playwright steps run after ready and before the screenshot.                                                                           |

Example `actions`:

```json
[
  { "click": { "role": "button", "name": "Use as student" } },
  { "fill": { "label": "Find a student", "value": "an" } },
  { "waitFor": { "role": "alert" } }
]
```

Capture runs these with Playwright after `__SPECIMEN__.ready` and before the
screenshot. Keep `deferReady = true` (export from the specimen module, then set
`window.__SPECIMEN__.ready = true` yourself) for setup that cannot be a locator
step. Smoke does not defer.

Identical PNG bytes across states produce a **warning** and do **not** fail the
run.

## Adding a specimen

Preview mounts by filename. `preview/main.tsx` glob-imports
`preview/specimens/*.tsx`. Do not edit `main.tsx` for a review.

1. Add `preview/specimens/<name>.tsx` with a **default-exported** component.
2. Add `preview/specimens/<name>.states.json` with a `states[]` array
   (`label`, `formFactor`, `query`). For fidelity reviews, `label` values must
   match the handoff's `[data-screen-label]` frames.
3. Put fixtures in the specimen file (or a sibling `*.ts` next to it).
   Prefer props/fixtures over use cases that call adapters. If an adapter
   is required, add a preview stub under `preview/adapters/` and alias it
   in `preview/vite.config.ts` — never call infrastructure.
4. If setup is async (wait for a click, animation, etc.), export
   `deferReady = true` from the specimen module and set
   `window.__SPECIMEN__.ready = true` yourself when capture should fire.
5. Capture:

   ```bash
   # Check / reuse port 5273 first (see Lifecycle)
   pnpm gauntlet:preview   # unsandboxed Shell

   # With a handoff:
   pnpm gauntlet:capture-bar -- --specimen <name> --bar ~/Downloads/handoff
   pnpm gauntlet:capture-app -- --specimen <name>

   # Without a handoff (preview only):
   pnpm gauntlet:capture-app -- --specimen <name> --no-bar
   ```

   `--bar` may be a folder with `index.html` or a path to an `*.html` file.
   A local `bars/<name>/index.html` is optional and gitignored.

Preview URL: `http://localhost:5273/?specimen=<name>`

## Lifecycle

**Before starting preview:** run `lsof -iTCP:5273 -sTCP:LISTEN` and reuse the
server if it is already up. `strictPort: true` will fail a second start.

**Teardown** (main agent only — the capture specialist must not stop the server or delete these):

1. Stop the preview with `pnpm gauntlet:stop`. That signals the process
   **listening** on port 5273, which is the Vite child. Killing only the
   `pnpm gauntlet:preview` wrapper can leave that child running. The command
   exits non-zero if a listener is still alive. Confirm with
   `lsof -iTCP:5273 -sTCP:LISTEN` (must print nothing).
2. Run `git status .gauntlet` and revert any temporary edits to committed
   harness files.
3. Delete review artifacts (never smoke, never the shell):
   - `preview/specimens/<name>.*`
   - `bars/<name>/`
   - `.gauntlet/out/<name>/`

Friction logs go in `.gauntlet/out/_logs/`, which deleting one specimen's
`out/<name>/` directory does not wipe.

Leave `browsers/`, `node_modules/`, and `.vite-cache/`. Gitignore will still
block a commit if teardown is skipped.

## Isolation details

- Exact-match Vite aliases swap auth, useMyData, and appUserAdapter (see stub
  table). `@auth0/auth0-react` aliases to a module that throws on import.
- Exact stub aliases are listed before the `@application` prefix alias.
- Every other adapter is real; `networkGuard` blocks its HTTP calls with a
  console error and increments `__SPECIMEN__.blocked`. Capture fails unless
  the state sets `allowBlocked: true`.
- `VITE_BACKEND_DOMAIN` is forced to `http://gauntlet.invalid/`.
- `capture-app.mjs` also aborts any Playwright request whose origin is not the
  specimen.

## Sandbox note

`pnpm gauntlet:preview` compiles real SCSS via `sass-embedded` (native Dart).
Capture uses Chromium. Run preview/capture with Shell `required_permissions: ["all"]`.

**Agent orchestration:** do not put preview/capture on the critic. Use a
**capture specialist** subagent (elevated Shell) that returns PNG paths to
main; main hands blind paths to a sandbox critic that only `Read`s images. See
`.cursor/skills/visual-gauntlet/SKILL.md`.

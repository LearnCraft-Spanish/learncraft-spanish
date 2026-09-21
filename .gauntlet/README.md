# Visual gauntlet harness

Auth0-free, network-isolated preview + Playwright capture so agents can
screenshot real UI and compare it to a design bar (HTML/PNG handoff).

This folder is the **architecture** for spinning up a live preview. It does
not hold review artifacts between commits. An agent builds a specimen for a
review, captures it, then tears that review down. None of those files go in
a commit.

**Hard rules**

1. **Never Auth0** — preview omits `Auth0Provider` and injects a plain AuthPort stub.
2. **Never real APIs** — fixture adapters + `networkGuard` + Playwright abort of non-specimen origins. No prod, live-dev, or local backend (`localhost:3010`, etc.).
3. **Do not claim visual review** without PNGs under `.gauntlet/out/<specimen>/bar/` and `.../app/`.

## What is committed vs local

| Path                                                                                                     | In git? | Role                                                           |
| -------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------- |
| `preview/` shell (`vite.config.ts`, `index.html`, `main.tsx`, `PreviewProviders.tsx`, `networkGuard.ts`) | Yes     | Vite app that mounts specimens                                 |
| `preview/adapters/`                                                                                      | Yes     | AuthPort + useMyData stubs (no Vitest `vi`)                    |
| `preview/specimens/smoke.tsx` + `smoke.states.json`                                                      | Yes     | Self-test that proves preview + capture                        |
| `bars/smoke/`                                                                                            | Yes     | Tiny bar for the smoke self-test                               |
| `capture/`                                                                                               | Yes     | `capture-bar.mjs`, `capture-app.mjs`                           |
| `package.json` + `pnpm-lock.yaml`                                                                        | Yes     | Playwright for capture                                         |
| Root `gauntlet:*` scripts                                                                                | Yes     | Install, preview, capture                                      |
| `preview/specimens/<name>.*` other than smoke                                                            | No      | Review specimen (gitignored)                                   |
| `bars/<name>/` other than smoke                                                                          | No      | Review bar (gitignored); prefer `--bar` to an external handoff |
| `out/`                                                                                                   | No      | Generated screenshots + `crop-manifest.json`                   |
| `browsers/`, `node_modules/`, `.vite-cache/`                                                             | No      | Installed harness (leave on disk)                              |

Do not commit specimens, bars other than smoke, or anything under `out/`.
A new file under `preview/adapters/` or a new Vite alias is shell: commit it
only when that stub should stay for later reviews.

## Quick start (smoke self-test)

```bash
# One-time: Playwright + Chromium (vendored under .gauntlet/browsers)
pnpm gauntlet:install

# Terminal A — requires Shell required_permissions: ["all"] (sass-embedded)
pnpm gauntlet:preview

# Terminal B
pnpm gauntlet:capture-bar -- --specimen smoke
pnpm gauntlet:capture-app -- --specimen smoke
```

Compare `.gauntlet/out/smoke/bar/*-body.png` ↔ `.gauntlet/out/smoke/app/*.png`
(same pixel dimensions). Blind critic: `Read` both images with labels stripped.

Preview URL: <http://localhost:5273/?specimen=smoke>

## Adding a specimen

Preview mounts by filename. `preview/main.tsx` glob-imports
`preview/specimens/*.tsx`. Do not edit `main.tsx` for a review.

1. Add `preview/specimens/<name>.tsx` with a **default-exported** component.
2. Add `preview/specimens/<name>.states.json` with a `states[]` array
   (`label`, `formFactor`, `query`). `label` values must match the
   handoff's `[data-screen-label]` frames.
3. Put fixtures in the specimen file (or a sibling `*.ts` next to it).
   Prefer props/fixtures over use cases that call adapters. If an adapter
   is required, add a preview stub under `preview/adapters/` and alias it
   in `preview/vite.config.ts` — never call infrastructure.
4. If setup is async (wait for a click, animation, etc.), export
   `deferReady = true` from the specimen module and set
   `window.__SPECIMEN__.ready = true` yourself when capture should fire.
   Smoke does not defer.
5. Capture the bar from an **external** handoff, not from a committed bar:

   ```bash
   pnpm gauntlet:preview   # unsandboxed Shell
   pnpm gauntlet:capture-bar -- --specimen <name> --bar ~/Downloads/handoff
   pnpm gauntlet:capture-app -- --specimen <name>
   ```

   `--bar` may be a folder with `index.html` or a path to an `*.html` file.
   A local `bars/<name>/index.html` is optional and gitignored.

Preview URL: `http://localhost:5273/?specimen=<name>`

## Teardown

During a review, gitignored files may sit on disk. When the review is done,
delete these (never smoke, never the shell):

- `preview/specimens/<name>.*`
- `bars/<name>/`
- `.gauntlet/out/<name>/`

Leave `browsers/`, `node_modules/`, and `.vite-cache/`. Gitignore will still
block a commit if teardown is skipped.

## Isolation details

- Vite aliases `@application/adapters/authAdapter` and `useMyData` to preview stubs.
- `VITE_BACKEND_DOMAIN` is forced to `http://gauntlet.invalid/`.
- `networkGuard.ts` throws on non-allowlisted `fetch` / XHR.
- `capture-app.mjs` aborts any request whose origin is not the specimen.

## Sandbox note

`pnpm gauntlet:preview` compiles real SCSS via `sass-embedded` (native Dart).
Capture uses Chromium. Run preview/capture with Shell `required_permissions: ["all"]`.

**Agent orchestration:** do not put preview/capture on the critic. Use a **capture specialist** subagent (elevated Shell) that returns PNG paths to main; main hands blind paths to a sandbox critic that only `Read`s images. See `.cursor/skills/visual-gauntlet/SKILL.md`.

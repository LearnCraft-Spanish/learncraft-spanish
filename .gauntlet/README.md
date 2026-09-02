# Visual gauntlet harness

Auth0-free, network-isolated preview + Playwright capture so agents can
screenshot real UI and compare it to a design bar (HTML/PNG handoff).

**Hard rules**

1. **Never Auth0** — preview omits `Auth0Provider` and injects a plain AuthPort stub.
2. **Never real APIs** — fixture adapters + `networkGuard` + Playwright abort of non-specimen origins. No prod, live-dev, or local backend (`localhost:3010`, etc.).
3. **Do not claim visual review** without PNGs under `.gauntlet/out/<specimen>/bar/` and `.../app/`.

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

## Redesign loop (e.g. student home)

```bash
pnpm gauntlet:preview   # unsandboxed Shell

# Bar from Downloads handoff (outside the repo)
pnpm gauntlet:capture-bar -- --specimen home --bar ~/Downloads/handoff

pnpm gauntlet:capture-app -- --specimen home
```

Home specimen is a **scaffold** until HomeV2 lands on your branch. Replace the
placeholder in [preview/specimens/home.tsx](preview/specimens/home.tsx) with the
real presentational tree + local fixtures. Update
[preview/specimens/home.states.json](preview/specimens/home.states.json) so
`label` values match the handoff's `[data-screen-label]` frames.

## Layout

| Path                              | Role                                                      |
| --------------------------------- | --------------------------------------------------------- |
| `preview/`                        | Vite specimen app (port **5273**, `strictPort`)           |
| `preview/adapters/`               | AuthPort + feature flags (no Vitest `vi`)                 |
| `preview/specimens/*.tsx`         | Surfaces under redesign                                   |
| `preview/specimens/*.states.json` | Capture matrix (label, formFactor, query)                 |
| `bars/smoke/`                     | Committed tiny bar for tooling self-test                  |
| `capture/`                        | `capture-bar.mjs`, `capture-app.mjs`                      |
| `out/<specimen>/`                 | Generated screenshots + `crop-manifest.json` (gitignored) |

## Adding a specimen

1. Add `preview/specimens/<name>.tsx` and register it in `preview/main.tsx`.
2. Add `preview/specimens/<name>.states.json` with `states[]`.
3. Optionally add `bars/<name>/index.html` with `[data-screen-label]` frames,
   or pass `--bar` to an external handoff folder/`*.html`.
4. Mount real presentational components with **props/fixtures**. Prefer that
   over pulling in use cases that call adapters. If an adapter is required,
   add a preview stub under `preview/adapters/` and alias it in
   `preview/vite.config.ts` — never call infrastructure.

## Isolation details

- Vite aliases `@application/adapters/authAdapter` and `featureFlagAdapter` to preview stubs.
- `VITE_BACKEND_DOMAIN` is forced to `http://gauntlet.invalid/`.
- `networkGuard.ts` throws on non-allowlisted `fetch` / XHR.
- `capture-app.mjs` aborts any request whose origin is not the specimen.

## Sandbox note

`pnpm gauntlet:preview` compiles real SCSS via `sass-embedded` (native Dart).
Capture uses Chromium. Run preview/capture with Shell `required_permissions: ["all"]`.

**Agent orchestration:** do not put preview/capture on the critic. Use a **capture specialist** subagent (elevated Shell) that returns PNG paths to main; main hands blind paths to a sandbox critic that only `Read`s images. See `.cursor/skills/visual-gauntlet/SKILL.md`.

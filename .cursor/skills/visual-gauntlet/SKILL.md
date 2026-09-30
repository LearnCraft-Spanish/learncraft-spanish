---
name: visual-gauntlet
description: >-
  Capture Auth0-free, API-free screenshots of redesign specimens and compare
  them blind to a design handoff bar. Use when the user asks for visual gauntlet,
  screenshot redesign, compare to handoff HTML/PNG, UI fidelity against a design
  file, or when running a /gauntlet-loop that needs real app screenshots.
---

# Visual Gauntlet

Harness docs: `.gauntlet/README.md` (commit rules, adding a specimen, teardown). Orchestration below is mandatory for agent loops.

## Non-negotiables

- **Never Auth0.** Do not run `pnpm start` for visual review.
- **Never real APIs.** No prod, live-dev, or local backend. Fixtures and preview adapters only.
- **Fidelity claims** require PNGs under both `.gauntlet/out/<specimen>/bar/` and `.gauntlet/out/<specimen>/app/`. A preview-only run (app PNGs only, no bar) is a **preview check**, not a fidelity win — you may cite those app PNGs for a preview check.
- **Never use `GenerateImage`** as a stand-in for capturing the app or the bar.
- **Never send the critic to run Vite/Playwright.** Critics only `Read` images the main agent supplies.

## Roles

```
Main ──asks screenshots──► Capture specialist (elevated Shell)
Main ◄──returns PNG paths── Capture specialist
Main ──blind prompt + paths──► Critic (sandbox OK; Read only)
Main ◄──winner + one gap──── Critic
Main ──gap──► Builder (code edits)
```

| Role                   | Owns                                                                                                           | Sandbox                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **Main**               | Orchestration; hands paths to critic; never lets critic capture; owns teardown, including `pnpm gauntlet:stop` | Mixed                                 |
| **Capture specialist** | Preview + Playwright capture; returns absolute PNG paths + `ls -la`                                            | Needs `required_permissions: ["all"]` |
| **Critic**             | Blind `Read` of images; pick winner / check expected states; name one gap                                      | Default sandbox                       |
| **Builder**            | Code/specimen edits only                                                                                       | Usually default                       |

## Preview-only branch (no design handoff)

When the feature has no design handoff:

1. Do **not** hand-write a fake bar.
2. Capture specialist runs `pnpm gauntlet:capture-app -- --specimen <name> --no-bar`
   (or plain `capture-app` when `.gauntlet/out/<specimen>/bar/crop-manifest.json`
   is missing — that mode is automatic).
3. Capture specialist returns **app PNG paths only** (no bar).
4. Main, or a critic, checks them against a **written list** of expected states
   and behavior.
5. Report the result as a **preview check**, never a **fidelity win**.
6. Critics still only `Read` images and never run Vite/Playwright.

Fidelity claims still need both `bar/` and `app/` PNGs.

## Capture specialist (subagent)

Fan this out as its own Task/subagent whenever screenshots are needed. Prompt it with specimen name, optional `--bar` path, whether bar capture is still required, or `--no-bar` for preview-only.

**It must:**

1. Use Shell with `required_permissions: ["all"]` for preview and capture (sass-embedded + Chromium).
2. Ensure `pnpm gauntlet:install` has been run if browsers are missing.
3. Before preview: run `lsof -iTCP:5273 -sTCP:LISTEN` and **reuse** the server if listening (`strictPort` fails a second start). Otherwise start `pnpm gauntlet:preview`.
4. For fidelity reviews, run bar capture once per redesign (or when the handoff changes):

   `pnpm gauntlet:capture-bar -- --specimen <name> [--bar <handoff>]`

5. Run app capture after each builder change:

   `pnpm gauntlet:capture-app -- --specimen <name>`

   For a feature with **no design handoff**, pass `--no-bar` (or just
   `capture-app` when no manifest exists). Do **not** hand-write a fake bar.

6. Return to main a structured list of **absolute paths**, plus `ls -la` output
   for **every** path it reports. Fidelity example:

   ```
   specimen: home
   pairs:
     - label: A-mobile
       bar: /…/.gauntlet/out/home/bar/A-mobile-body.png
       app: /…/.gauntlet/out/home/app/A-mobile.png
   ```

   Preview-only example: app paths only, labeled as a preview check.

7. Never call Auth0, never hit a backend, never judge visual quality (that is the critic’s job).

**It must never:**

- Delete specimen, bar, or `out/` files. Teardown belongs to **main only**.
- Run `pnpm gauntlet:stop` or otherwise kill the preview. Main does that when the review is done. Ending the wrapper shell is not teardown: the Vite child can keep port 5273.
- Edit `src/` application source. Report visual bugs; a **builder** fixes them.

Friction logs go in `.gauntlet/out/_logs/` (not under a single specimen’s
`out/<name>/`, so main’s specimen teardown does not wipe them).

If capture fails with Sass/IPC/Chromium errors, retry with `["all"]` — do not fall back to code-only “visual review.”

## Main → critic handoff

### Fidelity (bar + app)

Main strips labels before the critic runs:

1. For each pair, pick two paths (`bar` body crop and `app` shot).
2. Launch the critic with **fresh context** and a blind prompt, e.g. assign random A/B:

   - Image A: `<path>`
   - Image B: `<path>`
   - Ask: which is better for [viewport/state]? Name the single biggest gap on the loser.
   - Do **not** tell the critic which path is bar vs app, or which is “ours.”

3. Critic only uses the `Read` tool on those image paths (sandbox-safe).
4. Main maps the critic’s pick back to bar vs app and decides whether to loop the builder.

### Preview check (app only)

Main (or a critic) compares app PNGs to a written list of expected states and
behavior. Do not call the outcome a fidelity win.

## Full loop

1. Builder implements or updates the specimen / UI.
2. Main asks the **capture specialist** for screenshots (bar once when a handoff exists; app every round; `--no-bar` when there is no handoff).
3. Capture specialist returns PNG paths + `ls -la` for each.
4. Main fans out the **critic** with blind paths only (fidelity) or expected-state checklist (preview).
5. If ours loses (or preview check fails), main sends the gap to the builder; repeat from 2.
6. Stop only when the critic picks ours blind, the preview check passes, or the user stops.
7. When the review is done, **main** tears down per `.gauntlet/README.md`. First run `pnpm gauntlet:stop`, which kills the Vite process listening on port 5273 and fails if that child is still alive. Do not stop only the `pnpm gauntlet:preview` wrapper. Then revert temporary harness edits and delete specimen/bar/`out/<name>/`. Do not commit the specimen, its bar, or `out/`. Capture specialist must not stop the server or delete those files.

## Design bar

Handoffs stay outside the repo. Pass `--bar` to a folder with `index.html`
(or to an `*.html` file), e.g. `--bar ~/Downloads/handoff`. Capture frames
use `[data-screen-label]`. Do not commit bars other than smoke; see
`.gauntlet/README.md`. Do not invent a fake bar for preview-only work.

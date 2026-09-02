---
name: visual-gauntlet
description: >-
  Capture Auth0-free, API-free screenshots of redesign specimens and compare
  them blind to a design handoff bar. Use when the user asks for visual gauntlet,
  screenshot redesign, compare to handoff HTML/PNG, UI fidelity against a design
  file, or when running a /gauntlet-loop that needs real app screenshots.
---

# Visual Gauntlet

Harness docs: `.gauntlet/README.md`. Orchestration below is mandatory for agent loops.

## Non-negotiables

- **Never Auth0.** Do not run `pnpm start` for visual review.
- **Never real APIs.** No prod, live-dev, or local backend. Fixtures and preview adapters only.
- **Never claim visual review** without PNGs under `.gauntlet/out/<specimen>/bar/` and `.gauntlet/out/<specimen>/app/`.
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

| Role                   | Owns                                                            | Sandbox                               |
| ---------------------- | --------------------------------------------------------------- | ------------------------------------- |
| **Main**               | Orchestration; hands paths to critic; never lets critic capture | Mixed                                 |
| **Capture specialist** | Preview + Playwright capture; returns absolute PNG paths        | Needs `required_permissions: ["all"]` |
| **Critic**             | Blind `Read` of two (or more) images; pick winner; name one gap | Default sandbox                       |
| **Builder**            | Code/specimen edits only                                        | Usually default                       |

## Capture specialist (subagent)

Fan this out as its own Task/subagent whenever screenshots are needed. Prompt it with specimen name, optional `--bar` path, and whether bar capture is still required.

**It must:**

1. Use Shell with `required_permissions: ["all"]` for preview and capture (sass-embedded + Chromium).
2. Ensure `pnpm gauntlet:install` has been run if browsers are missing.
3. Start or reuse `pnpm gauntlet:preview` (port 5273).
4. Run bar capture once per redesign (or when the handoff changes):

   `pnpm gauntlet:capture-bar -- --specimen <name> [--bar <handoff>]`

5. Run app capture after each builder change:

   `pnpm gauntlet:capture-app -- --specimen <name>`

6. Return to main a structured list of **absolute paths**, e.g.:

   ```
   specimen: home
   pairs:
     - label: A-mobile
       bar: /…/.gauntlet/out/home/bar/A-mobile-body.png
       app: /…/.gauntlet/out/home/app/A-mobile.png
   ```

7. Never call Auth0, never hit a backend, never judge visual quality (that is the critic’s job).

If capture fails with Sass/IPC/Chromium errors, retry with `["all"]` — do not fall back to code-only “visual review.”

## Main → critic handoff

Main strips labels before the critic runs:

1. For each pair, pick two paths (`bar` body crop and `app` shot).
2. Launch the critic with **fresh context** and a blind prompt, e.g. assign random A/B:

   - Image A: `<path>`
   - Image B: `<path>`
   - Ask: which is better for [viewport/state]? Name the single biggest gap on the loser.
   - Do **not** tell the critic which path is bar vs app, or which is “ours.”

3. Critic only uses the `Read` tool on those image paths (sandbox-safe).
4. Main maps the critic’s pick back to bar vs app and decides whether to loop the builder.

## Full loop

1. Builder implements or updates the specimen / UI.
2. Main asks the **capture specialist** for screenshots (bar once, app every round).
3. Capture specialist returns PNG paths.
4. Main fans out the **critic** with blind paths only.
5. If ours loses, main sends the gap to the builder; repeat from 2.
6. Stop only when the critic picks ours blind (or the user stops).

## Home redesign bar

Default external handoff: `~/Downloads/handoff/` (`index.html` with `data-screen-label` frames). Capture specialist: `--bar ~/Downloads/handoff`.

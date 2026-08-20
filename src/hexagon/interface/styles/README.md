# Interface styles

Shared stylesheets and the cascade-layer contract for the student UI overhaul.

## Layer order

Reserved in `index.html` (must load before any Vite-injected CSS):

```css
@layer legacy, tokens, primitives, features;
```

Later names win, regardless of selector specificity.

| Layer        | What goes here                                                         | How it is assigned                                           |
| ------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| `legacy`     | All existing global `.css` / `.scss` under `src/`                      | Local PostCSS plugin (`postcss-plugins/assign-css-layer.js`) |
| `tokens`     | `:root` custom properties in `tokens.css`                              | File declares `@layer tokens` itself                         |
| `primitives` | CSS Modules under `interface/components/general/` (Button, UiScope, …) | Plugin, by path                                              |
| `features`   | Other CSS Modules (pages and feature components)                       | Plugin, by path                                              |

Do not add a second `@import … layer(legacy)` for files that are already imported from JS. That would emit an unlayered copy, which beats every layer.

Empty stylesheets are left unwrapped so concatenation cannot produce `@layer legacy@layer legacy {`. esbuild's CSS minifier also corrupts adjacent `@layer` blocks, so production CSS minify is off (`build.cssMinify: false` in `vite.config.ts`) until a layer-aware minifier is adopted.

## Tokens

`tokens.css` keeps the original `--brand`, `--theme`, `--accent`, `--light`, `--dark`, `--error-*` names and adds semantic aliases (`--color-action`, `--space-*`, `--radius-*`, `--z-*`, `--font-sans`).

Do not put breakpoints in CSS variables — `@media (max-width: var(--x))` is invalid. Student-v2 breakpoints are **480px** and **768px**.

### `--lcs-*` — the v2 design system

The LearnCraft Design System v2.1 values live in the same file under the `--lcs-` prefix: color, tints, lines, on-dark alphas, space, radius, elevation, motion, layout, typography, focus, and stacking. **New v2 primitives use `--lcs-*` exclusively.**

The prefix is load-bearing, not decorative. `VocabularyCreator.scss` and `PaginatedVocabularyTable.scss` reference generic names that are _not defined_ (`--color-primary`, `--color-border`, `--color-danger`, `--color-text-muted`, `--color-gray-lighter`, `--color-secondary`, `--color-primary-dark`, `--color-danger-light`, `--color-gray-lightest`) and resolve to their inline `var(name, fallback)` values. Defining any of those names would silently restyle those components.

Two rules follow:

- **Add tokens; never change existing ones.** `--space-1..6`, `--radius-sm/md`, `--brand`, and `--color-action-hover` keep their current values. The v2 spacing steps (6/10/14/20/28px) and radii (6/10/14px) are additions, not a renumbering.
- **Prefix every new token.** `--lcs-*` cannot collide with a legacy `var()` call site.

The two scales are independent and intentionally different:

|        | Legacy                           | v2                                                  |
| ------ | -------------------------------- | --------------------------------------------------- |
| Space  | `--space-1..6` = 4/8/12/16/24/32 | `--lcs-space-1..11` = 4/6/8/10/12/14/16/20/24/28/48 |
| Radius | `--radius-sm/md` = 4/8           | `--lcs-radius-sm/md/lg/xl/pill` = 6/8/10/14/999     |
| Font   | `--font-sans` (Poppins)          | `--lcs-font-sans` (Avenir → Nunito Sans)            |

`--lcs-font-sans` is applied by `PageShell` and inherited. Form-control primitives must set `font-family: inherit` themselves, since browsers do not inherit into `input` / `select` / `button`.

## Adding a flagged student surface

1. Add a flag id to `src/hexagon/domain/uiFlags.ts`.
2. Enable it locally with `VITE_UI_FLAGS=ui.student.help.v2` (comma-separated). Leave unset in production.
3. Wrap the route element in `<UiScope flag="ui.student.help.v2">`. The wrapper uses `display: contents` and sets `data-ui="v1"` or `data-ui="v2"`.
4. Author v2 styles as a `*.module.scss` file. Target `[data-ui='v2']` only when a v1/v2 split exists in the same tree.

Do not wrap student routes until that surface is being redesigned.

The first major student surface is Flashcard Finder (`ui.student.flashcards.finder.v2`). Architecture, isolation rules, and the start sequence live in [`pages/STUDENT_FLASHCARDS.md`](../pages/STUDENT_FLASHCARDS.md). `ui.student.help.v2` is the documented example flag only — Get Help is not wrapped and is not that phase.

## Flags that gate a whole surface

`UiScope` + `useStudentUiVersion` handle a v1/v2 split on a route that already exists. For a route that is entirely new or development-only, use `useUiFlag` inside the page instead — it returns `{ enabled }`, the page returns `null` when the flag is off, and the route needs no extra hook.

`ui.dev.gallery` works this way. It serves `/ui-gallery`, a specimen page for every v2 primitive and token. Enable it with `VITE_UI_FLAGS=ui.dev.gallery`. The page is lazy-loaded, so it never enters the main bundle.

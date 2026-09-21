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
| Font   | `--font-sans` (Poppins)          | `--lcs-font-sans` (Nunito Sans)                     |

`--lcs-font-sans` is applied by `PageShell` and inherited. Form-control primitives must set `font-family: inherit` themselves, since browsers do not inherit into `input` / `select` / `button`.

The design specified Avenir, but Avenir is not licensed for the web and only resolves as a system font on macOS and iOS. Listing it ahead of Nunito Sans meant Mac and iPhone users saw a different typeface from everyone else, so it was removed. v2 is Nunito Sans on every platform, loaded from the Google Fonts link in `index.html`.

## Student v1 vs v2

v2 is shown when the logged-in user's own record has `studentRole === 'student'` and `betaTester === true`. Everyone else gets v1. `UiScope` wraps each student route, uses `display: contents`, and sets `data-ui="v1"` or `data-ui="v2"`. Author v2 styles as a `*.module.scss` file. Target `[data-ui='v2']` only when a v1/v2 split exists in the same tree.

The first major student surface is Flashcard Finder. Architecture, isolation rules, and the start sequence live in [`pages/STUDENT_FLASHCARDS.md`](../pages/STUDENT_FLASHCARDS.md). Get Help is the help hub at `/get-help` (vocab lookup + video walkthroughs); the vocab search itself remains at `/get-help/vocab`.

## Development-only gallery

`/ui-gallery` is a specimen page for every v2 primitive and token. The route is registered only when `config.environment !== 'production'`. The page is lazy-loaded, so it never enters the main bundle.

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

New UI must use the semantic names. Do not put breakpoints in CSS variables — `@media (max-width: var(--x))` is invalid. Student-v2 breakpoints are **480px** and **768px**.

## Adding a flagged student surface

1. Add a flag id to `src/hexagon/domain/uiFlags.ts`.
2. Enable it locally with `VITE_UI_FLAGS=ui.student.help.v2` (comma-separated). Leave unset in production.
3. Wrap the route element in `<UiScope flag="ui.student.help.v2">`. The wrapper uses `display: contents` and sets `data-ui="v1"` or `data-ui="v2"`.
4. Author v2 styles as a `*.module.scss` file. Target `[data-ui='v2']` only when a v1/v2 split exists in the same tree.

Do not wrap student routes until that surface is being redesigned.

The first major student surface is Flashcard Manager + Flashcard Finder (one flag, both routes). Architecture, isolation rules, and the start sequence live in [`pages/STUDENT_FLASHCARDS.md`](../pages/STUDENT_FLASHCARDS.md). `ui.student.help.v2` is the documented example flag only — Get Help is not wrapped and is not that phase.

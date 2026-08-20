# General components

Two populations share this folder.

**Legacy** components (`AudioControl`, `Pagination`, `SafeLink`, `SectionHeader`, `ToggleSwitch`, `VocabTagFilter`, and the `LoginButton` / `LogoutButton` / `MenuButton` trio) are global `.scss` in `@layer legacy`. They have many consumers across quiz, coaching, and admin surfaces. Do not restyle them; see [`../../DECISIONS.md`](../../DECISIONS.md).

**v2 primitives** are `*.module.scss` and land in `@layer primitives` automatically, assigned by path in [`postcss-plugins/assign-css-layer.js`](../../../../../postcss-plugins/assign-css-layer.js). They implement LearnCraft Design System v2.1 and are what new student surfaces compose.

## The primitive contract

A file in this folder is a v2 primitive only if all of the following hold.

- **Tokens only.** Every color, space, radius, shadow, duration, and font size comes from a `--lcs-*` custom property. No hardcoded hex, no raw px for anything on the scale. The exceptions are values that are genuinely one-off geometry (a 22px checkbox, an 18px knob travel) and the two breakpoints, which must be literal `480px` / `768px` — `@media (max-width: var(--x))` is invalid CSS.
- **Props only.** No application hooks, no coordinators, no adapters. A primitive that needs data is not a primitive. The single exception `interface/DECISIONS.md` permits is a local interface hook for strictly visual concerns — popover dismissal, focus management, positioning.
- **Explicit return types.** `JSX.Element` on components, a named interface on any hook. No inference, no `typeof`, no `ReturnType<>`.
- **Colocated tests at 100%.** `Foo.tsx`, `Foo.module.scss`, `Foo.test.tsx`, `index.ts` in a `Foo/` directory.
- **Focus is never removed.** Every interactive primitive carries `outline: var(--lcs-focus-ring); outline-offset: var(--lcs-focus-offset)` on `:focus-visible`.
- **Motion is opacity and transform only**, at `--lcs-motion-micro` or `--lcs-motion-panel`, and honors `prefers-reduced-motion: reduce`.

## What exists

|          |                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------- |
| Layout   | `PageShell`, `FixedBottomStack`, `Card` + `CardSection` + `CardSectionHeader` + `CardFooterStrip` |
| Type     | `Eyebrow`, `Badge`                                                                                |
| Icons    | `Icon`, `IconButton`, `IconTile`                                                                  |
| Controls | `Button`, `Field`, `Select`, `TextInput`, `Checkbox`, `Toggle`                                    |
| Overlays | `Popover` (+ `useDismissable`), `Menu`                                                            |
| Feedback | `EmptyState`, `NoticeBar`, `Skeleton`                                                             |
| Data     | `Chip`, `DataTable`, `PaginationV2`                                                               |

`Icon` is the only file that imports an icon package. Call sites name a glyph by string, so swapping `@tabler/icons-react` for another set is a change to one map. Register a glyph in `Icon.tsx` before using it.

`Select` has a `readout` variant that renders a read-only input rather than a disabled `select` — a greyed-out dropdown reads as broken rather than inactive.

`DataTable` takes the grid as custom properties rather than an inline `grid-template-columns`, so an optional `mobileLayout` can reflow the row below 768px — inline styles cannot carry a media query. A column names the area it occupies on mobile; a column with no area is hidden there, header included. The Finder's results row stacks Spanish over English and keeps the checkbox and chevron spanning both lines:

```tsx
mobileLayout={{
  columnTemplate: '44px 1fr 44px',
  templateAreas: '"select spanish expand" "select english expand"',
}}
```

There is no `density` prop. The prototype had `comfortable | compact`; production does not need it, so rows are a fixed ≥56px.

## Promotion rule

Build in the feature tree first. A component earns a place here once a second surface needs it, or once it is obviously generic (a button, a checkbox). Feature-specific composition — preset chips, vocabulary tag popovers, a page's particular table columns — stays with its feature in `@layer features`.

Versioning beside a legacy component, rather than editing it, is deliberate. The v2 `Pagination` is a new primitive precisely because the legacy one has roughly nine consumers that are not being redesigned.

## Reviewing them

`/ui-gallery` renders every primitive with each variant and state. Enable it with `VITE_UI_FLAGS=ui.dev.gallery`. Add a section there in the same PR that adds a primitive.

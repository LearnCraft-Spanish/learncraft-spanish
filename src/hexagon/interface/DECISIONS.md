# Decisions: Interface Layer

## Why Interface Hooks Are Limited to Visual Concerns

**Context**: React components often need local hooks for UI behavior (modals, tooltips, focus management). The "one hook per component" rule could be read as forbidding all local hooks.

**Decision**: Interface-level hooks are allowed for strictly visual concerns: modals, popups, theme toggles, UI animations, focus management, tooltip positioning. They must never duplicate application/domain logic, mutate business state, call infrastructure, or perform business calculations.

**Consequences**: If you find yourself needing business logic in an interface hook, it belongs in `application/` instead. The line is: if removing the hook would break the UI but not the business logic, it's an interface hook. If removing it would break business behavior, it belongs in application.

## Why CSS Modules, cascade layers, and tokens

**Context**: Styles were colocated with components but still global. Element rules in `App.css` (`button`, `.div-header button`) beat new class names by specificity. A student UI overhaul needs isolation without rewriting 7k lines of CSS.

**Decision**:

- Existing stylesheets stay as-is and are wrapped in `@layer legacy` by a local PostCSS plugin. Convert a file to a CSS Module only when that feature is redesigned.
- New student UI uses CSS Modules so class names cannot collide with the global namespace.
- `@layer primitives` / `@layer features` sit above `legacy`, so new module classes win against `App.css` without `!important`.
- Design tokens live in `tokens.css` (`@layer tokens`, above `legacy`) so new UI references semantic variables. The original `--brand` / `--theme` names are kept so existing `var(--…)` call sites do not change.
- UI version is `useStudentUiVersion` plus `UiScope` (`data-ui`), not a CSS `@if`. v2 is rolled out to every visitor, so `useStudentUiVersion` always returns `v2`; the v1 branches stay until they are deleted. `App` mounts `AppHeader` for everyone, logged in or not; the legacy `Nav`, sub header, and full-viewport paper canvas are gone. The student nav (header links and mobile tab bar) shows only for the student home view: students, and staff using the app as one. Limited and free users get the account menu with no nav, and a limited toolset in home. Logged-out visitors get the brand alone. Parchment remains behind `.mainContent` only for the legacy staff tools. Loaders go through `LoadingScreen`. Do not set `data-ui=v2` on `html`.

**Consequences**: A PR that restyles one student surface must not edit `App.css` or shared global classes. Shared chrome (`QuizSetupMenu`, `ExampleListItem`, Nav) is versioned as a unit when it is redesigned, not restyled from a page stylesheet.

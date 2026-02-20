# Decisions: Interface Layer

## Why Interface Hooks Are Limited to Visual Concerns

**Context**: React components often need local hooks for UI behavior (modals, tooltips, focus management). The "one hook per component" rule could be read as forbidding all local hooks.

**Decision**: Interface-level hooks are allowed for strictly visual concerns: modals, popups, theme toggles, UI animations, focus management, tooltip positioning. They must never duplicate application/domain logic, mutate business state, call infrastructure, or perform business calculations.

**Consequences**: If you find yourself needing business logic in an interface hook, it belongs in `application/` instead. The line is: if removing the hook would break the UI but not the business logic, it's an interface hook. If removing it would break business behavior, it belongs in application.

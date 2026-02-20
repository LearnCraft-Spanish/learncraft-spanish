# Decisions: Coordinators

## Coordinators Access Composition Context Directly

**Context**: Coordinators manage cross-cutting concerns (audio playback, authentication, active student) that require global state from React Context providers. The strict inward-only dependency rule would prevent application-layer code from accessing composition-layer context.

**Decision**: Coordinators are allowed to import context hooks from `composition/context/`. This is a documented exception to the dependency direction rule.

**Consequences**: This creates a narrow, controlled upward dependency. The exception is limited to context-access hooks only — coordinators cannot import providers, components, or other composition-layer code. The BOUNDARIES.md for coordinators documents this explicitly. Any new coordinator using this exception must justify its context access.

## Coordinators Are Not Use Cases

**Context**: Both coordinators and use cases orchestrate application behavior. The distinction isn't obvious at first glance.

**Decision**: Coordinators manage shared state used across multiple features. Use cases compose multiple hooks for one specific interface purpose (typically a page). A coordinator is consumed by use cases; a use case is consumed by a page.

**Consequences**: If state is only needed by one feature, it belongs in a use case or unit, not a coordinator. Coordinators should be rare — most application state is feature-specific. When reviewing code, ask: "Is this state shared across features?" If not, it's not a coordinator.

## When to Use Coordinators

**Context**: It's not always clear whether state belongs in a coordinator, a use case, a unit, or the interface.

**Decision**: Use coordinators when state is needed by multiple use-cases, represents global application state, needs to persist across route changes, or coordinates between features.

**Consequences**: Don't use coordinators for feature-specific state (use a use case), component-specific UI state (use interface), or local transformations (use a unit). If the state only serves one page, it's not a coordinator.

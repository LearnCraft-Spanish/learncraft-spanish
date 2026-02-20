# Decisions: Hexagonal Architecture

## Why Hexagonal Architecture

**Context**: The codebase started as a standard React app with components, hooks, and API calls intermixed. As it grew, changes became risky — modifying one hook could break unrelated features, testing required mocking half the app, and business logic was scattered across UI components.

**Decision**: Adopt hexagonal architecture (ports and adapters) with six layers: Domain, Application, Infrastructure, Interface, Composition, Testing.

**Consequences**: Strict layer separation adds indirection (adapters, ports, use cases) that wouldn't exist in a simpler app. The tradeoff is that we own the abstractions: every module is independently testable, modularity is better supported, decisions are easier to reason about, and changes to external services (APIs, auth) don't ripple into business logic. This aligns with Doctrine principles 0 (explicit dependency direction) and 1 (explicit boundaries).

## Why Functions and Hooks Only — No Classes

**Context**: Hexagonal architecture literature typically uses classes and dependency injection via constructors and containers. Classes encourage inheritance hierarchies, implicit state through `this`, and "spooky action at a distance" where a method call on one object silently mutates another. React's idiom is functions, hooks, and composition.

**Decision**: Use functions and hooks exclusively. No classes, no OOP. Composition over inheritance — small, focused hooks composed together rather than class hierarchies. Dependency inversion is achieved through explicit adapter hooks rather than constructor injection or DI containers.

**Consequences**: Dependencies are visible at the call site, not hidden in a constructor or base class. Behavior is composed from small pieces rather than inherited from deep hierarchies. The architecture is idiomatic React — developers don't need to learn DI containers. The cost is that two dependency-rule exceptions exist (adapters importing infrastructure, coordinators importing composition context) because hook-based dependency resolution doesn't map perfectly to classical hex architecture. These exceptions are documented in ARCHITECTURE.md and the respective BOUNDARIES.md and DECISIONS.md files.

## Why Incremental Migration Rather Than Rewrite

**Context**: A large amount of legacy code exists outside `src/hexagon/`. A full rewrite would halt feature development for months.

**Decision**: Migrate incrementally. New features go in `src/hexagon/`. Legacy code is migrated when touched for bug fixes or when it blocks hexagon development. Legacy code is never extended.

**Consequences**: Two code worlds coexist. Developers must understand both and know which patterns apply where. The migration boundary is managed by the rule: new code always goes in `src/hexagon/`, legacy code outside is frozen.

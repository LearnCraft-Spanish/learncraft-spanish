# Hexagon Architecture Boundaries

## What is This?

The hexagon directory implements a **hexagonal architecture** (ports and adapters) with **pragmatic layer boundaries** for the LearnCraft Spanish React SPA.

**Note:** This is **NOT** strict DDD. We use a practical adaptation:

- **Domain** = Pure business logic and data transformations
- **Application** = Business workflows, orchestration, and runtime behavior
- **Infrastructure** = External IO, API bindings, and third-party integrations
- **Interface** = React UI components and rendering logic
- **Composition** = Static application bootstrap and provider wiring
- **Testing** = Test utilities, factories, and mock helpers

This works well for data-heavy React applications where business rules involve querying and aggregating across multiple sources.

## ⚠️ Longevity Warning

**Current State:** Business logic lives in the application layer (anemic domain model). This is pragmatic and works, but:

**Known Risks:**

- Business rules scattered across use-cases and units
- Hard to find "what are the rules for X?"
- Can lead to duplication as complexity grows
- Refactoring becomes harder over time
- Testing individual rules requires full orchestration setup

**Mitigation Strategy:**

- Document business rules clearly in comments (like the "cumulative" vs "range" distinction)
- Keep related logic together (units directory)
- Write thorough tests that capture the business semantics
- Refactor incrementally if rules become complex (consider moving to domain)

## Layer Responsibilities

```
┌─────────────────────────────────────┐
│  composition/ - Static bootstrap    │
│  (Providers, root render)          │
├─────────────────────────────────────┤
│  interface/   - React UI            │
│  (Components, pages, routing)      │
├─────────────────────────────────────┤
│  application/ - Business workflows  │
│  (Use-cases, units, coordinators)   │
│  - Complex orchestration             │
│  - Multi-source coordination         │
│  - React hooks and state             │
├─────────────────────────────────────┤
│  domain/      - Pure logic          │
│  (Pure functions, transformations)  │
│  - Business rules                    │
│  - Data transformations              │
├─────────────────────────────────────┤
│  infrastructure/ - External adapters│
│  (HTTP clients, API bindings)       │
│  - Side effects                      │
│  - Third-party integrations          │
└─────────────────────────────────────┘
```

## Dependency Rule

**Dependencies flow INWARD only:**

- Domain has NO dependencies (not even other layers)
- Application depends only on domain
- Infrastructure implements application ports (no business logic)
- Interface depends on application/use-cases only (via hooks)
- Composition depends on interface and wires everything together
- Testing depends on all layers for mocks and factories
- **NEVER let inner layers know about outer layers**

## Strict Dos and Don'ts

### ✅ DO

- Keep each layer focused on its responsibility
- Pass dependencies as function parameters
- Use pure functions in domain
- Use React hooks in application for runtime behavior
- Keep domain framework-agnostic (no React)
- Let composition wire all dependencies
- Document business rules clearly in comments
- Use typed mocks in tests

### ❌ DON'T

- NO classes or OOP patterns anywhere
- NO `this` keyword
- NO mutable state in domain
- NO React types or hooks in domain
- NO framework types (React, etc.) in domain
- NO direct infrastructure imports in domain/application (use ports)
- NO business logic in infrastructure/interface
- NO HTTP types outside infrastructure layer
- NO database types outside infrastructure layer
- NO untyped mocks (`vi.fn()` - use `createTypedMock<T>()`)

## Reading Order

1. `domain/` - Core business logic
2. `application/` - Use cases and orchestration
3. `infrastructure/` - External service adapters
4. `interface/` - React UI components
5. `composition/` - Application bootstrap
6. `testing/` - Test utilities and patterns

## Where to Add Code?

- New business rules → `application/` (for now, see longevity warning)
- New pure transformations → `domain/`
- New use cases → `application/useCases/`
- New reusable hooks → `application/units/`
- New shared state → `application/coordinators/`
- New external services → `infrastructure/`
- New React components → `interface/components/`
- New pages/routes → `interface/pages/`
- New providers → `composition/providers/`
- New test utilities → `testing/`

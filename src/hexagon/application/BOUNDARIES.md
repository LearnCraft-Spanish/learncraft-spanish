# Application Layer Boundaries

## What is This?

The application layer contains **runtime behavior and orchestration** - all the business workflows that coordinate data flow between domain and infrastructure. This is where most of the business logic lives (for now, see longevity warning in main BOUNDARIES.md).

## Responsibility

Business workflows, orchestration, and runtime behavior:

- Use-case hooks that implement complete user interactions
- Unit hooks that provide reusable, composable logic
- Coordinators that manage shared application state
- Port definitions that specify external dependency interfaces
- Adapters that wrap infrastructure to match ports (no logic)
- React hooks for state management and side effects
- Complex orchestration and multi-source coordination

## Structure

```
application/
├── useCases/     - Complete business workflows (exposed as hooks)
├── units/        - Reusable, composable logic hooks
├── coordinators/ - Shared state and cross-cutting concerns
├── ports/        - Type definitions for external dependencies
├── adapters/     - Wrappers over infrastructure (no logic)
├── queries/      - Data fetching hooks
└── types/        - Application-specific types
```

## ⚠️ Critical Rules

### ✅ DO

- Use React hooks for runtime behavior and state
- **Use EXPLICIT return types for ALL hooks** - Export interfaces, never use inferred types or `typeof`
- Compose domain functions for business logic
- Define ports (interfaces) for external dependencies
- Use adapters to wrap infrastructure implementations
- Write use-cases that orchestrate units and coordinators
- Write 100% test coverage for use-cases, units, and coordinators
- Pass dependencies as function parameters when possible
- Keep adapters thin (just wrapping, no logic)

### ❌ DON'T

- **NO direct infrastructure imports** (use ports and adapters instead)
- **NO rendering logic** (no JSX, no components)
- **NO React components** (hooks only)
- **NO framework types in domain layer** (but React is OK here)
- **NO business logic in adapters** (they're just wrappers)
- **NO classes or OOP** (functions and hooks only)
- **NO HTTP routing logic** (that's interface layer)
- **NO direct database access** (use infrastructure through ports)

## Dependency Rules

**Application depends ONLY on domain:**

- ✅ Can import from `domain/`
- ✅ Can define ports (types/interfaces) for infrastructure
- ✅ Can use React hooks and types
- ❌ Cannot import from `infrastructure/` directly (use adapters)
- ❌ Cannot import from `interface/` or `composition/`
- ❌ Cannot be imported by `domain/`

## Ports and Adapters Pattern

**Ports** (`ports/`):

- Define the interface that infrastructure must implement
- Pure TypeScript types/interfaces
- No implementation

**Adapters** (`adapters/`):

- Wrap infrastructure implementations to match ports
- Thin layer - no business logic
- Just function/type mapping

**Infrastructure** (separate layer):

- Implements the actual HTTP calls, database queries, etc.
- Must match port interfaces
- Adapters use infrastructure

## Testing Requirements

- **100% test coverage** for:
  - `useCases/` - Test with mocked units/coordinators
  - `units/` - Test in isolation with mocked dependencies
  - `coordinators/` - Test state management
- Colocated test files: `*.test.ts`, `*.stub.ts`
- Use typed mocks (`createTypedMock<T>()`, not `vi.fn()`)
- Mock adapters using `*.mock.ts` files

## Reading Order

1. `ports/` - Understand required interfaces
2. `units/` - See reusable logic components
3. `useCases/` - See complete workflows
4. `coordinators/` - See shared state
5. `adapters/` - See how infrastructure is wrapped

## Where to Add Code?

- New complete workflows → `useCases/`
- New reusable logic → `units/`
- New shared state → `coordinators/`
- New external dependency interface → `ports/`
- New infrastructure wrapper → `adapters/` (thin, no logic)
- New data queries → `queries/`

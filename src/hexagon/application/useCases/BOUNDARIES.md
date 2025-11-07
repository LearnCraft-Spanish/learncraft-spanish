# Use Cases Boundaries

## What is This?

Use cases represent **complete business workflows** that coordinate multiple units to accomplish specific user tasks. They are the **only** way interface components can access application logic.

## Responsibility

Complete business workflows and user interactions:

- Coordinate between multiple units and coordinators
- Implement complete user-facing features
- Provide cohesive APIs for specific features
- Handle complex orchestration across domain concepts
- Manage state that spans multiple units
- Expose application logic to interface layer

## ⚠️ Critical Rules

### ✅ DO

- Compose multiple units and coordinators
- **Define EXPLICIT return types for ALL hooks** - Export interfaces, never use inferred types or `typeof`
- Provide complete feature APIs (CRUD, loading states, error handling)
- Maintain state that spans multiple units
- Handle reactive state changes across units
- Write 100% test coverage (`*.test.ts`, `*.stub.ts`)
- Use hierarchical mocking for dependencies

### ❌ DON'T

- **NO direct calls from interface** (must go through use-case hooks)
- **NO direct infrastructure imports** (use adapters)
- **NO rendering logic** (no JSX, no components)
- **NO domain imports** (domain logic accessed through units)
- **NO classes or OOP** (functions/hooks only)
- **NO query logic** (use queries/ directory for data fetching)
- **NO single-unit functionality** (that belongs in units/)

## Core Principles

1. **EXPLICIT Return Types**: Every use case MUST have an explicitly defined and exported return type interface - NO inferred types, NO `typeof`, NO `ReturnType<>` - Export the interface directly
2. **Interface Boundary**: Interface components may ONLY call use cases, never units or other application layers directly
3. **Application Logic Exposure**: Application logic can ONLY be exposed to the interface through use cases

## Dependency Rules

**Use cases can depend on:**

- ✅ `application/units/` - Reusable logic hooks
- ✅ `application/coordinators/` - Shared state
- ✅ `application/queries/` - Data fetching hooks
- ✅ `application/adapters/` - Infrastructure wrappers
- ✅ `domain/` - Pure business logic
- ❌ Cannot import from `application/useCases/` (avoid circular dependencies)
- ❌ Cannot import from `interface/` or `composition/`
- ❌ Cannot be imported by `domain/`

## Structure Pattern

Each use case follows a consistent pattern:

```
useXxxCreation/
├── useXxxCreation.ts      - Main implementation
├── useXxxCreation.mock.ts - Mock for testing
└── types.ts              - Type definitions (if needed)
```

Or for simpler use cases:

```
useXxx.ts             - Main implementation
useXxx.mock.ts        - Mock for testing
```

## Testing Requirements

- **100% test coverage** required
- Test with mocked units, coordinators, and queries
- Use hierarchical mocking pattern (setup functions)
- Colocated test files: `*.test.ts`, `*.stub.ts`
- Use typed mocks (`createTypedMock<T>()`, not `vi.fn()`)

## Mocking Pattern

Use hierarchical mocking to set up all dependencies:

```typescript
// Setup function that mocks use-case and all dependencies
export function setupVerbCreationMocks(config = {}) {
  // Setup dependencies
  setupMockVocabulary(config.vocabulary);
  setupMockSubcategories(config.subcategories);

  // Setup and return use-case mock
  return overrideMockUseVerbCreation(config.useCase);
}
```

## Reading Order

1. `units/` - Understand available building blocks
2. `coordinators/` - Understand shared state
3. `useCases/` - See complete workflows
4. `interface/` - See how use-cases are consumed

## Where to Add Code?

- New complete user workflow → New use-case file
- New feature with CRUD → New use-case file
- New orchestration across units → New use-case file
- Complex multi-step process → New use-case file

## Key Distinctions

**Use Cases vs Units:**

- Use cases = Complete workflows, user-facing features
- Units = Reusable building blocks, single responsibilities

**Use Cases vs Queries:**

- Use cases = Business workflows that may use queries
- Queries = Simple data fetching hooks

**Use Cases vs Coordinators:**

- Use cases = Feature-specific orchestration
- Coordinators = Cross-cutting shared state

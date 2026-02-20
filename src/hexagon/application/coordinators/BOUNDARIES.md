# Coordinators Boundaries

## What is This?

Coordinators manage **global shared state and cross-cutting concerns** that are used by multiple use-cases across the application. They provide a single source of truth for application-wide state and lifecycle management.

## Responsibility

Shared state and cross-cutting coordination:

- Manage application-wide shared state
- Coordinate between multiple use-cases
- Handle global lifecycle events
- Provide cross-cutting functionality
- Maintain consistent state across features
- Provide React context for state sharing

## Structure

```
coordinators/
├── hooks/       - Coordinator hooks (useActiveStudent, etc.)
├── providers/   - React context providers
└── contexts/    - Context type definitions
```

## ⚠️ Critical Rules

### ✅ DO

- Manage truly shared state (used across multiple features)
- Provide React context for state sharing
- Use explicit return types for all hooks
- Import provider-accessing hooks from `composition/context/` (exception to dependency rule - see ARCHITECTURE.md)

### ❌ DON'T

- **NO business logic** (coordination only, logic belongs in use-cases/units)
- **NO feature-specific state** (that belongs in use-cases)
- **NO local component state** (that belongs in interface)
- **NO orchestration** (that's use-cases' job)
- **NO rendering logic** (no JSX, no components in hooks)
- **NO classes or OOP** (functions/hooks only)
- **NO direct infrastructure imports** (use adapters)

## Dependency Rules

**Coordinators can depend on:**

- ✅ `application/adapters/` - Infrastructure wrappers
- ✅ `application/queries/` - Data fetching (for shared data)
- ✅ `domain/` - Pure business logic
- ✅ `composition/context/` - Provider-accessing hooks (exception - see DECISIONS.md and ARCHITECTURE.md)
- ✅ React context APIs
- ❌ Cannot import from `application/useCases/` (avoid circular dependencies)
- ❌ Cannot import from `application/units/` directly (avoid circular dependencies)
- ❌ Cannot be imported by `domain/`
- ✅ Can be imported by `application/useCases/` and `application/units`


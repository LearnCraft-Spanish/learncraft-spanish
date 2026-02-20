# Adapters Boundaries

## What is This?

Adapters are **boundary enforcers** that call infrastructure into explicit port interfaces. They do basically nothing - just ensure infrastructure matches application-defined ports. The infrastructure layer is the real adapter (adapting external services). Adapters exist **for the boundaries** - to enforce architectural separation.

## Responsibility

Enforcing boundaries between infrastructure and application:

- Call infrastructure implementations
- Ensure infrastructure matches port interfaces
- Convert non-React infrastructure into React hooks
- Keep React dependencies out of infrastructure

## ⚠️ Critical Rules

### ✅ DO

- Keep adapters **thin** (minimal code, no logic)
- Match port interfaces exactly
- Use infrastructure implementations

### ❌ DON'T

- **NO business logic** (that belongs in use-cases/units)
- **NO complex transformations** (that belongs in application layer)
- **NO orchestration** (that's use-cases' job)
- **NO filtering, sorting, calculations** (business logic)
- **NO rendering logic** (no JSX, no components)
- **NO classes or OOP** (functions/hooks only)
- **NO direct HTTP calls** (use infrastructure)

## Dependency Rules

**Adapters can depend on:**

- ✅ `application/ports/` - Port interfaces to implement
- ✅ `infrastructure/` - Concrete implementations to wrap (exception - see DECISIONS.md)
- ✅ React hooks (for React-specific concerns like config/context)
- ❌ Cannot import from `application/useCases/` or `application/units/` (would create circular dependency)
- ❌ Cannot import from `interface/` or `composition/`
- ❌ Cannot be imported by `domain/`
- ✅ Can be imported by `application/useCases/`, `application/queries/`, etc.

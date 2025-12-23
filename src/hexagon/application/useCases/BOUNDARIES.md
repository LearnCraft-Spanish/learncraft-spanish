# Use Cases Boundaries

## What is This?

Use cases are **compositions of multiple hooks** (units, coordinators, queries) for one particular interface purpose, usually a full page. They coordinate multiple application hooks to provide a complete API for a specific interface component.

## Responsibility

Composing multiple hooks for interface purposes:

- Compose multiple units, coordinators, and queries
- Provide a complete API for one interface purpose (typically a page)
- Handle orchestration across multiple hooks
- Manage state that spans multiple units
- Expose cohesive interface for interface layer

## ⚠️ Critical Rules

### ✅ DO

- Compose multiple hooks (units, coordinators, queries)
- Serve one interface purpose (usually a full page)
- Use explicit return types for all hooks
- Provide complete APIs for interface components
- Handle orchestration across multiple hooks

### ❌ DON'T

- **NO direct infrastructure imports** (use adapters)
- **NO rendering logic** (no JSX, no components)
- **NO classes or OOP** (functions/hooks only)
- **NO pure business logic** (that belongs in domain/)
- **NO query logic** (use queries/ directory for data fetching)
- **NO single-unit functionality** (that belongs in units/)

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

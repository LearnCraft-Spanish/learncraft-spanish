# Units Boundaries

## What is This?

Units are **reusable, composable logic hooks** with single responsibilities. They provide building blocks that use-cases compose into complete workflows.

## Responsibility

Reusable, focused functionality:

- Handle specific, focused functionality
- Provide composable building blocks
- Manage local state (not shared across features)
- Are reused across different use-cases

## ⚠️ Critical Rules

### ✅ DO

- Keep single responsibility (one focused task)
- Make hooks composable and reusable
- Use React hooks for local state
- Use explicit return types for all hooks
- Return focused, typed interfaces

### ❌ DON'T

- **NO complete workflows** (that's use-cases' job)
- **NO global state** (use coordinators for that)
- **NO pure logic** (belongs in domain)
- **NO infrastructure imports** (use adapters)
- **NO rendering logic** (no JSX, no components)
- **NO classes or OOP** (functions/hooks only)

## Dependency Rules

**Units can depend on:**

- ✅ `domain/` - Pure business logic
- ✅ Other `application/units/` - Compose smaller units
- ✅ `application/queries/` - All data
- ❌ Cannot import from `application/useCases/` (avoid circular dependencies)
- ❌ Cannot import from `application/coordinators/` (units are independent)
- ❌ Cannot import from `application/adapters/` directly (go through use-cases or queries)
- ❌ Cannot be imported by `domain/`

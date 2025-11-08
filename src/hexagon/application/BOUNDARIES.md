# Application Layer Boundaries

## What is This?

The application layer contains **runtime behavior and orchestration** - all the business workflows that coordinate data flow between domain and infrastructure. This is where most of the business logic lives (for now, see longevity warning in main ARCHITECTURE.md).

## Structure

```
application/
├── useCases/     - Compositions of multiple hooks for interface purposes
├── units/        - Reusable, composable logic hooks
├── coordinators/ - Shared state and cross-cutting concerns
├── queries/      - Data fetching and mutation hooks
├── implementations/ - Compositions of multiple units but not for interface purposes (perhaps extraneous)
├── ports/        - Type definitions for external dependencies
├── adapters/     - Boundary enforcers that call infrastructure into ports
└── types/        - Application-specific types
```

## ⚠️ Critical Rules

### ✅ DO

- Use React hooks for runtime behavior and state
- Use explicit return types for all hooks
- Compose domain functions for business logic

### ❌ DON'T

- **NO rendering logic** (no JSX, no components)
- **NO React components** (hooks only)
- **NO classes or OOP** (functions and hooks only)
- **NO direct infrastructure imports** (use ports and adapters)

## Dependency Rules

**Application depends on:**

- ✅ `domain/` - Pure business logic
- ✅ React hooks and types
- ❌ Cannot import from `infrastructure/` directly (except through `adapters/`)
- ❌ Cannot import from `interface/` or `composition/`
- ❌ Cannot be imported by `domain/`

For detailed boundaries of each subdirectory, see:

- `useCases/BOUNDARIES.md`
- `units/BOUNDARIES.md`
- `coordinators/BOUNDARIES.md`
- `queries/BOUNDARIES.md`
- `ports/BOUNDARIES.md`
- `adapters/BOUNDARIES.md`

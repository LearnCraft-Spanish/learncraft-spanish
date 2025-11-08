# Queries Boundaries

## What is This?

Queries are **data fetching and mutation hooks** that use TanStack Query (React Query) to fetch, cache, and mutate data from infrastructure. They provide a simple, reusable pattern for accessing data that use-cases and units can consume.

## Responsibility

Data fetching, caching, and mutations:

- Fetch data using TanStack Query (`useQuery`)
- Mutate data using TanStack Query (`useMutation`)
- Manage loading and error states
- Cache query results
- Provide refetch capabilities
- Handle query invalidation

## ⚠️ Critical Rules

### ✅ DO

- Use TanStack Query (`useQuery`, `useMutation`)
- Use explicit return types for all hooks
- Provide loading and error states
- Use appropriate query keys
- Keep queries focused (one resource/endpoint)

### ❌ DON'T

- **NO business logic** (queries fetch and mutate data, don't process it)
- **NO complex orchestration** (that's use-cases' job)
- **NO filtering/sorting logic** (that belongs in units/use-cases)
- **NO rendering logic** (no JSX, no components)
- **NO direct infrastructure calls** (use adapters)
- **NO classes or OOP** (functions/hooks only)
- **NO complete workflows** (that's use-cases)

## Dependency Rules

**Queries can depend on:**

- ✅ `application/adapters/` - Infrastructure wrappers
- ✅ `application/coordinators/` - Shared state (for query parameters)
- ✅ `domain/` - Pure transformations (sparingly)
- ✅ TanStack Query
- ❌ Cannot import from `application/useCases/` (avoid circular dependencies)
- ❌ Cannot import from `application/units/` directly (use sparingly)
- ❌ Cannot be imported by `domain/`
- ✅ Can be imported by `application/useCases/`, `application/units/`

## When to Create a Query

Create a query when:

- ✅ Fetching data from infrastructure
- ✅ Mutating data (create, update, delete operations)
- ✅ Need caching and automatic refetching
- ✅ Need loading/error states
- ✅ Data is used by multiple use-cases

Don't create a query for:

- ❌ Business logic processing (use unit/use-case)
- ❌ Simple local state (use useState)
- ❌ Derived/computed data (use useMemo in unit/use-case)

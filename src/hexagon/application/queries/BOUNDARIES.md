# Queries Boundaries

## What is This?

Queries are **data fetching hooks** that use TanStack Query (React Query) to fetch and cache data from infrastructure. They provide a simple, reusable pattern for accessing data that use-cases and units can consume.

## Responsibility

Data fetching and caching:

- Fetch data using TanStack Query
- Manage loading and error states
- Cache query results
- Provide refetch capabilities
- Handle query invalidation
- Transform domain data if needed (sparingly)

## ⚠️ Critical Rules

### ✅ DO

- Use TanStack Query (`useQuery`, `useMutation`)
- **Use EXPLICIT return types for ALL hooks** - Export interfaces, never use inferred types or `typeof`
- Provide loading and error states
- Use appropriate query keys
- Follow query configuration patterns
- Keep queries focused (one resource/endpoint)
- Write 100% test coverage (`*.test.ts`)
- Use domain functions for transformations

### ❌ DON'T

- **NO business logic** (queries fetch data, don't process it)
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

## Query Patterns

### Pattern 1: Simple Resource Query

```typescript
export function useResourceQuery() {
  const { getResource } = useResourceAdapter();

  return useQuery({
    queryKey: ['resource'],
    queryFn: getResource,
    ...queryDefaults.referenceData,
  });
}
```

### Pattern 2: Parameterized Query

```typescript
export function useResourceByIdQuery(id: number) {
  const { getResourceById } = useResourceAdapter();

  return useQuery({
    queryKey: ['resource', id],
    queryFn: () => getResourceById(id),
    enabled: id !== null,
  });
}
```

### Pattern 3: Query with Filters

```typescript
export function useFilteredResourceQuery(filters: Filters) {
  const { getFilteredResource } = useResourceAdapter();

  return useQuery({
    queryKey: ['resource', filters],
    queryFn: () => getFilteredResource(filters),
  });
}
```

## Testing Requirements

- **100% test coverage** required
- Mock adapters and coordinators
- Test loading, error, and success states
- Test query keys and invalidation
- Colocated test files: `*.test.ts`
- Use typed mocks (`createTypedMock<T>()`, not `vi.fn()`)

## Mock Files

Queries should have mock files for testing:

```typescript
// useSubcategories.mock.ts
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultResult: UseSubcategoriesResult = {
  subcategories: [],
  loading: false,
  error: null,
  refetch: () => {},
};

export const {
  mock: mockUseSubcategories,
  override: overrideMockUseSubcategories,
  reset: resetMockUseSubcategories,
} = createOverrideableMock<() => UseSubcategoriesResult>(() => defaultResult);

export default mockUseSubcategories;
```

## Reading Order

1. `application/adapters/` - Understand available data sources
2. `application/queries/` - See data fetching patterns
3. `application/useCases/` - See how queries are consumed
4. `application/units/` - See if units use queries

## Where to Add Code?

- New data fetching hook → New query file
- New resource endpoint → New query file
- New filtered data fetching → New query file or update existing

## Key Distinctions

**Queries vs Use Cases:**

- Queries = Simple data fetching
- Use cases = Complete workflows (may use queries)

**Queries vs Units:**

- Queries = Data fetching only
- Units = Logic and transformations (may use queries)

**Queries vs Adapters:**

- Queries = React Query wrappers with caching
- Adapters = Thin infrastructure wrappers

## Query Configuration

Use consistent query defaults:

```typescript
// Reference data (rarely changes)
queryDefaults.referenceData = {
  staleTime: Infinity,
  cacheTime: Infinity,
};

// Entity data (may change)
queryDefaults.entityData = {
  staleTime: 5 * 60 * 1000, // 5 minutes
};
```

## When to Create a Query

Create a query when:

- ✅ Fetching data from infrastructure
- ✅ Need caching and automatic refetching
- ✅ Need loading/error states
- ✅ Data is used by multiple use-cases

Don't create a query for:

- ❌ Business logic processing (use unit/use-case)
- ❌ Simple local state (use useState)
- ❌ Derived/computed data (use useMemo in unit/use-case)

# Data Flow & State Management

_How data moves through the application._

For code conventions and examples, see [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md). For architecture rules, see [`ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md).

---

## State Categories

### Server State (TanStack Query)

Data from the backend, cached and synchronized automatically.

**Location**: `src/hexagon/application/queries/`

- Use `useQuery` for fetching (GET)
- Use `useMutation` for changes (POST/PUT/DELETE)
- Invalidate related queries after mutations
- Set appropriate `staleTime` per query
- Colocate `.mock.ts` files for testing

### Global UI State (React Context + Coordinators)

Shared state that multiple features need, but doesn't come from the server (e.g., audio player, selected lesson).

**Locations**:
- Contexts: `src/hexagon/composition/context/`
- Coordinators: `src/hexagon/application/coordinators/`

### Local Component State (useState)

State that only matters to a single component (form inputs, toggles, accordion state). Keep it local — don't lift unless necessary.

---

## Data Flow Through Layers

### Reading Data

```
Page → Use Case → Query → Adapter → Infrastructure → API
                                                       ↓
Page ← Use Case ← Query ← (TanStack Query caches) ← Response
```

### Mutating Data

```
User Action → Use Case → Mutation → Adapter → Infrastructure → API
                                                                 ↓
                  Query Invalidation ← onSuccess ← Response
                         ↓
                  Auto-refetch → UI updates
```

### Coordinated State (Multiple Sources)

When a use case needs data from multiple sources:

```
Use Case
  ├── Unit 1: Query (server data)
  ├── Unit 2: useState (local UI state)
  ├── Unit 3: Coordinator (global state)
  └── Returns: unified interface to Page
```

---

## Coordinator Pattern

Coordinators manage cross-cutting concerns accessed by multiple features.

**Examples in codebase**:
- Audio playback coordination
- Authentication state
- App user profile

Coordinators live in `application/coordinators/` and access global context through composition-layer hooks (see the exception documented in [`ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md#-two-exceptions-to-the-dependency-rule)).

---

## Cache Invalidation

After mutations, invalidate related queries so TanStack Query refetches:

```typescript
queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
```

For optimistic updates (update UI before API responds), use `onMutate` / `onError` / `onSettled` pattern with `useMutation`. See [TanStack Query docs](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates).

---

## Rules of Thumb

1. All server data goes through TanStack Query — never `fetch` in components
2. Mutations always invalidate related queries
3. Derive state when possible — don't store what you can compute
4. Keep state as local as possible — lift only when needed
5. Coordinators for cross-cutting concerns, Context for global UI

For common pitfalls (duplicate state, prop drilling, infinite loops), see [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md).

# Decisions: Queries

## When to Create a Query vs. Other Patterns

**Context**: All data fetching goes through queries, but not all application state is fetched data. The line between a query and other patterns (units, local state) needs to be clear.

**Decision**: Create a query when fetching data from infrastructure, mutating data (create/update/delete), needing caching and automatic refetching, needing loading/error states, or when data is used by multiple use-cases.

**Consequences**: Don't create a query for business logic processing (use a unit or use case), simple local state (use `useState`), or derived/computed data (use `useMemo` in a unit or use case). Queries are the data access boundary — they fetch and cache, but don't process.

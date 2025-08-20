# Adapters

This directory contains adapters that bridge infrastructure implementations to application-defined ports.

## Purpose

Adapters:

- Bridge infrastructure implementations to application ports
- Keep React dependencies out of infrastructure
- Convert non-React infrastructure into React hooks
- Handle any necessary data transformations
- Provide consistent interfaces for use-cases
- Enable easy mocking in tests

## Implementation Patterns

### Pattern 1: Direct Hook Adapter (Preferred)

When the infrastructure implementation already matches the port interface functionally, but needs to be exposed as a React hook:

```typescript
// Example of direct hook adapter
import type { SubcategoryPort } from '../ports/subcategoryPort';
import { subcategoryInfrastructure } from '../../infrastructure/vocabulary/subcategoryInfrastructure';

/**
 * Adapts the infrastructure to a React hook that implements the port.
 *
 * Benefits:
 * - Keeps React dependencies out of infrastructure
 * - Minimal code with no unnecessary indirection
 * - Consistent hook pattern for port consumption
 * - Easy to mock for testing
 * - Maintains clean architecture boundaries
 */
export function useSubcategoryAdapter(): SubcategoryPort {
  // Infrastructure is non-reactive, so we can just return it directly
  return subcategoryInfrastructure;
}
```

### Pattern 2: Transformation Hook Adapter

When the infrastructure implementation needs transformation to match the port interface:

```typescript
// Example transformation hook adapter
import { useState, useCallback } from 'react';

export function useDataAdapter(): DataPort {
  // React state and effects can be used in the adapter
  const [cache, setCache] = useState<Record<string, any>>({});

  // Infrastructure is typically stateless and non-reactive
  const infrastructure = dataInfrastructure;

  const fetchData = useCallback(async () => {
    const rawData = await infrastructure.getData();
    const transformedData = transformData(rawData);
    setCache((prev) => ({ ...prev, [Date.now()]: transformedData }));
    return transformedData;
  }, []);

  return {
    fetchData,
    saveData: async (data: Data) => {
      const rawData = transformDataForStorage(data);
      await infrastructure.storeData(rawData);
    },
    getCache: () => cache,
  };
}
```

## Testing

For both patterns, mock the hook function:

```typescript
// In your test file
import { vi } from 'vitest';

vi.mock('../adapters/subcategoryAdapter', () => ({
  useSubcategoryAdapter: () => ({
    getSubcategories: vi.fn().mockResolvedValue([
      /* mocked data */
    ]),
  }),
}));
```

## Architecture Benefits

- **Infrastructure remains pure**: No React dependencies in infrastructure
- **Testing is simpler**: Non-React infrastructure is easier to test
- **Clear separation**: Adapter layer has a clear purpose as the React/non-React boundary
- **Flexibility**: Infrastructure can be used in non-React contexts
- **Portability**: Infrastructure can be shared with other platforms

## Guidelines

- Always export a hook function to maintain the React boundary
- Keep infrastructure free of React dependencies
- Use the adapter layer for React-specific logic (state, effects, contexts)
- Keep adapters thin and focused
- Match port interfaces exactly
- Include tests for transformation logic
- Document any assumptions about data shape

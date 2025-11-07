# Adapters Boundaries

## What is This?

Adapters are **thin wrappers** that bridge infrastructure implementations to application-defined ports. They convert non-React infrastructure into React hooks and ensure infrastructure matches application port interfaces.

## Responsibility

Bridging infrastructure to application ports:

- Wrap infrastructure implementations to match ports
- Convert non-React infrastructure into React hooks
- Keep React dependencies out of infrastructure
- Provide consistent interfaces for use-cases
- Handle minimal data transformations (if needed)
- Enable easy mocking in tests

## ⚠️ Critical Rules

### ✅ DO

- Keep adapters **thin** (minimal code, no logic)
- Match port interfaces exactly
- **Use EXPLICIT return types for ALL hooks** - Export interfaces, never use inferred types or `typeof`
- Export React hooks (even if just wrapping)
- Use infrastructure implementations
- Provide mock files (`*.mock.ts`) for testing
- Handle React-specific concerns (state, effects) if needed

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
- ✅ `infrastructure/` - Concrete implementations to wrap
- ✅ React hooks (for React-specific concerns)
- ❌ Cannot import from `application/useCases/` or `application/units/` (would create circular dependency)
- ❌ Cannot import from `interface/` or `composition/`
- ❌ Cannot be imported by `domain/`
- ✅ Can be imported by `application/useCases/`, `application/queries/`, etc.

## Adapter Patterns

### Pattern 1: Direct Hook (Most Common)

```typescript
export function useSubcategoryAdapter(): SubcategoryPort {
  return subcategoryInfrastructure;
}
```

**Use when:** Infrastructure matches port exactly.

### Pattern 2: Function Mapping

```typescript
export function useExampleAdapter(): ExamplePort {
  return {
    getExamples: infrastructure.fetchExamples,
    createExample: infrastructure.createExample,
  };
}
```

**Use when:** Simple function name mapping needed.

### Pattern 3: React State Wrapper

```typescript
export function useAudioAdapter(): AudioPort {
  const [cache, setCache] = useState({});
  // ... React-specific state management
}
```

**Use when:** Infrastructure needs React state/effects.

## Mock Files

Every adapter should have a corresponding mock file:

```typescript
// vocabularyAdapter.mock.ts
import type { VocabularyPort } from '../ports/vocabularyPort';
import { createTypedMock } from '@testing/utils/typedMock';

export const mockGetVocabulary = createTypedMock<
  () => Promise<Vocabulary[]>
>().mockResolvedValue([]);

export const mockVocabularyAdapter: VocabularyPort = {
  getVocabulary: mockGetVocabulary,
  // ... other methods
};

export default mockVocabularyAdapter;
```

## Testing

Adapters typically don't need complex tests (they're thin wrappers), but:

- Mock files (`*.mock.ts`) are required
- If adapter has transformation logic, test it
- Ensure adapters match ports exactly

## Reading Order

1. `application/ports/` - Understand required interface
2. `application/adapters/` - See how infrastructure is wrapped
3. `infrastructure/` - See concrete implementation
4. `application/useCases/` - See how adapters are used

## Where to Add Code?

- New infrastructure wrapper → New adapter file
- New port implementation → Update or create adapter
- React-specific wrapping → Update adapter file

## Key Distinctions

**Adapters vs Infrastructure:**

- Adapters = React hooks wrapping infrastructure
- Infrastructure = Pure IO implementations

**Adapters vs Use Cases:**

- Adapters = Thin wrappers, no logic
- Use cases = Business workflows, orchestration

**Adapters vs Ports:**

- Adapters = Implementations (hooks)
- Ports = Interface definitions (types)

## Architecture Benefits

- **Infrastructure remains pure**: No React dependencies in infrastructure
- **Testing is simpler**: Non-React infrastructure is easier to test
- **Clear separation**: Adapter layer has a clear purpose as React/non-React boundary
- **Flexibility**: Infrastructure can be used in non-React contexts
- **Portability**: Infrastructure can be shared with other platforms

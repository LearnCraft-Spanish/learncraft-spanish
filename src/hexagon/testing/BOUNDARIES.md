# Testing Layer Boundaries

## What is This?

The testing layer contains **test utilities, factories, and mock helpers** that support testing across all layers of the hexagonal architecture. This layer provides the infrastructure for writing maintainable, type-safe tests.

## Responsibility

Test utilities and infrastructure:

- Factory functions for creating test data
- Mock helpers and utilities
- Test setup and configuration
- Typed mock creators
- Test providers and wrappers
- Schema-based test data generation
- Mock override patterns

## Structure

```
testing/
├── factories/    - Factory functions for creating test data
├── providers/    - Test provider components
├── utils/        - Test utility functions
├── setupTests.ts - Global test setup
└── index.ts      - Test utilities exports
```

## ⚠️ Critical Rules

### ✅ DO

- Use typed mocks (`createTypedMock<T>()`)
- Create factory functions for test data
- Use schema-based factories when possible
- Provide default happy-path implementations
- Support override patterns for test-specific behavior
- Follow hierarchical mocking for use-cases
- Export utilities for reuse
- Colocate mocks with implementations (`*.mock.ts`)

### ❌ DON'T

- **NO untyped mocks** (`vi.fn()` - use `createTypedMock<T>()`)
- **NO test logic in production code** (keep tests separate)
- **NO global test state mutation** (use isolated mocks)
- **NO direct infrastructure calls in tests** (use mocks)
- **NO duplicate mock implementations** (reuse factories)
- **NO hardcoded test data** (use factories)
- **NO test-specific logic in application layer** (keep it in testing layer)

## Dependency Rules

**Testing depends on:**

- ✅ All layers (for creating mocks and factories)
- ✅ External testing libraries (Vitest, React Testing Library)
- ✅ Can import from any layer to understand what to mock
- ✅ Should not be imported by production code (tests only)

## Examples of What Belongs Here

```typescript
// ✅ Factory function
export const createMockVocabulary = createZodFactory(VocabularySchema);

// ✅ Typed mock creator
export const mockUseVocabulary = createTypedMock<
  () => UseVocabularyResult
>().mockReturnValue(defaultResult);

// ✅ Override function
export const overrideMockUseVocabulary = (
  config: Partial<UseVocabularyResult> = {}
) => {
  const result = { ...defaultResult, ...config };
  mockUseVocabulary.mockReturnValue(result);
  return result;
};

// ✅ Test provider
export function TestProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
}

// ✅ Setup function for hierarchical mocks
export function setupVerbCreationMocks(config = {}) {
  // Sets up useCase and all its dependencies
  setupMockVocabulary(config.vocabulary);
  setupMockSubcategories(config.subcategories);
  return overrideMockUseVerbCreation(config.useCase);
}
```

## Examples of What Does NOT Belong Here

```typescript
// ❌ Untyped mocks
export const mockUseVocabulary = vi.fn(); // ❌ NO!

// ❌ Hardcoded test data
export const mockVocabulary = {
  id: 1,
  word: 'hola',
  // ... ❌ NO! Use factory instead
};

// ❌ Test logic in production files
// In application/useCases/useVocabulary.ts:
export function useVocabulary() {
  if (process.env.NODE_ENV === 'test') {
    // ❌ NO! Keep test logic in testing layer
    return mockData;
  }
  // ...
}

// ❌ Global state mutation
let globalMockState = {}; // ❌ NO! Use isolated mocks per test
```

## Mock Patterns

### 1. Modern Pattern: `createOverrideableMock`

```typescript
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const { mock, override, reset } = createOverrideableMock(() => defaultResult);

export { mock as mockUseExample, override as overrideMockUseExample };
```

### 2. Legacy Pattern: `createTypedMock`

```typescript
import { createTypedMock } from '@testing/utils/typedMock';

export const mockUseExample =
  createTypedMock<() => UseExampleResult>().mockReturnValue(defaultResult);
```

### 3. Factory Pattern

```typescript
import { createZodFactory } from '@testing/utils/factoryTools';

export const createMockVocabulary = createZodFactory(VocabularySchema);
export const createMockVocabularyList = createZodListFactory(VocabularySchema);
```

## Testing Standards

### Coverage Requirements

| Layer                       | Coverage | Test Files               |
| --------------------------- | -------- | ------------------------ |
| `domain/`                   | ✅ 100%  | `*.test.ts`              |
| `application/useCases/`     | ✅ 100%  | `*.test.ts`, `*.stub.ts` |
| `application/units/`        | ✅ 100%  | `*.test.ts`              |
| `application/coordinators/` | ✅ 100%  | `*.test.ts`, `*.stub.ts` |
| `interface/components/`     | ✅ 100%  | `*.test.tsx`             |
| `interface/pages/`          | ✅ 100%  | `*.test.tsx`             |
| `application/adapters/`     | ❌ N/A   | `*.mock.ts`              |
| `infrastructure/`           | ❌ N/A   | No logic = no tests      |

### Mock File Locations

- Adapter mocks: `application/adapters/*.mock.ts`
- Use-case mocks: `application/useCases/*/*.mock.ts`
- Unit mocks: `application/units/*.mock.ts` (if needed)

## Global Test Setup

⚠️ **DO NOT MODIFY OR DUPLICATE `setupTests.ts`**

The global `setupTests.ts` file handles:

- Adapter mocking
- Test isolation
- Query client reset
- Mock cleanup

Modifying it will break test isolation and cause flaky tests.

## Using Mocks in Tests

### Simple Component Test (defaultResult)

```typescript
import { defaultResult as vocabularyDefault } from '@application/useCases/useVocabulary.mock';

vi.mock('@application/useCases/useVocabulary', () => ({
  useVocabulary: () => vocabularyDefault,
}));
```

### Dynamic Test (override pattern)

```typescript
import { mockUseVocabulary, overrideMockUseVocabulary } from '@application/useCases/useVocabulary.mock';

vi.mock('@application/useCases/useVocabulary', () => ({
  useVocabulary: () => mockUseVocabulary(),
}));

it('handles loading state', () => {
  overrideMockUseVocabulary({ loading: true });
  render(<VocabularyPage />);
  // ... assertions
});
```

### Hierarchical Mock Setup

```typescript
import { setupVerbCreationMocks } from '@application/useCases/useVerbCreation.mock';

it('renders correctly', () => {
  setupVerbCreationMocks();
  render(<VerbCreationPage />);
  // All dependencies automatically mocked
});
```

## Reading Order

1. `testing/README.md` - Understand testing patterns
2. `testing/factories/` - See available factories
3. `testing/utils/` - See utility functions
4. `application/adapters/*.mock.ts` - See adapter mocks

## Where to Add Code?

- New factory function → `factories/`
- New mock utility → `utils/`
- New test provider → `providers/`
- New override pattern → Colocated with implementation (`*.mock.ts`)
- New setup function → Colocated with use-case (`*.mock.ts`)

## Key Principles

1. **Type Safety**: Always use typed mocks
2. **Isolation**: Each test should have isolated mocks
3. **Factories**: Use factories for test data generation
4. **Defaults**: Provide happy-path defaults for all mocks
5. **Override**: Support test-specific overrides without global mutation
6. **Colocation**: Keep mocks close to implementations

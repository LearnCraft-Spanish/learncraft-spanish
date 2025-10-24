# Hexagonal Architecture Testing

This directory contains utilities and patterns for testing the hexagonal architecture.

## 📋 Overview

Our testing approach follows these core principles:

1. **Leave the testing environment the way you found it** - Clean up after your tests
2. **Test at the right layer** - Unit test logic, integration test collaboration
3. **Use typed mocks** - All mocks must be type-safe
4. **Progressive improvement** - Each change should maintain or improve coverage

For complete testing standards, see `/documentation/TESTING_STANDARDS.md`

---

## ⚠️ IMPORTANT: Global Test Setup ⚠️

> **DO NOT MODIFY `setupTests.ts` without team discussion**
>
> Our test infrastructure relies on the global `setupTests.ts` file to provide default mocks for all tests. This file is configured in `vitest.config-hexagon.ts` and runs before all hexagon tests.

### Multiple Configuration Files

The project has two separate test configuration files:

- `vitest.config.ts` - General application tests (uses `./tests/setupTests.ts`)
- `vitest.config-hexagon.ts` - Hexagon architecture tests (uses `./src/hexagon/testing/setupTests.ts`)

When running hexagon tests, always specify the hexagon configuration:

```bash
npm test -- src/hexagon/some-test.ts --config vitest.config-hexagon.ts
```

## 🔧 Test Setup Infrastructure

The `setupTests.ts` file runs before all hexagon tests and provides:

1. **Global Mocks** - Commonly used adapters and hooks are mocked globally with default "happy path" values
2. **Automatic Cleanup** - Mocks are automatically reset after each test file
3. **React Query Integration** - QueryClient is reset between tests

### What's Globally Mocked

The following are mocked in `setupTests.ts` with default implementations:

- **Adapters**: `useCourseAdapter`, `useVocabularyAdapter`, `useSubcategoryAdapter`, `useAuthAdapter`, `useFlashcardAdapter`, `useOfficialQuizAdapter`
- **Coordinators**: `useActiveStudent`, `useSelectedCourseAndLessons`
- **Units**: `useStudentFlashcards`

### How It Works

```typescript
// Mocks are set up at module level
vi.mock('@application/adapters/vocabularyAdapter', () => ({
  useVocabularyAdapter: vi.fn(() => mockVocabularyAdapter),
}));

// After each test: Clear call history, reset query client, cleanup components
afterEach(() => {
  vi.clearAllMocks();
  resetTestQueryClient();
  cleanup();
});

// After each test file: Reset all mocks to default implementations
afterAll(() => {
  resetMockVocabularyAdapter();
  resetMockSubcategoryAdapter();
  // ... other resets
});
```

### Key Behaviors

- **Default values**: All global mocks use "happy path" default values
- **Test-specific overrides**: Use `overrideMock` functions to customize behavior for specific tests
- **Automatic cleanup**: Mock call history is cleared after each test
- **Full reset**: Mock implementations reset to defaults after each test file

---

## 🎭 Creating Mocks

All data-returning hooks must have a corresponding mock file. We use `createOverrideableMock` for consistency and type safety.

### Mock File Pattern

Each hook should have a corresponding mock file:

```
useExample.ts → useExample.mock.ts
```

### Using createOverrideableMock

All mocks should be created using the `createOverrideableMock` utility from `@testing/utils/createOverrideableMock`:

```typescript
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { createMockFooList } from '@testing/factories/fooFactories';

// 1. Define the default "happy path" implementation
const defaultMockImplementation: UseExampleResult = {
  items: createMockFooList(3),
  loading: false,
  error: null,
  doSomething: () => Promise.resolve(),
};

// 2. Create the overrideable mock
export const {
  defaultMockImplementation, // The default implementation
  overrideMock: overrideMockUseExample, // Override for specific tests
  resetMock: resetMockUseExample, // Reset to defaults
} = createOverrideableMock<() => UseExampleResult>(
  () => defaultMockImplementation,
);
```

### Using Mocks in Tests

**All mocks must be initialized using this pattern:**

```typescript
import {
  defaultMockImplementation,
  overrideMockUseExample,
  resetMockUseExample,
} from './useExample.mock';

// Initialize the mock with default implementation
vi.mock('@path/to/useExample', () => ({
  useExample: overrideMockUseExample(defaultMockImplementation),
}));

describe('Component using useExample', () => {
  // Clean up: Reset to defaults after all tests
  afterAll(() => {
    resetMockUseExample();
  });

  it('handles default data', () => {
    render(<MyComponent />);
    // Component uses default mock values
  });

  it('handles custom data', () => {
    // Override for this specific test
    overrideMockUseExample({
      items: createMockFooList(5, { name: 'custom' }),
      loading: true,
    });

    render(<MyComponent />);
    // Component uses overridden values
  });
});
```

**Note**: Mocks set with `vi.mock()` are automatically cleaned up by Vitest between test files.

---

## 🏭 Factory Functions

Factory functions create mock data with realistic defaults. Located in `testing/factories/`.

### Creating Factories

```typescript
import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';
import { VocabularySchema } from '@domain/schemas';

export const createMockVocabulary = createZodFactory(VocabularySchema);
export const createMockVocabularyList = createZodListFactory(VocabularySchema);
```

### Using Factories

```typescript
// Create single item with defaults
const vocab = createMockVocabulary();

// Create with overrides
const customVocab = createMockVocabulary({
  word: 'hola',
  descriptor: 'hello',
});

// Create a list
const vocabList = createMockVocabularyList(5);

// Create list with overrides applied to all items
const customList = createMockVocabularyList(3, { type: 'verb' });
```

---

## ✅ Testing Best Practices

1. **Import types, don't duplicate** - Use types from implementation files
2. **Use factory functions** - Create realistic test data consistently
3. **Default to happy path** - Provide realistic default implementations
4. **Override for edge cases** - Test loading, error, and edge cases with overrides
5. **Clean up after yourself** - Always reset mocks in `afterAll`
6. **Test at the right layer** - See `/documentation/TESTING_STANDARDS.md` for layer-specific guidance

---

## 📚 Additional Resources

- **Testing Standards**: `/documentation/TESTING_STANDARDS.md`
- **Hexagonal Architecture**: `/src/hexagon/ARCHITECTURE.md`
- **Factory Tools**: `/src/hexagon/testing/utils/factoryTools.ts`
- **createOverrideableMock**: `/src/hexagon/testing/utils/createOverrideableMock.ts`

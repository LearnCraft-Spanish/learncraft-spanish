# Hexagonal Architecture Testing

This directory contains utilities and patterns for testing the hexagonal architecture.

## ⚠️ IMPORTANT: Global Test Setup ⚠️

> **DO NOT MODIFY OR DUPLICATE `setupTests.ts`**
>
> Our test infrastructure relies on the global `setupTests.ts` file to properly isolate tests. This file handles adapter mocking and test cleanup. Modifying it or duplicating its functionality in your tests will break test isolation and lead to flaky tests.
>
> See below for details on how tests are configured.

### Multiple Configuration Files

> **IMPORTANT: Use the correct configuration file for hexagon tests**
>
> The project has two separate test configuration files:
>
> - `vitest.config.ts` - Used for general application tests (uses `./tests/setupTests.ts`)
> - `vitest.config-hexagon.ts` - Used specifically for hexagon architecture tests (uses `./src/hexagon/testing/setupTests.ts`)
>
> When running hexagon tests, always specify the hexagon configuration:
>
> ```bash
> npm test -- src/hexagon/some-test.ts --config vitest.config-hexagon.ts
> ```
>
> Failing to use the correct configuration file may cause test failures if adapter mocks are not properly initialized.

## Test Setup Infrastructure

Our testing infrastructure follows best practices for isolation and clean state management. The core setup is managed by the `setupTests.ts` file.

### setupTests.ts Explained

The `setupTests.ts` file handles global test configurations:

```typescript
// Replace real adapter implementations with mocks for all tests
const setupAdapterMocks = () => {
  vi.mock('@application/adapters/vocabularyAdapter', () => ({
    useVocabularyAdapter: callMockVocabularyAdapter,
  }));

  vi.mock('@application/adapters/subcategoryAdapter', () => ({
    useSubcategoryAdapter: callMockSubcategoryAdapter,
  }));
};

// Setup adapter mocks for each test
beforeEach(() => {
  setupAdapterMocks();
});

// Reset all mocks after each test
afterEach(() => {
  // Clear mock call history
  vi.clearAllMocks();

  // Reset React Query client
  resetTestQueryClient();
});
```

#### Key Features:

1. **Clean test isolation**:

   - `beforeEach`: Sets up adapter mocks fresh before each test
   - `afterEach`: Clears mock call history after each test
   - Tests run with isolated mocks, preventing cross-test contamination

2. **Hexagonal architecture support**:

   - Adapters are mocked centrally following hexagonal architecture patterns
   - Real implementations are replaced with test mocks

3. **React Query integration**:
   - The QueryClient is reset between tests with `resetTestQueryClient()`
   - Prevents cache leakage between tests

### Testing with Manual Mock Setup

If you encounter issues with mocks not working properly, you can explicitly set up the mock implementation in your test:

```typescript
import { mockGetVocabulary } from '@application/adapters/vocabularyAdapter.mock';
import { createMockVocabulary } from '@testing/factories/vocabularyFactories';

// In your test's beforeEach:
beforeEach(() => {
  // Ensure the mock implementation returns a proper result
  mockGetVocabulary.mockImplementation(() => {
    return Promise.resolve([
      createMockVocabulary({ id: 1, word: 'test1' }),
      createMockVocabulary({ id: 2, word: 'test2' }),
      createMockVocabulary({ id: 3, word: 'test3' }),
    ]);
  });
});
```

This approach provides a safety net if the global setup doesn't work, but using the correct config file is preferred.

### Mock Management Flow

1. **Before each test**:

   - `setupAdapterMocks()` replaces real adapter implementations with mocks
   - Each test starts with the default mock implementation

2. **During a test**:

   - Tests can use `overrideMockAdapter({...})` functions to customize mocks for that specific test
   - Tests run with isolated mock configurations

3. **After each test**:
   - `vi.clearAllMocks()` clears the mock call history but preserves implementations
   - `resetTestQueryClient()` clears the React Query cache
   - Prepares for the next test with clean state

### Testing Providers

React components are provided for testing with React Query:

```typescript
// In your tests:
import { TestQueryClientProvider } from '@testing';

render(
  <TestQueryClientProvider>
    <YourComponent />
  </TestQueryClientProvider>
);

// With renderHook:
import { createQueryClientWrapper } from '@testing';

const { result } = renderHook(() => useYourHook(), {
  wrapper: createQueryClientWrapper(),
});
```

#### Implementation Details:

- `TestQueryClientProvider`: React component provider that uses a test-specific QueryClient
- `createQueryClientWrapper`: Function to create a wrapper for renderHook
- Both use a shared `testQueryClient` that's reset between tests

## Mock Patterns

We follow a consistent pattern for mocking hooks in the hexagonal architecture:

### 1. Units and UseCases

Each hook should have a corresponding mock file with the following structure:

```
useExample.ts → useExample.mock.ts
```

### 2. Mock File Structure

Each mock file should follow this pattern:

```typescript
// 1. Import types from the actual implementation
import type { UseExampleResult } from './useExample';

// 2. Import testing utilities
import { createTypedMock } from '@testing/utils/typedMock';
import { createMockFooList } from '@testing/factories/fooFactories';

// 3. Create default mock implementation
const defaultMockResult: UseExampleResult = {
  // Populate with realistic data using factories
  items: createMockFooList(),
  loading: false,
  error: null,
  // Mock functions with createTypedMock
  doSomething: createTypedMock<
    (id: string) => Promise<void>
  >().mockImplementation(() => Promise.resolve()),
};

// 4. Create the main mock function
export const mockUseExample =
  createTypedMock<() => UseExampleResult>().mockReturnValue(defaultMockResult);

// 5. Create an override function
export const overrideMockUseExample = (
  config: Partial<UseExampleResult> = {},
) => {
  const mockResult = {
    ...defaultMockResult,
    ...config,
  };

  mockUseExample.mockReturnValue(mockResult);
  return mockResult;
};

// 6. Create a helper function for tests
export const callMockUseExample = () => mockUseExample();

// 7. Export default for global mocking
export default mockUseExample;
```

### 3. Using Mocks in Tests

There are three ways to use mocks in tests:

#### Direct Import and Mock

```typescript
import { vi } from 'vitest';
import { callMockUseExample, overrideMockUseExample } from './useExample.mock';

// Mock the hook module
vi.mock('@application/units/useExample', () => ({
  useExample: callMockUseExample,
}));

// Test with default values
test('component works with default values', () => {
  // ...test code
});

// Test with custom values
test('component shows loading state', () => {
  overrideMockUseExample({ loading: true });
  // ...test code
});
```

#### Using Helper Utilities

```typescript
import { setupHookMock, setupHookMocks } from '@testing/utils/mockHelpers';
import { callMockUseExample, overrideMockUseExample } from './useExample.mock';

test('component works with default values', () => {
  const cleanup = setupHookMock(
    '@application/units/useExample',
    'useExample',
    callMockUseExample,
  );

  // ...test code

  cleanup();
});

// Testing with multiple hooks
test('component uses multiple hooks', () => {
  const cleanup = setupHookMocks([
    {
      module: '@application/units/useExample',
      exportName: 'useExample',
      implementation: callMockUseExample,
    },
    {
      module: '@application/units/useOther',
      exportName: 'useOther',
      implementation: callMockUseOther,
    },
  ]);

  // ...test code

  cleanup();
});
```

#### Using Builder Pattern

```typescript
import { createMockTestBuilder } from '@testing/utils/mockHelpers';
import { callMockUseExample, overrideMockUseExample } from './useExample.mock';

const { withMock, withError, withLoading, run } = createMockTestBuilder();

// Test with loading state
test('component shows loading state', () => {
  run(
    withMock('useExample', callMockUseExample, overrideMockUseExample)
      .withLoading()
      .build(),
    () => {
      // ...test with loading state
    },
  );
});

// Test with error state
test('component shows error state', () => {
  run(
    withMock('useExample', callMockUseExample, overrideMockUseExample)
      .withError(new Error('Test error'))
      .build(),
    () => {
      // ...test with error state
    },
  );
});
```

## Factory Utilities

We use factory functions to create test data. These are located in `testing/factories/`.

Example:

```typescript
import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';
import { FooSchema } from '@shared/schemas';

export const createMockFoo = createZodFactory(FooSchema);
export const createMockFooList = createZodListFactory(FooSchema);

// Usage:
const singleFoo = createMockFoo({ name: 'Custom Name' });
const fooList = createMockFooList(5, { type: 'example' });
```

## Mock for Complex Nested Objects

When creating mocks with complex nested objects, use the deep merge pattern:

```typescript
export const overrideMockUseExample = (
  config: Partial<UseExampleResult> = {},
) => {
  const defaultResult = createDefaultMockResult();

  const mockResult = {
    ...defaultResult,
    ...config,

    // Deep merge complex nested objects
    ...(config.nestedObject && {
      nestedObject: {
        ...defaultResult.nestedObject,
        ...config.nestedObject,
      },
    }),
  };

  mockUseExample.mockReturnValue(mockResult);
  return mockResult;
};
```

## Testing Best Practices

1. **Avoid duplicating types**: Import types from implementation files rather than redefining them
2. **Use factory functions**: Create test data using factory functions for consistency
3. **Provide default implementations**: Always provide realistic default implementations for happy path testing
4. **Use typed mocks**: Always use `createTypedMock<T>()` instead of `vi.fn()`
5. **Create granular mocks**: Keep mocks at the same level of granularity as implementations (one mock per hook)
6. **Test error states**: Use override functions to test loading, error, and edge case states

## Key Features

- Schema-based mock data generation
- Happy-path defaults for all mocks
- Isolated from global test setup
- Explicit setup function to avoid conflicts

## Usage

### Basic Usage

Import the setup function and call it at the beginning of your test file:

```typescript
import { setupHexagonalMocks } from '@testing';

describe('MyComponent', () => {
  beforeEach(() => {
    // Initialize all hexagonal mocks with happy-path defaults
    setupHexagonalMocks();
  });

  it('should render correctly', () => {
    render(<MyComponent />);
    // Test with default data
  });
});
```

### Customizing Mocks

You can override specific mock behavior:

```typescript
import {
  setupHexagonalMocks,
  setupMockVocabularyAdapter,
  createMockVocabulary
} from '@testing';

describe('MyComponent', () => {
  beforeEach(() => {
    // Initialize all mocks first
    setupHexagonalMocks();

    // Then override specific behavior
    setupMockVocabularyAdapter({
      getVocabulary: [
        createMockVocabulary({ word: 'hola', descriptor: 'hello' })
      ]
    });
  });

  it('should render correctly', () => {
    render(<MyComponent />);
    // Test with custom data
  });
});
```

### Available Mock Factories

- `createMockVocabulary(overrides)` - Create vocabulary items
- `createMockVocabularyList(count, overrides)` - Create vocabulary lists
- `createMockSubcategory(overrides)` - Create subcategories
- `createMockSubcategories(count, overrides)` - Create subcategory lists

### Setup Functions

- `setupHexagonalMocks()` - Initialize all mocks with defaults
- `setupMockVocabularyAdapter(config)` - Configure vocabulary adapter
- `setupMockSubcategoryAdapter(config)` - Configure subcategory adapter
- `setupMockUseSubcategories(config)` - Configure useSubcategories hook

## Important Notes

1. These mocks are **not** included in the global test setup to avoid conflicts
2. Call `setupHexagonalMocks()` explicitly in each test file that needs them
3. You can customize mocks after initialization for specific test scenarios
4. All mocks automatically reset between tests when using `setupHexagonalMocks()`

## Path Aliases

The project uses the following path aliases for cleaner imports:

- `@domain` - Domain models and business logic
- `@application` - Application use cases, units, and ports
- `@infrastructure` - Infrastructure implementations
- `@interface` - UI components
- `@testing` - Test utilities (this module)

This makes imports cleaner and decouples the code from specific directory structures.

## Examples

### Testing Loading States

```typescript
import { setupHexagonalMocks, setupMockVocabularyAdapter } from '@testing';

it('should show loading state', () => {
  setupHexagonalMocks();
  setupMockVocabularyAdapter({
    getVocabulary: new Promise(() => {}) // Never resolves = loading
  });

  render(<VocabularyList />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
```

### Testing Error States

```typescript
import { setupHexagonalMocks, setupMockVocabularyAdapter } from '@testing';

it('should handle errors', () => {
  setupHexagonalMocks();
  setupMockVocabularyAdapter({
    getVocabulary: new Error('Failed to load vocabulary')
  });

  render(<VocabularyList />);
  expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
});
```

## Typed Mocks

In our hexagonal architecture, we enforce strict typing for all mocks to ensure type safety and maintainability.

### Rules for Typed Mocks

1. **Always use typed mocks**: Instead of using `vi.fn()` directly, use our `createTypedMock<T>()` utility:

```typescript
// ❌ AVOID: Untyped mocks
const untyped = vi.fn(); // No type information!

// ✅ CORRECT: Typed mocks
import { createTypedMock } from '@testing/utils/typedMock';
const typed = createTypedMock<() => Promise<void>>();
```

2. **Mock functions should only specify their type, not implementation**:

```typescript
// ❌ AVOID: Unnecessary implementation
const badMock = vi.fn().mockImplementation(() => Promise.resolve());

// ✅ CORRECT: Type-only mocks
const goodMock = createTypedMock<() => Promise<void>>();
```

3. **Use the override pattern for hook mocks**:

```typescript
// Test-specific overrides
const mocks = overrideMockUseVocabulary({
  createNonVerb:
    createTypedMock<
      (data: FormData) => Promise<Vocabulary>
    >().mockResolvedValue(mockResult),
});

// Verify the correct function was called
expect(mocks.createNonVerb).toHaveBeenCalledWith(formData);
```

### ESLint Rule

We've added an ESLint rule (`no-untyped-mocks`) that enforces the use of typed mocks in hexagonal architecture tests. This rule will:

1. Detect untyped `vi.fn()` calls in test files
2. Suggest using `createTypedMock<T>()` instead
3. Auto-fix the issue when possible

This helps maintain consistency and type safety across our testing code.

## Hierarchical Mocking for useCases

Our useCases depend on various units (hooks), which creates a dependency hierarchy. To simplify testing, we've implemented a hierarchical mocking pattern where useCase mocks can automatically set up their dependencies.

### The Pattern

Each useCase mock now provides a `setupXXXMocks` function that:

1. Sets up all the unit dependencies the useCase relies on
2. Sets up the useCase itself
3. Returns the mock result for assertions

### Example Usage

```typescript
import { setupNonVerbCreationMocks } from '@application/useCases/useNonVerbCreation.mock';
import { render } from '@testing-library/react';

describe('NonVerbCreationPage', () => {
  it('renders correctly', () => {
    // Setup all mocks with a single function call
    const mockResult = setupNonVerbCreationMocks();

    render(<NonVerbCreationPage />);

    // mockResult contains the mocked useCase return value
    // for assertions
    expect(mockResult.nonVerbSubcategories.length).toBe(3);
  });

  it('shows loading state', () => {
    // Override just what you need
    setupNonVerbCreationMocks({
      useCase: {
        loadingSubcategories: true
      }
    });

    render(<NonVerbCreationPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles errors from dependencies', () => {
    // You can mock both the useCase and its dependencies
    setupNonVerbCreationMocks({
      // Mock the useCase itself
      useCase: {
        creating: true
      },

      // Mock the dependencies it uses
      vocabulary: {
        error: new Error('Failed to load vocabulary')
      },
      subcategories: {
        loading: true
      }
    });

    render(<NonVerbCreationPage />);

    // Test appropriate error handling
  });
});
```

### Available Setup Functions

For useCases:

- `setupNonVerbCreationMocks()` - Sets up useNonVerbCreation and its dependencies
- `setupVerbCreationMocks()` - Sets up useVerbCreation and its dependencies

### Benefits

1. **Simplified Testing** - One function call sets up everything
2. **Proper Dependency Order** - Dependencies are set up in the correct order
3. **Type Safety** - Full TypeScript support for all configuration
4. **Reduced Boilerplate** - No need to manually configure each mock
5. **Flexible Configuration** - Can override any part of the useCase or its dependencies
6. **Matches Architecture** - Mocking pattern mirrors the actual dependencies in the code

### Implementation Details

The setup functions handle vi.mock calls internally and return the useCase mock result for assertions in your tests. This means you no longer need to manually set up each hook's mock in your tests.

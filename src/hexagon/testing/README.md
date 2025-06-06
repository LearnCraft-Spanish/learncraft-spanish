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
    useVocabularyAdapter: () => mockVocabularyAdapter,
  }));

  vi.mock('@application/adapters/subcategoryAdapter', () => ({
    useSubcategoryAdapter: () => mockSubcategoryAdapter,
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
   - Mock call history is cleared
   - React Query client is reset
   - Each test starts fresh with default mock behavior

### Mock Structure

Each adapter mock follows this pattern:

```typescript
// Individual method mocks with typed implementations
export const mockGetVocabulary = createTypedMock<
  () => Promise<Vocabulary[]>
>().mockResolvedValue(createMockVocabularyList(3));

// The complete adapter mock object
export const mockVocabularyAdapter: VocabularyPort = {
  getVocabulary: mockGetVocabulary,
  // ... other methods
};

// Override function for test-specific behavior
export const overrideMockVocabularyAdapter = (
  config: Partial<{
    getVocabulary: Awaited<ReturnType<typeof mockGetVocabulary>> | Error;
    // ... other methods
  }>,
) => {
  setMockResult(mockGetVocabulary, config.getVocabulary);
  // ... other overrides
};

// Default export for global mocking
export default mockVocabularyAdapter;
```

## Factory Functions

The `factories` directory contains functions to create mock data:

- `createMockVocabulary(overrides)` - Create vocabulary items
- `createMockVocabularyList(count, overrides)` - Create vocabulary lists
- `createMockSubcategory(overrides)` - Create subcategories
- `createMockSubcategories(count, overrides)` - Create subcategory lists

## Mock Patterns

We follow a consistent pattern for mocking hooks in the hexagonal architecture:

### 1. Units and UseCases

Each hook should have a corresponding mock file with the following structure:

```
useExample.ts → useExample.mock.ts
```

### 2. Modern Mock Pattern with createOverrideableMock

For improved consistency and type safety, we now use `createOverrideableMock` for most mocks. This pattern provides a clean interface for creating, overriding, and resetting mocks:

```typescript
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { createMockFooList } from '@testing/factories/fooFactories';

// Define the default mock implementation
const defaultMockResult: UseExampleResult = {
  items: createMockFooList(),
  loading: false,
  error: null,
  doSomething: () => Promise.resolve(),
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseExample, // The mock object/function to use in vi.mock()
  override: overrideMockUseExample, // Function to override mock properties
  reset: resetMockUseExample, // Function to reset to defaults
} = createOverrideableMock<() => UseExampleResult>(() => defaultMockResult);

// Export default for global mocking
export default mockUseExample;

// Export the default result for component testing
export { defaultMockResult as defaultResult };
```

#### Using in Tests

```typescript
import { mockUseExample, overrideMockUseExample } from './useExample.mock';

// Mock the module
vi.mock('./useExample', () => ({
  useExample: () => mockUseExample,
}));

describe('Component using useExample', () => {
  beforeEach(() => {
    // Reset or provide custom overrides for each test
    overrideMockUseExample({}); // Must pass an object, even if empty
  });

  it('handles data correctly', () => {
    overrideMockUseExample({
      items: createMockFooList(3, { name: 'test' }),
    });

    // Test with custom data
  });
});
```

#### Testing Components with Default Mock Data

When testing components that use these hooks, you can also import and use the default mock results directly:

```typescript
import { defaultResult as exampleDefault } from './useExample.mock';

// Mock the module to return the default result
vi.mock('./useExample', () => ({
  useExample: () => exampleDefault,
}));

describe('Component', () => {
  it('renders correctly with default data', () => {
    render(<MyComponent />);
    // Test with the default mock data
  });
});
```

### 3. Legacy Mock File Structure

The older pattern that you may still see in some files uses `createTypedMock` directly:

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

// 6. Export default for global mocking
export default mockUseExample;
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

## The createOverrideableMock Utility

This is our core utility for creating mocks that follow best practices. It provides a consistent pattern for creating, overriding, and resetting mocks:

```typescript
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Create a mock function with typesafe overrides
const {
  mock, // The mock function/object
  override, // Function to override properties
  reset, // Function to reset to defaults
} = createOverrideableMock<() => ReturnType>(
  () => defaultImplementation, // Default behavior
);
```

### Benefits

- **Type Safety**: Leverages TypeScript for full type checking of mock properties
- **Consistent Pattern**: Provides a uniform approach across the codebase
- **Simple API**: Just three functions to remember: mock, override, and reset
- **Atomic Updates**: Override only the properties you need, keeping defaults for the rest
- **Immutable**: Doesn't mutate the original default implementation
- **Deep Mocking**: Automatically makes nested functions into mocks

### Example Implementation

The utility handles all the complexity of mocking and provides a clean interface:

```typescript
// For a function that returns an object with methods
const defaultResult = {
  count: 42,
  increment: () => 43,
  data: [1, 2, 3],
};

const { mock, override, reset } = createOverrideableMock(() => defaultResult);

// Use in tests
override({
  count: 100, // Override just what you need
  increment: vi.fn().mockReturnValue(101), // Can use vi.fn for specific needs
});

// Reset when needed
reset();
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

## Testing Components that Use Hooks

When testing components that use hooks, we have two main approaches:

### 1. Using defaultResult for Component Tests

For components that only need the default mock data and don't need to change behavior between tests:

```typescript
import { defaultResult as verbCreationDefault } from '@application/useCases/useVerbCreation.mock';
import { defaultResult as nonVerbCreationDefault } from '@application/useCases/useNonVerbCreation.mock';

// Mock the hooks to return the default results
vi.mock('@application/useCases/useVerbCreation', () => ({
  useVerbCreation: () => verbCreationDefault,
}));

vi.mock('@application/useCases/useNonVerbCreation', () => ({
  useNonVerbCreation: () => nonVerbCreationDefault,
}));

describe('VocabularyCreatorPage', () => {
  it('renders correctly', () => {
    render(<VocabularyCreatorPage />);
    // Test with default mock data
  });
});
```

This approach is simpler for component tests that don't need to test different hook behaviors.

### 2. Using mock and override for More Dynamic Tests

For components where you need to test different hook behaviors:

```typescript
import {
  mockUseVerbCreation,
  overrideMockUseVerbCreation
} from '@application/useCases/useVerbCreation.mock';

// Mock the hooks to return the mocks
vi.mock('@application/useCases/useVerbCreation', () => ({
  useVerbCreation: () => mockUseVerbCreation,
}));

describe('VerbCreator', () => {
  beforeEach(() => {
    // Reset to defaults or provide basic overrides for each test
    overrideMockUseVerbCreation({});  // Pass empty object to avoid errors
  });

  it('shows loading state', () => {
    // Override for this specific test
    overrideMockUseVerbCreation({
      loadingSubcategories: true,
    });

    render(<VerbCreator onBack={() => {}} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows error state', () => {
    overrideMockUseVerbCreation({
      creationError: new Error('Failed to create verb'),
    });

    render(<VerbCreator onBack={() => {}} />);
    expect(screen.getByText(/Failed to create verb/i)).toBeInTheDocument();
  });
});
```

### Key Rules

1. **Always pass an object to override functions**, even if empty: `overrideMockUseVerbCreation({})`
2. **Don't access mock methods directly** unless absolutely necessary
3. **Use `defaultResult` for simple component tests** rather than setting up dynamic mocks
4. **Reset mocks between tests** if using the second approach
5. **Keep mock initialization in the test file** rather than in global setup

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

# Testing Guidelines

## Mocking Hooks

When mocking hooks, follow these patterns:

```typescript
// 1. Create the mock function
export const mockUseExample =
  createTypedMock<() => UseExampleResult>().mockReturnValue(defaultResult);

// 2. Create an override function
export const overrideMockUseExample = (config = {}) => {
  const result = { ...defaultResult, ...config };
  mockUseExample.mockReturnValue(result);
  return result;
};

// 3. Create a setup function
export function mockExample(config = {}) {
  const mockResult = config.useCase
    ? overrideMockUseExample(config.useCase)
    : mockUseExample();

  vi.mock('./useExample', () => ({
    useExample: mockUseExample,
  }));

  return mockResult;
}
```

## Using Mocks in Tests

```typescript
describe('MyComponent', () => {
  it('renders correctly', () => {
    // Setup the mock
    mockExample();

    render(<MyComponent />);
    // Assertions...
  });

  it('handles loading state', () => {
    // Override the mock
    mockExample({
      useCase: {
        loading: true
      }
    });

    render(<MyComponent />);
    // Assertions...
  });
});
```

## Using Mock Helpers

The testing utilities provide helpers for common mocking patterns:

```typescript
import {
  setupHookMock,
  setupHookMocks,
  createMockTestBuilder,
} from '@testing/utils/mockHelpers';

// Single hook mock
const cleanup = setupHookMock(
  '@application/units/useExample',
  'useExample',
  mockUseExample,
);

// Multiple hook mocks
const cleanup = setupHookMocks([
  {
    module: '@application/units/useExample',
    exportName: 'useExample',
    implementation: mockUseExample,
  },
  {
    module: '@application/units/useOther',
    exportName: 'useOther',
    implementation: mockUseOther,
  },
]);

// Using the test builder
const { withMock, withError, withLoading, run } = createMockTestBuilder();

run(
  withMock('useExample', mockUseExample, overrideMockUseExample)
    .withLoading()
    .build(),
  () => {
    // Test with loading state
  },
);

run(
  withMock('useExample', mockUseExample, overrideMockUseExample)
    .withError(new Error('Test error'))
    .build(),
  () => {
    // Test with error state
  },
);
```

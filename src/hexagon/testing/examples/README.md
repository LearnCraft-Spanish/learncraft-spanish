# Hexagonal Architecture Testing Examples

This directory contains example test files that demonstrate how to effectively test code within the hexagonal architecture.

## Getting Started

1. To run the hexagon tests:

```bash
npm run test:hexagon
```

This will run only tests within the hexagonal architecture using the specific Vitest configuration.

## Test Examples

### 1. Adapter Tests

The `adapter-usage.test.ts` file demonstrates:

- How to use mock adapters in tests
- Overriding default mock behavior for specific test cases
- Working with error scenarios
- Resetting mock behavior between tests

### 2. Use Case Tests

The `usecase-usage.test.ts` file demonstrates:

- Testing use cases that depend on adapters
- Mocking use cases themselves for testing components that use them
- Handling error scenarios that might occur in the hexagonal architecture
- Working with multiple adapter dependencies

## Best Practices

When writing tests for the hexagonal architecture, follow these practices:

1. **Always use setupHexagonalMocks()** at the beginning of your test or in a beforeEach hook to ensure clean state
2. **Use strongly-typed mocks** with the `createTypedMock<T>()` utility
3. **Override mock behavior** using the `overrideMock*` functions for specific test cases
4. **Reset mocks between tests** to prevent test pollution
5. **Structure tests with Arrange-Act-Assert** pattern for clarity
6. **Test error scenarios** to ensure robust error handling
7. **Verify adapter calls** with the right parameters and call count when testing use cases

## Mock Structure

Each mock should have:

1. **mockX** - The main mock function
2. **overrideMockX** - Function to override the mock's behavior
3. **mockX** - Setup function for tests

## Example Implementation

```typescript
// Create the mock
export const mockUseExample =
  createTypedMock<() => UseExampleResult>().mockReturnValue(defaultResult);

// Create override function
export const overrideMockUseExample = (config = {}) => {
  const result = { ...defaultResult, ...config };
  mockUseExample.mockReturnValue(result);
  return result;
};

// Create setup function
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

For more detailed examples, see the main [Hexagonal Architecture Testing README](../README.md).

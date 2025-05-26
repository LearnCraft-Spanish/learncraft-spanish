# Use Cases in Hexagonal Architecture

Use cases in our hexagonal architecture coordinate between multiple units to accomplish specific user tasks. They represent specific application features that span multiple domain concepts.

## Core Principles

1. **Explicit Return Types**: Every use case MUST have an explicitly defined and exported return type. This ensures proper type safety and documentation.

   ```typescript
   // ✅ GOOD: Explicit exported interface
   export interface UseVerbCreationResult {
     verbSubcategories: Subcategory[];
     loadingSubcategories: boolean;
     // ... other properties
   }

   export function useVerbCreation(): UseVerbCreationResult {
     // implementation
   }

   // ❌ BAD: No explicit return type
   export function useVerbCreation() {
     // implementation returning an ad-hoc object
   }
   ```

2. **Interface Boundary**: Interface components (pages, UI components) may ONLY call use cases, never units or other application layers directly. This maintains the hexagonal architecture's boundaries.

   ```typescript
   // ✅ GOOD: Component only uses use cases
   function VocabularyPage() {
     const { items, loading } = useVocabularyPage();
     // render UI using the use case result
   }

   // ❌ BAD: Component reaches into units or other layers
   function VocabularyPage() {
     const { vocabulary } = useVocabulary(); // directly using a unit
     const { subcategories } = useSubcategories(); // directly using a unit
     // render UI using the unit results
   }
   ```

3. **Application Logic Exposure**: Application logic can ONLY be exposed to the interface through use cases. Units and other implementation details should never leak outside the application layer.

## Structure

Each use case follows a similar pattern:

```
useXxxCreation.ts             // Main implementation
useXxxCreation.mock.ts        // Mock for testing
```

## Implementation Guidelines

1. **Composition**: Use cases should compose multiple units to create a cohesive API for a specific feature.
2. **Single Responsibility**: Each use case should focus on one feature or user task.
3. **Complete API**: Provide all operations needed for the feature, including loading states, error handling, and CRUD operations.
4. **Stateful Logic**: Use cases can maintain state that spans multiple units.
5. **Reactivity**: Use cases should manage reactive state changes across units.

## Example Use Case

```typescript
export interface UseVocabularyPageResult {
  // Data
  items: Vocabulary[];

  // Loading and error states
  isLoading: boolean;
  error: Error | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;

  // Filtering
  filter: string;
  setFilter: (filter: string) => void;

  // Operations
  deleteItem: (id: string) => Promise<void>;
}

export function useVocabularyPage(): UseVocabularyPageResult {
  // Compose multiple units
  const { vocabulary, loading, error, deleteVocabulary } = useVocabulary();
  const { subcategories } = useSubcategories();

  // Add feature-specific logic here

  // Return a cohesive API for the feature
  return {
    // implementation
  };
}
```

## Mocking Pattern

One of the key challenges in testing use cases is that they depend on multiple unit hooks. We've established a consistent pattern for mocking these dependencies.

### Pattern Principles

1. **Hierarchical Mocking**: Use case mocks depend on unit mocks, mirroring the real implementation's dependencies
2. **Reuse Unit Mocks**: Rather than duplicating mock data, use case mocks should call the unit mocks they depend on
3. **Dynamic Defaults**: Default mock results should be generated from the current state of unit mocks
4. **Explicit Dependencies**: Tests should be able to override both the use case and its dependencies

### Implementation Pattern

Every use case mock should follow this structure:

```typescript
// 1. Import dependencies
import { mockUnitA, overrideMockUnitA } from '../units/unitA.mock';
import { mockUnitB, overrideMockUnitB } from '../units/unitB.mock';

// 2. Create default result that uses unit mocks
const createDefaultMockResult = (): UseXxxResult => {
  // Get results from dependent unit mocks
  const unitAResult = mockUnitA();
  const unitBResult = mockUnitB();

  // Return a result that uses these values
  return {
    someValue: unitAResult.value,
    anotherValue: unitBResult.value,
    // Add use case specific values
    isDoingSomething: false,
  };
};

// 3. Create main mock
export const mockUseXxx = createTypedMock<() => UseXxxResult>().mockReturnValue(
  createDefaultMockResult(),
);

// 4. Provide override function
export const overrideUseXxx = (config = {}) => {
  const result = {
    ...createDefaultMockResult(),
    ...config,
  };
  mockUseXxx.mockReturnValue(result);
  return result;
};

// 5. Helper to call mock
export const callMockUseXxx = () => mockUseXxx();

// 6. Setup function for tests
export function mockXxx(config = {}) {
  // Setup unit dependencies
  if (config.unitA) {
    vi.mock('../units/unitA', () => ({
      // eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
      useUnitA: () => overrideMockUnitA(config.unitA),
    }));
  } else {
    vi.mock('../units/unitA', () => ({
      // eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
      useUnitA: mockUnitA,
    }));
  }

  // Similarly for other dependencies...

  // Refresh default mock to use current dependencies
  if (!config.useCase) {
    mockUseXxx.mockReturnValue(createDefaultMockResult());
  }

  // Apply any useCase overrides
  const mockResult = config.useCase
    ? overrideUseXxx(config.useCase)
    : callMockUseXxx();

  // Setup the use case mock
  vi.mock('./useXxx', () => ({
    // eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
    useXxx: () => mockResult,
  }));

  return mockResult;
}
```

### Using in Tests

In tests, you can use this pattern like this:

```typescript
import { mockNonVerbCreation } from '@application/useCases/useNonVerbCreation.mock';

describe('NonVerbCreationPage', () => {
  it('shows data correctly', () => {
    // Setup everything with defaults
    mockNonVerbCreation();

    render(<NonVerbCreationPage />);
    // Assertions...
  });

  it('shows loading state', () => {
    // Override just the useCase
    mockNonVerbCreation({
      useCase: {
        creating: true
      }
    });

    render(<NonVerbCreationPage />);
    // Assertions...
  });

  it('handles errors from dependencies', () => {
    // Override dependencies
    mockNonVerbCreation({
      vocabulary: {
        error: new Error('Failed to load vocabulary')
      }
    });

    render(<NonVerbCreationPage />);
    // Assertions...
  });
});
```

### Benefits of This Pattern

1. **Accuracy**: Mock behavior mirrors real implementation by depending on the same units
2. **Maintainability**: Changes to unit mocks automatically propagate to useCase mocks
3. **Reduced Duplication**: No need to duplicate mock data between units and useCases
4. **Flexibility**: Tests can override both useCase behavior and its dependencies
5. **Realistic Testing**: Tests will better match real-world behavior by respecting the dependency chain

### Important Notes

1. Always provide `.mockImplementation()` for all typed mocks
2. Ensure dependent mocks are set up before the useCase mock
3. Refresh default results after setting up dependencies
4. Be careful with vi.mock() hoisting behavior in complex test cases

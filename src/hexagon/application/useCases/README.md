# Use Cases in Hexagonal Architecture

Use cases coordinate between multiple units to accomplish specific user tasks. They represent application features that span multiple domain concepts.

## Core Principles

1. **Explicit Return Types**: Every use case MUST have an explicitly defined and exported return type.

## Structure

Each use case follows a similar pattern:

```
useXxxCreation.ts             // Main implementation
useXxxCreation.mock.ts        // Mock for testing
```

## Implementation Guidelines

1. **Composition**: Compose multiple units to create a cohesive API for a specific feature
2. **Single Responsibility**: Focus on one feature or user task
3. **Complete API**: Provide all operations needed for the feature (loading states, error handling, CRUD)
4. **Stateful Logic**: Maintain state that spans multiple units
5. **Reactivity**: Manage reactive state changes across units

## Example Implementation

```typescript
// Define the return type
export interface UseVocabularyPageResult {
  items: Vocabulary[];
  isLoading: boolean;
  error: Error | null;
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  filter: string;
  setFilter: (filter: string) => void;
  deleteItem: (id: string) => Promise<void>;
}

// Implement the use case
export function useVocabularyPage(): UseVocabularyPageResult {
  const { vocabulary, loading, error, deleteVocabulary } = useVocabulary();
  const { subcategories } = useSubcategories();

  // Add feature-specific logic here
  return {
    // implementation
  };
}
```

## Mocking Pattern

Use cases depend on multiple unit hooks. We use a consistent pattern for mocking these dependencies:

```typescript
// 1. Import dependencies
import { mockUnitA, overrideMockUnitA } from '../units/unitA.mock';

// 2. Create default result using unit mocks
const createDefaultResult = () => {
  const unitAResult = mockUnitA();
  return {
    someValue: unitAResult.value,
    isDoingSomething: false,
  };
};

// 3. Create main mock
export const mockUseXxx = createTypedMock<() => UseXxxResult>().mockReturnValue(
  createDefaultResult(),
);

// 4. Provide override function
export const overrideMockUseXxx = (config = {}) => {
  const result = { ...createDefaultResult(), ...config };
  mockUseXxx.mockReturnValue(result);
  return result;
};

// 5. Setup function for tests
export function mockXxx(config = {}) {
  // Setup dependencies
  if (config.unitA) {
    vi.mock('../units/unitA', () => ({
      useUnitA: () => overrideMockUnitA(config.unitA),
    }));
  }

  // Apply overrides and setup mock
  const mockResult = config.useCase
    ? overrideMockUseXxx(config.useCase)
    : mockUseXxx();

  vi.mock('./useXxx', () => ({
    useXxx: mockUseXxx,
  }));

  return mockResult;
}
```

import type { UseSubcategoriesResult } from './useSubcategories';
import { createMockSubcategoryList } from '@testing/factories/subcategoryFactories';
import { createTypedMock } from '@testing/utils/typedMock';

// Default mock implementation that provides happy-path data
const defaultMockResult: UseSubcategoriesResult = {
  subcategories: createMockSubcategoryList(),
  loading: false,
  error: null,
  refetch: createTypedMock<() => Promise<void>>().mockResolvedValue(undefined),
};

// Create the mock hook with default implementation
export const mockUseSubcategories =
  createTypedMock<() => UseSubcategoriesResult>().mockReturnValue(
    defaultMockResult,
  );

// Setup function to configure the mock for tests
export const overrideMockUseSubcategories = (
  config: Partial<UseSubcategoriesResult> = {},
) => {
  // Create a new result with defaults and overrides
  const mockResult = {
    ...defaultMockResult,
    ...config,
  };

  // Reset and configure the mock
  mockUseSubcategories.mockReturnValue(mockResult);
  return mockResult;
};

// Helper to call the mock during tests
export const callMockUseSubcategories = () => mockUseSubcategories();

// Export default for global mocking
export default mockUseSubcategories;

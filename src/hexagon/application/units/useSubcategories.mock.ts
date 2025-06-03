import type { UseSubcategoriesResult } from './useSubcategories';
import { createMockSubcategoryList } from '@testing/factories/subcategoryFactories';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Default mock implementation with sensible defaults
const defaultMockResult: UseSubcategoriesResult = {
  subcategories: createMockSubcategoryList(),
  loading: false,
  error: null,
  refetch: () => Promise.resolve(),
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseSubcategories,
  override: overrideMockUseSubcategories,
  reset: resetMockUseSubcategories,
} = createOverrideableMock<UseSubcategoriesResult>(defaultMockResult);

// Export default for global mocking
export default mockUseSubcategories;

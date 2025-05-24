import type { SubcategoryPort } from '@application/ports/subcategoryPort';
import {
  createMockSubcategory,
  createMockSubcategoryList,
} from '@testing/factories/subcategoryFactories';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Create a default mock implementation
const defaultMockAdapter: SubcategoryPort = {
  getSubcategories: () => Promise.resolve(createMockSubcategoryList(3)),
  getSubcategoryById: (id: string) =>
    Promise.resolve(createMockSubcategory({ id: Number.parseInt(id) })),
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockSubcategoryAdapter,
  override: overrideMockSubcategoryAdapter,
  reset: resetMockSubcategoryAdapter,
} = createOverrideableMock<SubcategoryPort>(defaultMockAdapter);

// Export the default mock for global mocking
export default mockSubcategoryAdapter;

import type { SubcategoryPort } from '@application/ports/subcategoryPort';

import {
  createMockSubcategory,
  createMockSubcategoryList,
} from '@testing/factories/subcategoryFactories';
import { createTypedMock } from '@testing/utils/typedMock';

// Create a default mock implementation
const defaultMockAdapter: SubcategoryPort = {
  getSubcategories: () => Promise.resolve(createMockSubcategoryList(3)),
  getSubcategoryById: (id: string) =>
    Promise.resolve(createMockSubcategory({ id: Number.parseInt(id) })),
};

// Create a single typed mock for the entire adapter hook
export const mockSubcategoryAdapter =
  createTypedMock<() => SubcategoryPort>().mockReturnValue(defaultMockAdapter);

// Override function with simpler type definition
export const overrideMockSubcategoryAdapter = (
  config: Partial<SubcategoryPort> = {},
) => {
  const mockResult = {
    ...defaultMockAdapter,
    ...config,
  };
  mockSubcategoryAdapter.mockReturnValue(mockResult);
  return mockResult;
};

// Export the default mock for global mocking
export default mockSubcategoryAdapter;

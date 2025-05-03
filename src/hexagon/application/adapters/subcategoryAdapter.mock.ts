import type { Subcategory } from '@LearnCraft-Spanish/shared';
import type { SubcategoryPort } from '../ports/subcategoryPort';
import {
  createMockSubcategory,
  createMockSubcategoryList,
} from 'src/hexagon/testing/factories/subcategoryFactories';
import { setMockResult } from 'src/hexagon/testing/utils/setMockResult';
import { createTypedMock } from 'src/hexagon/testing/utils/typedMock';

// Create strongly-typed spies for each SubcategoryPort method
export const mockGetSubcategories = createTypedMock<
  () => Promise<Subcategory[]>
>().mockResolvedValue(createMockSubcategoryList());
export const mockGetSubcategoryById = createTypedMock<
  (id: string) => Promise<Subcategory | null>
>().mockImplementation((id) =>
  Promise.resolve(createMockSubcategory({ id: Number.parseInt(id) })),
);

// Global mock for the adapter
export const mockSubcategoryAdapter: SubcategoryPort = {
  getSubcategories: mockGetSubcategories,
  getSubcategoryById: mockGetSubcategoryById,
};

// Setup function for tests to override mock behavior
export const overrideMockSubcategoryAdapter = (
  config: Partial<{
    getSubcategories: Awaited<ReturnType<typeof mockGetSubcategories>> | Error;
    getSubcategoryById:
      | Awaited<ReturnType<typeof mockGetSubcategoryById>>
      | Error;
  }> = {},
) => {
  setMockResult(mockGetSubcategories, config.getSubcategories);
  setMockResult(mockGetSubcategoryById, config.getSubcategoryById);
};

export const callMockSubcategoryAdapter = () => mockSubcategoryAdapter;

// Export the default mock for global mocking
export default mockSubcategoryAdapter;

import type { SubcategoryPort } from '@application/ports/subcategoryPort';
import { SubcategorySchema } from '@LearnCraft-Spanish/shared';
import { createMockSubcategoryList } from '@testing/factories/subcategoryFactories';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { zocker } from 'zocker';
// Create a default mock implementation
const defaultMockAdapter: SubcategoryPort = {
  getSubcategories: () => Promise.resolve(createMockSubcategoryList(3)),
  getSubcategoryById: (id: string) =>
    Promise.resolve(
      zocker(SubcategorySchema)
        .supply(SubcategorySchema.shape.id, Number.parseInt(id))
        .generate(),
    ),
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockSubcategoryAdapter,
  override: overrideMockSubcategoryAdapter,
  reset: resetMockSubcategoryAdapter,
} = createOverrideableMock<SubcategoryPort>(defaultMockAdapter);

// Export the default mock for global mocking
export default mockSubcategoryAdapter;

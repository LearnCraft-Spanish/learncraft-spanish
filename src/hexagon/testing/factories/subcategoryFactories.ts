import type { Subcategory } from '@LearnCraft-Spanish/shared';
import { SubcategorySchema } from '@LearnCraft-Spanish/shared';
import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';

export const createMockSubcategory =
  createZodFactory<Subcategory>(SubcategorySchema);
export const createMockSubcategoryList =
  createZodListFactory<Subcategory>(SubcategorySchema);

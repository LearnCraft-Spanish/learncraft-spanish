import { SubcategorySchema } from '@LearnCraft-Spanish/shared';
import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';

export const createMockSubcategory = createZodFactory(SubcategorySchema);
export const createMockSubcategoryList =
  createZodListFactory(SubcategorySchema);

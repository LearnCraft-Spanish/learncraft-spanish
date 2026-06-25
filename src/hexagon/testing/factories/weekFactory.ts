import { FurnishedWeekSchema } from '@learncraft-spanish/shared';
import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';

export const createMockFurnishedWeek = createZodFactory(FurnishedWeekSchema);
export const createMockFurnishedWeekList =
  createZodListFactory(FurnishedWeekSchema);

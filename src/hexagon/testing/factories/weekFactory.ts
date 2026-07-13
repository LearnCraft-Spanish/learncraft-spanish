import {
  BaseWeekSchema,
  FurnishedWeekSchema,
  FurnishedWeekWithCoachSchema,
  UpdateWeekCommandSchema,
} from '@learncraft-spanish/shared';
import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';

export const createMockFurnishedWeek = createZodFactory(FurnishedWeekSchema);
export const createMockFurnishedWeekList =
  createZodListFactory(FurnishedWeekSchema);

export const createMockFurnishedWeekWithCoach = createZodFactory(
  FurnishedWeekWithCoachSchema,
);
export const createMockFurnishedWeekWithCoachList = createZodListFactory(
  FurnishedWeekWithCoachSchema,
);

export const createMockBaseWeek = createZodFactory(BaseWeekSchema);
export const createMockBaseWeekList = createZodListFactory(BaseWeekSchema);

export const createMockUpdateWeekCommand = createZodFactory(
  UpdateWeekCommandSchema,
);
export const createMockUpdateWeekCommandList = createZodListFactory(
  UpdateWeekCommandSchema,
);

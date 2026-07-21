import {
  callCountSchema,
  CoachSchema,
  recentRecordsSchema,
} from '@learncraft-spanish/shared';
import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';

export const createMockCoachCallCount = createZodFactory(callCountSchema);
export const createMockCoachCallCountList =
  createZodListFactory(callCountSchema);

export const createMockCoach = createZodFactory(CoachSchema);
export const createMockCoachList = createZodListFactory(CoachSchema);

export const createMockRecentRecords = createZodFactory(recentRecordsSchema);

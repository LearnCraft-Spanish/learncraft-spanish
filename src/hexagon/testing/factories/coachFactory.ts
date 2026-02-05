import { callCountSchema } from '@learncraft-spanish/shared';
import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';

export const createMockCoachCallCount = createZodFactory(callCountSchema);
export const createMockCoachCallCountList =
  createZodListFactory(callCountSchema);

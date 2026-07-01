import {
  activeMembershipSummarySchema,
  membershipsByCoachSchema,
} from '@learncraft-spanish/shared';
import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';

export const createMockActiveMembershipSummary = createZodFactory(
  activeMembershipSummarySchema,
);
export const createMockActiveMembershipSummaryList = createZodListFactory(
  activeMembershipSummarySchema,
);

export const createMockMembershipsByCoach = createZodFactory(
  membershipsByCoachSchema,
);
export const createMockMembershipsByCoachList = createZodListFactory(
  membershipsByCoachSchema,
);

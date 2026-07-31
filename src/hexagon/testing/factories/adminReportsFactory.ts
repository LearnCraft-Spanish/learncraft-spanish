import {
  activeMembershipSummarySchema,
  assignmentsCompletedByWeekSchema,
  coachSummaryDrilldownSchema,
  coachSummarySchema,
  groupCallsByCoachSchema,
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

export const createMockAssignmentsCompletedByWeek = createZodFactory(
  assignmentsCompletedByWeekSchema,
);
export const createMockAssignmentsCompletedByWeekList = createZodListFactory(
  assignmentsCompletedByWeekSchema,
);

export const createMockCoachSummary = createZodFactory(coachSummarySchema);
export const createMockCoachSummaryList =
  createZodListFactory(coachSummarySchema);

export const createMockCoachSummaryDrilldown = createZodFactory(
  coachSummaryDrilldownSchema,
);
export const createMockCoachSummaryDrilldownList = createZodListFactory(
  coachSummaryDrilldownSchema,
);

export const createMockGroupCallsByCoach = createZodFactory(
  groupCallsByCoachSchema,
);
export const createMockGroupCallsByCoachList = createZodListFactory(
  groupCallsByCoachSchema,
);

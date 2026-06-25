import {
  bundleCreditSchema,
  coachingStudentSchema,
  srCourseSchema,
  studentMembershipSchema,
  timeZoneSchema,
} from '@learncraft-spanish/shared';
import {
  createZodFactory,
  createZodListFactory,
} from '@testing/utils/factoryTools';

export const createMockCoachingStudent = createZodFactory(
  coachingStudentSchema,
);
export const createMockCoachingStudentList = createZodListFactory(
  coachingStudentSchema,
);

export const createMockSrCourse = createZodFactory(srCourseSchema);
export const createMockSrCourseList = createZodListFactory(srCourseSchema);

export const createMockTimeZone = createZodFactory(timeZoneSchema);
export const createMockTimeZoneList = createZodListFactory(timeZoneSchema);

export const createMockBundleCredit = createZodFactory(bundleCreditSchema);
export const createMockBundleCreditList =
  createZodListFactory(bundleCreditSchema);

export const createMockStudentMembership = createZodFactory(
  studentMembershipSchema,
);
export const createMockStudentMembershipList = createZodListFactory(
  studentMembershipSchema,
);

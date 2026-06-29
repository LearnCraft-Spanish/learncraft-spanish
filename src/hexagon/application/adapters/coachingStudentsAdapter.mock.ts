import type { CoachingStudentsPort } from '@application/ports/coachingStudentsPort';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockCoachingStudentsAdapter: CoachingStudentsPort = {
  getAllCoachingStudents: async () => [],
  getAllSrCourses: async () => [],
  getStudentBundleCredits: async () => [],
  getStudentMemberships: async () => [],
  getAllTimeZones: async () => [],
  updateCoachingStudent: async () => ({
    student_id: 1,
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    billingEmail: 'john.doe@example.com',
    billingNotes: 'Lorem ipsum dolor sit amet',
    learningDisabilities: 'Lorem ipsum dolor sit amet',
    primaryCoach: {
      coach_id: 1,
      fullName: 'John Doe',
      email: 'john.doe@example.com',
    },
    usPhone: '1234567890',
    active: true,
    firstSubscribed: new Date(),
    advancedStudent: false,
    fluencyGoal: 'Lorem ipsum dolor sit amet',
    startingLevel: 'Lorem ipsum dolor sit amet',
  }),
  createBundleCredit: async () => ({
    bundle_credit_id: 1,
    student_id: 1,
    expiration: Date.now(),
    totalCredits: 0,
    usedCredits: 0,
    creditsRemaining: 0,
    expired: false,
  }),
  updateBundleCredit: async () => ({
    bundle_credit_id: 1,
    student_id: 1,
    expiration: Date.now(),
    totalCredits: 0,
    usedCredits: 0,
    creditsRemaining: 0,
    expired: false,
  }),
  deleteBundleCredit: async () => 1,
};

export const {
  mock: mockCoachingStudentsAdapter,
  override: overrideMockCoachingStudentsAdapter,
  reset: resetMockCoachingStudentsAdapter,
} = createOverrideableMock<CoachingStudentsPort>(
  defaultMockCoachingStudentsAdapter,
);

export default mockCoachingStudentsAdapter;

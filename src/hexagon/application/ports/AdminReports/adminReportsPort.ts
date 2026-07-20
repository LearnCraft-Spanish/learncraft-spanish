import type {
  AssignmentsCompletedByWeek,
  MembershipsByCoach,
} from '@learncraft-spanish/shared';

export interface AdminReportsPort {
  getMembershipsByCoachCurrentReport: () => Promise<MembershipsByCoach[]>;
  getMembershipsByCoachTwoWeeksOutReport: () => Promise<MembershipsByCoach[]>;
  getMembershipsBySalariedCoachCurrentReport: () => Promise<
    MembershipsByCoach[]
  >;
  getMembershipsBySalariedCoachTwoWeeksOutReport: () => Promise<
    MembershipsByCoach[]
  >;
  getAssignmentsCompletedByWeekReport: (
    weekStarts: string,
  ) => Promise<AssignmentsCompletedByWeek[]>;
}

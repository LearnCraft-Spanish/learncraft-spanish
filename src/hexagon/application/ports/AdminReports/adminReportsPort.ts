import type {
  AssignmentsCompletedByWeek,
  CoachSummary,
  CoachSummaryDrilldown,
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
  getWeeklyCoachSummaryReport: () => Promise<CoachSummary[]>;
  getLastWeekCoachSummaryReport: () => Promise<CoachSummary[]>;
  getWeeksDrilldownReport: (
    coachName: string,
    report: 'Weekly Coach Summary' | 'Last Week Coach Summary',
  ) => Promise<CoachSummaryDrilldown[]>;
}

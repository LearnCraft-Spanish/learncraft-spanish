import type {
  ActiveMembershipsByCourse,
  AssignmentsCompletedByWeek,
  CoachCapacityReportRow,
  CoachCapacitySettings,
  CoachSummary,
  CoachSummaryDrilldown,
  GroupCallsByCoach,
  LeadsToReEngage,
  MembershipsByCoach,
  PrivateCallsByCoach,
  WeeklyTimeCommitmentByCoach,
} from '@learncraft-spanish/shared';

export type WeeksDrilldownReportName =
  'Weekly Coach Summary' | 'Last Week Coach Summary';

/** Replaces one coach's whole Coach Capacity settings */
export interface UpdateCoachCapacitySettingsCommand {
  coachId: number;
  settings: CoachCapacitySettings;
}

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
    report: WeeksDrilldownReportName,
  ) => Promise<CoachSummaryDrilldown[]>;
  getPrivateCallsByCoachReport: () => Promise<PrivateCallsByCoach[]>;
  getGroupCallsByCoachReport: () => Promise<GroupCallsByCoach[]>;
  getActiveMembershipsReport: () => Promise<ActiveMembershipsByCourse[]>;
  getDropoutsByLevelReport: () => Promise<ActiveMembershipsByCourse[]>;
  getWeeklyTimeCommitmentByCoachReport: () => Promise<
    WeeklyTimeCommitmentByCoach[]
  >;
  getLeadsToReEngageReport: () => Promise<LeadsToReEngage[]>;
  getCoachCapacityTodayReport: () => Promise<CoachCapacityReportRow[]>;
  getCoachCapacityTwoWeeksOutReport: () => Promise<CoachCapacityReportRow[]>;
  updateCoachCapacitySettings: (
    command: UpdateCoachCapacitySettingsCommand,
  ) => Promise<CoachCapacitySettings>;
}

import type { AdminReportsPort } from '@application/ports/AdminReports/adminReportsPort';
import type { AuthPort } from '@application/ports/authPort';
import type {
  ActiveMembershipsByCourse,
  AssignmentsCompletedByWeek,
  CoachSummary,
  CoachSummaryDrilldown,
  GroupCallsByCoach,
  LeadsToReEngage,
  MembershipsByCoach,
  PrivateCallsByCoach,
  WeeklyTimeCommitmentByCoach,
} from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import {
  getActiveMembershipsReportEndpoint,
  getAssignmentsCompletedByWeekReportEndpoint,
  getDropoutsByLevelReportEndpoint,
  getGroupCallsByCoachReportEndpoint,
  getLastWeekCoachSummaryReportEndpoint,
  getLeadsToReEngageReportEndpoint,
  getMembershipsByCoachCurrentReportEndpoint,
  getMembershipsByCoachTwoWeeksOutReportEndpoint,
  getMembershipsBySalariedCoachCurrentReportEndpoint,
  getMembershipsBySalariedCoachTwoWeeksOutReportEndpoint,
  getPrivateCallsByCoachReportEndpoint,
  getWeeklyCoachSummaryReportEndpoint,
  getWeeklyTimeCommitmentByCoachReportEndpoint,
  getWeeksDrilldownReportEndpoint,
} from '@learncraft-spanish/shared';

export function createAdminReportsInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): AdminReportsPort {
  const httpClient = createHttpClient(apiUrl, auth);
  return {
    getMembershipsByCoachCurrentReport: () =>
      httpClient.get<MembershipsByCoach[]>(
        getMembershipsByCoachCurrentReportEndpoint.path,
        getMembershipsByCoachCurrentReportEndpoint.requiredScopes,
      ),
    getMembershipsByCoachTwoWeeksOutReport: () =>
      httpClient.get<MembershipsByCoach[]>(
        getMembershipsByCoachTwoWeeksOutReportEndpoint.path,
        getMembershipsByCoachTwoWeeksOutReportEndpoint.requiredScopes,
      ),
    getMembershipsBySalariedCoachCurrentReport: () =>
      httpClient.get<MembershipsByCoach[]>(
        getMembershipsBySalariedCoachCurrentReportEndpoint.path,
        getMembershipsBySalariedCoachCurrentReportEndpoint.requiredScopes,
      ),
    getMembershipsBySalariedCoachTwoWeeksOutReport: () =>
      httpClient.get<MembershipsByCoach[]>(
        getMembershipsBySalariedCoachTwoWeeksOutReportEndpoint.path,
        getMembershipsBySalariedCoachTwoWeeksOutReportEndpoint.requiredScopes,
      ),
    getAssignmentsCompletedByWeekReport: (weekStarts: string) =>
      httpClient.get<AssignmentsCompletedByWeek[]>(
        getAssignmentsCompletedByWeekReportEndpoint.path,
        getAssignmentsCompletedByWeekReportEndpoint.requiredScopes,
        {
          params: {
            startDate: weekStarts,
          },
        },
      ),
    getWeeklyCoachSummaryReport: () =>
      httpClient.get<CoachSummary[]>(
        getWeeklyCoachSummaryReportEndpoint.path,
        getWeeklyCoachSummaryReportEndpoint.requiredScopes,
      ),
    getLastWeekCoachSummaryReport: () =>
      httpClient.get<CoachSummary[]>(
        getLastWeekCoachSummaryReportEndpoint.path,
        getLastWeekCoachSummaryReportEndpoint.requiredScopes,
      ),
    getWeeksDrilldownReport: (
      coachName: string,
      report: 'Weekly Coach Summary' | 'Last Week Coach Summary',
    ) =>
      httpClient.get<CoachSummaryDrilldown[]>(
        getWeeksDrilldownReportEndpoint.path,
        getWeeksDrilldownReportEndpoint.requiredScopes,
        {
          params: { coachName, report },
        },
      ),
    getPrivateCallsByCoachReport: () =>
      httpClient.get<PrivateCallsByCoach[]>(
        getPrivateCallsByCoachReportEndpoint.path,
        getPrivateCallsByCoachReportEndpoint.requiredScopes,
      ),
    getGroupCallsByCoachReport: () =>
      httpClient.get<GroupCallsByCoach[]>(
        getGroupCallsByCoachReportEndpoint.path,
        getGroupCallsByCoachReportEndpoint.requiredScopes,
      ),
    getActiveMembershipsReport: () =>
      httpClient.get<ActiveMembershipsByCourse[]>(
        getActiveMembershipsReportEndpoint.path,
        getActiveMembershipsReportEndpoint.requiredScopes,
      ),
    getDropoutsByLevelReport: () =>
      httpClient.get<ActiveMembershipsByCourse[]>(
        getDropoutsByLevelReportEndpoint.path,
        getDropoutsByLevelReportEndpoint.requiredScopes,
      ),
    getWeeklyTimeCommitmentByCoachReport: () =>
      httpClient.get<WeeklyTimeCommitmentByCoach[]>(
        getWeeklyTimeCommitmentByCoachReportEndpoint.path,
        getWeeklyTimeCommitmentByCoachReportEndpoint.requiredScopes,
      ),
    getLeadsToReEngageReport: () =>
      httpClient.get<LeadsToReEngage[]>(
        getLeadsToReEngageReportEndpoint.path,
        getLeadsToReEngageReportEndpoint.requiredScopes,
      ),
  };
}

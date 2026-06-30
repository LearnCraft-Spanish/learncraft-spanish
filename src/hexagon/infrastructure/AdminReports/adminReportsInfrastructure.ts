import type { AdminReportsPort } from '@application/ports/AdminReports/adminReportsPort';
import type { AuthPort } from '@application/ports/authPort';
import type { MembershipsByCoach } from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import {
  getMembershipsByCoachCurrentReportEndpoint,
  getMembershipsByCoachTwoWeeksOutReportEndpoint,
  getMembershipsBySalariedCoachCurrentReportEndpoint,
  getMembershipsBySalariedCoachTwoWeeksOutReportEndpoint,
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
  };
}

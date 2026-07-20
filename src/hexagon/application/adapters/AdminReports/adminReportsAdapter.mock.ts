import type { AdminReportsPort } from '@application/ports/AdminReports/adminReportsPort';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockAdminReportsAdapter: AdminReportsPort = {
  getMembershipsByCoachCurrentReport: async () => [],
  getMembershipsByCoachTwoWeeksOutReport: async () => [],
  getMembershipsBySalariedCoachCurrentReport: async () => [],
  getMembershipsBySalariedCoachTwoWeeksOutReport: async () => [],
  getAssignmentsCompletedByWeekReport: async (_weekStarts: string) => [],
};

export const {
  mock: mockAdminReportsAdapter,
  override: overrideMockAdminReportsAdapter,
  reset: resetMockAdminReportsAdapter,
} = createOverrideableMock<AdminReportsPort>(defaultMockAdminReportsAdapter);

export default mockAdminReportsAdapter;

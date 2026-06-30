import type { AdminReportsPort } from '@application/ports/AdminReports/adminReportsPort';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockAdminReportsAdapter: AdminReportsPort = {
  getMembershipsByCoachCurrentReport: async () => [],
  getMembershipsByCoachTwoWeeksOutReport: async () => [],
};

export const {
  mock: mockAdminReportsAdapter,
  override: overrideMockAdminReportsAdapter,
  reset: resetMockAdminReportsAdapter,
} = createOverrideableMock<AdminReportsPort>(defaultMockAdminReportsAdapter);

export default mockAdminReportsAdapter;

import type { AdminReportsPort } from '@application/ports/AdminReports/adminReportsPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createAdminReportsInfrastructure } from '@infrastructure/AdminReports/adminReportsInfrastructure';

export function useAdminReportsAdapter(): AdminReportsPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createAdminReportsInfrastructure(apiUrl, auth);
}

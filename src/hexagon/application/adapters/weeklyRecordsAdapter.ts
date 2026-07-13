import type { WeeklyRecordsPort } from '@application/ports/weeklyRecordsPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createWeeklyRecordsInfrastructure } from '@infrastructure/weeklyRecords/weeklyRecordsInfrastructure';

export function useWeeklyRecordsAdapter(): WeeklyRecordsPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();

  return createWeeklyRecordsInfrastructure(apiUrl, auth);
}

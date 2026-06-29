import type { WeeksPort } from '@application/ports/weeksPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createWeeksInfrastructure } from '@infrastructure/weeksInfrastructure';

export function useWeeksAdapter(): WeeksPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createWeeksInfrastructure(apiUrl, auth);
}
